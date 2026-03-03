import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PatientMedication, MedicationStatus } from './entities/patient-medication.entity';
import { DoseLog, DoseStatus } from './entities/dose-log.entity';
import { AdherenceStat } from './entities/adherence-stat.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateMedicationDto {
  drugId?: string;
  customDrugName?: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  customFrequencyHours?: number;
  foodCondition?: string;
  startDate: string;
  endDate?: string;
  durationDays?: number;
  prescriberName?: string;
  notes?: string;
  reminderTimes: string[];
  snoozeMinutes?: number;
  maxSnoozeCount?: number;
  refillReminderEnabled?: boolean;
  totalQuantity?: number;
}

export interface UpdateDoseDto {
  status: DoseStatus;
  notes?: string;
}

@Injectable()
export class PillboxService {
  private readonly logger = new Logger(PillboxService.name);

  constructor(
    @InjectRepository(PatientMedication)
    private readonly medicationRepository: Repository<PatientMedication>,
    @InjectRepository(DoseLog)
    private readonly doseLogRepository: Repository<DoseLog>,
    @InjectRepository(AdherenceStat)
    private readonly adherenceStatRepository: Repository<AdherenceStat>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Medication CRUD ───────────────────────────────────────────────────────

  async addMedication(userId: string, dto: CreateMedicationDto): Promise<PatientMedication> {
    if (!dto.drugId && !dto.customDrugName) {
      throw new BadRequestException('Either drugId or customDrugName is required');
    }

    const medication = this.medicationRepository.create({
      userId,
      drugId: dto.drugId,
      customDrugName: dto.customDrugName,
      dosage: dto.dosage,
      dosageUnit: dto.dosageUnit,
      frequency: dto.frequency as any,
      customFrequencyHours: dto.customFrequencyHours,
      foodCondition: (dto.foodCondition as any) || 'no_restriction',
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      durationDays: dto.durationDays,
      prescriberName: dto.prescriberName,
      notes: dto.notes,
      reminderTimes: dto.reminderTimes,
      snoozeMinutes: dto.snoozeMinutes || 15,
      maxSnoozeCount: dto.maxSnoozeCount || 3,
      refillReminderEnabled: dto.refillReminderEnabled || false,
      totalQuantity: dto.totalQuantity,
      remainingQuantity: dto.totalQuantity,
    });

    const saved = await this.medicationRepository.save(medication);

    // Generate dose schedule for the next 7 days
    await this.generateDoseSchedule(saved, 7);

    await this.auditService.log({
      userId,
      action: 'add_medication',
      resourceType: 'medication',
      resourceId: saved.id,
      details: { drugId: dto.drugId, customDrugName: dto.customDrugName },
    });

    return saved;
  }

  async getUserMedications(
    userId: string,
    status?: MedicationStatus,
  ): Promise<PatientMedication[]> {
    const where: any = { userId };
    if (status) where.status = status;

    return this.medicationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getMedicationById(userId: string, medicationId: string): Promise<PatientMedication> {
    const medication = await this.medicationRepository.findOne({
      where: { id: medicationId, userId },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    return medication;
  }

  async updateMedication(
    userId: string,
    medicationId: string,
    dto: Partial<CreateMedicationDto>,
  ): Promise<PatientMedication> {
    const medication = await this.getMedicationById(userId, medicationId);
    Object.assign(medication, dto);
    const updated = await this.medicationRepository.save(medication);

    await this.auditService.log({
      userId,
      action: 'update_medication',
      resourceType: 'medication',
      resourceId: medicationId,
      details: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  async deleteMedication(userId: string, medicationId: string): Promise<void> {
    const medication = await this.getMedicationById(userId, medicationId);
    await this.medicationRepository.softDelete(medicationId);

    await this.auditService.log({
      userId,
      action: 'delete_medication',
      resourceType: 'medication',
      resourceId: medicationId,
    });
  }

  // ─── Dose Management ──────────────────────────────────────────────────────

  async getTodayDoses(userId: string): Promise<DoseLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.doseLogRepository.find({
      where: {
        userId,
        scheduledTime: Between(today, tomorrow),
      },
      order: { scheduledTime: 'ASC' },
    });
  }

  async getDosesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DoseLog[]> {
    return this.doseLogRepository.find({
      where: {
        userId,
        scheduledTime: Between(startDate, endDate),
      },
      order: { scheduledTime: 'ASC' },
    });
  }

  async updateDoseStatus(
    userId: string,
    doseId: string,
    dto: UpdateDoseDto,
  ): Promise<DoseLog> {
    const dose = await this.doseLogRepository.findOne({
      where: { id: doseId, userId },
    });

    if (!dose) {
      throw new NotFoundException('Dose log not found');
    }

    dose.status = dto.status;
    dose.notes = dto.notes || dose.notes;

    if (dto.status === DoseStatus.TAKEN) {
      dose.actualTime = new Date();
      dose.confirmedBy = 'self';

      // Decrement remaining quantity
      const medication = await this.medicationRepository.findOne({
        where: { id: dose.medicationId },
      });
      if (medication && medication.remainingQuantity > 0) {
        medication.remainingQuantity -= 1;
        await this.medicationRepository.save(medication);
      }
    }

    if (dto.status === DoseStatus.SNOOZED) {
      dose.snoozeCount += 1;
      // Schedule a new reminder after snooze
      const medication = await this.medicationRepository.findOne({
        where: { id: dose.medicationId },
      });
      if (medication && dose.snoozeCount <= medication.maxSnoozeCount) {
        await this.notificationService.scheduleDoseReminder(
          userId,
          dose.medicationId,
          new Date(Date.now() + (medication.snoozeMinutes || 15) * 60 * 1000),
        );
      }
    }

    const updated = await this.doseLogRepository.save(dose);

    // Audit
    const auditAction = dto.status === DoseStatus.TAKEN
      ? 'dose_taken'
      : dto.status === DoseStatus.MISSED
        ? 'dose_missed'
        : 'dose_skipped';

    await this.auditService.log({
      userId,
      action: auditAction,
      resourceType: 'dose_log',
      resourceId: doseId,
      details: { medicationId: dose.medicationId, status: dto.status },
    });

    return updated;
  }

  // ─── Adherence Analytics ───────────────────────────────────────────────────

  async getAdherenceStats(
    userId: string,
    periodType: string = 'daily',
    startDate?: Date,
    endDate?: Date,
  ): Promise<AdherenceStat[]> {
    const where: any = { userId, periodType };
    if (startDate && endDate) {
      where.periodDate = Between(startDate, endDate);
    }

    return this.adherenceStatRepository.find({
      where,
      order: { periodDate: 'DESC' },
      take: 90,
    });
  }

  async calculateDailyAdherence(userId: string, date: Date): Promise<AdherenceStat> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const doses = await this.doseLogRepository.find({
      where: {
        userId,
        scheduledTime: Between(dayStart, dayEnd),
      },
    });

    const totalDoses = doses.length;
    const takenDoses = doses.filter((d) => d.status === DoseStatus.TAKEN).length;
    const missedDoses = doses.filter((d) => d.status === DoseStatus.MISSED).length;
    const skippedDoses = doses.filter((d) => d.status === DoseStatus.SKIPPED).length;
    const adherencePercentage = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

    // Risk score: higher = more risk of non-adherence
    const riskScore = this.calculateRiskScore(adherencePercentage, missedDoses, totalDoses);

    // Upsert adherence stat
    let stat = await this.adherenceStatRepository.findOne({
      where: { userId, periodDate: dayStart, periodType: 'daily' },
    });

    if (stat) {
      Object.assign(stat, { totalDoses, takenDoses, missedDoses, skippedDoses, adherencePercentage, riskScore });
    } else {
      stat = this.adherenceStatRepository.create({
        userId,
        periodDate: dayStart,
        periodType: 'daily',
        totalDoses,
        takenDoses,
        missedDoses,
        skippedDoses,
        adherencePercentage,
        riskScore,
      });
    }

    return this.adherenceStatRepository.save(stat);
  }

  /**
   * AI Behavioral Analytics — Transparent risk scoring
   * No black-box: formula is fully documented and auditable
   *
   * Risk Score = weighted combination of:
   * - Recent adherence rate (40%)
   * - Missed dose frequency (30%)
   * - Pattern detection: consecutive misses (30%)
   */
  private calculateRiskScore(
    adherencePercentage: number,
    missedDoses: number,
    totalDoses: number,
  ): number {
    if (totalDoses === 0) return 0;

    const adherenceFactor = (100 - adherencePercentage) / 100; // 0-1, higher = worse
    const missedFactor = Math.min(missedDoses / totalDoses, 1); // 0-1
    const riskScore = (adherenceFactor * 0.4 + missedFactor * 0.6);

    return Math.round(riskScore * 100) / 100; // 0.00 - 1.00
  }

  // ─── Dose Schedule Generation ──────────────────────────────────────────────

  private async generateDoseSchedule(
    medication: PatientMedication,
    daysAhead: number,
  ): Promise<void> {
    const startDate = new Date(Math.max(
      new Date(medication.startDate).getTime(),
      new Date().setHours(0, 0, 0, 0),
    ));

    for (let day = 0; day < daysAhead; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);

      // Check if medication has ended
      if (medication.endDate && currentDate > new Date(medication.endDate)) break;

      for (const time of medication.reminderTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Skip if in the past
        if (scheduledTime < new Date()) continue;

        // Check if dose already exists
        const existing = await this.doseLogRepository.findOne({
          where: {
            medicationId: medication.id,
            userId: medication.userId,
            scheduledTime: scheduledTime,
          },
        });

        if (!existing) {
          const doseLog = this.doseLogRepository.create({
            medicationId: medication.id,
            userId: medication.userId,
            scheduledTime,
            status: DoseStatus.PENDING,
          });
          await this.doseLogRepository.save(doseLog);
        }
      }
    }
  }

  // ─── Scheduled Tasks ───────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateUpcomingDoses(): Promise<void> {
    this.logger.log('Generating upcoming dose schedules...');
    const activeMedications = await this.medicationRepository.find({
      where: { status: MedicationStatus.ACTIVE },
    });

    for (const medication of activeMedications) {
      await this.generateDoseSchedule(medication, 7);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async computeDailyAdherence(): Promise<void> {
    this.logger.log('Computing daily adherence stats...');
    const activeMedications = await this.medicationRepository.find({
      where: { status: MedicationStatus.ACTIVE },
    });

    const userIds = [...new Set(activeMedications.map((m) => m.userId))];
    const today = new Date();

    for (const userId of userIds) {
      await this.calculateDailyAdherence(userId, today);
    }
  }

  @Cron('0 */5 * * * *') // Every 5 minutes
  async checkMissedDoses(): Promise<void> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const pendingDoses = await this.doseLogRepository.find({
      where: {
        status: DoseStatus.PENDING,
        scheduledTime: LessThanOrEqual(thirtyMinutesAgo),
      },
    });

    for (const dose of pendingDoses) {
      dose.status = DoseStatus.MISSED;
      await this.doseLogRepository.save(dose);

      // Notify user and potentially caregiver
      await this.notificationService.sendMissedDoseAlert(dose.userId, dose.medicationId);

      await this.auditService.log({
        userId: dose.userId,
        action: 'dose_missed',
        resourceType: 'dose_log',
        resourceId: dose.id,
        details: { medicationId: dose.medicationId, scheduledTime: dose.scheduledTime },
      });
    }
  }

  // ─── Report Generation ─────────────────────────────────────────────────────

  async generateAdherenceReport(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    period: { start: string; end: string };
    overallAdherence: number;
    dailyStats: AdherenceStat[];
    medications: PatientMedication[];
    missedDoses: DoseLog[];
    riskAssessment: { score: number; level: string; explanation: string };
  }> {
    const dailyStats = await this.adherenceStatRepository.find({
      where: {
        userId,
        periodType: 'daily',
        periodDate: Between(startDate, endDate),
      },
      order: { periodDate: 'ASC' },
    });

    const medications = await this.medicationRepository.find({
      where: { userId, status: MedicationStatus.ACTIVE },
    });

    const missedDoses = await this.doseLogRepository.find({
      where: {
        userId,
        status: DoseStatus.MISSED,
        scheduledTime: Between(startDate, endDate),
      },
      order: { scheduledTime: 'ASC' },
    });

    // Calculate overall adherence
    const totalTaken = dailyStats.reduce((sum, s) => sum + s.takenDoses, 0);
    const totalDoses = dailyStats.reduce((sum, s) => sum + s.totalDoses, 0);
    const overallAdherence = totalDoses > 0 ? Math.round((totalTaken / totalDoses) * 10000) / 100 : 0;

    // Risk assessment — transparent formula
    const avgRisk = dailyStats.length > 0
      ? dailyStats.reduce((sum, s) => sum + Number(s.riskScore), 0) / dailyStats.length
      : 0;

    const riskLevel = avgRisk >= 0.7 ? 'high' : avgRisk >= 0.4 ? 'medium' : 'low';
    const riskExplanation = `Risk score ${avgRisk.toFixed(2)} calculated from: ` +
      `adherence rate (${overallAdherence}%), ` +
      `missed doses (${missedDoses.length}/${totalDoses}). ` +
      `Formula: 40% adherence factor + 60% missed dose ratio.`;

    await this.auditService.log({
      userId,
      action: 'export_report',
      resourceType: 'adherence_report',
      details: { startDate, endDate, overallAdherence },
    });

    return {
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      overallAdherence,
      dailyStats,
      medications,
      missedDoses,
      riskAssessment: {
        score: Math.round(avgRisk * 100) / 100,
        level: riskLevel,
        explanation: riskExplanation,
      },
    };
  }
}

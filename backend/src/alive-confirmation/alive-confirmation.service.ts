import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { AliveConfiguration } from './entities/alive-configuration.entity';
import { AliveCheck, AliveStatus, EscalationLevel } from './entities/alive-check.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AliveConfirmationService {
  private readonly logger = new Logger(AliveConfirmationService.name);

  constructor(
    @InjectRepository(AliveConfiguration)
    private readonly configRepository: Repository<AliveConfiguration>,
    @InjectRepository(AliveCheck)
    private readonly aliveCheckRepository: Repository<AliveCheck>,
    @InjectRepository(EmergencyContact)
    private readonly emergencyContactRepository: Repository<EmergencyContact>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Configuration ─────────────────────────────────────────────────────────

  async getConfiguration(userId: string): Promise<AliveConfiguration> {
    let config = await this.configRepository.findOne({ where: { userId } });
    if (!config) {
      config = this.configRepository.create({ userId });
      config = await this.configRepository.save(config);
    }
    return config;
  }

  async updateConfiguration(
    userId: string,
    dto: Partial<AliveConfiguration>,
  ): Promise<AliveConfiguration> {
    let config = await this.getConfiguration(userId);
    Object.assign(config, dto);
    config = await this.configRepository.save(config);

    await this.auditService.log({
      userId,
      action: 'update_profile',
      resourceType: 'alive_configuration',
      resourceId: config.id,
      details: { updatedFields: Object.keys(dto) },
    });

    return config;
  }

  // ─── Alive Confirmation (Core Logic) ───────────────────────────────────────

  async confirmAlive(
    userId: string,
    deviceInfo?: {
      batteryLevel?: number;
      gpsLatitude?: number;
      gpsLongitude?: number;
      gpsAccuracy?: number;
      networkStatus?: string;
    },
  ): Promise<AliveCheck> {
    // Find the latest pending check for this user
    let check = await this.aliveCheckRepository.findOne({
      where: { userId, status: AliveStatus.PENDING },
      order: { scheduledTime: 'DESC' },
    });

    if (!check) {
      // Create a new check if none pending
      check = this.aliveCheckRepository.create({
        userId,
        scheduledTime: new Date(),
        status: AliveStatus.CONFIRMED,
        confirmedTime: new Date(),
        batteryLevel: deviceInfo?.batteryLevel,
        gpsLatitude: deviceInfo?.gpsLatitude,
        gpsLongitude: deviceInfo?.gpsLongitude,
        gpsAccuracy: deviceInfo?.gpsAccuracy,
        deviceInfo: deviceInfo as any,
      });
    } else {
      check.status = AliveStatus.CONFIRMED;
      check.confirmedTime = new Date();
      check.batteryLevel = deviceInfo?.batteryLevel;
      check.gpsLatitude = deviceInfo?.gpsLatitude;
      check.gpsLongitude = deviceInfo?.gpsLongitude;
      check.gpsAccuracy = deviceInfo?.gpsAccuracy;
      check.deviceInfo = deviceInfo as any;
    }

    const saved = await this.aliveCheckRepository.save(check);

    // Check low battery and send pre-alert
    const config = await this.getConfiguration(userId);
    if (
      deviceInfo?.batteryLevel &&
      deviceInfo.batteryLevel <= config.lowBatteryAlertThreshold
    ) {
      await this.notificationService.sendLowBatteryAlert(userId, deviceInfo.batteryLevel);

      // Also alert caregivers
      const contacts = await this.getEmergencyContacts(userId);
      for (const contact of contacts.filter((c) => c.notifyOnAliveMiss)) {
        await this.notificationService.sendCaregiverAlert(
          userId, // In production, this would be the caregiver's user ID
          contact.contactName,
          'low_battery',
          { batteryLevel: deviceInfo.batteryLevel },
        );
      }
    }

    await this.auditService.log({
      userId,
      action: 'confirm_alive',
      resourceType: 'alive_check',
      resourceId: saved.id,
      details: {
        batteryLevel: deviceInfo?.batteryLevel,
        hasGps: !!(deviceInfo?.gpsLatitude),
      },
    });

    return saved;
  }

  // ─── Alive Check History ───────────────────────────────────────────────────

  async getAliveHistory(
    userId: string,
    page: number = 1,
    limit: number = 30,
  ): Promise<{ data: AliveCheck[]; total: number }> {
    const [data, total] = await this.aliveCheckRepository.findAndCount({
      where: { userId },
      order: { scheduledTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getAliveStatus(userId: string): Promise<{
    lastCheck: AliveCheck | null;
    nextCheckDue: Date;
    isOverdue: boolean;
    config: AliveConfiguration;
  }> {
    const config = await this.getConfiguration(userId);

    const lastCheck = await this.aliveCheckRepository.findOne({
      where: { userId, status: AliveStatus.CONFIRMED },
      order: { confirmedTime: 'DESC' },
    });

    const nextCheckDue = lastCheck
      ? new Date(lastCheck.confirmedTime.getTime() + config.checkIntervalHours * 60 * 60 * 1000)
      : new Date();

    const isOverdue = new Date() > nextCheckDue;

    return { lastCheck, nextCheckDue, isOverdue, config };
  }

  // ─── Emergency Contacts ────────────────────────────────────────────────────

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return this.emergencyContactRepository.find({
      where: { userId, isActive: true },
      order: { escalationPriority: 'ASC' },
    });
  }

  async addEmergencyContact(
    userId: string,
    dto: Partial<EmergencyContact>,
  ): Promise<EmergencyContact> {
    const contact = this.emergencyContactRepository.create({
      ...dto,
      userId,
    });

    const saved = await this.emergencyContactRepository.save(contact);

    await this.auditService.log({
      userId,
      action: 'update_profile',
      resourceType: 'emergency_contact',
      resourceId: saved.id,
      details: { contactName: dto.contactName },
    });

    return saved;
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    dto: Partial<EmergencyContact>,
  ): Promise<EmergencyContact> {
    const contact = await this.emergencyContactRepository.findOne({
      where: { id: contactId, userId },
    });

    if (!contact) throw new NotFoundException('Emergency contact not found');

    Object.assign(contact, dto);
    return this.emergencyContactRepository.save(contact);
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    const contact = await this.emergencyContactRepository.findOne({
      where: { id: contactId, userId },
    });

    if (!contact) throw new NotFoundException('Emergency contact not found');

    contact.isActive = false;
    await this.emergencyContactRepository.save(contact);
  }

  // ─── Escalation Workflow Engine ────────────────────────────────────────────

  /**
   * Escalation Workflow (5 stages):
   *
   * Stage 1: Push notification to user (grace period expired)
   * Stage 2: SMS to emergency contact #1
   * Stage 3: Automated call to emergency contact #1
   * Stage 4: GPS location transmission + SMS to all contacts
   * Stage 5: Emergency escalation (all contacts + optional emergency services)
   *
   * Each stage has a configurable delay before advancing to the next.
   * All actions are fully logged for audit trail.
   */
  private async runEscalation(check: AliveCheck): Promise<void> {
    const config = await this.getConfiguration(check.userId);
    if (!config.escalationEnabled) return;

    const contacts = await this.getEmergencyContacts(check.userId);
    if (contacts.length === 0) {
      this.logger.warn(`No emergency contacts for user ${check.userId}`);
      return;
    }

    const currentLevel = check.escalationLevel;
    const escalationDelay = config.escalationDelayMinutes * 60 * 1000;
    const lastEscalation = check.escalationHistory?.length > 0
      ? new Date(check.escalationHistory[check.escalationHistory.length - 1].timestamp)
      : new Date(check.scheduledTime.getTime() + config.gracePeriodMinutes * 60 * 1000);

    const timeSinceLastEscalation = Date.now() - lastEscalation.getTime();
    if (timeSinceLastEscalation < escalationDelay) return;

    const primaryContact = contacts[0];
    let nextLevel: EscalationLevel;
    let stage: number;

    switch (currentLevel) {
      case EscalationLevel.NONE:
        nextLevel = EscalationLevel.PUSH;
        stage = 1;
        await this.notificationService.sendAliveMissedAlert(check.userId, '', '', 1);
        break;

      case EscalationLevel.PUSH:
        nextLevel = EscalationLevel.SMS;
        stage = 2;
        await this.notificationService.sendAliveMissedAlert(
          check.userId, primaryContact.phone, primaryContact.contactName, 2,
        );
        break;

      case EscalationLevel.SMS:
        nextLevel = EscalationLevel.CALL;
        stage = 3;
        await this.notificationService.sendAliveMissedAlert(
          check.userId, primaryContact.phone, primaryContact.contactName, 3,
        );
        break;

      case EscalationLevel.CALL:
        nextLevel = EscalationLevel.GPS;
        stage = 4;
        // Send GPS + alert to all contacts
        for (const contact of contacts) {
          await this.notificationService.sendAliveMissedAlert(
            check.userId, contact.phone, contact.contactName, 4,
          );
        }
        break;

      case EscalationLevel.GPS:
        nextLevel = EscalationLevel.EMERGENCY;
        stage = 5;
        // Emergency escalation to all contacts
        for (const contact of contacts) {
          await this.notificationService.sendAliveMissedAlert(
            check.userId, contact.phone, contact.contactName, 5,
          );
        }
        break;

      default:
        return;
    }

    // Update check
    check.escalationLevel = nextLevel;
    check.status = AliveStatus.ESCALATED;
    check.escalationHistory = [
      ...(check.escalationHistory || []),
      {
        level: nextLevel,
        stage,
        timestamp: new Date().toISOString(),
        contactNotified: primaryContact.contactName,
      },
    ];

    await this.aliveCheckRepository.save(check);

    await this.auditService.log({
      userId: check.userId,
      action: 'escalate_alive',
      resourceType: 'alive_check',
      resourceId: check.id,
      details: { stage, escalationLevel: nextLevel },
      riskLevel: stage >= 4 ? 'high' : 'medium',
    });
  }

  // ─── Scheduled Tasks ───────────────────────────────────────────────────────

  @Cron('0 */5 * * * *') // Every 5 minutes
  async checkAliveConfirmations(): Promise<void> {
    this.logger.debug('Checking alive confirmations...');

    // Find all active configurations
    const configs = await this.configRepository.find({
      where: { isEnabled: true },
    });

    for (const config of configs) {
      const status = await this.getAliveStatus(config.userId);

      if (status.isOverdue) {
        // Check if there's already a pending/escalated check
        let pendingCheck = await this.aliveCheckRepository.findOne({
          where: [
            { userId: config.userId, status: AliveStatus.PENDING },
            { userId: config.userId, status: AliveStatus.ESCALATED },
          ],
          order: { scheduledTime: 'DESC' },
        });

        if (!pendingCheck) {
          // Create a new pending check
          pendingCheck = this.aliveCheckRepository.create({
            userId: config.userId,
            scheduledTime: status.nextCheckDue,
            status: AliveStatus.PENDING,
            escalationLevel: EscalationLevel.NONE,
            escalationHistory: [],
          });
          pendingCheck = await this.aliveCheckRepository.save(pendingCheck);

          // Send initial reminder
          await this.notificationService.sendAliveCheckReminder(config.userId);

          await this.auditService.log({
            userId: config.userId,
            action: 'miss_alive',
            resourceType: 'alive_check',
            resourceId: pendingCheck.id,
          });
        }

        // Check if grace period has expired
        const gracePeriodEnd = new Date(
          pendingCheck.scheduledTime.getTime() + config.gracePeriodMinutes * 60 * 1000,
        );

        if (new Date() > gracePeriodEnd) {
          // Run escalation workflow
          await this.runEscalation(pendingCheck);
        }
      }
    }
  }

  @Cron('0 */15 * * * *') // Every 15 minutes
  async checkOfflineFailsafe(): Promise<void> {
    // Offline fail-safe: if a user hasn't been seen for 2x their check interval,
    // trigger pre-alert to caregivers
    const configs = await this.configRepository.find({
      where: { isEnabled: true, offlineFailsafeEnabled: true },
    });

    for (const config of configs) {
      const lastCheck = await this.aliveCheckRepository.findOne({
        where: { userId: config.userId },
        order: { createdAt: 'DESC' },
      });

      if (lastCheck) {
        const offlineThreshold = config.checkIntervalHours * 2 * 60 * 60 * 1000;
        const timeSinceLastActivity = Date.now() - lastCheck.createdAt.getTime();

        if (timeSinceLastActivity > offlineThreshold) {
          const contacts = await this.getEmergencyContacts(config.userId);
          for (const contact of contacts.filter((c) => c.notifyOnAliveMiss)) {
            await this.notificationService.sendCaregiverAlert(
              config.userId,
              contact.contactName,
              'offline_detected',
              { lastSeen: lastCheck.createdAt, hoursOffline: Math.round(timeSinceLastActivity / 3600000) },
            );
          }
        }
      }
    }
  }
}

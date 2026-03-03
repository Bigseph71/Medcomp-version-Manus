import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Incident } from './entities/incident.entity';

export interface AuditLogInput {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  riskLevel?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
  ) {}

  // ─── Audit Logging ─────────────────────────────────────────────────────────

  async log(input: AuditLogInput): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: input.userId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        details: input.details,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        sessionId: input.sessionId,
        riskLevel: input.riskLevel || 'low',
      });

      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      // Audit logging should never break the main flow
      return null;
    }
  }

  // ─── Query Audit Logs ──────────────────────────────────────────────────────

  async getLogsByUser(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogRepository.findAndCount({
      where: { createdAt: Between(startDate, endDate) },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getSecurityEvents(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogRepository.findAndCount({
      where: { action: 'security_event' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  // ─── Incident Management (MDR Compliance) ─────────────────────────────────

  async createIncident(input: Partial<Incident>): Promise<Incident> {
    const incident = this.incidentRepository.create(input);
    const saved = await this.incidentRepository.save(incident);

    await this.log({
      userId: input.reportedBy,
      action: 'system_error',
      resourceType: 'incident',
      resourceId: saved.id,
      details: { title: input.title, severity: input.severity },
      riskLevel: 'high',
    });

    return saved;
  }

  async getIncidents(
    status?: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Incident[]; total: number }> {
    const where = status ? { status } : {};
    const [data, total] = await this.incidentRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async resolveIncident(
    incidentId: string,
    resolutionNotes: string,
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId },
    });

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    incident.resolutionNotes = resolutionNotes;

    return await this.incidentRepository.save(incident);
  }
}

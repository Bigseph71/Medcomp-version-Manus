import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CaregiverRelationship, CaregiverPermission } from './entities/caregiver-relationship.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CaregiverService {
  private readonly logger = new Logger(CaregiverService.name);

  constructor(
    @InjectRepository(CaregiverRelationship)
    private readonly relationshipRepository: Repository<CaregiverRelationship>,
    private readonly auditService: AuditService,
  ) {}

  // ─── Invitation System ─────────────────────────────────────────────────────

  async createInvitation(
    patientId: string,
    caregiverEmail: string,
    permissions: string[] = ['view_adherence', 'view_alive_status'],
  ): Promise<{ invitationToken: string; expiresAt: Date }> {
    const invitationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const relationship = this.relationshipRepository.create({
      patientId,
      caregiverId: '00000000-0000-0000-0000-000000000000', // Placeholder until accepted
      permissions,
      isApproved: false,
      invitationToken,
      invitationExpiresAt: expiresAt,
    });

    await this.relationshipRepository.save(relationship);

    await this.auditService.log({
      userId: patientId,
      action: 'caregiver_linked',
      resourceType: 'caregiver_relationship',
      resourceId: relationship.id,
      details: { caregiverEmail, action: 'invitation_created' },
    });

    return { invitationToken, expiresAt };
  }

  async acceptInvitation(
    caregiverId: string,
    invitationToken: string,
  ): Promise<CaregiverRelationship> {
    const relationship = await this.relationshipRepository.findOne({
      where: { invitationToken, isApproved: false },
    });

    if (!relationship) {
      throw new NotFoundException('Invitation not found or already accepted');
    }

    if (relationship.invitationExpiresAt < new Date()) {
      throw new ForbiddenException('Invitation has expired');
    }

    // Check if relationship already exists
    const existing = await this.relationshipRepository.findOne({
      where: { caregiverId, patientId: relationship.patientId },
    });

    if (existing) {
      throw new ConflictException('Caregiver relationship already exists');
    }

    relationship.caregiverId = caregiverId;
    relationship.isApproved = true;
    relationship.approvedAt = new Date();
    relationship.invitationToken = null;

    const saved = await this.relationshipRepository.save(relationship);

    await this.auditService.log({
      userId: caregiverId,
      action: 'caregiver_linked',
      resourceType: 'caregiver_relationship',
      resourceId: saved.id,
      details: { patientId: relationship.patientId, action: 'invitation_accepted' },
    });

    return saved;
  }

  // ─── Relationship Management ───────────────────────────────────────────────

  async getPatientCaregivers(patientId: string): Promise<CaregiverRelationship[]> {
    return this.relationshipRepository.find({
      where: { patientId, isApproved: true },
    });
  }

  async getCaregiverPatients(caregiverId: string): Promise<CaregiverRelationship[]> {
    return this.relationshipRepository.find({
      where: { caregiverId, isApproved: true },
    });
  }

  async updatePermissions(
    patientId: string,
    relationshipId: string,
    permissions: string[],
  ): Promise<CaregiverRelationship> {
    const relationship = await this.relationshipRepository.findOne({
      where: { id: relationshipId, patientId },
    });

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    relationship.permissions = permissions;
    return this.relationshipRepository.save(relationship);
  }

  async removeRelationship(
    userId: string,
    relationshipId: string,
  ): Promise<void> {
    const relationship = await this.relationshipRepository.findOne({
      where: [
        { id: relationshipId, patientId: userId },
        { id: relationshipId, caregiverId: userId },
      ],
    });

    if (!relationship) {
      throw new NotFoundException('Relationship not found');
    }

    await this.relationshipRepository.softDelete(relationshipId);

    await this.auditService.log({
      userId,
      action: 'caregiver_removed',
      resourceType: 'caregiver_relationship',
      resourceId: relationshipId,
    });
  }

  // ─── Permission Check ──────────────────────────────────────────────────────

  async checkPermission(
    caregiverId: string,
    patientId: string,
    permission: string,
  ): Promise<boolean> {
    const relationship = await this.relationshipRepository.findOne({
      where: { caregiverId, patientId, isApproved: true },
    });

    if (!relationship) return false;

    return (
      relationship.permissions.includes(permission) ||
      relationship.permissions.includes(CaregiverPermission.FULL_ACCESS)
    );
  }
}

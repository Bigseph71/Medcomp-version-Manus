import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, Unique,
} from 'typeorm';

export enum CaregiverPermission {
  VIEW_ADHERENCE = 'view_adherence',
  VIEW_INTERACTIONS = 'view_interactions',
  VIEW_ALIVE_STATUS = 'view_alive_status',
  MANAGE_MEDICATIONS = 'manage_medications',
  FULL_ACCESS = 'full_access',
}

@Entity('caregiver_relationships')
@Unique(['caregiverId', 'patientId'])
export class CaregiverRelationship {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) caregiverId: string;

  @Index()
  @Column({ type: 'uuid' }) patientId: string;

  @Column({ type: 'simple-array', default: 'view_adherence,view_alive_status' })
  permissions: string[];

  @Column({ type: 'boolean', default: false }) isApproved: boolean;
  @Column({ type: 'timestamptz', nullable: true }) approvedAt: Date;
  @Column({ type: 'varchar', length: 255, nullable: true }) invitationToken: string;
  @Column({ type: 'timestamptz', nullable: true }) invitationExpiresAt: Date;
  @Column({ type: 'text', nullable: true }) notes: string;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz' }) deletedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DoseStatus { PENDING = 'pending', TAKEN = 'taken', MISSED = 'missed', SKIPPED = 'skipped', SNOOZED = 'snoozed' }

@Entity({ schema: 'health', name: 'dose_logs' })
export class DoseLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) medicationId: string;

  @Index()
  @Column({ type: 'uuid' }) userId: string;

  @Index()
  @Column({ type: 'timestamptz' }) scheduledTime: Date;

  @Column({ type: 'timestamptz', nullable: true }) actualTime: Date;

  @Index()
  @Column({ type: 'enum', enum: DoseStatus, default: DoseStatus.PENDING }) status: DoseStatus;

  @Column({ type: 'int', default: 0 }) snoozeCount: number;

  @Column({ type: 'text', nullable: true }) notes: string;

  @Column({ type: 'varchar', length: 20, default: 'self' }) confirmedBy: string;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}

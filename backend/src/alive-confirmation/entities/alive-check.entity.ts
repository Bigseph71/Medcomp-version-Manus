import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AliveStatus { CONFIRMED = 'confirmed', PENDING = 'pending', MISSED = 'missed', ESCALATED = 'escalated' }
export enum EscalationLevel { NONE = 'none', PUSH = 'push', SMS = 'sms', CALL = 'call', GPS = 'gps', EMERGENCY = 'emergency' }

@Entity('alive_checks')
export class AliveCheck {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) userId: string;

  @Index()
  @Column({ type: 'timestamptz' }) scheduledTime: Date;

  @Column({ type: 'timestamptz', nullable: true }) confirmedTime: Date;

  @Index()
  @Column({ type: 'enum', enum: AliveStatus, default: AliveStatus.PENDING }) status: AliveStatus;

  @Column({ type: 'enum', enum: EscalationLevel, default: EscalationLevel.NONE }) escalationLevel: EscalationLevel;

  @Column({ type: 'jsonb', default: '[]' }) escalationHistory: any[];

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true }) gpsLatitude: number;
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true }) gpsLongitude: number;
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true }) gpsAccuracy: number;

  @Column({ type: 'int', nullable: true }) batteryLevel: number;
  @Column({ type: 'jsonb', nullable: true }) deviceInfo: Record<string, any>;
  @Column({ type: 'text', nullable: true }) notes: string;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}

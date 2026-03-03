import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  DOSE_REMINDER = 'dose_reminder',
  DOSE_MISSED = 'dose_missed',
  INTERACTION_ALERT = 'interaction_alert',
  ALIVE_CHECK = 'alive_check',
  ALIVE_MISSED = 'alive_missed',
  ALIVE_ESCALATION = 'alive_escalation',
  CAREGIVER_ALERT = 'caregiver_alert',
  LOW_BATTERY = 'low_battery',
  REFILL_REMINDER = 'refill_reminder',
  SYSTEM = 'system',
}

export enum NotificationChannel {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  CALL = 'call',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) userId: string;

  @Index()
  @Column({ type: 'enum', enum: NotificationType }) type: NotificationType;

  @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.PUSH })
  channel: NotificationChannel;

  @Index()
  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ type: 'varchar', length: 255 }) title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'jsonb', nullable: true }) data: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true }) scheduledAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) sentAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) deliveredAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) readAt: Date;

  @Column({ type: 'int', default: 0 }) retryCount: number;
  @Column({ type: 'int', default: 3 }) maxRetries: number;
  @Column({ type: 'text', nullable: true }) errorMessage: string;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}

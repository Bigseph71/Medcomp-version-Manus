import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('alive_configurations')
export class AliveConfiguration {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' }) userId: string;

  @Column({ type: 'boolean', default: true }) isEnabled: boolean;
  @Column({ type: 'int', default: 24 }) checkIntervalHours: number;
  @Column({ type: 'time', default: '09:00:00' }) checkTime: string;
  @Column({ type: 'int', default: 60 }) gracePeriodMinutes: number;
  @Column({ type: 'boolean', default: true }) escalationEnabled: boolean;
  @Column({ type: 'int', default: 30 }) escalationDelayMinutes: number;
  @Column({ type: 'boolean', default: false }) gpsTrackingEnabled: boolean;
  @Column({ type: 'int', default: 15 }) lowBatteryAlertThreshold: number;
  @Column({ type: 'boolean', default: true }) voiceConfirmationEnabled: boolean;
  @Column({ type: 'boolean', default: true }) offlineFailsafeEnabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinColumn,
} from 'typeorm';

export enum MedicationStatus { ACTIVE = 'active', PAUSED = 'paused', COMPLETED = 'completed', CANCELLED = 'cancelled' }
export enum FrequencyType { DAILY = 'daily', TWICE_DAILY = 'twice_daily', THREE_TIMES_DAILY = 'three_times_daily', WEEKLY = 'weekly', BIWEEKLY = 'biweekly', MONTHLY = 'monthly', AS_NEEDED = 'as_needed', CUSTOM = 'custom' }
export enum FoodCondition { BEFORE_MEAL = 'before_meal', WITH_MEAL = 'with_meal', AFTER_MEAL = 'after_meal', EMPTY_STOMACH = 'empty_stomach', NO_RESTRICTION = 'no_restriction' }

@Entity({ schema: 'health', name: 'patient_medications' })
export class PatientMedication {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) userId: string;

  @Column({ type: 'uuid', nullable: true }) drugId: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) customDrugName: string;

  @Column({ type: 'varchar', length: 100 }) dosage: string;

  @Column({ type: 'varchar', length: 50 }) dosageUnit: string;

  @Column({ type: 'enum', enum: FrequencyType, default: FrequencyType.DAILY }) frequency: FrequencyType;

  @Column({ type: 'int', nullable: true }) customFrequencyHours: number;

  @Column({ type: 'enum', enum: FoodCondition, default: FoodCondition.NO_RESTRICTION }) foodCondition: FoodCondition;

  @Column({ type: 'date' }) startDate: Date;

  @Column({ type: 'date', nullable: true }) endDate: Date;

  @Column({ type: 'int', nullable: true }) durationDays: number;

  @Column({ type: 'enum', enum: MedicationStatus, default: MedicationStatus.ACTIVE }) status: MedicationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true }) prescriberName: string;

  @Column({ type: 'text', nullable: true }) prescriptionImageUrl: string;

  @Column({ type: 'text', nullable: true }) notes: string;

  @Column({ type: 'time', array: true }) reminderTimes: string[];

  @Column({ type: 'int', default: 15 }) snoozeMinutes: number;

  @Column({ type: 'int', default: 3 }) maxSnoozeCount: number;

  @Column({ type: 'boolean', default: false }) refillReminderEnabled: boolean;

  @Column({ type: 'int', default: 7 }) refillReminderDaysBefore: number;

  @Column({ type: 'int', nullable: true }) remainingQuantity: number;

  @Column({ type: 'int', nullable: true }) totalQuantity: number;

  @Column({ type: 'boolean', default: false }) interactionChecked: boolean;

  @Column({ type: 'timestamptz', nullable: true }) interactionCheckDate: Date;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamptz' }) deletedAt: Date;
}

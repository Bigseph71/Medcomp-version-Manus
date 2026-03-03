import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';

export enum UserRole {
  PATIENT = 'patient',
  CAREGIVER = 'caregiver',
  ADMIN = 'admin',
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Index()
  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'varchar', length: 5, default: 'fr' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'Europe/Paris' })
  timezone: string;

  @Column({ type: 'text', nullable: true })
  profileImageUrl: string;

  @Column({ type: 'boolean', default: false })
  biometricEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  twoFactorSecret: string;

  @Column({ type: 'boolean', default: false })
  seniorModeEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  gdprConsent: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  gdprConsentDate: Date;

  @Column({ type: 'boolean', default: false })
  dataProcessingConsent: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) userId: string;

  @Column({ type: 'varchar', length: 200 }) contactName: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) relationship: string;
  @Column({ type: 'varchar', length: 20 }) phone: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string;
  @Column({ type: 'int', default: 1 }) escalationPriority: number;
  @Column({ type: 'boolean', default: false }) notifyOnMissedDose: boolean;
  @Column({ type: 'boolean', default: true }) notifyOnAliveMiss: boolean;
  @Column({ type: 'boolean', default: false }) notifyOnInteraction: boolean;
  @Column({ type: 'boolean', default: true }) isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;
}

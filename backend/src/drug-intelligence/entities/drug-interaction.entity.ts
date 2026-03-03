import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Drug } from './drug.entity';

export enum InteractionSeverity {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
}

export enum InteractionType {
  DRUG_DRUG = 'drug_drug',
  DRUG_DISEASE = 'drug_disease',
  DRUG_AGE = 'drug_age',
  DRUG_RENAL = 'drug_renal',
  DRUG_FOOD = 'drug_food',
  DRUG_ALLERGY = 'drug_allergy',
  DRUG_PREGNANCY = 'drug_pregnancy',
  DRUG_HEPATIC = 'drug_hepatic',
}

@Entity({ schema: 'health', name: 'drug_interactions' })
export class DrugInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  drugAId: string;

  @ManyToOne(() => Drug)
  @JoinColumn({ name: 'drug_a_id' })
  drugA: Drug;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  drugBId: string;

  @ManyToOne(() => Drug, { nullable: true })
  @JoinColumn({ name: 'drug_b_id' })
  drugB: Drug;

  @Column({ type: 'enum', enum: InteractionType })
  interactionType: InteractionType;

  @Index()
  @Column({ type: 'enum', enum: InteractionSeverity })
  severity: InteractionSeverity;

  @Column({ type: 'text' })
  clinicalExplanation: string;

  @Column({ type: 'text' })
  patientExplanation: string;

  @Column({ type: 'text' })
  recommendation: string;

  @Column({ type: 'text', nullable: true })
  mechanism: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  evidenceLevel: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  confidenceScore: number;

  @Column({ type: 'jsonb', default: '[]' })
  sources: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  conditionTrigger: string;

  @Column({ type: 'int', nullable: true })
  ageMin: number;

  @Column({ type: 'int', nullable: true })
  ageMax: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  renalThreshold: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  foodTrigger: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

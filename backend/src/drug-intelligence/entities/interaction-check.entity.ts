import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ schema: 'health', name: 'interaction_checks' })
export class InteractionCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', array: true })
  drugsChecked: string[];

  @Column({ type: 'jsonb', default: '[]' })
  interactionsFound: any[];

  @Column({ type: 'jsonb', nullable: true })
  aiExplanations: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  totalInteractions: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  maxSeverity: string;

  @Column({ type: 'jsonb', nullable: true })
  checkContext: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  disclaimerShown: boolean;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

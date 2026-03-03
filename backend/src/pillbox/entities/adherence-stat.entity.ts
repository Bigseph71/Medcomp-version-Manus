import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity({ schema: 'health', name: 'adherence_stats' })
@Unique(['userId', 'periodDate', 'periodType'])
export class AdherenceStat {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index()
  @Column({ type: 'uuid' }) userId: string;

  @Index()
  @Column({ type: 'date' }) periodDate: Date;

  @Column({ type: 'varchar', length: 10 }) periodType: string;

  @Column({ type: 'int', default: 0 }) totalDoses: number;
  @Column({ type: 'int', default: 0 }) takenDoses: number;
  @Column({ type: 'int', default: 0 }) missedDoses: number;
  @Column({ type: 'int', default: 0 }) skippedDoses: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) adherencePercentage: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 }) riskScore: number;

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}

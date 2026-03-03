import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ schema: 'health', name: 'drugs' })
export class Drug {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  internationalName: string;

  @Column({ type: 'text', array: true })
  activeSubstances: string[];

  @Index()
  @Column({ type: 'varchar', length: 10, nullable: true })
  atcCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  atcDescription: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dosageForm: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  strength: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  routeOfAdministration: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  marketingAuthorizationNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  marketingAuthorizationHolder: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  emaProductCode: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ansmCisCode: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fdaNdcCode: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'jsonb', default: '[]' })
  contraindications: any[];

  @Column({ type: 'jsonb', default: '[]' })
  sideEffects: any[];

  @Column({ type: 'jsonb', default: '[]' })
  precautions: any[];

  @Column({ type: 'text', nullable: true })
  smpcUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  smpcParsed: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugIntelligenceService } from './drug-intelligence.service';
import { DrugIntelligenceController } from './drug-intelligence.controller';
import { RuleEngineService } from './rule-engine.service';
import { Drug } from './entities/drug.entity';
import { DrugInteraction } from './entities/drug-interaction.entity';
import { InteractionCheck } from './entities/interaction-check.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Drug, DrugInteraction, InteractionCheck]),
    AuditModule,
  ],
  controllers: [DrugIntelligenceController],
  providers: [DrugIntelligenceService, RuleEngineService],
  exports: [DrugIntelligenceService],
})
export class DrugIntelligenceModule {}

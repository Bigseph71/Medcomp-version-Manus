import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PillboxService } from './pillbox.service';
import { PillboxController } from './pillbox.controller';
import { PatientMedication } from './entities/patient-medication.entity';
import { DoseLog } from './entities/dose-log.entity';
import { AdherenceStat } from './entities/adherence-stat.entity';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientMedication, DoseLog, AdherenceStat]),
    AuditModule,
    NotificationModule,
  ],
  controllers: [PillboxController],
  providers: [PillboxService],
  exports: [PillboxService],
})
export class PillboxModule {}

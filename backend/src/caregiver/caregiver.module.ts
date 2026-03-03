import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaregiverService } from './caregiver.service';
import { CaregiverController } from './caregiver.controller';
import { CaregiverRelationship } from './entities/caregiver-relationship.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CaregiverRelationship]),
    AuditModule,
  ],
  controllers: [CaregiverController],
  providers: [CaregiverService],
  exports: [CaregiverService],
})
export class CaregiverModule {}

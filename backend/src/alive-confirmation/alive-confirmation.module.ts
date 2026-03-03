import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AliveConfirmationService } from './alive-confirmation.service';
import { AliveConfirmationController } from './alive-confirmation.controller';
import { AliveConfiguration } from './entities/alive-configuration.entity';
import { AliveCheck } from './entities/alive-check.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AliveConfiguration, AliveCheck, EmergencyContact]),
    AuditModule,
    NotificationModule,
  ],
  controllers: [AliveConfirmationController],
  providers: [AliveConfirmationService],
  exports: [AliveConfirmationService],
})
export class AliveConfirmationModule {}

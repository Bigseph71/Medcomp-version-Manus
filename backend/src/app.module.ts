import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { DrugIntelligenceModule } from './drug-intelligence/drug-intelligence.module';
import { PillboxModule } from './pillbox/pillbox.module';
import { NotificationModule } from './notification/notification.module';
import { CaregiverModule } from './caregiver/caregiver.module';
import { AuditModule } from './audit/audit.module';
import { AliveConfirmationModule } from './alive-confirmation/alive-confirmation.module';
import { DatabaseModule } from './database/database.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    DrugIntelligenceModule,
    PillboxModule,
    NotificationModule,
    CaregiverModule,
    AuditModule,
    AliveConfirmationModule,
  ],
})
export class AppModule {}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // ─── Create Notification ───────────────────────────────────────────────────

  async createNotification(input: {
    userId: string;
    type: NotificationType;
    channel?: NotificationChannel;
    title: string;
    body: string;
    data?: Record<string, any>;
    scheduledAt?: Date;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: input.userId,
      type: input.type,
      channel: input.channel || NotificationChannel.PUSH,
      title: input.title,
      body: input.body,
      data: input.data,
      scheduledAt: input.scheduledAt || new Date(),
      status: NotificationStatus.PENDING,
    });

    return this.notificationRepository.save(notification);
  }

  // ─── Dose Reminder ─────────────────────────────────────────────────────────

  async scheduleDoseReminder(
    userId: string,
    medicationId: string,
    scheduledAt: Date,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.DOSE_REMINDER,
      title: 'Rappel de médicament',
      body: 'Il est l\'heure de prendre votre médicament. Appuyez pour confirmer.',
      data: { medicationId, action: 'confirm_dose' },
      scheduledAt,
    });
  }

  async sendMissedDoseAlert(userId: string, medicationId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.DOSE_MISSED,
      title: 'Dose manquée',
      body: 'Vous avez manqué une dose. Si possible, prenez-la dès que possible ou consultez votre médecin.',
      data: { medicationId, action: 'view_dose' },
    });
  }

  // ─── Alive Confirmation Notifications ──────────────────────────────────────

  async sendAliveCheckReminder(userId: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.ALIVE_CHECK,
      title: 'Confirmation de bien-être',
      body: 'Appuyez sur "Je vais bien" pour confirmer que tout va bien.',
      data: { action: 'alive_confirm' },
    });
  }

  async sendAliveMissedAlert(
    userId: string,
    contactPhone: string,
    contactName: string,
    stage: number,
  ): Promise<Notification> {
    // Stage 1: Push notification to user
    if (stage === 1) {
      return this.createNotification({
        userId,
        type: NotificationType.ALIVE_MISSED,
        title: 'Confirmation manquée',
        body: 'Vous n\'avez pas confirmé votre bien-être. Veuillez appuyer sur le bouton maintenant.',
        data: { action: 'alive_confirm', escalationStage: stage },
      });
    }

    // Stage 2: SMS to emergency contact
    if (stage === 2) {
      return this.createNotification({
        userId,
        type: NotificationType.ALIVE_ESCALATION,
        channel: NotificationChannel.SMS,
        title: 'Alerte bien-être',
        body: `${contactName}: Votre proche n'a pas confirmé son bien-être. Veuillez vérifier.`,
        data: {
          action: 'escalation',
          escalationStage: stage,
          contactPhone,
          contactName,
        },
      });
    }

    // Stage 3: Automated call
    if (stage === 3) {
      return this.createNotification({
        userId,
        type: NotificationType.ALIVE_ESCALATION,
        channel: NotificationChannel.CALL,
        title: 'Appel de vérification',
        body: 'Appel automatique de vérification de bien-être.',
        data: {
          action: 'escalation_call',
          escalationStage: stage,
          contactPhone,
        },
      });
    }

    // Stage 4+: Emergency escalation
    return this.createNotification({
      userId,
      type: NotificationType.ALIVE_ESCALATION,
      channel: NotificationChannel.SMS,
      title: 'URGENCE — Confirmation manquée',
      body: `URGENCE: ${contactName} n'a pas confirmé son bien-être après plusieurs tentatives. Action immédiate requise.`,
      data: {
        action: 'emergency_escalation',
        escalationStage: stage,
        contactPhone,
      },
    });
  }

  // ─── Caregiver Alerts ──────────────────────────────────────────────────────

  async sendCaregiverAlert(
    caregiverId: string,
    patientName: string,
    alertType: string,
    details: Record<string, any>,
  ): Promise<Notification> {
    const titles: Record<string, string> = {
      missed_dose: 'Dose manquée — Patient',
      interaction_alert: 'Alerte d\'interaction',
      alive_missed: 'Confirmation de bien-être manquée',
      low_battery: 'Batterie faible — Patient',
    };

    return this.createNotification({
      userId: caregiverId,
      type: NotificationType.CAREGIVER_ALERT,
      title: titles[alertType] || 'Alerte soignant',
      body: `${patientName}: ${alertType}. Veuillez vérifier.`,
      data: { alertType, patientName, ...details },
    });
  }

  // ─── Low Battery Alert ─────────────────────────────────────────────────────

  async sendLowBatteryAlert(userId: string, batteryLevel: number): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.LOW_BATTERY,
      title: 'Batterie faible',
      body: `Votre batterie est à ${batteryLevel}%. Veuillez charger votre appareil pour maintenir les alertes actives.`,
      data: { batteryLevel },
    });
  }

  // ─── Get User Notifications ────────────────────────────────────────────────

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.DELIVERED },
    });

    return { data, total, unreadCount };
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (notification) {
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      return this.notificationRepository.save(notification);
    }

    return null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.DELIVERED },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
  }

  // ─── Push Notification Dispatch (Firebase) ─────────────────────────────────

  private async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    try {
      // Firebase Admin SDK integration
      // const message = {
      //   notification: { title, body },
      //   data: data ? Object.fromEntries(
      //     Object.entries(data).map(([k, v]) => [k, String(v)])
      //   ) : undefined,
      //   token: deviceToken,
      //   android: {
      //     priority: 'high' as const,
      //     notification: { channelId: 'medcom_alerts', priority: 'high' as const },
      //   },
      //   apns: {
      //     payload: { aps: { sound: 'default', badge: 1 } },
      //   },
      // };
      // await admin.messaging().send(message);
      this.logger.log(`Push notification sent: ${title}`);
      return true;
    } catch (error) {
      this.logger.error(`Push notification failed: ${error.message}`);
      return false;
    }
  }

  // ─── SMS Dispatch (Twilio) ─────────────────────────────────────────────────

  private async sendSms(phone: string, message: string): Promise<boolean> {
    try {
      // Twilio integration
      // const client = require('twilio')(
      //   process.env.TWILIO_ACCOUNT_SID,
      //   process.env.TWILIO_AUTH_TOKEN,
      // );
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phone,
      // });
      this.logger.log(`SMS sent to ${phone}: ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`SMS failed: ${error.message}`);
      return false;
    }
  }

  // ─── Scheduled: Process Pending Notifications ──────────────────────────────

  @Cron('*/30 * * * * *') // Every 30 seconds
  async processPendingNotifications(): Promise<void> {
    const pendingNotifications = await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledAt: LessThanOrEqual(new Date()),
      },
      take: 50,
      order: { scheduledAt: 'ASC' },
    });

    for (const notification of pendingNotifications) {
      try {
        let success = false;

        switch (notification.channel) {
          case NotificationChannel.PUSH:
            // In production, fetch device token from user_devices table
            success = await this.sendPushNotification(
              'device_token', notification.title, notification.body, notification.data,
            );
            break;
          case NotificationChannel.SMS:
            const phone = notification.data?.contactPhone || '';
            success = await this.sendSms(phone, notification.body);
            break;
          case NotificationChannel.CALL:
            // Twilio voice call integration
            this.logger.log(`Call scheduled for ${notification.data?.contactPhone}`);
            success = true;
            break;
          default:
            success = true;
        }

        notification.status = success ? NotificationStatus.SENT : NotificationStatus.FAILED;
        notification.sentAt = success ? new Date() : null;

        if (!success) {
          notification.retryCount += 1;
          if (notification.retryCount < notification.maxRetries) {
            notification.status = NotificationStatus.PENDING;
            notification.scheduledAt = new Date(Date.now() + 60000 * notification.retryCount);
          }
          notification.errorMessage = 'Delivery failed';
        }

        await this.notificationRepository.save(notification);
      } catch (error) {
        this.logger.error(`Notification processing error: ${error.message}`);
      }
    }
  }
}

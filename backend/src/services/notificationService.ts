import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { socketManager } from '../utils/socketManager.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

// Configure Nodemailer (Using a mock ethereal account for demonstration)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

export class NotificationService {
  async sendEmailNotification(userEmail: string, message: string) {
    try {
      const info = await transporter.sendMail({
        from: '"Workflow Engine" <no-reply@workflow.com>',
        to: userEmail,
        subject: 'Workflow Notification',
        text: message,
      });

      logger.info(`Email notification sent: ${userEmail} (Preview: ${nodemailer.getTestMessageUrl(info)})`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      logger.error(`Failed to send email notification: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async createInAppNotification(userId: string, message: string) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type: 'in-app',
          status: 'pending',
        },
      });

      // Emit real-time notification via Socket.io
      socketManager.emitNotification(userId, notification);

      logger.info(`In-app notification created for user ${userId}`);
      return notification;
    } catch (error: any) {
      logger.error(`Failed to create in-app notification: ${error.message}`);
      throw error;
    }
  }

  async notifyStepUpdate(userId: string, userEmail: string | null, stepName: string, status: string) {
    const message = `Workflow step "${stepName}" ${status}.`;

    // Always create in-app notification
    await this.createInAppNotification(userId, message);

    // Send email notification if email is provided
    if (userEmail) {
      await this.sendEmailNotification(userEmail, message);
    }
  }

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

export const notificationService = new NotificationService();

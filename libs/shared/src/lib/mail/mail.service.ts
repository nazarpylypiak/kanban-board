import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('MAIL_HOST') || 'smtp.mailtrap.io',
      port: Number(config.get<string>('MAIL_PORT')) || 2525,
      auth: {
        user: config.get<string>('MAIL_USER'),
        pass: config.get<string>('MAIL_PASS')
      }
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: '"Kanban Board" <no-reply@kanban.app>',
        to,
        subject,
        text
      });
      this.logger.log(`📧 Email sent to ${to} (${subject})`);
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(
          `Failed to send email to ${to}: ${err.message}`,
          err.stack
        );
      } else {
        this.logger.error(
          `Unknown error while sending email to ${to}: ${JSON.stringify(err)}`
        );
      }
    }
  }
}

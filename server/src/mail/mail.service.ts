import { Injectable, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly emailApi: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey =
      process.env.BREVO_API_KEY;

    this.emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    this.logger.log('Brevo Mail Service initialized ');
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      await this.emailApi.sendTransacEmail({
        sender: {
          email: process.env.SMTP_FROM!,
          name: 'Appointment System',
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html,
      });

      this.logger.log(`Email sent to ${options.to} `);
    } catch (error: any) {
      this.logger.error(
        'Email failed ',
        error?.response?.body || error.message,
      );
    }
  }
}

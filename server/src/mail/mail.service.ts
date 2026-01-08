import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTestMail(to: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'SMTP Test Mail',
      text: 'SMTP is working successfully',
    });

    console.log('Test email sent to', to);
  }
}

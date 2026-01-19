import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

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

  this.transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP CONFIG ERROR ❌", error);
    } else {
      console.log("SMTP READY ✅");
    }
  });
}


  sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    this.transporter
      .sendMail({
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })
      .catch((err) => {
        console.error('Email failed:', err.message);
      });
  }
}

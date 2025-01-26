import { createTransporter } from '../config/mailConfig';
import { SentMessageInfo } from 'nodemailer';

interface EmailOptions {
  from?: string;
  to: string;   
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<SentMessageInfo> => {
  const transporter = createTransporter();

  const from = options.from || `"Default Sender" <${process.env.SMTP_USER}>`;

  const mailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text || '',
    html: options.html || '',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

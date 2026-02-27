import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

// Cria transporter apenas se SMTP estiver configurado (produção)
let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/** Indica se o email está configurado para envio real (SMTP). */
export function isEmailConfigured(): boolean {
  return transporter !== null;
}

export class EmailService {
  /**
   * Envia email de confirmação de agendamento
   */
  async sendAppointmentConfirmation(data: {
    to: string;
    clientName: string;
    providerName: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    location?: string;
    publicToken?: string;
  }): Promise<void> {
    if (!transporter) {
      console.log('Email não configurado. Dados do agendamento:', data);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Agendamento Confirmado!</h1>
            </div>
            <div class="content">
              <p>Olá ${data.clientName},</p>
              <p>Seu agendamento com <strong>${data.providerName}</strong> foi confirmado!</p>
              <p><strong>Data:</strong> ${data.appointmentDate}</p>
              <p><strong>Horário:</strong> ${data.appointmentTime}</p>
              <p><strong>Duração:</strong> ${data.duration} minutos</p>
              ${data.location ? `<p><strong>Local:</strong> ${data.location}</p>` : ''}
              ${data.publicToken ? `<p><a href="${env.FRONTEND_URL}/confirm/${data.publicToken}" class="button">Ver ou cancelar agendamento</a></p><p>Ou use este link: ${env.FRONTEND_URL}/confirm/${data.publicToken}</p>` : ''}
              <p>Obrigado por usar nosso sistema!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to: data.to,
        subject: 'Agendamento Confirmado - SmartSupport',
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new AppError('Erro ao enviar email de confirmação', 500);
    }
  }

  /**
   * Envia email de reset de senha
   */
  async sendPasswordReset(data: {
    to: string;
    name: string;
    resetToken: string;
  }): Promise<void> {
    if (!transporter) {
      console.log('Email não configurado. Token de reset:', data.resetToken);
      return;
    }

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${data.resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset de Senha</h1>
            <p>Olá ${data.name},</p>
            <p>Você solicitou um reset de senha. Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
            <p>Ou copie e cole este link no navegador:</p>
            <p>${resetUrl}</p>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou este reset, ignore este email.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to: data.to,
        subject: 'Reset de Senha - SmartSupport',
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new AppError('Erro ao enviar email de reset', 500);
    }
  }

  /**
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(data: {
    to: string;
    name: string;
  }): Promise<void> {
    if (!transporter) {
      console.log('Email não configurado. Bem-vindo:', data.name);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Bem-vindo ao SmartSupport!</h1>
            <p>Olá ${data.name},</p>
            <p>Obrigado por se cadastrar em nossa plataforma de agendamento.</p>
            <p>Comece a usar agora mesmo!</p>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: env.SMTP_FROM || env.SMTP_USER,
        to: data.to,
        subject: 'Bem-vindo ao SmartSupport!',
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      // Não lança erro para não bloquear o registro
    }
  }
}

export const emailService = new EmailService();

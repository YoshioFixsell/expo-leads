import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async sendTestEmail(toEmail: string, name: string) {
    const fromEmail = this.configService.get('SES_FROM_EMAIL');
    
    if (!fromEmail) {
        this.logger.warn('SES_FROM_EMAIL is not configured. Email will not be sent.');
        return;
    }

    const params = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: '¡Gracias por visitarnos en la Expo!',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #007bff;">¡Hola ${name}!</h2>
                <p>Muchas gracias por dejarnos tus datos y por tu interés en <strong>Fixsell</strong>.</p>
                <p>Te escribimos para recordarte que <strong>nuestro equipo de ventas está a tu entera disposición</strong>. Estamos listos para resolver cualquier duda que tengas sobre nuestros productos, brindarte asesoría técnica y apoyarte con cualquier cotización que ocupes para tus proyectos.</p>
                <br/>
                <p>¡Esperamos tener la oportunidad de trabajar contigo muy pronto!</p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
                  Saludos cordiales,<br/>
                  <strong>El equipo de Ventas</strong><br/>
                  Fixsell de Norte, S.A. de C.V.<br/>
                  <a href="http://www.fixsell.com" style="color: #007bff;">www.fixsell.com</a>
                </p>
              </div>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `¡Hola ${name}!\n\nMuchas gracias por dejarnos tus datos y por tu interés en Fixsell.\n\nTe escribimos para recordarte que nuestro equipo de ventas está a tu entera disposición. Estamos listos para resolver cualquier duda que tengas sobre nuestros productos, brindarte asesoría técnica y apoyarte con cualquier cotización que ocupes para tus proyectos.\n\n¡Esperamos tener la oportunidad de trabajar contigo muy pronto!\n\nSaludos cordiales,\nEl equipo de Ventas\nFixsell de Norte, S.A. de C.V.\nwww.fixsell.com`,
            Charset: 'UTF-8',
          }
        },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Email sent successfully to ${toEmail}`);
    } catch (error) {
      this.logger.error('Error sending email via SES', error);
      throw error;
    }
  }
}

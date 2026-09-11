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

  async sendTestEmail(toEmail: string, name: string, company?: string) {
    const fromEmail = this.configService.get('SES_FROM_EMAIL');
    
    if (!fromEmail) {
        this.logger.warn('SES_FROM_EMAIL is not configured. Email will not be sent.');
        return;
    }

    const companyMention = company && company.trim() 
      ? ` para <strong>${this.escapeHtml(company.trim())}</strong>` 
      : '';
    const companyTextMention = company && company.trim() 
      ? ` para ${company.trim()}` 
      : '';
    const sanitizedName = this.escapeHtml(name.trim());

    const params = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: '¡Gracias por visitarnos en Expo Fespa 2026! | Fixsell del Norte',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.buildHtmlTemplate(sanitizedName, companyMention),
            Charset: 'UTF-8',
          },
          Text: {
            Data: this.buildTextTemplate(name.trim(), companyTextMention),
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

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private buildHtmlTemplate(name: string, companyMentionHtml: string): string {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>¡Gracias por visitarnos en la Expo! | Fixsell del Norte</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    a.cta-btn, a.cta-btn:link, a.cta-btn:visited, a.cta-btn:hover, a.cta-btn:active {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 24px 18px !important; }
      .feature-box { padding: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader preview text -->
  <div style="display: none; font-size: 1px; color: #f4f6f8; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ¡Gracias por visitarnos en Expo Fespa 2026! Nuestro equipo de ventas y asesores técnicos está a tu entera disposición.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f4f6f8; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 30px 12px 40px 12px;">
        
        <!-- Main Email Container Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Top Accent Stripe (Fixsell Crimson) -->
          <tr>
            <td height="5" style="background-color: #ae1d3e; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header with Hosted S3 Logo -->
          <tr>
            <td align="center" style="padding: 36px 30px 24px 30px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
              <a href="https://www.fixsell.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://fixsell-prod-assets.s3.us-east-1.amazonaws.com/app-assets/fixsell-logo.png" 
                     alt="Fixsell del Norte" 
                     width="220" 
                     style="max-width: 220px; width: 100%; height: auto; display: block; border: 0;" />
              </a>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px; text-align: left; color: #334155;">
              
              <!-- Expo Badge (Balanced Neutral Slate) -->
              <div style="text-align: center; margin-bottom: 22px;">
                <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #475569; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; padding: 5px 14px; text-transform: uppercase; letter-spacing: 0.8px;">
                  <span style="color: #ae1d3e; font-size: 10px; vertical-align: middle; margin-right: 4px;">●</span>Expo Fespa 2026 • Seguimiento Comercial
                </span>
              </div>

              <!-- Greeting -->
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.3; text-align: center;">
                ¡Hola, ${name}!
              </h1>

              <!-- Introduction -->
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Fue un gran gusto coincidir contigo en <strong>Expo Fespa 2026</strong>. Queremos agradecerte por brindarnos tus datos y por tu interés en las soluciones que ofrecemos en <strong>Fixsell del Norte</strong>${companyMentionHtml}.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Te escribimos para recordarte que <strong>nuestro equipo de ventas y asesores técnicos está a tu entera disposición</strong>. Estamos listos para apoyarte con:
              </p>

              <!-- Value Props / Feature Cards -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin-bottom: 24px;">
                <!-- Feature 1 -->
                <tr>
                  <td class="feature-box" style="padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tr>
                        <td width="36" valign="top" style="font-size: 20px; line-height: 1; padding-top: 2px;">
                          ⚙️
                        </td>
                        <td style="font-size: 14px; line-height: 1.5; color: #334155;">
                          <strong style="color: #0f172a;">Asesoría Técnica y Especializada:</strong> Te orientamos en la selección óptima de productos y aplicaciones para tus necesidades específicas.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="10" style="font-size: 0; line-height: 0;">&nbsp;</td></tr>
                <!-- Feature 2 -->
                <tr>
                  <td class="feature-box" style="padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tr>
                        <td width="36" valign="top" style="font-size: 20px; line-height: 1; padding-top: 2px;">
                          ⚡
                        </td>
                        <td style="font-size: 14px; line-height: 1.5; color: #334155;">
                          <strong style="color: #0f172a;">Cotizaciones Ágiles a tu Medida:</strong> Elaboramos presupuestos claros y competitivos con rapidez para tus proyectos en puerta.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="10" style="font-size: 0; line-height: 0;">&nbsp;</td></tr>
                <!-- Feature 3 -->
                <tr>
                  <td class="feature-box" style="padding: 14px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tr>
                        <td width="36" valign="top" style="font-size: 20px; line-height: 1; padding-top: 2px;">
                          🤝
                        </td>
                        <td style="font-size: 14px; line-height: 1.5; color: #334155;">
                          <strong style="color: #0f172a;">Atención Comercial Directa:</strong> Acompañamiento constante y soluciones de suministro para impulsar el éxito de tu operación.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button Container with Generous Spacing -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                <tr>
                  <td align="center" style="padding: 30px 0 28px 0;">
                    <!-- Rounded Pill Button -->
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td align="center" bgcolor="#ae1d3e" style="border-radius: 50px; background-color: #ae1d3e; color: #ffffff;">
                          <a href="https://www.fixsell.com" target="_blank" class="cta-btn" style="font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 600; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; text-decoration: none !important; border-radius: 50px; padding: 15px 36px; border: 1px solid #ae1d3e; display: inline-block; background-color: #ae1d3e; line-height: 1.2;">
                            <span style="color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; text-decoration: none !important; font-weight: 600;">Explorar Soluciones en Fixsell</span>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Direct Contact Box (Neutral Executive Callout) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin-bottom: 28px;">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                      <tr>
                        <td width="32" valign="middle" style="font-size: 18px; line-height: 1; padding-right: 10px;">
                          📞
                        </td>
                        <td style="font-size: 14px; line-height: 1.5; color: #475569;">
                          <strong style="color: #0f172a; display: block; margin-bottom: 2px;">¿Requieres asistencia inmediata o cotización directa?</strong>
                          Llámanos al <a href="tel:8181143827" style="color: #0f172a; font-weight: 700; text-decoration: underline;">(81) 8114-3827</a> o responde directamente a este correo.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Sign-off -->
              <p style="margin: 0 0 4px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                ¡Esperamos tener la oportunidad de colaborar contigo muy pronto!
              </p>
              <p style="margin: 18px 0 0 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                Saludos cordiales,<br />
                <strong style="color: #0f172a; font-size: 15px;">El Equipo de Ventas y Soporte</strong><br />
                Fixsell del Norte, S.A. de C.V.
              </p>

            </td>
          </tr>

          <!-- Corporate Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; line-height: 1.6; color: #64748b;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">
                Fixsell del Norte, S.A. de C.V.
              </p>
              <p style="margin: 0 0 6px 0; color: #64748b;">
                Platón Sánchez 721, Centro, Monterrey, N.L. &bull; Tel. <a href="tel:8181143827" style="color: #475569; font-weight: 600; text-decoration: none;">(81) 8114-3827</a>
              </p>
              <p style="margin: 0 0 10px 0;">
                <a href="https://www.fixsell.com" target="_blank" style="color: #475569; text-decoration: underline; font-weight: 600;">www.fixsell.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Recibes este correo electrónico porque nos proporcionaste tus datos de contacto durante Expo Fespa 2026.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildTextTemplate(name: string, companyTextMention: string): string {
    return `¡Hola ${name}!

Fue un gran gusto coincidir contigo en Expo Fespa 2026. Queremos agradecerte por brindarnos tus datos y por tu interés en las soluciones de Fixsell del Norte${companyTextMention}.

Te escribimos para recordarte que nuestro equipo de ventas y asesores técnicos está a tu entera disposición. Estamos listos para apoyarte con:

• Asesoría Técnica y Especializada: Orientación para elegir los mejores productos y materiales para tus requerimientos específicos.
• Cotizaciones Ágiles a tu Medida: Presupuestos claros y competitivos con rapidez para tus proyectos.
• Atención Comercial Directa: Acompañamiento constante y soluciones para impulsar tu operación.

¿Requieres asistencia inmediata o cotización urgente?
Llámanos al (81) 8114-3827 o responde directamente a este correo para atenderte enseguida.

Conoce más de nuestro catálogo y soluciones en:
https://www.fixsell.com

¡Esperamos tener la oportunidad de colaborar contigo muy pronto!

Saludos cordiales,
El Equipo de Ventas y Soporte
Fixsell del Norte, S.A. de C.V.
Platón Sánchez 721, Centro, Monterrey, N.L.
Tel: (81) 8114-3827
www.fixsell.com`;
  }
}


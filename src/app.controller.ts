import { Controller, Get, Post, Body, Render, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { EmailService } from './email.service';
import { SheetsService } from './sheets.service';

@Controller()
export class AppController {
  constructor(
    private readonly emailService: EmailService,
    private readonly sheetsService: SheetsService
  ) {}

  @Get()
  @Render('index')
  getForm(@Query('success') success?: string, @Query('error') error?: string) {
    return { 
      success: success === 'true', 
      error: error === 'true' ? 'Ocurrió un problema procesando tu registro. Intenta de nuevo.' : null 
    };
  }

  @Post('submit')
  async handleSubmit(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('company') company: string,
    @Res() res: Response
  ) {
    try {
      // 1. Prioridad: Guardar el lead en Google Sheets para no perder los datos del cliente
      await this.sheetsService.addLead(name, email, company);

      // 2. Intentar enviar el correo de bienvenida
      try {
        await this.emailService.sendTestEmail(email, name);
      } catch (emailError) {
        // Si el correo falla, registramos el error pero NO detenemos el proceso.
        // El cliente ya está en tu base de datos, que es lo más importante.
        console.error('El lead se guardó en Sheets, pero hubo un error enviando el correo:', emailError);
      }

      // Responder éxito al frontend
      return res.status(200).json({ success: true });
    } catch (error) {
      // Si falla Google Sheets (paso 1), el código salta directo aquí.
      // Nunca se intenta enviar el correo, y le mostramos error al usuario para que reintente.
      console.error('Error crítico: No se pudo guardar el lead en Google Sheets:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

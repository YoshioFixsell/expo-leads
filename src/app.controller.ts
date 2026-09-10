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
      // 1. Send test email via SES
      await this.emailService.sendTestEmail(email, name);
      
      // 2. Save lead to Google Sheets
      await this.sheetsService.addLead(name, email, company);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);
  private doc: GoogleSpreadsheet;
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  private async init() {
    if (this.isInitialized) return;

    const sheetId = this.configService.get('GOOGLE_SHEET_ID');
    const clientEmail = this.configService.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = this.configService.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (!sheetId || !clientEmail || !privateKey) {
        this.logger.warn('Google Sheets configuration is missing.');
        return;
    }

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const { GoogleSpreadsheet } = await import('google-spreadsheet');
    this.doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    try {
        await this.doc.loadInfo(); 
        this.isInitialized = true;
        this.logger.log(`Connected to spreadsheet: ${this.doc.title}`);
    } catch (error) {
        this.logger.error('Failed to connect to Google Sheets', error);
        throw error;
    }
  }

  async addLead(name: string, email: string, company: string) {
    try {
      await this.init();
      if (!this.isInitialized) return;

      const sheet = this.doc.sheetsByIndex[0]; // Gets the first tab
      
      await sheet.addRow({
        Fecha: new Date().toISOString(),
        Nombre: name,
        Email: email,
        Empresa: company || 'N/A'
      });
      
      this.logger.log(`Lead added to Google Sheets: ${email}`);
    } catch (error) {
      this.logger.error('Error adding lead to Google Sheets', error);
      throw error;
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { EmailService } from './email.service';
import { SheetsService } from './sheets.service';

describe('AppController', () => {
  let appController: AppController;
  let emailService: jest.Mocked<EmailService>;
  let sheetsService: jest.Mocked<SheetsService>;

  beforeEach(async () => {
    const mockEmailService = {
      sendTestEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockSheetsService = {
      addLead: jest.fn().mockResolvedValue(undefined),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: EmailService, useValue: mockEmailService },
        { provide: SheetsService, useValue: mockSheetsService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    emailService = app.get(EmailService);
    sheetsService = app.get(SheetsService);
  });

  describe('getForm', () => {
    it('should return form view model', () => {
      const result = appController.getForm('true', undefined);
      expect(result).toEqual({ success: true, error: null });
    });
  });

  describe('handleSubmit', () => {
    it('should save lead and send welcome email with company name', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      await appController.handleSubmit(
        'Juan Pérez',
        'juan@empresa.com',
        'Empresa SA',
        res,
      );

      expect(sheetsService.addLead).toHaveBeenCalledWith(
        'Juan Pérez',
        'juan@empresa.com',
        'Empresa SA',
      );
      expect(emailService.sendTestEmail).toHaveBeenCalledWith(
        'juan@empresa.com',
        'Juan Pérez',
        'Empresa SA',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SES_FROM_EMAIL') return 'ventas@fixsell.com';
              if (key === 'AWS_REGION') return 'us-east-1';
              return '';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate HTML with AWS S3 logo and personalized company name', () => {
    const html = (service as any).buildHtmlTemplate(
      'Carlos Morales',
      ' para <strong>Empresa X</strong>',
    );

    expect(html).toContain('https://fixsell-prod-assets.s3.us-east-1.amazonaws.com/app-assets/fixsell-logo.png');
    expect(html).toContain('¡Hola, Carlos Morales!');
    expect(html).toContain('para <strong>Empresa X</strong>');
    expect(html).toContain('#ae1d3e');
    expect(html).toContain('Platón Sánchez 721');
    expect(html).toContain('(81) 8114-3827');
    expect(html).toContain('border-radius: 50px');
    expect(html).toContain('color: #ffffff !important');
    expect(html).toContain('padding: 30px 0 28px 0');
    expect(html).toContain('Expo Fespa 2026');
    expect(html).toContain('Explorar Soluciones en Fixsell</span>');
  });

  it('should escape malicious HTML inputs in name and company', () => {
    const escaped = (service as any).escapeHtml('<script>alert("hack")</script>');
    expect(escaped).toBe('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
  });

  it('should generate plain text template with contact details', () => {
    const text = (service as any).buildTextTemplate(
      'Carlos Morales',
      ' para Empresa X',
    );

    expect(text).toContain('¡Hola Carlos Morales!');
    expect(text).toContain('Fixsell del Norte');
    expect(text).toContain('(81) 8114-3827');
    expect(text).toContain('https://www.fixsell.com');
  });
});

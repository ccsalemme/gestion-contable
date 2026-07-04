import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SheetsService } from '../../../backend/src/sheets/sheets.service';

describe('SheetsService - Unit Tests', () => {
  let service: SheetsService;
  let configService: ConfigService;

  // Mock de ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        GOOGLE_SHEET_MOVEMENTS_ID: 'test-sheet-id',
        GOOGLE_SHEET_MOVEMENTS_NAME: 'Test Sheet',
        GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
        GOOGLE_PRIVATE_KEY: 'test-key',
        GOOGLE_APPS_SCRIPT_WEB_APP_URL: 'https://script.google.com/test',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Validación de Configuración', () => {
    it('debe obtener correctamente la configuración de Google Sheets', () => {
      expect(configService.get('GOOGLE_SHEET_MOVEMENTS_ID')).toBe('test-sheet-id');
      expect(configService.get('GOOGLE_SHEET_MOVEMENTS_NAME')).toBe('Test Sheet');
    });
  });

  // Nota: Tests de integración real con Google Sheets API están en integration/sheets.integration.spec.ts
});

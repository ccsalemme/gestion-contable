import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'

export interface SheetRow {
  [key: string]: string | number | boolean | null
}

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name)
  private sheets: any
  private auth: any

  constructor(private configService: ConfigService) {
    this.initializeGoogleSheets()
  }

  private async initializeGoogleSheets() {
    try {
      const keyPath = this.configService.get<string>('GOOGLE_SHEETS_PRIVATE_KEY_PATH')
      
      if (!keyPath) {
        this.logger.warn('GOOGLE_SHEETS_PRIVATE_KEY_PATH not configured')
        return
      }
      
      const fullPath = path.join(process.cwd(), keyPath)
      
      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`Google Sheets credentials not found at ${fullPath}`)
        return
      }

      const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
      })

      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      this.logger.log('Google Sheets API initialized successfully')
    } catch (error) {
      this.logger.error(`Failed to initialize Google Sheets: ${error.message}`)
    }
  }

  /**
   * Obtiene datos de Google Sheets
   */
  async getSheetData(sheetId?: string, range: string = 'A1:Z1000'): Promise<SheetRow[]> {
    try {
      const spreadsheetId = sheetId || this.configService.get<string>('GOOGLE_SHEET_ID')
      
      if (!this.sheets || !spreadsheetId) {
        this.logger.warn('Google Sheets not configured, returning mock data')
        return this.getMockData()
      }

      this.logger.log(`Fetching data from spreadsheet ${spreadsheetId} with range ${range}`)

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        this.logger.warn('No data found in sheet')
        return []
      }

      // Primera fila como headers
      const headers = rows[0]
      const data: SheetRow[] = []

      this.logger.log(`Found ${rows.length} rows with headers: ${headers.join(', ')}`)

      // Convertir filas a objetos
      for (let i = 1; i < rows.length; i++) {
        const row: SheetRow = {}
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j]
          const value = rows[i][j] || ''
          row[header] = value
        }
        data.push(row)
      }

      this.logger.log(`Retrieved ${data.length} rows from Google Sheets`)
      return data
    } catch (error) {
      this.logger.error(`Error fetching sheet data: ${error.message}`)
      return this.getMockData()
    }
  }

  /**
   * Datos mock para desarrollo
   */
  private getMockData(): SheetRow[] {
    return [
      {
        ID: '1',
        Nombre: 'Juan',
        Apellido: 'Pérez',
        Email: 'juan.perez@example.com',
        Teléfono: '+34 600 123 456',
        Estado: 'Activo',
        'Fecha de Registro': '2023-01-15',
      },
      {
        ID: '2',
        Nombre: 'María',
        Apellido: 'García',
        Email: 'maria.g@example.com',
        Teléfono: '+34 611 987 654',
        Estado: 'Pendiente',
        'Fecha de Registro': '2023-02-20',
      },
      {
        ID: '3',
        Nombre: 'Carlos',
        Apellido: 'López',
        Email: 'clopez@example.com',
        Teléfono: '+34 622 345 678',
        Estado: 'Inactivo',
        'Fecha de Registro': '2023-03-05',
      },
      {
        ID: '4',
        Nombre: 'Ana',
        Apellido: 'Martínez',
        Email: 'ana.m@example.com',
        Teléfono: '+34 633 456 789',
        Estado: 'Activo',
        'Fecha de Registro': '2023-04-10',
      },
    ]
  }
}

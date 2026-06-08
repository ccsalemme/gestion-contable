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
          'https://www.googleapis.com/auth/spreadsheets',
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
   * Convierte un índice de columna (0-based) a letra de columna (A, B, ..., Z, AA, AB, ...)
   */
  private columnIndexToLetter(index: number): string {
    let label = ''
    let temp = index
    while (temp >= 0) {
      label = String.fromCharCode(65 + (temp % 26)) + label
      temp = Math.floor(temp / 26) - 1
    }
    return label
  }

  /**
   * Obtiene datos de Google Sheets
   */
  async getSheetData(sheetId?: string, range: string = 'A1:ZZ1000'): Promise<SheetRow[]> {
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

  /**
   * Actualiza una celda en Google Sheets
   * @param sheetId ID de la hoja de cálculo
   * @param range Rango de la celda (ej: 'A1', 'B5', 'Sheet1!C10')
   * @param value Valor a escribir
   */
  async updateCell(sheetId: string, range: string, value: any): Promise<any> {
    try {
      if (!this.sheets) {
        this.logger.warn('Google Sheets not configured')
        return { success: false, message: 'Google Sheets not configured' }
      }

      this.logger.log(`Updating cell ${range} in spreadsheet ${sheetId} with value: ${value}`)

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[value]],
        },
      })

      this.logger.log(`Cell updated successfully: ${response.data.updatedCells} cells updated`)
      return {
        success: true,
        updatedCells: response.data.updatedCells,
        updatedRange: response.data.updatedRange,
      }
    } catch (error) {
      this.logger.error(`Error updating cell: ${error.message}`)
      return { success: false, message: error.message }
    }
  }

  /**
   * Actualiza múltiples celdas en Google Sheets
   */
  async updateCells(sheetId: string, updates: Array<{range: string, value: any}>): Promise<any> {
    try {
      if (!this.sheets) {
        this.logger.warn('Google Sheets not configured')
        return { success: false, message: 'Google Sheets not configured' }
      }

      const data = updates.map(update => ({
        range: update.range,
        values: [[update.value]],
      }))

      const response = await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data,
        },
      })

      this.logger.log(`Batch update completed: ${response.data.totalUpdatedCells} cells updated`)
      return {
        success: true,
        totalUpdatedCells: response.data.totalUpdatedCells,
        responses: response.data.responses,
      }
    } catch (error) {
      this.logger.error(`Error updating cells: ${error.message}`)
      return { success: false, message: error.message }
    }
  }

  /**
   * Obtiene información sobre las pestañas/hojas del spreadsheet
   */
  async getSheetMetadata(sheetId?: string): Promise<any> {
    try {
      const spreadsheetId = sheetId || this.configService.get<string>('GOOGLE_SHEET_ID')
      
      if (!this.sheets || !spreadsheetId) {
        this.logger.warn('Google Sheets not configured')
        return { success: false, message: 'Google Sheets not configured' }
      }

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets(properties(sheetId,title,index,gridProperties))',
      })

      const sheetsList = response.data.sheets.map((sheet: any) => ({
        sheetId: sheet.properties.sheetId,
        title: sheet.properties.title,
        index: sheet.properties.index,
        rowCount: sheet.properties.gridProperties?.rowCount,
        columnCount: sheet.properties.gridProperties?.columnCount,
      }))

      this.logger.log(`Retrieved ${sheetsList.length} sheets from spreadsheet`)
      return {
        success: true,
        sheets: sheetsList,
      }
    } catch (error) {
      this.logger.error(`Error fetching sheet metadata: ${error.message}`)
      return { success: false, message: error.message }
    }
  }

  /**
   * Obtiene datos de una pestaña específica
   */
  async getSheetDataByName(spreadsheetId: string, sheetName: string, range?: string): Promise<SheetRow[]> {
    try {
      if (!this.sheets) {
        this.logger.warn('Google Sheets not configured')
        return []
      }

      // Si no se especifica un rango, obtener el metadata para determinar el tamaño real de la hoja
      let fullRange: string
      if (range) {
        fullRange = `'${sheetName}'!${range}`
      } else {
        // Obtener metadata para saber cuántas columnas tiene la hoja
        const metadata = await this.getSheetMetadata(spreadsheetId)
        const sheetMeta = metadata.sheets.find(s => s.title === sheetName)
        
        if (sheetMeta && sheetMeta.columnCount) {
          // Convertir el número de columnas a letra (A, B, ..., Z, AA, AB, ...)
          const lastColumn = this.columnIndexToLetter(sheetMeta.columnCount - 1)
          fullRange = `'${sheetName}'!A1:${lastColumn}1000`
          this.logger.log(`Using dynamic range for ${sheetMeta.columnCount} columns: ${fullRange}`)
        } else {
          // Fallback al rango por defecto
          fullRange = `'${sheetName}'!A1:ZZ1000`
        }
      }

      this.logger.log(`Fetching data from sheet "${sheetName}" with range ${fullRange}`)

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: fullRange,
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        this.logger.warn(`No data found in sheet "${sheetName}"`)
        return []
      }

      // Primera fila como headers (generar headers automáticos para columnas sin nombre)
      const firstRow = rows[0]
      const headers: string[] = []
      const maxColumns = firstRow.length
      
      for (let j = 0; j < maxColumns; j++) {
        if (firstRow[j] && firstRow[j].toString().trim()) {
          headers.push(firstRow[j].toString().trim())
        } else {
          // Generar header automático para columna vacía
          headers.push(`Column ${this.columnIndexToLetter(j)}`)
        }
      }
      
      const data: SheetRow[] = []

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

      this.logger.log(`Retrieved ${data.length} rows from sheet "${sheetName}"`)
      return data
    } catch (error) {
      this.logger.error(`Error fetching data from sheet "${sheetName}": ${error.message}`)
      return []
    }
  }

  /**
   * Exporta datos a diferentes formatos
   */
  async exportData(sheetId: string | undefined, format: 'json' | 'csv', range?: string): Promise<any> {
    try {
      const data = await this.getSheetData(sheetId, range)

      if (format === 'json') {
        return {
          success: true,
          format: 'json',
          data,
        }
      }

      if (format === 'csv') {
        // Convertir a CSV
        if (data.length === 0) {
          return { success: true, format: 'csv', data: '' }
        }

        const headers = Object.keys(data[0])
        const csvRows = [headers.join(',')]

        for (const row of data) {
          const values = headers.map(header => {
            const value = row[header]
            // Escapar valores que contengan comas o comillas
            const escaped = String(value || '').replace(/"/g, '""')
            return `"${escaped}"`
          })
          csvRows.push(values.join(','))
        }

        return {
          success: true,
          format: 'csv',
          data: csvRows.join('\n'),
        }
      }

      return { success: false, message: 'Unsupported format' }
    } catch (error) {
      this.logger.error(`Error exporting data: ${error.message}`)
      return { success: false, message: error.message }
    }
  }
}

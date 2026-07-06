import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

export interface SheetRow {
  [key: string]: string | number | boolean | null
}

export interface CellFormat {
  backgroundColor?: { red?: number; green?: number; blue?: number; alpha?: number }
  textFormat?: {
    foregroundColor?: { red?: number; green?: number; blue?: number; alpha?: number }
    fontFamily?: string
    fontSize?: number
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
  }
  horizontalAlignment?: string
  verticalAlignment?: string
  numberFormat?: {
    type?: string
    pattern?: string
  }
  borders?: {
    top?: any
    bottom?: any
    left?: any
    right?: any
  }
}

export interface FormattedCell {
  value: string | number | boolean | null
  formattedValue?: string
  format?: CellFormat
  row: number
  col: number
}

export interface SheetDataWithFormat {
  cells: FormattedCell[]
  headers: string[]
  rowCount: number
  columnCount: number
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
      this.logger.log('🔧 Iniciando configuración de Google Sheets...')
      
      // Intentar leer credenciales desde variable de entorno (Render)
      const jsonCredentials = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON')
      this.logger.log(`🔍 GOOGLE_SERVICE_ACCOUNT_JSON exists: ${jsonCredentials ? 'YES' : 'NO'}`)
      this.logger.log(`🔍 Length: ${jsonCredentials ? jsonCredentials.length : 0}`)
      let credentials: any

      if (jsonCredentials) {
        this.logger.log('✅ Using Google credentials from environment variable')
        try {
          credentials = JSON.parse(jsonCredentials)
          
          // Fix: Check if private_key first 100 chars contain a REAL newline (not \n text)
          if (credentials.private_key) {
            const first100 = credentials.private_key.substring(0, 100)
            const hasRealNewline = first100.split('\n').length > 1
            this.logger.log(`🔍 Private key first 100 chars have real newline: ${hasRealNewline}`)
            
            if (!hasRealNewline) {
              this.logger.log('🔧 Private key has no real newlines, reformatting...')
              // Remove any literal \n and rebuild with proper structure
              let key = credentials.private_key.replace(/\\n/g, '')
              key = key.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
              key = key.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----')
              
              const beginMatch = key.match(/-----BEGIN PRIVATE KEY-----\n/)
              const endMatch = key.match(/\n-----END PRIVATE KEY-----/)
              if (beginMatch && endMatch) {
                const header = beginMatch[0]
                const footer = endMatch[0]
                const startIdx = beginMatch.index + beginMatch[0].length
                const endIdx = endMatch.index
                const body = key.substring(startIdx, endIdx)
                
                // Split body into 64-char lines
                const lines = []
                for (let i = 0; i < body.length; i += 64) {
                  lines.push(body.substring(i, i + 64))
                }
                credentials.private_key = header + lines.join('\n') + footer
                this.logger.log('✅ Private key reformatted with proper line breaks')
              }
            }
          }
          
          this.logger.log(`✅ JSON parsed successfully. Email: ${credentials.client_email}`)
        } catch (parseError) {
          this.logger.error(`❌ Failed to parse JSON: ${parseError.message}`)
          this.logger.error(`First 100 chars: ${jsonCredentials.substring(0, 100)}`)
          return
        }
      } else {
        // Fallback: leer desde archivo (desarrollo local)
        this.logger.log('📁 Intentando leer credenciales desde archivo...')
        const keyPath = this.configService.get<string>('GOOGLE_SHEETS_PRIVATE_KEY_PATH')
        
        if (!keyPath) {
          this.logger.warn('⚠️  Neither GOOGLE_SERVICE_ACCOUNT_JSON nor GOOGLE_SHEETS_PRIVATE_KEY_PATH configured')
          return
        }
        
        this.logger.log(`📁 Ruta de credenciales: ${keyPath}`)
        
        const fullPath = path.join(process.cwd(), keyPath)
        
        this.logger.log(`📂 Ruta completa: ${fullPath}`)
        
        if (!fs.existsSync(fullPath)) {
          this.logger.warn(`⚠️  Google Sheets credentials not found at ${fullPath}`)
          return
        }

        this.logger.log('📄 Archivo de credenciales encontrado, leyendo...')
        
        credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      }
      
      this.logger.log('🔐 Creando autenticación de Google...')
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
      })

      this.logger.log('📊 Inicializando cliente de Sheets API...')
      
      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      
      this.logger.log('✅ Google Sheets API initialized successfully')
      this.logger.log(`🔍 Estado final: this.sheets=${this.sheets ? 'OK' : 'NULL'}, this.auth=${this.auth ? 'OK' : 'NULL'}`)
    } catch (error) {
      this.logger.error(`❌ Failed to initialize Google Sheets: ${error.message}`)
      this.logger.error(`Stack: ${error.stack}`)
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
   * Agrega una nueva fila al final de una hoja específica
   */
  async appendRow(spreadsheetId: string, sheetName: string, values: any[]): Promise<any> {
    try {
      this.logger.log(`🔍 appendRow llamado: spreadsheetId=${spreadsheetId}, sheetName=${sheetName}`)
      this.logger.log(`📊 Valores a escribir: ${JSON.stringify(values)}`)
      
      if (!this.sheets) {
        this.logger.error('❌ Google Sheets NO está configurado (this.sheets es null/undefined)')
        this.logger.log(`🔧 Estado de auth: ${this.auth ? 'inicializado' : 'NO inicializado'}`)
        return { success: false, message: 'Google Sheets not configured' }
      }
      
      this.logger.log('✅ Google Sheets está configurado, procediendo a escribir...')

      const range = `${sheetName}!A:Z`
      this.logger.log(`Appending row to sheet ${sheetName} in spreadsheet ${spreadsheetId}`)

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values],
        },
      })

      this.logger.log(`Row appended successfully: ${response.data.updates.updatedRange}`)

      // Llamar al Google Apps Script Web App para procesar la fila inmediatamente
      if (sheetName === 'FORM_INPUT') {
        this.triggerGoogleAppsScriptWebApp()
      }

      return {
        success: true,
        appendedRange: response.data.updates.updatedRange,
        updatedCells: response.data.updates.updatedCells,
      }
    } catch (error) {
      this.logger.error(`Error appending row: ${error.message}`)
      this.logger.error(`Stack trace: ${error.stack}`)
      return { success: false, message: error.message }
    }
  }

  /**
   * Llama al Google Apps Script Web App para procesar nuevas filas
   */
  private async triggerGoogleAppsScriptWebApp(): Promise<void> {
    try {
      const webAppUrl = this.configService.get<string>('GOOGLE_APPS_SCRIPT_WEB_APP_URL') || 
        'https://script.google.com/macros/s/AKfycbzpno3f1pMjIRmdSzSbMqlsCHoaBPMBsegkQv8f614h5J-Usr3XaJNtwVRDK9FhIcfK/exec'

      this.logger.log('========================================')
      this.logger.log('🚀 TRIGGERING GOOGLE APPS SCRIPT WEB APP')
      this.logger.log(`📍 URL: ${webAppUrl}`)
      this.logger.log(`📦 Payload: { trigger: "formSubmitted" }`)
      this.logger.log('========================================')

      const startTime = Date.now()

      const response = await axios.post(
        webAppUrl,
        { trigger: 'formSubmitted' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 segundos de timeout (para múltiples operaciones)
        }
      )

      const duration = Date.now() - startTime

      this.logger.log('========================================')
      this.logger.log(`✅ WEB APP RESPONSE SUCCESS`)
      this.logger.log(`⏱️  Duration: ${duration}ms`)
      this.logger.log(`📊 Status: ${response.status}`)
      this.logger.log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`)
      this.logger.log('========================================')
    } catch (error) {
      // Registrar el error pero no fallar la operación principal
      this.logger.error('========================================')
      this.logger.error('❌ WEB APP CALL FAILED')
      this.logger.error(`Error message: ${error.message}`)
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`)
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`)
      }
      if (error.code) {
        this.logger.error(`Error code: ${error.code}`)
      }
      this.logger.error('========================================')
    }
  }

  /**
   * Método público para probar el webhook manualmente (solo para debugging)
   */
  async testWebAppWebhook(): Promise<any> {
    this.logger.log('🧪 MANUAL TEST: Calling Web App webhook...')
    await this.triggerGoogleAppsScriptWebApp()
    return { message: 'Webhook test completed. Check logs for details.' }
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
        const sheetMeta = metadata.sheets.find((s: any) => s.title === sheetName)
        
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
   * Obtiene datos con formato completo de Google Sheets (colores, estilos, etc.)
   */
  async getSheetDataWithFormat(spreadsheetId: string, sheetName: string, range?: string): Promise<SheetDataWithFormat> {
    try {
      if (!this.sheets) {
        this.logger.warn('Google Sheets not configured')
        return { cells: [], headers: [], rowCount: 0, columnCount: 0 }
      }

      // Determinar el rango
      let fullRange: string
      if (range) {
        fullRange = `'${sheetName}'!${range}`
      } else {
        const metadata = await this.getSheetMetadata(spreadsheetId)
        const sheetMeta = metadata.sheets.find((s: any) => s.title === sheetName)
        
        if (sheetMeta && sheetMeta.columnCount) {
          const lastColumn = this.columnIndexToLetter(sheetMeta.columnCount - 1)
          fullRange = `'${sheetName}'!A1:${lastColumn}${sheetMeta.rowCount || 1000}`
          this.logger.log(`Using dynamic range: ${fullRange}`)
        } else {
          fullRange = `'${sheetName}'!A1:ZZ1000`
        }
      }

      this.logger.log(`Fetching formatted data from sheet "${sheetName}"`)

      // Obtener datos con formato completo
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        ranges: [fullRange],
        includeGridData: true,
        fields: 'sheets(data(rowData(values(formattedValue,userEnteredValue,effectiveFormat))))',
      })

      const sheet = response.data.sheets[0]
      if (!sheet || !sheet.data || !sheet.data[0] || !sheet.data[0].rowData) {
        this.logger.warn('No data found in sheet')
        return { cells: [], headers: [], rowCount: 0, columnCount: 0 }
      }

      const rowData = sheet.data[0].rowData
      const cells: FormattedCell[] = []
      const headers: string[] = []
      let maxColumns = 0

      // Procesar todas las celdas
      rowData.forEach((row: any, rowIndex: number) => {
        if (!row.values) return

        row.values.forEach((cell: any, colIndex: number) => {
          maxColumns = Math.max(maxColumns, colIndex + 1)

          // Extraer valor
          let value: any = null
          if (cell.formattedValue !== undefined) {
            value = cell.formattedValue
          } else if (cell.userEnteredValue) {
            if (cell.userEnteredValue.numberValue !== undefined) {
              value = cell.userEnteredValue.numberValue
            } else if (cell.userEnteredValue.stringValue !== undefined) {
              value = cell.userEnteredValue.stringValue
            } else if (cell.userEnteredValue.boolValue !== undefined) {
              value = cell.userEnteredValue.boolValue
            }
          }

          // Extraer formato
          const format: CellFormat = {}
          if (cell.effectiveFormat) {
            const ef = cell.effectiveFormat

            // Colores de fondo
            if (ef.backgroundColor) {
              format.backgroundColor = ef.backgroundColor
            }

            // Formato de texto
            if (ef.textFormat) {
              format.textFormat = {
                foregroundColor: ef.textFormat.foregroundColor,
                fontFamily: ef.textFormat.fontFamily,
                fontSize: ef.textFormat.fontSize,
                bold: ef.textFormat.bold,
                italic: ef.textFormat.italic,
                strikethrough: ef.textFormat.strikethrough,
                underline: ef.textFormat.underline,
              }
            }

            // Alineación
            if (ef.horizontalAlignment) {
              format.horizontalAlignment = ef.horizontalAlignment
            }
            if (ef.verticalAlignment) {
              format.verticalAlignment = ef.verticalAlignment
            }

            // Formato de números
            if (ef.numberFormat) {
              format.numberFormat = {
                type: ef.numberFormat.type,
                pattern: ef.numberFormat.pattern,
              }
            }

            // Bordes
            if (ef.borders) {
              format.borders = ef.borders
            }
          }

          // Construir celda formateada
          const formattedCell: FormattedCell = {
            value,
            formattedValue: cell.formattedValue,
            format: Object.keys(format).length > 0 ? format : undefined,
            row: rowIndex,
            col: colIndex,
          }

          cells.push(formattedCell)

          // Guardar headers de la primera fila
          if (rowIndex === 0) {
            headers.push(value?.toString() || `Column ${this.columnIndexToLetter(colIndex)}`)
          }
        })
      })

      this.logger.log(`Retrieved ${rowData.length} rows with formatting from sheet "${sheetName}"`)
      
      return {
        cells,
        headers,
        rowCount: rowData.length,
        columnCount: maxColumns,
      }
    } catch (error) {
      this.logger.error(`Error fetching formatted data from sheet "${sheetName}": ${error.message}`)
      return { cells: [], headers: [], rowCount: 0, columnCount: 0 }
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

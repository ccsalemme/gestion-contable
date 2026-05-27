import { Injectable, Logger } from '@nestjs/common'

export interface SheetRow {
  [key: string]: string | number | boolean | null
}

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name)

  constructor() {
    this.logger.log('SheetsService initialized')
  }

  /**
   * Obtiene datos de Google Sheets
   * Por ahora devuelve datos mock - reemplazar con Google Sheets API real
   */
  async getSheetData(sheetId: string): Promise<SheetRow[]> {
    try {
      // TODO: Integrar con Google Sheets API usando credenciales en credentials/
      // Por ahora devolver datos de ejemplo
      return [
        {
          id: 1,
          concepto: 'Venta A',
          monto: 1000,
          fecha: '2026-05-27',
          estado: 'Pagado',
        },
        {
          id: 2,
          concepto: 'Venta B',
          monto: 2500,
          fecha: '2026-05-26',
          estado: 'Pendiente',
        },
        {
          id: 3,
          concepto: 'Gasto Operativo',
          monto: 500,
          fecha: '2026-05-25',
          estado: 'Pagado',
        },
      ]
    } catch (error) {
      this.logger.error(`Error fetching sheet data: ${error.message}`)
      throw error
    }
  }
}

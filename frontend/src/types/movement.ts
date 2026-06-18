// Movement Types
export enum MotivoMovimiento {
  CABLE = 'Cable',
  USDT = 'USDT',
  LIQUIDACION = 'Liquidación',
  OTRO = 'Otro',
}

export interface Movement {
  monto: number
  emisor: string
  receptor: string
  motivo: MotivoMovimiento
  casoEspecial: boolean
}

export interface MovementResponse {
  success: boolean
  appendedRange?: string
  message?: string
}

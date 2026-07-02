// Movement Types
export enum MotivoMovimiento {
  CABLE = 'Cable',
  USDT = 'USDT',
  LIQUIDACION = 'Liquidación',
  OTRO = 'Otro',
}

export enum TipoOperacion {
  SOLO_COMPRA = 'Solo Compra',
  SOLO_VENTA = 'Solo Venta',
  COMPRA_VENTA_VINCULADAS = 'Compra y Venta Vinculadas',
}

export enum Moneda {
  USD = 'USD',
  ARS = 'ARS',
}

export enum EstadoTransaccion {
  COMPLETADA = 'Completada',
  EN_PROCESO = 'En Proceso',
  CANCELADA = 'Cancelada',
  SIN_ESTADO = 'Sin Estado',
}

export interface DatosCompra {
  monto: number
  contraparte: string // Quien vende (de quien compramos)
  costo: number // Multiplicador de costo (ej: 1.015)
}

export interface DatosVenta {
  monto: number
  contraparte: string // Cliente (a quien vendemos)
  costo: number // Multiplicador de costo
  usaSaldoActual: boolean // Si usa saldo actual o no
}

export interface Movement {
  tipoOperacion: TipoOperacion
  moneda: Moneda
  motivo: MotivoMovimiento
  estadoTransaccion?: EstadoTransaccion
  casoEspecial: boolean
  
  // Datos de compra (requeridos si tipoOperacion incluye compra)
  compra?: DatosCompra
  
  // Datos de venta (requeridos si tipoOperacion incluye venta)
  venta?: DatosVenta
}

export interface MovementResponse {
  success: boolean
  appendedRange?: string
  message?: string
}

import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, Matches, Min, IsOptional, ValidateNested, ValidateIf } from 'class-validator'
import { Type } from 'class-transformer'

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

export class DatosCompraDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El monto de compra es obligatorio' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number

  @IsString()
  @IsNotEmpty({ message: 'La contraparte de compra es obligatoria' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'La contraparte solo puede contener letras, números, espacios y guiones',
  })
  contraparte: string

  @IsNumber()
  @IsNotEmpty({ message: 'El costo es obligatorio' })
  @Min(0.01, { message: 'El costo debe ser mayor a 0' })
  costo: number
}

export class DatosVentaDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El monto de venta es obligatorio' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number

  @IsString()
  @IsNotEmpty({ message: 'La contraparte de venta es obligatoria' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'La contraparte solo puede contener letras, números, espacios y guiones',
  })
  contraparte: string

  @IsNumber()
  @IsNotEmpty({ message: 'El costo es obligatorio' })
  @Min(0.01, { message: 'El costo debe ser mayor a 0' })
  costo: number

  @IsBoolean()
  usaSaldoActual: boolean
}

export class CreateMovementDto {
  @IsEnum(TipoOperacion, { message: 'El tipo de operación debe ser uno de los valores permitidos' })
  @IsNotEmpty({ message: 'El tipo de operación es obligatorio' })
  tipoOperacion: TipoOperacion

  @IsEnum(Moneda, { message: 'La moneda debe ser USD o ARS' })
  @IsNotEmpty({ message: 'La moneda es obligatoria' })
  moneda: Moneda

  @IsEnum(MotivoMovimiento, { message: 'El motivo debe ser uno de los valores permitidos' })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  motivo: MotivoMovimiento

  @IsEnum(EstadoTransaccion, { message: 'El estado debe ser uno de los valores permitidos' })
  @IsOptional()
  estadoTransaccion?: EstadoTransaccion

  @IsBoolean()
  casoEspecial: boolean

  @ValidateNested()
  @Type(() => DatosCompraDto)
  @ValidateIf((o) => o.tipoOperacion === TipoOperacion.SOLO_COMPRA || o.tipoOperacion === TipoOperacion.COMPRA_VENTA_VINCULADAS)
  @IsNotEmpty({ message: 'Los datos de compra son obligatorios para este tipo de operación' })
  compra?: DatosCompraDto

  @ValidateNested()
  @Type(() => DatosVentaDto)
  @ValidateIf((o) => o.tipoOperacion === TipoOperacion.SOLO_VENTA || o.tipoOperacion === TipoOperacion.COMPRA_VENTA_VINCULADAS)
  @IsNotEmpty({ message: 'Los datos de venta son obligatorios para este tipo de operación' })
  venta?: DatosVentaDto
}

export class MovementResponseDto {
  success: boolean
  appendedRange?: string
  message?: string
}

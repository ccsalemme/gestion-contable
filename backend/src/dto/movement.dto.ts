import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator'

export enum MotivoMovimiento {
  CABLE = 'Cable',
  USDT = 'USDT',
  LIQUIDACION = 'Liquidación',
  OTRO = 'Otro',
}

export class CreateMovementDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  monto: number

  @IsString()
  @IsNotEmpty({ message: 'El emisor es obligatorio' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'El emisor solo puede contener letras, números, espacios y guiones',
  })
  emisor: string

  @IsString()
  @IsNotEmpty({ message: 'El receptor es obligatorio' })
  @Matches(/^[a-zA-Z0-9\s\-_]+$/, {
    message: 'El receptor solo puede contener letras, números, espacios y guiones',
  })
  receptor: string

  @IsEnum(MotivoMovimiento, { message: 'El motivo debe ser uno de los valores permitidos' })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  motivo: MotivoMovimiento

  @IsBoolean()
  casoEspecial: boolean
}

export class MovementResponseDto {
  success: boolean
  appendedRange?: string
  message?: string
}

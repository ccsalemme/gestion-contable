import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator'

export class CreateTenantDto {
  @IsString()
  name: string

  @IsString()
  sheetId: string
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsBoolean()
  @IsOptional()
  active?: boolean
}

export class TenantResponseDto {
  id: string
  name: string
  sheetId: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

import { IsUUID, IsEnum, IsOptional } from 'class-validator'
import { UserTenantRole } from '../entities/user-tenant.entity'

export class CreateUserTenantDto {
  @IsUUID()
  userId: string

  @IsUUID()
  tenantId: string

  @IsEnum(UserTenantRole)
  @IsOptional()
  role?: UserTenantRole
}

export class UpdateUserTenantDto {
  @IsEnum(UserTenantRole)
  @IsOptional()
  role?: UserTenantRole
}

export class UserTenantResponseDto {
  id: string
  userId: string
  tenantId: string
  role: UserTenantRole
}

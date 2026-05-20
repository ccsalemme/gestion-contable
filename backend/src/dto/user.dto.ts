import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator'
import { UserRole } from '../entities/user.entity'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  password: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @IsBoolean()
  @IsOptional()
  active?: boolean
}

export class UserResponseDto {
  id: string
  email: string
  role: UserRole
  active: boolean
  createdAt: Date
  updatedAt: Date
}

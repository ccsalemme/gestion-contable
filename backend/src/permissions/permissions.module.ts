import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionsController } from './permissions.controller'
import { PermissionsService } from './permissions.service'
import { PermissionEntity } from '../entities/permission.entity'

@Module({
  imports: [], // TypeOrmModule.forFeature([PermissionEntity]) - Desactivado sin DB
  controllers: [], // PermissionsController - Desactivado sin DB
  providers: [], // PermissionsService - Desactivado sin DB
  exports: [], // PermissionsService
})
export class PermissionsModule {}

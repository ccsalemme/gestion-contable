import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../guards/auth.guard'
import { PermissionsService } from './permissions.service'
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
} from '../dto/permission.dto'

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async getPermissions(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAll()
  }

  @Get(':id')
  async getPermission(@Param('id') id: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findById(id)
  }

  @Post()
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.create(createPermissionDto)
  }

  @Put(':id')
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.update(id, updatePermissionDto)
  }

  @Delete(':id')
  async deletePermission(@Param('id') id: string): Promise<void> {
    return this.permissionsService.delete(id)
  }
}

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
import { TenantsService } from './tenants.service'
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from '../dto/tenant.dto'

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  async getTenants(): Promise<TenantResponseDto[]> {
    return this.tenantsService.findAll()
  }

  @Get(':id')
  async getTenant(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantsService.findById(id)
  }

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantsService.create(createTenantDto)
  }

  @Put(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.update(id, updateTenantDto)
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string): Promise<void> {
    return this.tenantsService.delete(id)
  }
}

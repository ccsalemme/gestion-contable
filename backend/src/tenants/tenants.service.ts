import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TenantEntity } from '../entities/tenant.entity'
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from '../dto/tenant.dto'

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantsRepository: Repository<TenantEntity>,
  ) {}

  async findAll(): Promise<TenantResponseDto[]> {
    const tenants = await this.tenantsRepository.find()
    return tenants.map(this.mapToResponse)
  }

  async findById(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantsRepository.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`)
    }
    return this.mapToResponse(tenant)
  }

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    const tenant = this.tenantsRepository.create({
      name: createTenantDto.name,
      sheetId: createTenantDto.sheetId,
      active: true,
    })

    const savedTenant = await this.tenantsRepository.save(tenant)
    return this.mapToResponse(savedTenant)
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    const tenant = await this.tenantsRepository.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`)
    }

    Object.assign(tenant, updateTenantDto)
    const updatedTenant = await this.tenantsRepository.save(tenant)
    return this.mapToResponse(updatedTenant)
  }

  async delete(id: string): Promise<void> {
    const result = await this.tenantsRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with id ${id} not found`)
    }
  }

  private mapToResponse(tenant: TenantEntity): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      sheetId: tenant.sheetId,
      active: tenant.active,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }
}

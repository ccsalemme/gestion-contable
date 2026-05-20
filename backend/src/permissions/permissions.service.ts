import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PermissionEntity } from '../entities/permission.entity'
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto } from '../dto/permission.dto'

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
  ) {}

  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionsRepository.find()
    return permissions.map(this.mapToResponse)
  }

  async findById(id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findOne({ where: { id } })
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`)
    }
    return this.mapToResponse(permission)
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const permission = this.permissionsRepository.create({
      name: createPermissionDto.name,
      description: createPermissionDto.description,
    })

    const savedPermission = await this.permissionsRepository.save(permission)
    return this.mapToResponse(savedPermission)
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findOne({ where: { id } })
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`)
    }

    Object.assign(permission, updatePermissionDto)
    const updatedPermission = await this.permissionsRepository.save(permission)
    return this.mapToResponse(updatedPermission)
  }

  async delete(id: string): Promise<void> {
    const result = await this.permissionsRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with id ${id} not found`)
    }
  }

  private mapToResponse(permission: PermissionEntity): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
    }
  }
}

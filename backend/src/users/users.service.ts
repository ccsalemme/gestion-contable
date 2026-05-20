import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { UserEntity } from '../entities/user.entity'
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find()
    return users.map(this.mapToResponse)
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
    return this.mapToResponse(user)
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findByEmail(createUserDto.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10)
    const user = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role,
      active: true,
    })

    const savedUser = await this.usersRepository.save(user)
    return this.mapToResponse(savedUser)
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    Object.assign(user, updateUserDto)
    const updatedUser = await this.usersRepository.save(user)
    return this.mapToResponse(updatedUser)
  }

  async delete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
  }

  private mapToResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}

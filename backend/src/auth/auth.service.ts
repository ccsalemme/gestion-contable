import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { UserEntity, UserRole } from '../entities/user.entity'
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    })

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.active) {
      throw new UnauthorizedException('User is inactive')
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new UnauthorizedException('Email already in use')
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10)

    const newUser = this.usersRepository.create({
      email: registerDto.email,
      passwordHash,
      role: UserRole.USER_FINAL,
      active: true,
    })

    const savedUser = await this.usersRepository.save(newUser)

    const token = this.jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    })

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
      token,
    }
  }

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOne({ where: { email } })

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user
    }

    return null
  }
}

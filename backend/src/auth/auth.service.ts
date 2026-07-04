import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UserRole } from '../entities/user.entity'
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto'

// Mock users en memoria para testing sin base de datos
interface MockUser {
  id: string
  email: string
  passwordHash: string
  role: UserRole
  active: boolean
}

@Injectable()
export class AuthService {
  private mockUsers: Map<string, MockUser> = new Map()

  constructor(private readonly jwtService: JwtService) {
    // Inicializar usuarios de prueba
    this.initializeMockUsers()
  }

  private async initializeMockUsers() {
    // 🔒 SEGURIDAD: Mock users SOLO en desarrollo
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Mock users disabled in production. Use real database.')
      console.warn('⚠️  Authentication will NOT work until you implement PostgreSQL/Supabase')
      return
    }
    
    const testUsers = [
      {
        id: 'bb484727-8a16-47d8-ba64-c13766e754aa',
        email: 'admin@contable.local',
        password: 'Admin@123',
        role: UserRole.USER_FINAL,
      },
      {
        id: '62b23d84-2294-466d-866d-d25945cfcc9e',
        email: 'contador@empresa1.local',
        password: 'Contador@123',
        role: UserRole.USER_FINAL,
      },
      {
        id: 'gerente-id-123',
        email: 'gerente@empresa1.local',
        password: 'Gerente@123',
        role: UserRole.ADMIN_CLIENT,
      },
      {
        id: 'super-admin-id-123',
        email: 'super-admin@contable.local',
        password: 'SuperAdmin@123',
        role: UserRole.SUPER_ADMIN,
      },
    ]

    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10)
      this.mockUsers.set(user.email, {
        id: user.id,
        email: user.email,
        passwordHash,
        role: user.role,
        active: true,
      })
    }

    console.log('✅ Mock users initialized (DEV ONLY):', Array.from(this.mockUsers.keys()))
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // 🔒 SEGURIDAD: Bloquear login en producción si no hay DB
    if (process.env.NODE_ENV === 'production' && this.mockUsers.size === 0) {
      throw new UnauthorizedException('Authentication not configured. Database required.')
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Login attempt for: ${loginDto.email}`)
    }
    
    const user = this.mockUsers.get(loginDto.email)

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Invalid credentials for: ${loginDto.email}`)
      }
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

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Login successful for: ${loginDto.email}`)
    }

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
    const existingUser = this.mockUsers.get(registerDto.email)

    if (existingUser) {
      throw new UnauthorizedException('Email already in use')
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10)
    const newUserId = `user-${Date.now()}`

    const newUser: MockUser = {
      id: newUserId,
      email: registerDto.email,
      passwordHash,
      role: UserRole.USER_FINAL,
      active: true,
    }

    this.mockUsers.set(registerDto.email, newUser)

    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    })

    console.log(`✅ User registered: ${registerDto.email}`)

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    }
  }

  async validateUser(email: string, password: string): Promise<MockUser | null> {
    const user = this.mockUsers.get(email)

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user
    }

    return null
  }
}

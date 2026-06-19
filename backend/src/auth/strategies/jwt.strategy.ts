import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name)

  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET')
    
    console.log('🔑 JWT_SECRET loaded:', secret ? `[${secret.substring(0, 10)}...] (length: ${secret.length})` : 'NOT FOUND')
    
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
    
    this.logger.log(`✅ JWT Strategy initialized with secret`)
  }

  async validate(payload: any) {
    this.logger.log(`🔍 JWT payload validated: ${payload.email}`)
    return { userId: payload.sub, email: payload.email, role: payload.role }
  }
}

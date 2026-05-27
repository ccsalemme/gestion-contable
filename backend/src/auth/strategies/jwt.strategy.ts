import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name)

  constructor() {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set')
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
    this.logger.log(`JWT Strategy initialized with secret (length: ${secret.length})`)
  }

  async validate(payload: any) {
    this.logger.debug(`JWT payload validated:`, {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    })
    return { userId: payload.sub, email: payload.email, role: payload.role }
  }
}

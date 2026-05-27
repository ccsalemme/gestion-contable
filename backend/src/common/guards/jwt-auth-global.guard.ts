import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuardGlobal extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuardGlobal.name)

  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest()
    this.logger.debug(
      `Guard check for ${request.method} ${request.url} - isPublic: ${isPublic}`,
    )

    if (isPublic) {
      this.logger.debug('Public route - skipping JWT validation')
      return true
    }

    this.logger.debug('Protected route - validating JWT')
    try {
      return super.canActivate(context)
    } catch (error: any) {
      this.logger.error(`JWT validation error: ${error.message}`, error.stack)
      throw new UnauthorizedException(
        `JWT validation failed: ${error.message}`,
      )
    }
  }

  handleRequest(err: any, user: any, info: any) {
    this.logger.debug(`handleRequest called - err: ${err}, user: ${user}, info: ${info?.message}`)
    if (err || !user) {
      const message = info?.message || err?.message || 'Unauthorized'
      this.logger.error(`Authentication failed: ${message}`)
      throw new UnauthorizedException(`Authentication failed: ${message}`)
    }
    return user
  }
}

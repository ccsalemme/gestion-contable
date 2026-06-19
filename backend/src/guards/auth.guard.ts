import { Injectable, ExecutionContext, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name)

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    
    this.logger.log(`🔐 Checking JWT for path: ${request.path}`)
    this.logger.log(`🔑 Auth header: ${authHeader ? `${authHeader.substring(0, 50)}...` : 'MISSING'}`)
    
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error(`❌ JWT Auth failed - Error: ${err?.message || 'none'}, Info: ${info?.message || JSON.stringify(info)}, User: ${user ? 'exists' : 'null'}`)
    } else {
      this.logger.log(`✅ JWT Auth success: ${user.email}`)
    }
    
    return super.handleRequest(err, user, info, context)
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

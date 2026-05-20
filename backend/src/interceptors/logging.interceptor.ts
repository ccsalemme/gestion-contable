import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const startTime = Date.now()

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime
        const response = context.switchToHttp().getResponse()
        const { statusCode } = response

        this.logger.debug(
          `${method} ${url} - ${statusCode} - ${duration}ms`,
        )
      }),
    )
  }
}

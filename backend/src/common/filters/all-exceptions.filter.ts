import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let error = 'INTERNAL_ERROR'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message
        error = (exceptionResponse as any).error || error
      } else {
        message = exceptionResponse as string
      }
    } else if (exception instanceof Error) {
      message = exception.message
      error = exception.name
    }

    this.logger.error(
      `Exception: ${status} - ${message} - Path: ${request.url}`,
      exception instanceof Error ? exception.stack : undefined,
    )

    // 🔒 SEGURIDAD: Ocultar detalles en producción
    const isProduction = process.env.NODE_ENV === 'production'
    
    const errorResponse: any = {
      statusCode: status,
      message: isProduction && status === 500 ? 'Internal server error' : message,
      timestamp: new Date().toISOString(),
    }

    // Solo incluir detalles en desarrollo
    if (!isProduction) {
      errorResponse.error = error
      errorResponse.path = request.url
    }

    response.status(status).json(errorResponse)
  }
}

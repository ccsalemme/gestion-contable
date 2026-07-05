import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './interceptors/logging.interceptor'

async function bootstrap() {
  // ⚠️ Validación de seguridad: No permitir desactivación de SSL en producción
  if (process.env.NODE_ENV === 'production' && process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    console.error('❌ ERROR DE SEGURIDAD: NODE_TLS_REJECT_UNAUTHORIZED=0 no está permitido en producción')
    console.error('   Por favor, elimine esta variable del archivo .env de producción')
    process.exit(1)
  }
  
  // Mostrar advertencia si SSL está desactivado en desarrollo
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    console.warn('⚠️  ADVERTENCIA: Validación de certificados SSL desactivada (NODE_TLS_REJECT_UNAUTHORIZED=0)')
    console.warn('   Esto es aceptable SOLO en desarrollo local')
    console.warn('   NUNCA usar esta configuración en producción')
  }

  const app = await NestFactory.create(AppModule)

  // Global prefix
  app.setGlobalPrefix('api')

  // 🔒 SEGURIDAD: CORS configuration
  let corsOrigin = process.env.CORS_ORIGIN
  
  // Validar CORS en producción
  if (process.env.NODE_ENV === 'production') {
    if (!corsOrigin) {
      console.error('❌ ERROR: CORS_ORIGIN must be set in production')
      process.exit(1)
    }
    if (corsOrigin === '*') {
      console.error('❌ ERROR: Wildcard CORS (*) not allowed in production')
      process.exit(1)
    }
  } else {
    corsOrigin = corsOrigin || 'http://localhost:3000'
  }
  
  const allowedOrigins = corsOrigin.split(',').map(o => o.trim())
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 CORS Configuration:')
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`   CORS_ORIGIN env var: ${process.env.CORS_ORIGIN}`)
    console.log(`   Allowed origins: ${JSON.stringify(allowedOrigins)}`)
  }
  
  app.enableCors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📨 CORS preflight request from origin: ${origin}`)
      }
      
      if (!origin) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ No origin header (same-origin request)')
        }
        return callback(null, true)
      }
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Origin allowed: ${origin}`)
        }
        return callback(null, true)
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Origin NOT allowed: ${origin}`)
      }
      return callback(new Error(`CORS not allowed for origin: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Plataforma de Gestión Contable - API')
    .setDescription('API para plataforma multiempresa de gestión financiera')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port, '0.0.0.0')
  console.log(`✅ Application is running on: http://0.0.0.0:${port}`)
  console.log(`📚 Swagger docs available at: http://0.0.0.0:${port}/api/docs`)
  console.log(`🔗 Expected frontend origins: ${allowedOrigins.join(', ')}`)
}

bootstrap().catch(console.error)

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global prefix
  app.setGlobalPrefix('api')

  // CORS con logs para debuggear
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
  const allowedOrigins = corsOrigin.split(',').map(o => o.trim())
  
  console.log('🔐 CORS Configuration:')
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`   CORS_ORIGIN env var: ${process.env.CORS_ORIGIN}`)
  console.log(`   Allowed origins: ${JSON.stringify(allowedOrigins)}`)
  
  app.enableCors({
    origin: (origin, callback) => {
      console.log(`📨 CORS preflight request from origin: ${origin}`)
      
      if (!origin) {
        console.log('✅ No origin header (same-origin request)')
        return callback(null, true)
      }
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        console.log(`✅ Origin allowed: ${origin}`)
        return callback(null, true)
      }
      
      console.log(`❌ Origin NOT allowed: ${origin}`)
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
  await app.listen(port)
  console.log(`✅ Application is running on: http://localhost:${port}`)
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`)
  console.log(`🔗 Expected frontend origins: ${allowedOrigins.join(', ')}`)
}

bootstrap().catch(console.error)

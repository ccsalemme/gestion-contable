import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { UserEntity } from '../entities/user.entity'

@Module({
  imports: [
    // TypeOrmModule.forFeature([UserEntity]), // Desactivado temporalmente - sin DB
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET')
        const expirationStr = configService.get<string>('JWT_EXPIRATION') || '3600'
        const expiration = parseInt(expirationStr, 10)
        
        // 🔒 SEGURIDAD: JWT_SECRET obligatorio en producción
        if (!secret && process.env.NODE_ENV === 'production') {
          throw new Error('❌ CRITICAL: JWT_SECRET must be set in production environment')
        }
        
        const finalSecret = secret || 'dev-only-insecure-secret-change-in-production'
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 JWT Module Config:', { 
            secretLength: finalSecret.length,
            expiration: `${expiration}s (${expiration/60} minutes)`,
            expirationRaw: expirationStr
          })
        }
        
        return {
          secret: finalSecret,
          signOptions: {
            expiresIn: expiration, // número en segundos
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

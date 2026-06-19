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
        const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key'
        const expirationStr = configService.get<string>('JWT_EXPIRATION') || '3600'
        const expiration = parseInt(expirationStr, 10)
        
        console.log('🔧 JWT Module Config:', { 
          secretLength: secret.length,
          expiration: `${expiration}s (${expiration/60} minutes)`,
          expirationRaw: expirationStr
        })
        
        return {
          secret,
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

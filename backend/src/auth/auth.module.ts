import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { UserEntity } from '../entities/user.entity'

@Module({
  imports: [
    // TypeOrmModule.forFeature([UserEntity]), // Desactivado temporalmente - sin DB
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600'),
      },
    }),
  ],
  controllers: [], // AuthController - Desactivado sin DB
  providers: [], // AuthService, JwtStrategy, LocalStrategy - Desactivado sin DB
  exports: [], // AuthService
})
export class AuthModule {}

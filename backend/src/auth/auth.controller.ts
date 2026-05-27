import { Controller, Post, Body, HttpCode, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto, AuthResponseDto } from '../dto/auth.dto'
import { Public } from '../common/decorators/public.decorator'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('debug/env')
  async debugEnv() {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return {
      jwt_secret_length: secret.length,
      jwt_secret_first_10: secret.substring(0, 10),
      jwt_secret_last_10: secret.substring(secret.length - 10),
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto)
  }
}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DriveController } from './drive.controller'
import { DriveService } from './drive.service'

@Module({
  imports: [ConfigModule],
  controllers: [DriveController],
  providers: [DriveService],
  exports: [DriveService],
})
export class DriveModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SheetsController } from './sheets.controller'
import { SheetsService } from './sheets.service'
import { DriveModule } from '../drive/drive.module'

@Module({
  imports: [ConfigModule, DriveModule],
  controllers: [SheetsController],
  providers: [SheetsService],
  exports: [SheetsService],
})
export class SheetsModule {}

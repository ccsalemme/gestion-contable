import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SheetsController } from './sheets.controller'
import { SheetsService } from './sheets.service'

@Module({
  imports: [ConfigModule],
  controllers: [SheetsController],
  providers: [SheetsService],
  exports: [SheetsService],
})
export class SheetsModule {}

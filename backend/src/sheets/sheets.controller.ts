import { Controller } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { SheetsService } from './sheets.service'

@ApiTags('Google Sheets')
@ApiBearerAuth()
@Controller('sheets')
export class SheetsController {
  constructor(private sheetsService: SheetsService) {}
}

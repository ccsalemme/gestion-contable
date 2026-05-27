import { Controller, Get, Param, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { SheetsService } from './sheets.service'

@ApiTags('Google Sheets')
@ApiBearerAuth()
@Controller('sheets')
export class SheetsController {
  constructor(private sheetsService: SheetsService) {}

  @Get('debug/test')
  async debugTest(@Request() req: any) {
    return {
      message: 'Debug endpoint',
      authorization: req.headers.authorization,
      user: req.user || 'No user',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('default')
  async getDefault(@Request() req: any) {
    console.log(`[SheetsController] getDefault called`)
    console.log(`[SheetsController] request.user:`, req.user)
    return this.sheetsService.getSheetData('default')
  }

  @Get(':sheetId')
  async getSheetData(@Param('sheetId') sheetId: string, @Request() req: any) {
    console.log(`[SheetsController] getSheetData called with sheetId: ${sheetId}`)
    console.log(`[SheetsController] request.user:`, req.user)
    return this.sheetsService.getSheetData(sheetId)
  }
}

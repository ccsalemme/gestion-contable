import { Controller, Get, Param, Request, Query, Logger } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { SheetsService } from './sheets.service'

@ApiTags('Google Sheets')
@ApiBearerAuth()
@Controller('sheets')
export class SheetsController {
  private readonly logger = new Logger(SheetsController.name)

  constructor(private sheetsService: SheetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get sheet data with optional sheetId and range' })
  @ApiQuery({ name: 'sheetId', required: false })
  @ApiQuery({ name: 'range', required: false })
  async getSheetData(
    @Query('sheetId') sheetId?: string,
    @Query('range') range?: string,
  ) {
    this.logger.log(`Getting sheet data: ${sheetId || 'default'}, range: ${range || 'default'}`)
    return this.sheetsService.getSheetData(sheetId, range)
  }

  @Get('debug/test')
  @ApiOperation({ summary: 'Debug endpoint to test Google Sheets connection' })
  async debugTest(@Request() req: any) {
    const data = await this.sheetsService.getSheetData()
    return {
      message: 'Debug endpoint',
      authorization: req.headers.authorization,
      user: req.user || 'No user',
      timestamp: new Date().toISOString(),
      rowCount: data.length,
      sample: data.slice(0, 3),
    }
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default sheet data' })
  async getDefault(@Request() req: any) {
    this.logger.log(`getDefault called`)
    return this.sheetsService.getSheetData('default')
  }

  @Get(':sheetId')
  @ApiOperation({ summary: 'Get specific sheet data by ID' })
  async getSheetById(@Param('sheetId') sheetId: string, @Request() req: any) {
    this.logger.log(`getSheetById called with sheetId: ${sheetId}`)
    return this.sheetsService.getSheetData(sheetId)
  }
}

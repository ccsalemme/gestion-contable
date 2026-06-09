import { Controller, Get, Put, Post, Param, Body, Request, Query, Logger } from '@nestjs/common'
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

  @Put('update-cell')
  @ApiOperation({ summary: 'Update a single cell in Google Sheets' })
  async updateCell(
    @Body() body: { sheetId: string; range: string; value: any },
  ) {
    this.logger.log(`Updating cell ${body.range} in sheet ${body.sheetId}`)
    return this.sheetsService.updateCell(body.sheetId, body.range, body.value)
  }

  @Put('update-cells')
  @ApiOperation({ summary: 'Update multiple cells in Google Sheets' })
  async updateCells(
    @Body() body: { sheetId: string; updates: Array<{range: string, value: any}> },
  ) {
    this.logger.log(`Batch updating ${body.updates.length} cells in sheet ${body.sheetId}`)
    return this.sheetsService.updateCells(body.sheetId, body.updates)
  }

  @Post('export')
  @ApiOperation({ summary: 'Export sheet data to different formats' })
  async exportData(
    @Body() body: { sheetId?: string; format: 'json' | 'csv'; range?: string },
  ) {
    this.logger.log(`Exporting sheet ${body.sheetId || 'default'} as ${body.format}`)
    return this.sheetsService.exportData(body.sheetId, body.format, body.range)
  }

  @Get('metadata/:sheetId')
  @ApiOperation({ summary: 'Get spreadsheet metadata (list of sheets/tabs)' })
  async getSheetMetadata(@Param('sheetId') sheetId: string) {
    this.logger.log(`Getting metadata for spreadsheet ${sheetId}`)
    return this.sheetsService.getSheetMetadata(sheetId)
  }

  @Get('sheet-data/:sheetId/:sheetName')
  @ApiOperation({ summary: 'Get data from a specific sheet/tab by name' })
  @ApiQuery({ name: 'range', required: false })
  async getSheetDataByName(
    @Param('sheetId') sheetId: string,
    @Param('sheetName') sheetName: string,
    @Query('range') range?: string,
  ) {
    this.logger.log(`Getting data from sheet "${sheetName}" in spreadsheet ${sheetId}`)
    return this.sheetsService.getSheetDataByName(sheetId, sheetName, range)
  }

  @Get('formatted/:sheetId/:sheetName')
  @ApiOperation({ summary: 'Get data with complete formatting (colors, styles, etc.) from a specific sheet' })
  @ApiQuery({ name: 'range', required: false })
  async getSheetDataWithFormat(
    @Param('sheetId') sheetId: string,
    @Param('sheetName') sheetName: string,
    @Query('range') range?: string,
  ) {
    this.logger.log(`Getting formatted data from sheet "${sheetName}" in spreadsheet ${sheetId}`)
    return this.sheetsService.getSheetDataWithFormat(sheetId, sheetName, range)
  }
}

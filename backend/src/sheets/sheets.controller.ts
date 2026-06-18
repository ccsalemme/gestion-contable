import { Controller, Get, Put, Post, Param, Body, Request, Query, Logger, UseGuards, HttpException, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { SheetsService } from './sheets.service'
import { DriveService } from '../drive/drive.service'
import { JwtAuthGuard } from '../guards/auth.guard'
import { CreateMovementDto, MovementResponseDto } from '../dto/movement.dto'
import { ConfigService } from '@nestjs/config'

@ApiTags('Google Sheets')
@ApiBearerAuth()
@Controller('sheets')
export class SheetsController {
  private readonly logger = new Logger(SheetsController.name)

  constructor(
    private sheetsService: SheetsService,
    private driveService: DriveService,
    private configService: ConfigService,
  ) {}

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

  @Post('movements')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new financial movement entry' })
  async createMovement(
    @Body() movementDto: CreateMovementDto,
  ): Promise<MovementResponseDto> {
    try {
      this.logger.log('Creating new financial movement')

      // Get the spreadsheet file name from environment or use default
      const fileName = this.configService.get<string>('GOOGLE_SHEET_MOVEMENTS_NAME') || 'Copia de Gyc (David) - Alex Finan'
      
      // Get the spreadsheet ID by name
      const spreadsheetId = await this.driveService.getSpreadsheetIdByName(fileName)
      
      if (!spreadsheetId) {
        throw new HttpException(
          `Spreadsheet "${fileName}" not found in the configured Drive folder`,
          HttpStatus.NOT_FOUND,
        )
      }

      // Generate timestamp in the format: YYYY-MM-DD HH:mm:ss
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

      // Build the row data
      const rowData = [
        timestamp,
        movementDto.monto,
        movementDto.emisor,
        movementDto.receptor,
        movementDto.motivo,
        movementDto.casoEspecial,
        'Pendiente',
      ]

      // Append the row to the FORM_INPUT sheet
      const result = await this.sheetsService.appendRow(spreadsheetId, 'FORM_INPUT', rowData)

      if (!result.success) {
        throw new HttpException(
          result.message || 'Failed to create movement',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      this.logger.log(`Movement created successfully: ${result.appendedRange}`)
      return result
    } catch (error) {
      this.logger.error(`Error creating movement: ${error.message}`)
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Failed to create movement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}

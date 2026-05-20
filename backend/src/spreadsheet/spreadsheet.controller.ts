import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../guards/auth.guard'
import { SpreadsheetService } from './spreadsheet.service'

@ApiTags('Spreadsheet Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spreadsheet')
export class SpreadsheetController {
  constructor(private readonly spreadsheetService: SpreadsheetService) {}

  @Get(':tenantId')
  async getSpreadsheetData(@Param('tenantId') tenantId: string): Promise<any> {
    return this.spreadsheetService.getDataForTenant(tenantId)
  }

  @Post(':tenantId/sync')
  async syncSpreadsheet(@Param('tenantId') tenantId: string): Promise<any> {
    return this.spreadsheetService.syncWithSheet(tenantId)
  }

  @Put(':tenantId/cell')
  async updateCell(
    @Param('tenantId') tenantId: string,
    @Body() updateData: any,
  ): Promise<any> {
    return this.spreadsheetService.updateCell(tenantId, updateData)
  }
}

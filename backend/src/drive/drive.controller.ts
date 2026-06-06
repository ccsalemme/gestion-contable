import { Controller, Get, Param, Query, Logger } from '@nestjs/common'
import { DriveService } from './drive.service'

@Controller('drive')
export class DriveController {
  private readonly logger = new Logger(DriveController.name)

  constructor(private readonly driveService: DriveService) {}

  @Get('files')
  async listFiles(@Query('folderId') folderId?: string) {
    this.logger.log(`Listing files from folder: ${folderId || 'default'}`)
    const files = await this.driveService.listFilesInFolder(folderId)
    return files
  }

  @Get('files/:fileId')
  async getFileInfo(@Param('fileId') fileId: string) {
    this.logger.log(`Getting file info for: ${fileId}`)
    const file = await this.driveService.getFileInfo(fileId)
    return file
  }
}

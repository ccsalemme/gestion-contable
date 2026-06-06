import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  webViewLink?: string
  iconLink?: string
}

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name)
  private drive: any
  private auth: any

  constructor(private configService: ConfigService) {
    this.initializeGoogleDrive()
  }

  private async initializeGoogleDrive() {
    try {
      const keyPath = this.configService.get<string>('GOOGLE_SHEETS_PRIVATE_KEY_PATH')
      
      if (!keyPath) {
        this.logger.warn('GOOGLE_SHEETS_PRIVATE_KEY_PATH not configured')
        return
      }
      
      const fullPath = path.join(process.cwd(), keyPath)
      
      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`Google Drive credentials not found at ${fullPath}`)
        return
      }

      const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.metadata.readonly',
        ],
      })

      this.drive = google.drive({ version: 'v3', auth: this.auth })
      this.logger.log('Google Drive API initialized successfully')
    } catch (error) {
      this.logger.error(`Failed to initialize Google Drive: ${error.message}`)
    }
  }

  /**
   * Lista archivos de una carpeta de Google Drive
   */
  async listFilesInFolder(folderId?: string): Promise<DriveFile[]> {
    try {
      const folderIdToUse = folderId || this.configService.get<string>('GOOGLE_DRIVE_FOLDER_ID')
      
      if (!this.drive || !folderIdToUse) {
        this.logger.warn('Google Drive not configured or folder ID missing, returning mock data')
        return this.getMockFiles()
      }

      this.logger.log(`Listing files in folder ${folderIdToUse}`)

      const response = await this.drive.files.list({
        q: `'${folderIdToUse}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      })

      const files: DriveFile[] = response.data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size ? this.formatFileSize(parseInt(file.size)) : undefined,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        iconLink: file.iconLink,
      }))

      this.logger.log(`Retrieved ${files.length} files from Google Drive`)
      return files
    } catch (error) {
      this.logger.error(`Error listing Drive files: ${error.message}`)
      return this.getMockFiles()
    }
  }

  /**
   * Obtiene información de un archivo específico
   */
  async getFileInfo(fileId: string): Promise<DriveFile | null> {
    try {
      if (!this.drive) {
        this.logger.warn('Google Drive not configured')
        return null
      }

      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, modifiedTime, webViewLink, iconLink',
      })

      return {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        size: response.data.size ? this.formatFileSize(parseInt(response.data.size)) : undefined,
        modifiedTime: response.data.modifiedTime,
        webViewLink: response.data.webViewLink,
        iconLink: response.data.iconLink,
      }
    } catch (error) {
      this.logger.error(`Error getting file info: ${error.message}`)
      return null
    }
  }

  /**
   * Formatea el tamaño del archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Datos mock para desarrollo
   */
  private getMockFiles(): DriveFile[] {
    const currentSheetId = this.configService.get<string>('GOOGLE_SHEET_ID')
    
    return [
      {
        id: currentSheetId || '1jzGjT49CVcsaNau6okiZHlLt58cKlnB8qxVg2-jrJyE',
        name: 'Hoja de Cálculo Principal.xlsx',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        size: '2.4 MB',
        modifiedTime: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Presupuesto 2024.xlsx',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        size: '1.8 MB',
        modifiedTime: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        name: 'Base de Datos Clientes.xlsx',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        size: '3.2 MB',
        modifiedTime: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
  }
}

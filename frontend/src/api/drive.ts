import { apiClient } from './client'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  webViewLink?: string
  iconLink?: string
}

export const driveApi = {
  /**
   * Lista archivos de la carpeta configurada
   */
  listFiles: (folderId?: string) => 
    apiClient.get<DriveFile[]>('/drive/files', { params: { folderId } }),

  /**
   * Obtiene información de un archivo específico
   */
  getFileInfo: (fileId: string) => 
    apiClient.get<DriveFile>(`/drive/files/${fileId}`),
}

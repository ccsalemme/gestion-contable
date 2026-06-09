import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FileSpreadsheet, FileText, RefreshCw, ExternalLink, File } from "lucide-react";
import { driveApi, DriveFile } from "@/api/drive";

export default function FilesView() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await driveApi.listFiles();
      setFiles(response.data);
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError('Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  const openFile = (file: DriveFile) => {
    // Si es una hoja de cálculo, redirigir a SpreadsheetView con el ID
    if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
      navigate(`/?sheetId=${file.id}`);
    } else if (file.webViewLink) {
      // Para otros tipos de archivo, abrir en nueva pestaña
      window.open(file.webViewLink, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      return 'Hoy, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 2) {
      return 'Ayer, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return { icon: FileSpreadsheet, color: 'bg-green-100 text-green-700' };
    } else if (mimeType === 'application/vnd.google-apps.document') {
      return { icon: FileText, color: 'bg-blue-100 text-blue-700' };
    } else if (mimeType.includes('csv')) {
      return { icon: FileText, color: 'bg-orange-100 text-orange-700' };
    }
    return { icon: File, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archivos</h1>
            <p className="text-gray-500 mt-1">Gestiona tus archivos y documentos.</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={loadFiles}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            {error}
          </div>
        )}

        {loading && files.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay archivos en la carpeta configurada</p>
            <p className="text-sm text-gray-500 mt-1">Comparte archivos con el service account o configura un FOLDER_ID válido</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Tamaño</th>
                  <th className="px-6 py-3 font-medium">Última modificación</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.map(file => {
                  const { icon: Icon, color } = getFileIcon(file.mimeType);
                  return (
                    <tr 
                      key={file.id} 
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => openFile(file)}
                    >
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{file.size || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(file.modifiedTime)}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openFile(file);
                          }}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {file.mimeType === 'application/vnd.google-apps.spreadsheet' ? (
                            <>
                              <FileSpreadsheet size={16} />
                              <span>Abrir</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink size={16} />
                              <span>Ver</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

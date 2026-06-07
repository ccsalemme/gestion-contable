import { useState, useEffect } from "react";
import { FileSpreadsheet, Download, Database, CheckCircle2, History, FileJson, FileText, RefreshCw } from "lucide-react";
import { sheetsApi } from "@/api/sheets";
import { driveApi, DriveFile } from "@/api/drive";
import { useSearchParams } from "react-router";

export default function ExportView() {
  const [searchParams] = useSearchParams();
  const sheetIdFromUrl = searchParams.get('sheetId');
  
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string>(sheetIdFromUrl || '');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (sheetIdFromUrl) {
      setSelectedSheetId(sheetIdFromUrl);
    }
  }, [sheetIdFromUrl]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await driveApi.listFiles();
      const spreadsheets = response.data.filter(
        f => f.mimeType === 'application/vnd.google-apps.spreadsheet'
      );
      setFiles(spreadsheets);
      
      if (!selectedSheetId && spreadsheets.length > 0) {
        setSelectedSheetId(spreadsheets[0].id);
      }
    } catch (err: any) {
      console.error('Error loading files:', err);
      setError('Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedSheetId) {
      setError('Por favor selecciona una hoja de cálculo');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setExporting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await sheetsApi.exportData(selectedSheetId, format);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al exportar');
      }

      const data = response.data.data;
      const selectedFile = files.find(f => f.id === selectedSheetId);
      const fileName = selectedFile?.name || 'export';

      // Crear y descargar archivo
      let blob: Blob;
      let fileExtension: string;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        fileExtension = 'json';
      } else {
        blob = new Blob([data], { type: 'text/csv' });
        fileExtension = 'csv';
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage(`✓ Archivo exportado exitosamente: ${fileName}.${fileExtension}`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      console.error('Error exporting:', err);
      setError('Error al exportar datos. Inténtalo de nuevo.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exportar Datos</h1>
          <p className="text-gray-500 mt-1">Descarga los datos de tus hojas de cálculo en diferentes formatos.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Database className="text-blue-600" size={20} />
            <span>Configuración de Exportación</span>
          </h2>

          <div className="space-y-5">
            {/* Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoja de cálculo
              </label>
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Cargando hojas...</span>
                </div>
              ) : (
                <select 
                  value={selectedSheetId}
                  onChange={(e) => setSelectedSheetId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Seleccionar hoja...</option>
                  {files.map(file => (
                    <option key={file.id} value={file.id}>
                      {file.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Formato de salida</label>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none ${
                    format === 'json' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="format" 
                    value="json" 
                    checked={format === 'json'}
                    onChange={(e) => setFormat(e.target.value as 'json')}
                    className="sr-only" 
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded text-purple-700">
                        <FileJson size={20}/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">JSON</p>
                        <p className="text-xs text-gray-500">Datos estructurados</p>
                      </div>
                    </div>
                    {format === 'json' && <CheckCircle2 className="text-blue-600" size={20} />}
                  </div>
                </label>

                <label 
                  className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none ${
                    format === 'csv' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="format" 
                    value="csv" 
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value as 'csv')}
                    className="sr-only" 
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded text-orange-700">
                        <FileText size={20}/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">CSV</p>
                        <p className="text-xs text-gray-500">Texto separado por comas</p>
                      </div>
                    </div>
                    {format === 'csv' && <CheckCircle2 className="text-blue-600" size={20} />}
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-200 flex justify-end">
              <button 
                onClick={handleExport}
                disabled={exporting || !selectedSheetId}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Generar Exportación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

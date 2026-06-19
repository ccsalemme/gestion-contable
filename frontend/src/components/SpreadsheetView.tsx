import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Save, RefreshCw, Search, X, Plus } from "lucide-react";
import { sheetsApi, SheetRow, FormattedCell, CellFormat } from "@/api/sheets";
import { cellFormatToCSS } from "@/utils/sheetFormat";

const COLS = 26; // Número por defecto de columnas
const ROWS = 50;

const getColumnLabel = (index: number) => {
  let label = "";
  let temp = index;
  while (temp >= 0) {
    label = String.fromCharCode(65 + (temp % 26)) + label;
    temp = Math.floor(temp / 26) - 1;
  }
  return label;
};

interface Sheet {
  id: string;
  name: string;
  data: Record<string, string>;
  headers: string[];
  sheetId?: number; // ID interno de la hoja
  loaded?: boolean; // Indica si los datos ya fueron cargados
  cellFormats?: Map<string, CellFormat>; // Formatos de celdas por ID (row-col)
}

export default function SpreadsheetView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sheetId = searchParams.get('sheetId'); // Obtener sheetId de query params
  
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheetId, setActiveSheetId] = useState("1");
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, { range: string; value: any }>>(new Map());
  const [sheetSearchQuery, setSheetSearchQuery] = useState("");
  
  // Estados para dropdowns de menú
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  
  // Estados para funcionalidades
  const [history, setHistory] = useState<Array<Record<string, string>>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<{type: 'copy' | 'cut', data: string, cell: string} | null>(null);
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Cargar datos de las hojas al montar el componente o cuando cambia sheetId
  useEffect(() => {
    loadSheetData();
  }, [sheetId]);

  // Inicializar historial cuando cambia la hoja activa
  useEffect(() => {
    const currentSheet = sheets.find(s => s.id === activeSheetId);
    if (currentSheet && currentSheet.data) {
      setHistory([{ ...currentSheet.data }]);
      setHistoryIndex(0);
    }
  }, [activeSheetId, sheets.length]);

  const loadSheetData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!sheetId) {
        setError('No se especificó un ID de hoja');
        setLoading(false);
        return;
      }

      // Primero, obtener metadata de las hojas (rápido)
      const metadataResponse = await sheetsApi.getSheetMetadata(sheetId);
      if (metadataResponse.data.success && metadataResponse.data.sheets.length > 0) {
        const availableSheets = metadataResponse.data.sheets;
        
        // Crear estructura de hojas sin datos (lazy loading)
        const loadedSheets: Sheet[] = availableSheets.map(sheetMeta => ({
          id: sheetMeta.sheetId.toString(),
          name: sheetMeta.title,
          data: {},
          headers: [],
          sheetId: sheetMeta.sheetId,
          loaded: false,
        }));

        setSheets(loadedSheets);
        
        // Cargar datos solo de la primera hoja
        if (loadedSheets.length > 0) {
          await loadSheetDataByIndex(0, loadedSheets[0].name);
          setActiveSheetId(loadedSheets[0].id);
        }
      } else {
        // Fallback: cargar datos sin metadata
        const response = await sheetsApi.getSheetData(sheetId);
        const rows: SheetRow[] = response.data;

        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);
          const sheetData: Record<string, string> = {};
          
          headers.forEach((header, colIndex) => {
            sheetData[`0-${colIndex}`] = header;
          });

          rows.forEach((row, rowIndex) => {
            headers.forEach((header, colIndex) => {
              const value = row[header];
              sheetData[`${rowIndex + 1}-${colIndex}`] = value?.toString() || '';
            });
          });

          setSheets([
            { 
              id: "1", 
              name: "Datos", 
              data: sheetData,
              headers,
              loaded: true,
            }
          ]);
          setActiveSheetId("1");
        }
      }
    } catch (err: any) {
      console.error('Error loading sheet data:', err);
      setError('Error al cargar datos.');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadSheetDataByIndex = async (index: number, sheetName: string) => {
    try {
      if (!sheetId) return;

      // Intentar cargar con formato completo
      try {
        const formattedResponse = await sheetsApi.getSheetDataWithFormat(sheetId, sheetName);
        const formattedData = formattedResponse.data;

        if (formattedData.cells && formattedData.cells.length > 0) {
          const sheetData: Record<string, string> = {};
          const cellFormats = new Map<string, CellFormat>();

          // Convertir las celdas formateadas a la estructura de datos
          formattedData.cells.forEach((cell: FormattedCell) => {
            const cellId = `${cell.row}-${cell.col}`;
            sheetData[cellId] = cell.formattedValue || cell.value?.toString() || '';
            
            if (cell.format) {
              cellFormats.set(cellId, cell.format);
            }
          });

          // Actualizar la hoja con datos y formatos
          setSheets(prev => prev.map((sheet, idx) => 
            idx === index 
              ? { ...sheet, data: sheetData, headers: formattedData.headers, loaded: true, cellFormats }
              : sheet
          ));
          return;
        }
      } catch (formatErr) {
        console.warn(`Could not load formatted data for "${sheetName}", falling back to basic data:`, formatErr);
      }

      // Fallback: cargar datos sin formato
      const response = await sheetsApi.getSheetDataByName(sheetId, sheetName);
      const rows: SheetRow[] = response.data;

      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        const sheetData: Record<string, string> = {};
        
        // Headers en la primera fila
        headers.forEach((header, colIndex) => {
          sheetData[`0-${colIndex}`] = header;
        });

        // Datos en las filas siguientes
        rows.forEach((row, rowIndex) => {
          headers.forEach((header, colIndex) => {
            const value = row[header];
            sheetData[`${rowIndex + 1}-${colIndex}`] = value?.toString() || '';
          });
        });

        // Actualizar solo la hoja específica
        setSheets(prev => prev.map((sheet, idx) => 
          idx === index 
            ? { ...sheet, data: sheetData, headers, loaded: true }
            : sheet
        ));
      }
    } catch (err) {
      console.error(`Error loading data for sheet "${sheetName}":`, err);
      setError(`Error al cargar hoja "${sheetName}"`);
    }
  };

  const handleSheetChange = async (newSheetId: string) => {
    const sheetIndex = sheets.findIndex(s => s.id === newSheetId);
    if (sheetIndex === -1) return;

    setActiveSheetId(newSheetId);

    // Si la hoja no está cargada, cargarla
    const sheet = sheets[sheetIndex];
    if (!sheet.loaded) {
      setLoading(true);
      await loadSheetDataByIndex(sheetIndex, sheet.name);
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockData: Record<string, string> = {
      "0-0": "ID", "0-1": "Nombre", "0-2": "Apellido", "0-3": "Email", "0-4": "Teléfono", "0-5": "Estado", "0-6": "Fecha de Registro",
      "1-0": "1", "1-1": "Juan", "1-2": "Pérez", "1-3": "juan.perez@example.com", "1-4": "+34 600 123 456", "1-5": "Activo", "1-6": "2023-01-15",
      "2-0": "2", "2-1": "María", "2-2": "García", "2-3": "maria.g@example.com", "2-4": "+34 611 987 654", "2-5": "Pendiente", "2-6": "2023-02-20",
      "3-0": "3", "3-1": "Carlos", "3-2": "López", "3-3": "clopez@example.com", "3-4": "+34 622 345 678", "3-5": "Inactivo", "3-6": "2023-03-05",
    };
    
    setSheets([
      { 
        id: "1", 
        name: "Datos de Ejemplo", 
        data: mockData,
        headers: ["ID", "Nombre", "Apellido", "Email", "Teléfono", "Estado", "Fecha de Registro"],
        loaded: true,
      }
    ]);
    setActiveSheetId("1");
  };

  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];
  const activeData = activeSheet?.data || {};
  const totalCols = activeSheet?.headers?.length || COLS;
  // Usar el número real de columnas de cada hoja (dinámico)
  const numCols = totalCols;
  // Ancho mínimo de columna: permite scroll horizontal natural
  const colWidthClass = "min-w-48"; // 192px mínimo - permite ~6 columnas visibles

  const handleCellChange = (row: number, col: number, value: string) => {
    // Guardar estado actual en el historial antes de cambiar
    const currentSheet = sheets.find(s => s.id === activeSheetId);
    if (currentSheet && historyIndex === history.length - 1) {
      setHistory(prev => [...prev, { ...currentSheet.data }]);
      setHistoryIndex(prev => prev + 1);
    }

    setSheets(prev => prev.map(sheet => {
      if (sheet.id === activeSheetId) {
        return {
          ...sheet,
          data: { ...sheet.data, [`${row}-${col}`]: value }
        };
      }
      return sheet;
    }));

    // Rastrear cambio pendiente
    const cellId = `${row}-${col}`;
    const columnLabel = getColumnLabel(col);
    const range = `${columnLabel}${row + 1}`; // Ej: A1, B5, C10
    
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      newChanges.set(cellId, { range, value });
      return newChanges;
    });
  };

  const handleSave = async () => {
    if (pendingChanges.size === 0) {
      setSaveMessage('No hay cambios para guardar');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (!sheetId) {
      setError('No se puede guardar: ID de hoja no especificado');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const updates = Array.from(pendingChanges.values());
      
      await sheetsApi.updateCells(sheetId, updates);
      
      setPendingChanges(new Map());
      setSaveMessage(`✓ ${updates.length} cambios guardados exitosamente`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setError('Error al guardar cambios. Inténtalo de nuevo.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const addSheet = () => {
    const newId = Date.now().toString();
    setSheets([
      ...sheets, 
      { 
        id: newId, 
        name: `Hoja ${sheets.length + 1}`, 
        data: {},
        headers: []
      }
    ]);
    setActiveSheetId(newId);
  };

  // Funciones de Archivo
  const handleNew = () => {
    if (pendingChanges.size > 0) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) return;
    }
    addSheet();
    setFileMenuOpen(false);
  };

  const handleDownload = () => {
    const activeSheet = sheets.find(s => s.id === activeSheetId);
    if (!activeSheet) return;

    // Convertir datos a CSV
    let csv = '';
    const maxRow = Math.max(...Object.keys(activeSheet.data).map(key => parseInt(key.split('-')[0])));
    const maxCol = Math.max(...Object.keys(activeSheet.data).map(key => parseInt(key.split('-')[1])));

    for (let row = 0; row <= maxRow; row++) {
      const rowData = [];
      for (let col = 0; col <= maxCol; col++) {
        const value = activeSheet.data[`${row}-${col}`] || '';
        rowData.push(`"${value.replace(/"/g, '""')}"`);
      }
      csv += rowData.join(',') + '\n';
    }

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSheet.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setFileMenuOpen(false);
  };

  // Funciones de Editar
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      setSheets(prev => prev.map(sheet => 
        sheet.id === activeSheetId ? { ...sheet, data: previousState } : sheet
      ));
    }
    setEditMenuOpen(false);
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setSheets(prev => prev.map(sheet => 
        sheet.id === activeSheetId ? { ...sheet, data: nextState } : sheet
      ));
    }
    setEditMenuOpen(false);
  };

  const handleCopy = () => {
    if (activeCell) {
      const activeSheet = sheets.find(s => s.id === activeSheetId);
      if (activeSheet) {
        const value = activeSheet.data[activeCell] || '';
        setClipboard({ type: 'copy', data: value, cell: activeCell });
        navigator.clipboard.writeText(value);
      }
    }
    setEditMenuOpen(false);
  };

  const handleCut = () => {
    if (activeCell) {
      const activeSheet = sheets.find(s => s.id === activeSheetId);
      if (activeSheet) {
        const value = activeSheet.data[activeCell] || '';
        setClipboard({ type: 'cut', data: value, cell: activeCell });
        navigator.clipboard.writeText(value);
        // Limpiar celda
        const [row, col] = activeCell.split('-').map(Number);
        handleCellChange(row, col, '');
      }
    }
    setEditMenuOpen(false);
  };

  const handlePaste = async () => {
    if (activeCell) {
      try {
        const text = await navigator.clipboard.readText();
        const [row, col] = activeCell.split('-').map(Number);
        handleCellChange(row, col, text);
      } catch (err) {
        console.error('Error al pegar:', err);
      }
    }
    setEditMenuOpen(false);
  };

  const handleSearch = () => {
    const term = prompt('Buscar en la hoja:');
    if (!term) return;
    
    setSearchTerm(term);
    const activeSheet = sheets.find(s => s.id === activeSheetId);
    if (!activeSheet) return;

    const results: string[] = [];
    Object.entries(activeSheet.data).forEach(([key, value]) => {
      if (value.toString().toLowerCase().includes(term.toLowerCase())) {
        results.push(key);
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);
    if (results.length > 0) {
      setActiveCell(results[0]);
    }
    setEditMenuOpen(false);
  };

  // Funciones de Ver
  const handleZoom100 = () => {
    setZoom(100);
    setViewMenuOpen(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
    setViewMenuOpen(false);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
    setViewMenuOpen(false);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setViewMenuOpen(false);
  };

  // Funciones de Formato
  const handleBold = () => {
    // Funcionalidad de formato requiere extensión del modelo de datos
    alert('Funcionalidad de formato en desarrollo');
    setFormatMenuOpen(false);
  };

  if (!sheets.length && loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-6 border-b border-gray-200 bg-gray-50/50 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-600 flex space-x-1">
            {/* Menú Archivo */}
            <div className="relative">
              <button 
                onClick={() => {
                  setFileMenuOpen(!fileMenuOpen);
                  setEditMenuOpen(false);
                  setViewMenuOpen(false);
                  setFormatMenuOpen(false);
                }}
                className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                Archivo
              </button>
              {fileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFileMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                    <button onClick={handleNew} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Nuevo</button>
                    <button onClick={() => { navigate('/files'); setFileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Abrir</button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button onClick={() => { handleSave(); setFileMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Guardar</button>
                    <button onClick={handleDownload} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Descargar</button>
                  </div>
                </>
              )}
            </div>

            {/* Menú Editar */}
            <div className="relative">
              <button 
                onClick={() => {
                  setEditMenuOpen(!editMenuOpen);
                  setFileMenuOpen(false);
                  setViewMenuOpen(false);
                  setFormatMenuOpen(false);
                }}
                className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                Editar
              </button>
              {editMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setEditMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Deshacer</button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Rehacer</button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button onClick={handleCut} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cortar</button>
                    <button onClick={handleCopy} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Copiar</button>
                    <button onClick={handlePaste} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Pegar</button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button onClick={handleSearch} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Buscar</button>
                  </div>
                </>
              )}
            </div>

            {/* Menú Ver */}
            <div className="relative">
              <button 
                onClick={() => {
                  setViewMenuOpen(!viewMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setFormatMenuOpen(false);
                }}
                className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                Ver
              </button>
              {viewMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setViewMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                    <button onClick={handleZoom100} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Zoom {zoom}%</button>
                    <button onClick={handleZoomIn} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Aumentar zoom</button>
                    <button onClick={handleZoomOut} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Reducir zoom</button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button onClick={handleFullscreen} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors">Pantalla completa</button>
                  </div>
                </>
              )}
            </div>

            {/* Menú Formato */}
            <div className="relative">
              <button 
                onClick={() => {
                  setFormatMenuOpen(!formatMenuOpen);
                  setFileMenuOpen(false);
                  setEditMenuOpen(false);
                  setViewMenuOpen(false);
                }}
                className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                Formato
              </button>
              {formatMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setFormatMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                    <button onClick={handleBold} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Negrita</button>
                    <button onClick={handleBold} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cursiva</button>
                    <button onClick={handleBold} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Subrayado</button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button onClick={handleBold} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Tamaño de fuente</button>
                    <button onClick={handleBold} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Color de texto</button>
                    <button onClick={handleBold} disabled={!activeCell} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Color de fondo</button>
                  </div>
                </>
              )}
            </div>

            <button 
              className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium flex items-center space-x-1"
              onClick={loadSheetData}
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>Recargar</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {error && (
            <span className="text-xs text-amber-600 font-medium">{error}</span>
          )}
          {saveMessage && (
            <span className="text-xs text-green-600 font-medium">{saveMessage}</span>
          )}
          {pendingChanges.size > 0 && !saving && (
            <span className="text-xs text-blue-600 font-medium">
              {pendingChanges.size} cambio{pendingChanges.size > 1 ? 's' : ''} sin guardar
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving || pendingChanges.size === 0 || !sheetId}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={14} className={saving ? "animate-spin" : ""} />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="flex items-center border-b border-gray-200 px-4 py-2 bg-white shrink-0">
        <div className="w-14 text-center text-gray-500 font-mono text-sm border-r border-gray-200 pr-3 mr-3 font-semibold">
          {activeCell || ""}
        </div>
        <div className="text-gray-400 font-serif italic pr-3 border-r border-gray-200 mr-3 text-base">fx</div>
        <input
          type="text"
          className="flex-1 outline-none px-2 py-1 text-base font-sans bg-transparent"
          placeholder="Selecciona una celda para editar su contenido..."
          value={activeCell ? activeData[activeCell] || "" : ""}
          onChange={(e) => {
            if (activeCell) {
              const [row, col] = activeCell.split("-");
              handleCellChange(parseInt(row), parseInt(col), e.target.value);
            }
          }}
          disabled={!activeCell}
        />
      </div>

      {/* Spreadsheet Grid container */}
      <div className="flex-1 overflow-auto bg-gray-50 relative" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${100 / (zoom / 100)}%`, height: `${100 / (zoom / 100)}%` }}>
        <table className="border-collapse bg-white whitespace-nowrap">
          <thead>
            <tr>
              {/* Top-left corner */}
              <th className="sticky top-0 left-0 z-20 w-12 h-10 bg-gray-100 border-r border-b border-gray-300 shadow-[inset_-1px_-1px_0_rgba(209,213,219,1)]"></th>
              
              {/* Column Headers */}
              {Array.from({ length: numCols }).map((_, colIndex) => (
                <th
                  key={`col-${colIndex}`}
                  className={`sticky top-0 z-10 ${colWidthClass} h-10 bg-gray-100 border-r border-b border-gray-300 text-gray-600 font-medium text-sm text-center select-none shadow-[inset_-1px_-1px_0_rgba(209,213,219,1)] hover:bg-gray-200 transition-colors`}
                >
                  {getColumnLabel(colIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="group">
                {/* Row Header */}
                <td className="sticky left-0 z-10 w-12 h-10 bg-gray-100 border-r border-b border-gray-300 text-gray-500 font-medium text-sm text-center select-none shadow-[inset_-1px_-1px_0_rgba(209,213,219,1)] group-hover:bg-gray-200 group-hover:text-gray-800 transition-colors">
                  {rowIndex + 1}
                </td>
                
                {/* Cells */}
                {Array.from({ length: numCols }).map((_, colIndex) => {
                  const cellId = `${rowIndex}-${colIndex}`;
                  const isActive = activeCell === cellId;
                  const cellFormat = activeSheet?.cellFormats?.get(cellId);
                  const cellStyles = cellFormat ? cellFormatToCSS(cellFormat) : {};
                  
                  return (
                    <td
                      key={cellId}
                      className={`h-10 border-r border-b border-gray-200 p-0 relative ${
                        isActive ? "outline outline-2 outline-blue-500 z-0 ring-4 ring-blue-500/20" : "hover:bg-blue-50/30"
                      }`}
                      style={cellStyles}
                      onClick={() => setActiveCell(cellId)}
                    >
                      <input
                        type="text"
                        className="w-full h-full px-2 outline-none bg-transparent text-base"
                        style={{
                          color: cellStyles.color || 'inherit',
                          fontFamily: cellStyles.fontFamily || 'inherit',
                          fontSize: cellStyles.fontSize || 'inherit',
                          fontWeight: cellStyles.fontWeight || 'inherit',
                          fontStyle: cellStyles.fontStyle || 'inherit',
                          textDecoration: cellStyles.textDecoration || 'inherit',
                          textAlign: cellStyles.textAlign || 'inherit',
                        }}
                        value={activeData[cellId] || ""}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        onFocus={() => setActiveCell(cellId)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Tabs for Sheets */}
      <div className="h-16 border-t border-gray-200 bg-gray-100 flex items-center px-2 shrink-0">
        <div className="flex items-center space-x-2 flex-1">
          {/* Buscador de hojas */}
          <div className="relative flex-shrink-0">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={sheetSearchQuery}
              onChange={(e) => setSheetSearchQuery(e.target.value)}
              placeholder="Buscar hoja..."
              className="pl-8 pr-8 py-1 text-xs border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-48"
            />
            {sheetSearchQuery && (
              <button
                onClick={() => setSheetSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Botón añadir hoja */}
          <button 
            onClick={addSheet}
            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-300 rounded transition-colors flex-shrink-0"
            title="Añadir hoja"
          >
            <Plus size={18} />
          </button>

          {/* Lista de hojas con scroll horizontal */}
          <div className="flex space-x-1 overflow-x-auto flex-1">
            {sheets
              .filter(sheet => 
                sheetSearchQuery === "" || 
                sheet.name.toLowerCase().includes(sheetSearchQuery.toLowerCase())
              )
              .map(sheet => (
                <button
                  key={sheet.id}
                  onClick={() => handleSheetChange(sheet.id)}
                  className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap border-b-2 rounded-t-md transition-colors flex-shrink-0 ${
                    activeSheetId === sheet.id
                      ? "bg-white border-blue-600 text-blue-700 shadow-sm"
                      : "border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sheet.name}
                  {!sheet.loaded && activeSheetId !== sheet.id && (
                    <span className="ml-1 text-xs text-gray-400">•</span>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

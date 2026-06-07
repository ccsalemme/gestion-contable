import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Save, Plus, Settings2, RefreshCw, ArrowLeft, Search, X } from "lucide-react";
import { sheetsApi, SheetRow, SheetMetadata } from "@/api/sheets";

const COLS = 50; // Aumentado de 15 a 50 para soportar más columnas
const ROWS = 100; // Aumentado de 50 a 100

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
  sheetId?: number; // ID interno de Google Sheets
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

  // Cargar datos desde Google Sheets al montar el componente o cuando cambia sheetId
  useEffect(() => {
    loadSheetData();
  }, [sheetId]);

  const loadSheetData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!sheetId) {
        setError('No se especificó un ID de hoja');
        setLoading(false);
        return;
      }

      // Primero, obtener metadata de las hojas
      const metadataResponse = await sheetsApi.getSheetMetadata(sheetId);
      if (metadataResponse.data.success && metadataResponse.data.sheets.length > 0) {
        const availableSheets = metadataResponse.data.sheets;
        
        // Cargar datos de todas las hojas
        const loadedSheets: Sheet[] = [];
        
        for (const sheetMeta of metadataResponse.data.sheets) {
          try {
            const response = await sheetsApi.getSheetDataByName(sheetId, sheetMeta.title);
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

              loadedSheets.push({
                id: sheetMeta.sheetId.toString(),
                name: sheetMeta.title,
                data: sheetData,
                headers,
                sheetId: sheetMeta.sheetId,
              });
            }
          } catch (err) {
            console.error(`Error loading sheet "${sheetMeta.title}":`, err);
          }
        }

        if (loadedSheets.length > 0) {
          setSheets(loadedSheets);
          setActiveSheetId(loadedSheets[0].id);
        } else {
          setError('No se pudieron cargar datos de las hojas');
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
              name: "Datos de Google Sheets", 
              data: sheetData,
              headers 
            }
          ]);
          setActiveSheetId("1");
        }
      }
    } catch (err: any) {
      console.error('Error loading sheet data:', err);
      setError('Error al cargar datos de Google Sheets.');
      loadMockData();
    } finally {
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
        headers: ["ID", "Nombre", "Apellido", "Email", "Teléfono", "Estado", "Fecha de Registro"]
      }
    ]);
  };

  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];
  const activeData = activeSheet?.data || {};

  const handleCellChange = (row: number, col: number, value: string) => {
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

  if (!sheets.length && loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando datos de Google Sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-6 border-b border-gray-200 bg-gray-50/50 shrink-0">
        <div className="flex items-center space-x-3">
          {sheetId && (
            <button 
              onClick={() => navigate('/files')}
              className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-700 text-sm font-medium"
            >
              <ArrowLeft size={14} />
              <span>Archivos</span>
            </button>
          )}
          <div className="text-xs text-gray-600 flex space-x-1">
            <button className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium">Archivo</button>
            <button className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium">Editar</button>
            <button className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium">Ver</button>
            <button className="hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium">Formato</button>
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
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 rounded-md text-sm font-medium text-gray-700 transition-colors">
            <Settings2 size={14} />
            <span>Filtros</span>
          </button>
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
        <div className="w-12 text-center text-gray-500 font-mono text-xs border-r border-gray-200 pr-3 mr-3 font-semibold">
          {activeCell || ""}
        </div>
        <div className="text-gray-400 font-serif italic pr-3 border-r border-gray-200 mr-3 text-sm">fx</div>
        <input
          type="text"
          className="flex-1 outline-none px-2 py-1 text-sm font-sans bg-transparent"
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
      <div className="flex-1 overflow-auto bg-gray-50 relative">
        <table className="border-collapse bg-white whitespace-nowrap min-w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              {/* Top-left corner */}
              <th className="sticky top-0 left-0 z-20 w-12 h-8 bg-gray-100 border-r border-b border-gray-300 shadow-[inset_-1px_-1px_0_rgba(209,213,219,1)]"></th>
              
              {/* Column Headers */}
              {Array.from({ length: COLS }).map((_, colIndex) => (
                <th
                  key={`col-${colIndex}`}
                  className="sticky top-0 z-10 w-32 h-8 bg-gray-100 border-r border-b border-gray-300 text-gray-600 font-medium text-xs text-center select-none shadow-[inset_-1px_-1px_0_rgba(209,213,219,1)] hover:bg-gray-200 transition-colors"
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
                <td className="sticky left-0 z-10 w-12 h-8 bg-gray-100 border-r border-b border-gray-300 text-gray-500 font-medium text-xs text-center select-none shadow-[inset_-1px_-1px_0_rgba(209,213,219,1)] group-hover:bg-gray-200 group-hover:text-gray-800 transition-colors">
                  {rowIndex + 1}
                </td>
                
                {/* Cells */}
                {Array.from({ length: COLS }).map((_, colIndex) => {
                  const cellId = `${rowIndex}-${colIndex}`;
                  const isActive = activeCell === cellId;
                  
                  return (
                    <td
                      key={cellId}
                      className={`h-8 border-r border-b border-gray-200 p-0 relative bg-white ${
                        isActive ? "outline outline-2 outline-blue-500 z-0 ring-4 ring-blue-500/20" : "hover:bg-blue-50/30"
                      }`}
                      onClick={() => setActiveCell(cellId)}
                    >
                      <input
                        type="text"
                        className="w-full h-full px-2 outline-none bg-transparent text-sm text-gray-800"
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
                  onClick={() => setActiveSheetId(sheet.id)}
                  className={`px-4 py-1.5 text-sm font-medium whitespace-nowrap border-b-2 rounded-t-md transition-colors flex-shrink-0 ${
                    activeSheetId === sheet.id
                      ? "bg-white border-blue-600 text-blue-700 shadow-sm"
                      : "border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

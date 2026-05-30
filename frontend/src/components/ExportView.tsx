import { FileSpreadsheet, Download, Database, CheckCircle2, History, FileJson, FileText } from "lucide-react";

export default function ExportView() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exportar Datos</h1>
          <p className="text-gray-500 mt-1">Configura y descarga los datos de tus hojas de cálculo en diferentes formatos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Export Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Database className="text-blue-600" size={20} />
                <span>Configuración de Exportación</span>
              </h2>

              <div className="space-y-5">
                {/* Source Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origen de los datos</label>
                  <select className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option>Clientes Q1 (Hoja Actual)</option>
                    <option>Proveedores</option>
                    <option>Inventario Global</option>
                    <option>Todo el documento (Libro completo)</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Formato de salida</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none border-blue-500 ring-1 ring-blue-500">
                      <input type="radio" name="format" value="excel" className="sr-only" defaultChecked />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded text-green-700"><FileSpreadsheet size={20}/></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Excel (.xlsx)</p>
                            <p className="text-xs text-gray-500">Documento completo</p>
                          </div>
                        </div>
                        <CheckCircle2 className="text-blue-600" size={20} />
                      </div>
                    </label>

                    <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none border-gray-200">
                      <input type="radio" name="format" value="csv" className="sr-only" />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-orange-100 p-2 rounded text-orange-700"><FileText size={20}/></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">CSV</p>
                            <p className="text-xs text-gray-500">Texto separado por comas</p>
                          </div>
                        </div>
                      </div>
                    </label>

                    <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 focus:outline-none border-gray-200">
                      <input type="radio" name="format" value="json" className="sr-only" />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded text-purple-700"><FileJson size={20}/></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">JSON</p>
                            <p className="text-xs text-gray-500">Datos estructurados</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-gray-200 flex justify-end">
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Download size={18} />
                    <span>Generar Exportación</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center space-x-2 uppercase tracking-wide">
                <History className="text-gray-400" size={16} />
                <span>Exportaciones Recientes</span>
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: "Clientes_Marzo.xlsx", date: "Hace 2 horas", size: "2.4 MB" },
                  { name: "Reporte_Anual_2023.csv", date: "Ayer, 14:30", size: "1.1 MB" },
                  { name: "Inventario_Export.json", date: "10 Mar, 09:15", size: "850 KB" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.date} • {item.size}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Volver a descargar">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

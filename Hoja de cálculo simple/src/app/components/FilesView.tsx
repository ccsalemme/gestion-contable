import { Folder, FileSpreadsheet, FileText, MoreVertical, Plus, Filter } from "lucide-react";

export default function FilesView() {
  const folders = [
    { id: 1, name: "Reportes 2024", count: 12, date: "12 Mar, 2024" },
    { id: 2, name: "Finanzas", count: 8, date: "10 Mar, 2024" },
    { id: 3, name: "Recursos Humanos", count: 5, date: "05 Mar, 2024" },
    { id: 4, name: "Marketing", count: 24, date: "28 Feb, 2024" },
  ];

  const files = [
    { id: 1, name: "Base de Datos - Clientes.xlsx", type: "spreadsheet", size: "2.4 MB", date: "Hoy, 10:30 AM" },
    { id: 2, name: "Presupuesto Q1.xlsx", type: "spreadsheet", size: "1.1 MB", date: "Ayer, 16:45 PM" },
    { id: 3, name: "Lista de Contactos.csv", type: "csv", size: "450 KB", date: "12 Mar, 2024" },
    { id: 4, name: "Inventario Global.xlsx", type: "spreadsheet", size: "5.6 MB", date: "10 Mar, 2024" },
    { id: 5, name: "Análisis Competitivo.csv", type: "csv", size: "890 KB", date: "08 Mar, 2024" },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Archivos</h1>
            <p className="text-gray-500 mt-1">Gestiona todos tus documentos y hojas de cálculo en un solo lugar.</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Filter size={16} />
              <span>Filtrar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={16} />
              <span>Nuevo Archivo</span>
            </button>
          </div>
        </div>

        {/* Folders Section */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Carpetas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map(folder => (
              <div key={folder.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Folder size={20} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-700 p-1">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>{folder.count} archivos</span>
                    <span>{folder.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Files Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Archivos Recientes</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Tamaño</th>
                  <th className="px-6 py-3 font-medium">Última modificación</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${file.type === 'spreadsheet' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {file.type === 'spreadsheet' ? <FileSpreadsheet size={18} /> : <FileText size={18} />}
                      </div>
                      <span className="font-medium text-gray-900">{file.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{file.size}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{file.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

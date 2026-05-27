import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { apiClient } from '@/api/client'

interface SheetRow {
  [key: string]: string | number | boolean | null
}

export default function SpreadsheetPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [data, setData] = useState<SheetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
    fetchSheetData()
  }, [])

  const fetchSheetData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<SheetRow[]>('/sheets/default')
      const data = response.data as SheetRow[]
      setData(data)

      // Extraer columnas del primer fila
      if (data.length > 0) {
        setColumns(Object.keys(data[0]))
      }

      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simple */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hojas de Cálculo</h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.email} ({user?.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Botón Refrescar */}
        <div className="mb-4">
          <button
            onClick={fetchSheetData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tabla */}
        {!loading && data.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td
                          key={`${idx}-${col}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[col] !== null ? String(row[col]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
              Total: {data.length} filas
            </div>
          </div>
        )}

        {/* Sin datos */}
        {!loading && data.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay datos disponibles
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        )}
      </div>
    </div>
  )
}

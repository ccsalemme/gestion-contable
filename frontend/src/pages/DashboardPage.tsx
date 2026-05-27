import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { LoadingSpinner } from '@/components'

export function DashboardPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Aquí cargarías datos del dashboard
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.email}
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control de Gestión Contable Multiempresa
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Empresas" value="0" icon="🏢" />
        <StatsCard title="Usuarios" value="0" icon="👥" />
        <StatsCard title="Hojas" value="0" icon="📊" />
        <StatsCard title="Registros" value="0" icon="📝" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="text-center py-12 text-gray-500">
          <p>No hay actividad reciente aún</p>
        </div>
      </div>

      {/* Rol Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Tu Información</h3>
        <p className="text-blue-800">
          Rol: <span className="font-bold">{user?.role}</span>
        </p>
        <p className="text-blue-800 text-sm mt-1">
          ID: <span className="font-mono text-xs">{user?.id}</span>
        </p>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

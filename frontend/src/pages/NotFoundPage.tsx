import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
        <Button onClick={() => navigate('/')} size="lg">
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

import { useAuthStore } from '@/store/auth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">
                Gestión Contable
              </h1>
              <span className="text-sm text-gray-500">Multiempresa</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user?.email}</p>
                <p className="text-gray-500 text-xs">{user?.role}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            <NavLink href="/dashboard" icon="📊">
              Dashboard
            </NavLink>
            <NavLink href="/tenants" icon="🏢">
              Empresas
            </NavLink>
            <NavLink href="/spreadsheet" icon="📈">
              Hojas de Cálculo
            </NavLink>
            <NavLink href="/users" icon="👥">
              Usuarios
            </NavLink>
            <NavLink href="/permissions" icon="🔐">
              Permisos
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

interface NavLinkProps {
  href: string
  icon: string
  children: React.ReactNode
}

function NavLink({ href, icon, children }: NavLinkProps) {
  const isActive = window.location.pathname === href
  const baseStyles =
    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors'
  const activeStyles = isActive
    ? 'bg-blue-100 text-blue-700 font-medium'
    : 'text-gray-700 hover:bg-gray-100'

  return (
    <a href={href} className={`${baseStyles} ${activeStyles}`}>
      <span>{icon}</span>
      <span>{children}</span>
    </a>
  )
}

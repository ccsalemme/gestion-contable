import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "./Root";
import { 
  LogOut, 
  FileSpreadsheet, 
  Settings, 
  Folder, 
  DownloadCloud,
  Menu,
  ChevronRight,
  ClipboardList
} from "lucide-react";

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || "");
        // Obtener iniciales del email
        const emailName = user.email.split('@')[0];
        const initials = emailName.substring(0, 2).toUpperCase();
        setUserInitials(initials);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case "/files":
        return "Archivos";
      case "/export":
        return "Exportar Datos";
      case "/movements":
        return "Registro de Movimientos";
      case "/":
      default:
        return "Hoja de Datos";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && <span className="font-semibold text-white text-lg tracking-wide">DataPro</span>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto space-y-1">
          <NavItem 
            icon={<FileSpreadsheet size={20} />} 
            label="Hojas de Datos" 
            isOpen={sidebarOpen} 
            active={location.pathname === "/"} 
            onClick={() => {
              const defaultSheetId = import.meta.env.VITE_DEFAULT_SHEET_ID || '1jzGjT49CVcsaNau6okiZHlLt58cKlnB8qxVg2-jrJyE';
              navigate(`/?sheetId=${defaultSheetId}`);
            }}
          />
          <NavItem 
            icon={<Folder size={20} />} 
            label="Archivos" 
            isOpen={sidebarOpen} 
            active={location.pathname === "/files"} 
            onClick={() => navigate("/files")}
          />
          <NavItem 
            icon={<DownloadCloud size={20} />} 
            label="Exportar" 
            isOpen={sidebarOpen} 
            active={location.pathname === "/export"} 
            onClick={() => navigate("/export")}
          />
          <NavItem 
            icon={<ClipboardList size={20} />} 
            label="Movimientos" 
            isOpen={sidebarOpen} 
            active={location.pathname === "/movements"} 
            onClick={() => navigate("/movements")}
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Configuración" 
            isOpen={sidebarOpen} 
            active={false}
            onClick={() => {}}
          />
          <button 
            onClick={logout}
            className={`w-full flex items-center ${sidebarOpen ? "justify-start px-3" : "justify-center"} py-2 mt-2 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-10 rounded-l-2xl border-l border-gray-200 overflow-hidden my-2 mr-2">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-900">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                {userInitials}
              </button>
              
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                          <p className="text-xs text-gray-500">Usuario</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* The View Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  isOpen, 
  active = false,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  isOpen: boolean; 
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center ${isOpen ? "justify-start px-3" : "justify-center"} py-2.5 mx-2 rounded-lg transition-colors ${
        active 
          ? "bg-blue-600 text-white" 
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
      title={!isOpen ? label : undefined}
      style={{ width: isOpen ? "calc(100% - 16px)" : "calc(100% - 16px)" }}
    >
      <div className="shrink-0">{icon}</div>
      {isOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
    </button>
  );
}

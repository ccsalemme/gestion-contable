import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "./Root";
import { 
  LogOut, 
  FileSpreadsheet, 
  Settings, 
  Folder, 
  DownloadCloud,
  Bell, 
  Search,
  Menu,
  ChevronRight
} from "lucide-react";

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case "/files":
        return "Archivos";
      case "/export":
        return "Exportar Datos";
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
            onClick={() => navigate("/")}
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="pl-9 pr-4 py-1.5 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all w-64"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                JS
              </div>
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

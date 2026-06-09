import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState, createContext, useContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const login = () => {
    setIsAuthenticated(true);
    const defaultSheetId = import.meta.env.VITE_DEFAULT_SHEET_ID || '1jzGjT49CVcsaNau6okiZHlLt58cKlnB8qxVg2-jrJyE';
    navigate(`/?sheetId=${defaultSheetId}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigate("/login");
  };

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <div className="w-full h-screen bg-gray-50 flex flex-col font-sans">
        <Outlet />
      </div>
    </AuthContext.Provider>
  );
}

import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const initialize = useAuthStore((state) => state.initialize);

  // Inicializar el store al montar
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirigir a login si no hay token
  useEffect(() => {
    if (!token && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [token, location.pathname, navigate]);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col font-sans">
      <Outlet />
    </div>
  );
}

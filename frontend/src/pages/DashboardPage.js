import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { LoadingSpinner } from '@/components';
export function DashboardPage() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        // Aquí cargarías datos del dashboard
        setIsLoading(false);
    }, []);
    if (isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: ["Bienvenido, ", user?.email] }), _jsx("p", { className: "text-gray-600 mt-2", children: "Panel de control de Gesti\u00F3n Contable Multiempresa" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatsCard, { title: "Empresas", value: "0", icon: "\uD83C\uDFE2" }), _jsx(StatsCard, { title: "Usuarios", value: "0", icon: "\uD83D\uDC65" }), _jsx(StatsCard, { title: "Hojas", value: "0", icon: "\uD83D\uDCCA" }), _jsx(StatsCard, { title: "Registros", value: "0", icon: "\uD83D\uDCDD" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Actividad Reciente" }), _jsx("div", { className: "text-center py-12 text-gray-500", children: _jsx("p", { children: "No hay actividad reciente a\u00FAn" }) })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Tu Informaci\u00F3n" }), _jsxs("p", { className: "text-blue-800", children: ["Rol: ", _jsx("span", { className: "font-bold", children: user?.role })] }), _jsxs("p", { className: "text-blue-800 text-sm mt-1", children: ["ID: ", _jsx("span", { className: "font-mono text-xs", children: user?.id })] })] })] }));
}
function StatsCard({ title, value, icon }) {
    return (_jsx("div", { className: "bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-600 text-sm font-medium", children: title }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: value })] }), _jsx("div", { className: "text-4xl", children: icon })] }) }));
}
//# sourceMappingURL=DashboardPage.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuthStore } from '@/store/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components';
export function MainLayout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("h1", { className: "text-2xl font-bold text-blue-600", children: "Gesti\u00F3n Contable" }), _jsx("span", { className: "text-sm text-gray-500", children: "Multiempresa" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "text-gray-900 font-medium", children: user?.email }), _jsx("p", { className: "text-gray-500 text-xs", children: user?.role })] }), _jsx(Button, { variant: "secondary", size: "sm", onClick: handleLogout, children: "Cerrar Sesi\u00F3n" })] })] }) }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: "w-64 bg-white shadow-sm min-h-[calc(100vh-64px)]", children: _jsxs("nav", { className: "p-4 space-y-2", children: [_jsx(NavLink, { href: "/dashboard", icon: "\uD83D\uDCCA", children: "Dashboard" }), _jsx(NavLink, { href: "/tenants", icon: "\uD83C\uDFE2", children: "Empresas" }), _jsx(NavLink, { href: "/spreadsheet", icon: "\uD83D\uDCC8", children: "Hojas de C\u00E1lculo" }), _jsx(NavLink, { href: "/users", icon: "\uD83D\uDC65", children: "Usuarios" }), _jsx(NavLink, { href: "/permissions", icon: "\uD83D\uDD10", children: "Permisos" })] }) }), _jsx("main", { className: "flex-1 p-8", children: _jsx("div", { className: "max-w-7xl mx-auto", children: children }) })] })] }));
}
function NavLink({ href, icon, children }) {
    const isActive = window.location.pathname === href;
    const baseStyles = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors';
    const activeStyles = isActive
        ? 'bg-blue-100 text-blue-700 font-medium'
        : 'text-gray-700 hover:bg-gray-100';
    return (_jsxs("a", { href: href, className: `${baseStyles} ${activeStyles}`, children: [_jsx("span", { children: icon }), _jsx("span", { children: children })] }));
}
//# sourceMappingURL=MainLayout.js.map
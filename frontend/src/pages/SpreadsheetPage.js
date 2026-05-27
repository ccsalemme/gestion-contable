import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/api/client';
export default function SpreadsheetPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columns, setColumns] = useState([]);
    useEffect(() => {
        fetchSheetData();
    }, []);
    const fetchSheetData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/sheets/default');
            const data = response.data;
            setData(data);
            // Extraer columnas del primer fila
            if (data.length > 0) {
                setColumns(Object.keys(data[0]));
            }
            setError(null);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Error al cargar datos');
            setData([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Hojas de C\u00E1lculo" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [user?.email, " (", user?.role, ")"] })] }), _jsx("button", { onClick: handleLogout, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition", children: "Cerrar Sesi\u00F3n" })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [_jsx("div", { className: "mb-4", children: _jsx("button", { onClick: fetchSheetData, disabled: loading, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400", children: loading ? 'Cargando...' : 'Refrescar' }) }), error && (_jsx("div", { className: "mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded", children: error })), !loading && data.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-100", children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider", children: col }, col))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: data.map((row, idx) => (_jsx("tr", { className: "hover:bg-gray-50", children: columns.map((col) => (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: row[col] !== null ? String(row[col]) : '-' }, `${idx}-${col}`))) }, idx))) })] }) }), _jsxs("div", { className: "bg-gray-50 px-6 py-3 text-sm text-gray-600", children: ["Total: ", data.length, " filas"] })] })), !loading && data.length === 0 && !error && (_jsx("div", { className: "bg-white rounded-lg shadow p-8 text-center text-gray-500", children: "No hay datos disponibles" })), loading && (_jsxs("div", { className: "bg-white rounded-lg shadow p-8 text-center", children: [_jsx("div", { className: "inline-block", children: _jsx("div", { className: "w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" }) }), _jsx("p", { className: "mt-4 text-gray-600", children: "Cargando datos..." })] }))] })] }));
}
//# sourceMappingURL=SpreadsheetPage.js.map
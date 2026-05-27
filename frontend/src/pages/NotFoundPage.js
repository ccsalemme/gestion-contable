import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components';
export function NotFoundPage() {
    const navigate = useNavigate();
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-4", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-6xl font-bold text-gray-900 mb-4", children: "404" }), _jsx("p", { className: "text-xl text-gray-600 mb-8", children: "P\u00E1gina no encontrada" }), _jsx(Button, { onClick: () => navigate('/'), size: "lg", children: "Volver al inicio" })] }) }));
}
//# sourceMappingURL=NotFoundPage.js.map
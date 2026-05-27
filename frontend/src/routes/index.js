import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes as ReactRoutes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages';
import SpreadsheetPage from '@/pages/SpreadsheetPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
export default function Routes() {
    return (_jsxs(ReactRoutes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(SpreadsheetPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
//# sourceMappingURL=index.js.map
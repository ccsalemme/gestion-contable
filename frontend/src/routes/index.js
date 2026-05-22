import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes as ReactRoutes, Route, Navigate } from 'react-router-dom';
export default function Routes() {
    return (_jsxs(ReactRoutes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx("div", { children: "Dashboard - Coming Soon" }) }), _jsx(Route, { path: "/login", element: _jsx("div", { children: "Login - Coming Soon" }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
//# sourceMappingURL=index.js.map
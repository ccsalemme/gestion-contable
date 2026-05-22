import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ErrorAlert({ message, onClose }) {
    return (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-red-900", children: "Error" }), _jsx("p", { className: "text-red-700 text-sm mt-1", children: message })] }), onClose && (_jsx("button", { onClick: onClose, className: "text-red-600 hover:text-red-900 font-bold text-lg", children: "\u00D7" }))] }));
}
export function SuccessAlert({ message, onClose }) {
    return (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-green-900", children: "\u00C9xito" }), _jsx("p", { className: "text-green-700 text-sm mt-1", children: message })] }), onClose && (_jsx("button", { onClick: onClose, className: "text-green-600 hover:text-green-900 font-bold text-lg", children: "\u00D7" }))] }));
}
//# sourceMappingURL=Alert.js.map
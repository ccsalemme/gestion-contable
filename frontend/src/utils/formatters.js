export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES');
}
export function formatTime(date) {
    return new Date(date).toLocaleTimeString('es-ES');
}
export function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}
export function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}
//# sourceMappingURL=formatters.js.map
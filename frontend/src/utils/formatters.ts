export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES')
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-ES')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

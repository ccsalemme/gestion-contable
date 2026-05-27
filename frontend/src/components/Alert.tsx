interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info' | 'danger'
  message: string
  onClose?: () => void
  className?: string
}

export function Alert({ variant, message, onClose, className = '' }: AlertProps) {
  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'Éxito',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
      buttonColor: 'text-green-600 hover:text-green-900',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'Error',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      buttonColor: 'text-red-600 hover:text-red-900',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'Alerta',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
      buttonColor: 'text-red-600 hover:text-red-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: 'Advertencia',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
      buttonColor: 'text-yellow-600 hover:text-yellow-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'Información',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
      buttonColor: 'text-blue-600 hover:text-blue-900',
    },
  }

  const config = variants[variant]

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex justify-between items-start ${className}`}
    >
      <div>
        <h3 className={`font-semibold ${config.titleColor}`}>{config.title}</h3>
        <p className={`${config.messageColor} text-sm mt-1`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${config.buttonColor} font-bold text-lg flex-shrink-0 ml-4`}
        >
          ×
        </button>
      )}
    </div>
  )
}

// Convenience exports
export function ErrorAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert variant="error" message={message} onClose={onClose} />
}

export function SuccessAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert variant="success" message={message} onClose={onClose} />
}

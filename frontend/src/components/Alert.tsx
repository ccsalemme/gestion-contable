interface ErrorAlertProps {
  message: string
  onClose?: () => void
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-red-900">Error</h3>
        <p className="text-red-700 text-sm mt-1">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-900 font-bold text-lg"
        >
          ×
        </button>
      )}
    </div>
  )
}

interface SuccessAlertProps {
  message: string
  onClose?: () => void
}

export function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-green-900">Éxito</h3>
        <p className="text-green-700 text-sm mt-1">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-600 hover:text-green-900 font-bold text-lg"
        >
          ×
        </button>
      )}
    </div>
  )
}

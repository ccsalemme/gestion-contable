import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { sheetsApi } from '@/api/sheets'
import { Movement, MotivoMovimiento } from '@/types/movement'
import { Button, Alert } from '@/components'

interface MovementFormData extends Movement {}

export function MovementsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MovementFormData>({
    defaultValues: {
      monto: undefined,
      emisor: '',
      receptor: '',
      motivo: MotivoMovimiento.CABLE,
      casoEspecial: false,
    },
  })

  const onSubmit = async (data: MovementFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await sheetsApi.createMovement(data)

      if (response.data.success) {
        setSuccessMessage('✓ Movimiento registrado exitosamente')
        reset()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } else {
        setErrorMessage(response.data.message || 'Error al registrar movimiento')
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Error al registrar movimiento. Por favor, intente nuevamente.'
      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro de Movimientos
          </h1>
          <p className="text-gray-600">
            Complete el formulario para registrar un nuevo movimiento financiero
          </p>
        </div>

        {successMessage && (
          <Alert variant="success" message={successMessage} className="mb-6" />
        )}
        {errorMessage && (
          <Alert variant="danger" message={errorMessage} className="mb-6" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Monto */}
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              id="monto"
              type="number"
              step="0.01"
              placeholder="Ej: 50000.00"
              {...register('monto', {
                required: 'El monto es obligatorio',
                min: {
                  value: 0.01,
                  message: 'El monto debe ser mayor a 0',
                },
                valueAsNumber: true,
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.monto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.monto && (
              <p className="text-red-500 text-sm mt-1">{errors.monto.message}</p>
            )}
          </div>

          {/* Emisor */}
          <div>
            <label htmlFor="emisor" className="block text-sm font-medium text-gray-700 mb-1">
              Emisor <span className="text-red-500">*</span>
            </label>
            <input
              id="emisor"
              type="text"
              placeholder="Nombre del emisor"
              {...register('emisor', {
                required: 'El emisor es obligatorio',
                pattern: {
                  value: /^[a-zA-Z0-9\s\-_]+$/,
                  message: 'Solo se permiten letras, números, espacios y guiones',
                },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.emisor ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.emisor && (
              <p className="text-red-500 text-sm mt-1">{errors.emisor.message}</p>
            )}
          </div>

          {/* Receptor */}
          <div>
            <label htmlFor="receptor" className="block text-sm font-medium text-gray-700 mb-1">
              Receptor <span className="text-red-500">*</span>
            </label>
            <input
              id="receptor"
              type="text"
              placeholder="Nombre del receptor"
              {...register('receptor', {
                required: 'El receptor es obligatorio',
                pattern: {
                  value: /^[a-zA-Z0-9\s\-_]+$/,
                  message: 'Solo se permiten letras, números, espacios y guiones',
                },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.receptor ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.receptor && (
              <p className="text-red-500 text-sm mt-1">{errors.receptor.message}</p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <select
              id="motivo"
              {...register('motivo', {
                required: 'El motivo es obligatorio',
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.motivo ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value={MotivoMovimiento.CABLE}>Cable</option>
              <option value={MotivoMovimiento.USDT}>USDT</option>
              <option value={MotivoMovimiento.LIQUIDACION}>Liquidación</option>
              <option value={MotivoMovimiento.OTRO}>Otro</option>
            </select>
            {errors.motivo && (
              <p className="text-red-500 text-sm mt-1">{errors.motivo.message}</p>
            )}
          </div>

          {/* Caso Especial */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="casoEspecial"
                type="checkbox"
                {...register('casoEspecial')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="casoEspecial" className="text-sm font-medium text-gray-700">
                Caso Especial
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Marque esta casilla si este movimiento requiere atención especial
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Movimiento'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</p>
        </div>
      </div>
    </div>
  )
}

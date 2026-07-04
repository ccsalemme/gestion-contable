import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { sheetsApi } from '@/api/sheets'
import { Movement, MotivoMovimiento, TipoOperacion, Moneda, EstadoTransaccion } from '@/types/movement'
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
    watch,
    setValue,
  } = useForm<MovementFormData>({
    defaultValues: {
      tipoOperacion: TipoOperacion.SOLO_COMPRA,
      moneda: Moneda.USD,
      motivo: MotivoMovimiento.CABLE,
      estadoTransaccion: EstadoTransaccion.SIN_ESTADO,
      casoEspecial: false,
      compra: {
        monto: undefined,
        contraparte: '',
        costo: undefined,
      },
      venta: {
        monto: undefined,
        contraparte: '',
        costo: undefined,
        usaSaldoActual: false,
      },
    },
  })

  const tipoOperacion = watch('tipoOperacion')
  const usaSaldoActual = watch('venta.usaSaldoActual')
  const motivo = watch('motivo')

  // Cuando se selecciona "Liquidación", forzar tipo de operación a "Compra y Venta Vinculadas"
  useEffect(() => {
    if (motivo === MotivoMovimiento.LIQUIDACION && tipoOperacion !== TipoOperacion.COMPRA_VENTA_VINCULADAS) {
      setValue('tipoOperacion', TipoOperacion.COMPRA_VENTA_VINCULADAS)
    }
  }, [motivo, tipoOperacion, setValue])
  const onSubmit = async (data: MovementFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Validación adicional para venta sin saldo actual
      if (
        (data.tipoOperacion === TipoOperacion.SOLO_VENTA) &&
        !data.venta?.usaSaldoActual
      ) {
        setErrorMessage('Para registrar solo una venta sin usar saldo actual, debe vincularla con una compra')
        setIsSubmitting(false)
        return
      }

      const response = await sheetsApi.createMovement(data)

      if (response.data.success) {
        setSuccessMessage('✓ Operación registrada exitosamente')
        reset()
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } else {
        setErrorMessage(response.data.message || 'Error al registrar operación')
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Error al registrar operación. Por favor, intente nuevamente.'
      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const mostrarCompra = tipoOperacion === TipoOperacion.SOLO_COMPRA || tipoOperacion === TipoOperacion.COMPRA_VENTA_VINCULADAS
  const mostrarVenta = tipoOperacion === TipoOperacion.SOLO_VENTA || tipoOperacion === TipoOperacion.COMPRA_VENTA_VINCULADAS

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro de Operaciones
          </h1>
          <p className="text-gray-600">
            Complete el formulario para registrar una operación de compra, venta o ambas vinculadas
          </p>
        </div>

        {successMessage && (
          <Alert variant="success" message={successMessage} className="mb-6" />
        )}
        {errorMessage && (
          <Alert variant="danger" message={errorMessage} className="mb-6" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Operación */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Tipo de Operación <span className="text-red-500">*</span>
              {motivo === MotivoMovimiento.LIQUIDACION && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  (Liquidación requiere Compra y Venta Vinculadas)
                </span>
              )}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className={`flex items-center p-3 border-2 rounded-lg transition-colors ${
                motivo === MotivoMovimiento.LIQUIDACION 
                  ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                  : 'cursor-pointer hover:bg-blue-100'
              }`}>
                <input
                  type="radio"
                  value={TipoOperacion.SOLO_COMPRA}
                  {...register('tipoOperacion')}
                  disabled={motivo === MotivoMovimiento.LIQUIDACION}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm font-medium">Solo Compra</span>
              </label>
              <label className={`flex items-center p-3 border-2 rounded-lg transition-colors ${
                motivo === MotivoMovimiento.LIQUIDACION 
                  ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                  : 'cursor-pointer hover:bg-blue-100'
              }`}>
                <input
                  type="radio"
                  value={TipoOperacion.SOLO_VENTA}
                  {...register('tipoOperacion')}
                  disabled={motivo === MotivoMovimiento.LIQUIDACION}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm font-medium">Solo Venta</span>
              </label>
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="radio"
                  value={TipoOperacion.COMPRA_VENTA_VINCULADAS}
                  {...register('tipoOperacion')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm font-medium">Compra y Venta Vinculadas</span>
              </label>
            </div>
          </div>

          {/* Moneda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                  <input
                    type="radio"
                    value={Moneda.USD}
                    {...register('moneda')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm font-medium">USD (Dólares)</span>
                </label>
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex-1">
                  <input
                    type="radio"
                    value={Moneda.ARS}
                    {...register('moneda')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm font-medium">ARS (Pesos)</span>
                </label>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo <span className="text-red-500">*</span>
              </label>
              <select
                id="motivo"
                {...register('motivo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value={MotivoMovimiento.CABLE}>Cable</option>
                <option value={MotivoMovimiento.USDT}>USDT</option>
                <option value={MotivoMovimiento.LIQUIDACION}>Liquidación</option>
                <option value={MotivoMovimiento.OTRO}>Otro</option>
              </select>
            </div>
          </div>

          {/* Sección de Compra */}
          {mostrarCompra && (
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Datos de compra
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="compra.monto" className="block text-sm font-medium text-gray-700 mb-1">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="compra.monto"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 10000.00"
                    {...register('compra.monto', {
                      required: mostrarCompra ? 'El monto es obligatorio' : false,
                      min: { value: 0.01, message: 'Debe ser mayor a 0' },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${
                      errors.compra?.monto ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.compra?.monto && (
                    <p className="text-red-500 text-xs mt-1">{errors.compra.monto.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="compra.contraparte" className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="compra.contraparte"
                    type="text"
                    placeholder="De quien compramos"
                    {...register('compra.contraparte', {
                      required: mostrarCompra ? 'El proveedor es obligatorio' : false,
                      pattern: {
                        value: /^[a-zA-Z0-9\s\-_]+$/,
                        message: 'Solo letras, números, espacios y guiones',
                      },
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${
                      errors.compra?.contraparte ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.compra?.contraparte && (
                    <p className="text-red-500 text-xs mt-1">{errors.compra.contraparte.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="compra.costo" className="block text-sm font-medium text-gray-700 mb-1">
                    Costo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="compra.costo"
                    type="number"
                    step="0.0001"
                    placeholder="Ej: 1.015"
                    {...register('compra.costo', {
                      required: mostrarCompra ? 'El costo es obligatorio' : false,
                      min: { value: 0.01, message: 'Debe ser mayor a 0' },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${
                      errors.compra?.costo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.compra?.costo && (
                    <p className="text-red-500 text-xs mt-1">{errors.compra.costo.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sección de Venta */}
          {mostrarVenta && (
            <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Datos de venta
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="venta.monto" className="block text-sm font-medium text-gray-700 mb-1">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="venta.monto"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 10000.00"
                    {...register('venta.monto', {
                      required: mostrarVenta ? 'El monto es obligatorio' : false,
                      min: { value: 0.01, message: 'Debe ser mayor a 0' },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                      errors.venta?.monto ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.venta?.monto && (
                    <p className="text-red-500 text-xs mt-1">{errors.venta.monto.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="venta.contraparte" className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="venta.contraparte"
                    type="text"
                    placeholder="A quien vendemos"
                    {...register('venta.contraparte', {
                      required: mostrarVenta ? 'El cliente es obligatorio' : false,
                      pattern: {
                        value: /^[a-zA-Z0-9\s\-_]+$/,
                        message: 'Solo letras, números, espacios y guiones',
                      },
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                      errors.venta?.contraparte ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.venta?.contraparte && (
                    <p className="text-red-500 text-xs mt-1">{errors.venta.contraparte.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="venta.costo" className="block text-sm font-medium text-gray-700 mb-1">
                    Costo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="venta.costo"
                    type="number"
                    step="0.0001"
                    placeholder="Ej: 1.015"
                    {...register('venta.costo', {
                      required: mostrarVenta ? 'El costo es obligatorio' : false,
                      min: { value: 0.01, message: 'Debe ser mayor a 0' },
                      valueAsNumber: true,
                    })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                      errors.venta?.costo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.venta?.costo && (
                    <p className="text-red-500 text-xs mt-1">{errors.venta.costo.message}</p>
                  )}
                </div>
              </div>

              {/* Usa Saldo Actual */}
              <div className="flex items-start pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="venta.usaSaldoActual"
                    type="checkbox"
                    {...register('venta.usaSaldoActual')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="venta.usaSaldoActual" className="text-sm font-medium text-gray-700">
                    Utiliza Saldo Actual
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {tipoOperacion === TipoOperacion.SOLO_VENTA 
                      ? 'Si no usa saldo actual, debe vincular con una compra'
                      : 'Marca si esta venta usa el saldo disponible en lugar de la compra vinculada'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado de Transacción */}
          <div>
            <label htmlFor="estadoTransaccion" className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Transacción <span className="text-gray-400">(Opcional)</span>
            </label>
            <select
              id="estadoTransaccion"
              {...register('estadoTransaccion')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value={EstadoTransaccion.SIN_ESTADO}>Sin especificar</option>
              <option value={EstadoTransaccion.COMPLETADA}>Completada</option>
              <option value={EstadoTransaccion.EN_PROCESO}>En Proceso</option>
              <option value={EstadoTransaccion.CANCELADA}>Cancelada</option>
            </select>
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
                Marque si esta operación requiere atención o seguimiento especial
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
              {isSubmitting ? 'Registrando...' : 'Registrar Operación'}
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

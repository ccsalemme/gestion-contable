import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreateMovementDto,
  TipoOperacion,
  Moneda,
  MotivoMovimiento,
  EstadoTransaccion,
} from '../../../backend/src/dto/movement.dto';

describe('MovementDTO - Validación', () => {
  describe('Solo Compra', () => {
    it('debe validar correctamente una compra válida', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.SOLO_COMPRA,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.CABLE,
        estadoTransaccion: EstadoTransaccion.COMPLETADA,
        casoEspecial: false,
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe fallar si falta el monto de compra', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.SOLO_COMPRA,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.CABLE,
        estadoTransaccion: EstadoTransaccion.COMPLETADA,
        compra: {
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debe fallar si el costo es negativo', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.SOLO_COMPRA,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.CABLE,
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: -1.015,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Solo Venta', () => {
    it('debe validar correctamente una venta válida', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.SOLO_VENTA,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.USDT,
        estadoTransaccion: EstadoTransaccion.COMPLETADA,
        venta: {
          monto: 1000,
          contraparte: 'Cliente Test',
          costo: 1.02,
          usaSaldoActual: true,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Compra y Venta Vinculadas', () => {
    it('debe validar correctamente operación vinculada', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.COMPRA_VENTA_VINCULADAS,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.CABLE,
        estadoTransaccion: EstadoTransaccion.COMPLETADA,
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
        venta: {
          monto: 1000,
          contraparte: 'Cliente Test',
          costo: 1.02,
          usaSaldoActual: false,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe fallar si falta datos de compra en vinculada', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.COMPRA_VENTA_VINCULADAS,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.CABLE,
        venta: {
          monto: 1000,
          contraparte: 'Cliente Test',
          costo: 1.02,
          usaSaldoActual: false,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Liquidación', () => {
    it('debe validar liquidación solo con operación vinculada', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.COMPRA_VENTA_VINCULADAS,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.LIQUIDACION,
        estadoTransaccion: EstadoTransaccion.COMPLETADA,
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
        venta: {
          monto: 1000,
          contraparte: 'Cliente Test',
          costo: 1.02,
          usaSaldoActual: false,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe fallar liquidación con operación simple', async () => {
      const dto = plainToClass(CreateMovementDto, {
        tipoOperacion: TipoOperacion.SOLO_COMPRA,
        moneda: Moneda.USD,
        motivo: MotivoMovimiento.LIQUIDACION,
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../backend/src/app.module';

describe('Sheets Controller (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener token de autenticación
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'test123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /sheets/movements', () => {
    it('debe crear una operación de solo compra', async () => {
      const movementData = {
        tipoOperacion: 'Solo Compra',
        moneda: 'USD',
        motivo: 'Cable',
        estadoTransaccion: 'Completada',
        casoEspecial: false,
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/sheets/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movementData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registrada exitosamente');
    });

    it('debe crear una operación de solo venta', async () => {
      const movementData = {
        tipoOperacion: 'Solo Venta',
        moneda: 'USD',
        motivo: 'USDT',
        estadoTransaccion: 'Completada',
        compra: {
          monto: 1000,
          contraparte: 'Cliente Test',
          costo: 1.02,
          usaSaldoActual: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/sheets/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movementData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('debe crear una operación vinculada', async () => {
      const movementData = {
        tipoOperacion: 'Compra y Venta Vinculadas',
        moneda: 'USD',
        motivo: 'Cable',
        estadoTransaccion: 'Completada',
        casoEspecial: false,
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
      };

      const response = await request(app.getHttpServer())
        .post('/sheets/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movementData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('debe crear una liquidación', async () => {
      const movementData = {
        tipoOperacion: 'Compra y Venta Vinculadas',
        moneda: 'USD',
        motivo: 'Liquidación',
        estadoTransaccion: 'Completada',
        casoEspecial: false,
        compra: {
          monto: 5000,
          contraparte: 'Proveedor Liquidación',
          costo: 1.0,
        },
        venta: {
          monto: 5000,
          contraparte: 'Cliente Liquidación',
          costo: 1.0,
          usaSaldoActual: false,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/sheets/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movementData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('debe rechazar operación sin autenticación', async () => {
      const movementData = {
        tipoOperacion: 'Solo Compra',
        moneda: 'USD',
        motivo: 'Cable',
        compra: {
          monto: 1000,
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
      };

      await request(app.getHttpServer())
        .post('/sheets/movements')
        .send(movementData)
        .expect(401);
    });

    it('debe rechazar datos inválidos', async () => {
      const invalidData = {
        tipoOperacion: 'Solo Compra',
        moneda: 'USD',
        motivo: 'Cable',
        compra: {
          monto: -1000, // Monto negativo (inválido)
          contraparte: 'Proveedor Test',
          costo: 1.015,
        },
      };

      await request(app.getHttpServer())
        .post('/sheets/movements')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovementsPage } from '../../../frontend/src/pages/MovementsPage';
import * as sheetsApi from '../../../frontend/src/api/sheets';

// Mock del API
vi.mock('../../../frontend/src/api/sheets', () => ({
  sheetsApi: {
    createMovement: vi.fn(),
  },
}));

describe('MovementsPage - Tests Unitarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el formulario correctamente', () => {
    render(<MovementsPage />);
    
    expect(screen.getByText('Registro de Operaciones')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Operación/i)).toBeInTheDocument();
  });

  it('debe mostrar campos de compra cuando se selecciona Solo Compra', () => {
    render(<MovementsPage />);
    
    const tipoOperacionRadio = screen.getByLabelText('Solo Compra');
    fireEvent.click(tipoOperacionRadio);
    
    expect(screen.getByLabelText(/Proveedor/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Cliente/i)).not.toBeInTheDocument();
  });

  it('debe mostrar campos de venta cuando se selecciona Solo Venta', () => {
    render(<MovementsPage />);
    
    const tipoOperacionRadio = screen.getByLabelText('Solo Venta');
    fireEvent.click(tipoOperacionRadio);
    
    expect(screen.getByLabelText(/Cliente/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Proveedor/i)).not.toBeInTheDocument();
  });

  it('debe mostrar ambos campos en operación vinculada', () => {
    render(<MovementsPage />);
    
    const tipoOperacionRadio = screen.getByLabelText('Compra y Venta Vinculadas');
    fireEvent.click(tipoOperacionRadio);
    
    expect(screen.getByLabelText(/Proveedor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cliente/i)).toBeInTheDocument();
  });

  it('debe auto-seleccionar vinculadas cuando se elige Liquidación', async () => {
    render(<MovementsPage />);
    
    const motivoSelect = screen.getByLabelText(/Motivo/i);
    fireEvent.change(motivoSelect, { target: { value: 'Liquidación' } });
    
    await waitFor(() => {
      const vinculadasRadio = screen.getByLabelText('Compra y Venta Vinculadas') as HTMLInputElement;
      expect(vinculadasRadio.checked).toBe(true);
    });
  });

  it('debe ocultar checkbox de saldo actual en operación vinculada', () => {
    render(<MovementsPage />);
    
    const vinculadasRadio = screen.getByLabelText('Compra y Venta Vinculadas');
    fireEvent.click(vinculadasRadio);
    
    expect(screen.queryByLabelText(/Utiliza Saldo Actual/i)).not.toBeInTheDocument();
  });

  it('debe mostrar campo de motivo personalizado cuando se elige Otro', async () => {
    render(<MovementsPage />);
    
    const motivoSelect = screen.getByLabelText(/Motivo/i);
    fireEvent.change(motivoSelect, { target: { value: 'Otro' } });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ingrese el motivo/i)).toBeInTheDocument();
    });
  });

  it('debe validar campos requeridos antes de enviar', async () => {
    render(<MovementsPage />);
    
    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/obligatorio/i)).toBeInTheDocument();
    });
  });

  it('debe llamar a la API correctamente al enviar formulario válido', async () => {
    const mockCreateMovement = vi.fn().mockResolvedValue({
      data: { success: true, message: 'Operación registrada' },
    });
    vi.spyOn(sheetsApi, 'sheetsApi').mockReturnValue({
      createMovement: mockCreateMovement,
    } as any);

    render(<MovementsPage />);
    
    // Llenar formulario
    fireEvent.click(screen.getByLabelText('Solo Compra'));
    fireEvent.change(screen.getByLabelText(/Monto/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Proveedor/i), { target: { value: 'Test Provider' } });
    fireEvent.change(screen.getByLabelText(/Costo/i), { target: { value: '1.015' } });
    
    const submitButton = screen.getByRole('button', { name: /Registrar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateMovement).toHaveBeenCalled();
    });
  });

  it('debe mostrar mensaje de éxito después de registro exitoso', async () => {
    vi.spyOn(sheetsApi, 'sheetsApi').mockReturnValue({
      createMovement: vi.fn().mockResolvedValue({
        data: { success: true, message: 'Operación registrada' },
      }),
    } as any);

    render(<MovementsPage />);
    
    // Llenar y enviar formulario
    fireEvent.click(screen.getByLabelText('Solo Compra'));
    fireEvent.change(screen.getByLabelText(/Monto/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Proveedor/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Costo/i), { target: { value: '1.015' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/exitosamente/i)).toBeInTheDocument();
    });
  });

  it('debe limpiar formulario después de registro exitoso', async () => {
    vi.spyOn(sheetsApi, 'sheetsApi').mockReturnValue({
      createMovement: vi.fn().mockResolvedValue({
        data: { success: true },
      }),
    } as any);

    render(<MovementsPage />);
    
    const montoInput = screen.getByLabelText(/Monto/i) as HTMLInputElement;
    fireEvent.change(montoInput, { target: { value: '1000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Registrar/i }));
    
    await waitFor(() => {
      expect(montoInput.value).toBe('');
    });
  });
});

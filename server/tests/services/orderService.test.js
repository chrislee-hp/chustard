import { OrderService } from '../../src/services/orderService.js';

describe('OrderService', () => {
  let service;
  let mockOrderRepo, mockOrderItemRepo, mockMenuRepo, mockTableRepo, mockSseService;

  beforeEach(() => {
    mockOrderRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySessionId: jest.fn(),
      updateStatus: jest.fn(),
      softDelete: jest.fn()
    };
    mockOrderItemRepo = {
      create: jest.fn(),
      findByOrderId: jest.fn()
    };
    mockMenuRepo = { findById: jest.fn() };
    mockTableRepo = { findById: jest.fn() };
    mockSseService = { broadcast: jest.fn() };
    service = new OrderService(mockOrderRepo, mockOrderItemRepo, mockMenuRepo, mockTableRepo, mockSseService);
  });

  describe('createOrder', () => {
    it('should create order with items', () => {
      mockTableRepo.findById.mockReturnValue({ id: 'table-001', currentSessionId: 'session-001' });
      mockMenuRepo.findById.mockReturnValue({ id: 'menu-001', nameKo: '불고기', nameEn: 'Bulgogi' });
      mockOrderRepo.create.mockReturnValue({ id: 1, status: 'pending', totalAmount: 30000 });
      mockOrderItemRepo.create.mockReturnValue({});
      mockOrderItemRepo.findByOrderId.mockReturnValue([]);

      const result = service.createOrder('table-001', 'session-001', [
        { menuId: 'menu-001', quantity: 2, price: 15000 }
      ]);

      expect(result.id).toBe(1);
      expect(mockSseService.broadcast).toHaveBeenCalled();
    });

    it('should throw on invalid session', () => {
      mockTableRepo.findById.mockReturnValue({ id: 'table-001', currentSessionId: 'other-session' });

      expect(() => service.createOrder('table-001', 'session-001', [])).toThrow('UNAUTHORIZED');
    });

    it('should throw on invalid quantity', () => {
      mockTableRepo.findById.mockReturnValue({ id: 'table-001', currentSessionId: 'session-001' });
      mockMenuRepo.findById.mockReturnValue({ id: 'menu-001' });

      expect(() => service.createOrder('table-001', 'session-001', [
        { menuId: 'menu-001', quantity: 100, price: 15000 }
      ])).toThrow('VALIDATION_ERROR');
    });
  });

  describe('updateOrderStatus', () => {
    it('should allow pending to preparing', () => {
      mockOrderRepo.findById.mockReturnValue({ id: 1, status: 'pending', tableId: 'table-001' });
      mockOrderRepo.updateStatus.mockReturnValue({ id: 1, status: 'preparing' });

      const result = service.updateOrderStatus(1, 'preparing');
      expect(result.status).toBe('preparing');
    });

    it('should reject invalid transition', () => {
      mockOrderRepo.findById.mockReturnValue({ id: 1, status: 'completed' });

      expect(() => service.updateOrderStatus(1, 'pending')).toThrow('VALIDATION_ERROR');
    });
  });

  describe('deleteOrder', () => {
    it('should soft delete order', () => {
      mockOrderRepo.findById.mockReturnValue({ id: 1, tableId: 'table-001' });

      service.deleteOrder(1);
      expect(mockOrderRepo.softDelete).toHaveBeenCalledWith(1);
      expect(mockSseService.broadcast).toHaveBeenCalled();
    });
  });
});

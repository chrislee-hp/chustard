import { SSEService } from '../../src/services/sseService.js';

describe('SSEService', () => {
  let service;

  beforeEach(() => {
    service = new SSEService();
  });

  describe('subscribe', () => {
    it('should add client to connections', () => {
      const mockRes = { write: jest.fn(), on: jest.fn() };
      service.subscribe('client-001', 'admin', 'store-001', null, mockRes);
      expect(service.connections.size).toBe(1);
    });
  });

  describe('broadcast', () => {
    it('should send event to matching clients', () => {
      const mockRes = { write: jest.fn(), on: jest.fn() };
      service.subscribe('client-001', 'table', null, 'table-001', mockRes);

      service.broadcast('order:created', { orderId: 1 }, { tableId: 'table-001' });

      expect(mockRes.write).toHaveBeenCalled();
    });

    it('should not send to non-matching clients', () => {
      const mockRes = { write: jest.fn(), on: jest.fn() };
      service.subscribe('client-001', 'table', null, 'table-002', mockRes);

      service.broadcast('order:created', { orderId: 1 }, { tableId: 'table-001' });

      expect(mockRes.write).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should remove client from connections', () => {
      const mockRes = { write: jest.fn(), on: jest.fn() };
      service.subscribe('client-001', 'admin', 'store-001', null, mockRes);
      service.unsubscribe('client-001');
      expect(service.connections.size).toBe(0);
    });
  });
});

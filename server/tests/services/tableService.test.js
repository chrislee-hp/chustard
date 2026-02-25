import { TableService } from '../../src/services/tableService.js';

describe('TableService', () => {
  let service;
  let mockTableRepo, mockSessionRepo, mockSseService;

  beforeEach(() => {
    mockTableRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByStoreId: jest.fn(),
      updateSession: jest.fn()
    };
    mockSessionRepo = {
      endSession: jest.fn()
    };
    mockSseService = { broadcast: jest.fn() };
    service = new TableService(mockTableRepo, mockSessionRepo, mockSseService);
  });

  describe('createTable', () => {
    it('should create table with valid PIN', () => {
      mockTableRepo.create.mockReturnValue({ id: 'table-001', tableNumber: 1 });

      const result = service.createTable('store-001', 1, '1234');
      expect(result.tableNumber).toBe(1);
    });

    it('should throw on invalid PIN format', () => {
      expect(() => service.createTable('store-001', 1, '12345')).toThrow('VALIDATION_ERROR');
      expect(() => service.createTable('store-001', 1, 'abcd')).toThrow('VALIDATION_ERROR');
    });
  });

  describe('completeTable', () => {
    it('should end session and reset table', () => {
      mockTableRepo.findById.mockReturnValue({ id: 'table-001', currentSessionId: 'session-001' });

      service.completeTable('table-001');

      expect(mockSessionRepo.endSession).toHaveBeenCalledWith('session-001');
      expect(mockTableRepo.updateSession).toHaveBeenCalledWith('table-001', null, 'inactive');
      expect(mockSseService.broadcast).toHaveBeenCalled();
    });

    it('should do nothing if no active session', () => {
      mockTableRepo.findById.mockReturnValue({ id: 'table-001', currentSessionId: null });

      service.completeTable('table-001');

      expect(mockSessionRepo.endSession).not.toHaveBeenCalled();
    });
  });

  describe('getTables', () => {
    it('should return all tables for store', () => {
      mockTableRepo.findByStoreId.mockReturnValue([{ id: 'table-001' }, { id: 'table-002' }]);

      const result = service.getTables('store-001');
      expect(result).toHaveLength(2);
    });
  });
});

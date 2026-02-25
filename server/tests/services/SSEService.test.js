const SSEService = require('../../src/sse/SSEService');

describe('SSEService', () => {
  let service;

  beforeEach(() => { service = new SSEService(); });

  test('TC-S-025: addClient/removeClient - 클라이언트 등록/해제', () => {
    const mockRes = { write: jest.fn(), on: jest.fn() };
    service.addClient('c1', 'admin', 'store1', mockRes);
    expect(service.clients.size).toBe(1);
    service.removeClient('c1');
    expect(service.clients.size).toBe(0);
  });

  test('TC-S-026: broadcast - admin은 매장 전체, customer는 테이블만', () => {
    const adminRes = { write: jest.fn(), on: jest.fn() };
    const custRes1 = { write: jest.fn(), on: jest.fn() };
    const custRes2 = { write: jest.fn(), on: jest.fn() };
    service.addClient('a1', 'admin', 'store1', adminRes);
    service.addClient('c1', 'table', 'table1', custRes1);
    service.addClient('c2', 'table', 'table2', custRes2);

    service.broadcast('order:created', { test: true }, 'store1', 'table1');

    expect(adminRes.write).toHaveBeenCalled();
    expect(custRes1.write).toHaveBeenCalled();
    expect(custRes2.write).not.toHaveBeenCalled();
  });
});

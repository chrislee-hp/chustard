import { v4 as uuidv4 } from 'uuid';

export class TableService {
  constructor(tableRepo, sessionRepo, sseService) {
    this.tableRepo = tableRepo;
    this.sessionRepo = sessionRepo;
    this.sseService = sseService;
  }

  createTable(storeId, tableNumber, password) {
    if (!/^\d{4}$/.test(password)) throw new Error('VALIDATION_ERROR');
    return this.tableRepo.create({ id: uuidv4(), storeId, tableNumber, password });
  }

  getTables(storeId) {
    return this.tableRepo.findByStoreId(storeId);
  }

  completeTable(tableId) {
    const table = this.tableRepo.findById(tableId);
    if (!table) throw new Error('NOT_FOUND');
    if (!table.currentSessionId) return;

    this.sessionRepo.endSession(table.currentSessionId);
    this.tableRepo.updateSession(tableId, null, 'inactive');
    this.sseService.broadcast('table:completed', { tableId }, { tableId });
  }
}

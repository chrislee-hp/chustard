export class SSEService {
  constructor() {
    this.connections = new Map();
  }

  subscribe(clientId, role, storeId, tableId, res) {
    this.connections.set(clientId, { role, storeId, tableId, res });
    res.on('close', () => this.unsubscribe(clientId));
  }

  unsubscribe(clientId) {
    this.connections.delete(clientId);
  }

  broadcast(eventType, data, scope) {
    this.connections.forEach((client) => {
      const match = scope.storeId
        ? client.storeId === scope.storeId
        : client.tableId === scope.tableId;

      if (match) {
        client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    });
  }
}

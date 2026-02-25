export class SSEService {
  constructor() {
    this.connections = new Map();
  }

  subscribe(clientId, role, storeId, tableId, res) {
    const keepAlive = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        this.unsubscribe(clientId);
      }
    }, 30000);
    
    this.connections.set(clientId, { role, storeId, tableId, res, keepAlive });
    res.on('close', () => this.unsubscribe(clientId));
  }

  unsubscribe(clientId) {
    const conn = this.connections.get(clientId);
    if (conn?.keepAlive) clearInterval(conn.keepAlive);
    this.connections.delete(clientId);
  }

  broadcast(eventType, data, scope) {
    this.connections.forEach((client) => {
      const match = (scope.tableId && client.tableId === scope.tableId) ||
                    (scope.storeId && client.storeId === scope.storeId);

      if (match) {
        client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
      }
    });
  }
}

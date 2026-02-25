class SSEService {
  constructor() { this.clients = new Map(); }

  addClient(clientId, type, filterId, res) {
    this.clients.set(clientId, { type, filterId, res });
    res.on('close', () => this.removeClient(clientId));
  }

  removeClient(clientId) { this.clients.delete(clientId); }

  broadcast(event, data, storeId, tableId) {
    const payload = `data: ${JSON.stringify({ type: event, ...data })}\n\n`;
    for (const [, client] of this.clients) {
      if (client.type === 'admin' && client.filterId === storeId) client.res.write(payload);
      else if (client.type === 'table' && client.filterId === tableId) client.res.write(payload);
    }
  }
}
module.exports = SSEService;

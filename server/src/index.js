const { createApp } = require('./app');
const { getDb } = require('./db');

const db = getDb();
const app = createApp(db);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

process.on('SIGINT', () => { db.close(); process.exit(); });

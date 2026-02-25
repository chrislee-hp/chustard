import { initDb, seedDb } from './database.js';

console.log('Initializing database...');
initDb();
console.log('Seeding database...');
seedDb();
console.log('Database initialized successfully.');

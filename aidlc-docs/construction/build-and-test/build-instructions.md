# Build Instructions

## Prerequisites
- **Node.js**: v18+
- **npm**: v9+

## Build Steps

### 1. Install Dependencies
```bash
# API Server
cd server && npm install

# Customer SPA
cd client/customer && npm install

# Admin SPA
cd client/admin && npm install
```

### 2. Build Frontend SPAs
```bash
# Customer SPA
cd client/customer && npx vite build

# Admin SPA
cd client/admin && npx vite build
```

### 3. Start API Server
```bash
cd server && node src/index.js
# Runs on http://localhost:3000
```

### 4. Build Artifacts
- `client/customer/dist/` - Customer SPA static files
- `client/admin/dist/` - Admin SPA static files
- `server/` - Node.js runtime (no build step)

## Troubleshooting

### SQLite Native Module Error
```bash
cd server && npm rebuild better-sqlite3
```

### Port Already in Use
```bash
lsof -i :3000 && kill -9 <PID>
```

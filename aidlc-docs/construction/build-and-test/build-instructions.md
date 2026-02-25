# Build Instructions - admin-web

## Prerequisites

### Build Tools
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Dependencies
All dependencies are listed in `client/admin/package.json`:
- React 18.2.0
- Redux Toolkit 2.0.0
- React Router DOM 6.20.0
- TypeScript 5.3.0
- Jest 29.7.0
- React Testing Library 14.1.0

### Environment Variables
None required for local development build.

### System Requirements
- **OS**: macOS, Linux, or Windows
- **Memory**: 2GB minimum
- **Disk Space**: 500MB for node_modules

---

## Build Steps

### 1. Install Dependencies

```bash
cd client/admin
npm install
```

**Expected Output**:
```
added 1234 packages in 30s
```

**Note**: First install may take 1-2 minutes depending on network speed.

---

### 2. Configure Environment

No environment configuration needed for local development.

For production builds, create `.env.production`:
```bash
VITE_API_URL=https://api.example.com
```

---

### 3. Build Application

```bash
npm run build
```

**Expected Output**:
```
vite v5.0.0 building for production...
✓ 45 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-abc123.js     150.23 kB │ gzip: 48.12 kB
✓ built in 2.34s
```

**Build Artifacts**:
- `client/admin/dist/` - Production build output
- `client/admin/dist/index.html` - Entry HTML file
- `client/admin/dist/assets/` - Bundled JS/CSS files

---

### 4. Verify Build Success

**Check build artifacts exist**:
```bash
ls -lh client/admin/dist/
```

**Expected files**:
- `index.html`
- `assets/index-[hash].js`
- `assets/index-[hash].css` (if CSS exists)

**Common Warnings** (acceptable):
- "Some chunks are larger than 500 kB" - Normal for React apps
- "Use of eval is strongly discouraged" - From source maps in dev mode

---

## Development Server

For local development without building:

```bash
npm run dev
```

**Expected Output**:
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Access the app at `http://localhost:5173/`

---

## Troubleshooting

### Build Fails with "Cannot find module"

**Cause**: Dependencies not installed or corrupted node_modules

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Build Fails with TypeScript Errors

**Cause**: Type errors in source code

**Solution**:
1. Check error messages for file and line number
2. Fix type errors in source files
3. Run `npm run build` again

**Common fixes**:
- Add missing type imports
- Fix incorrect prop types
- Add null checks for optional properties

---

### Build Fails with "Out of Memory"

**Cause**: Insufficient memory for build process

**Solution**:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

### Build Succeeds but App Doesn't Load

**Cause**: Incorrect base path or API URL

**Solution**:
1. Check browser console for errors
2. Verify `vite.config.ts` base path setting
3. Check API URL in environment variables

---

## Build Verification Checklist

- [ ] Dependencies installed successfully
- [ ] TypeScript compilation passes
- [ ] Build completes without errors
- [ ] `dist/` directory created
- [ ] `index.html` exists in dist/
- [ ] JS bundle files exist in dist/assets/
- [ ] File sizes are reasonable (< 1MB for main bundle)
- [ ] No critical warnings in build output

---

## Next Steps

After successful build:
1. Run unit tests (see `unit-test-instructions.md`)
2. Run integration tests (see `integration-test-instructions.md`)
3. Deploy to staging environment (if applicable)

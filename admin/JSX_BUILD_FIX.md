# JSX build fix

The admin previously stored JSX in `src/App.js`. Vite dependency scanning parsed `.js` as plain JavaScript before the React plugin transform, causing:

`The JSX syntax extension is not currently enabled`

Fixes applied:

- Renamed `src/App.js` to `src/App.jsx`
- Updated `src/main.jsx` to import `./App.jsx`
- Updated `scripts/check-source.mjs`
- Simplified `vite.config.js` to use the standard `react()` plugin configuration

After replacing the files, clear Vite's cache and restart:

```bash
rm -rf node_modules/.vite
npm run dev
```

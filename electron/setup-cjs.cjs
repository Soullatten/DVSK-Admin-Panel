const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist-electron');
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2) + '\n'
);
console.log('[setup-cjs] dist-electron/package.json written.');

/**
 * Renders the DVSK SVG to two formats electron-builder uses:
 *   - build/icon.png  (512x512) — used by the in-app window icon
 *   - build/icon.ico  (multi-size: 16, 24, 32, 48, 64, 128, 256) — used by the
 *     Windows installer, Start Menu, taskbar, and uninstaller
 *
 * Both regenerate every build via the `electron:icon` npm script.
 */
const sharp = require('sharp');
const pngToIcoMod = require('png-to-ico');
const pngToIco = pngToIcoMod.default || pngToIcoMod;
const fs = require('fs');
const path = require('path');

const svgPath = path.resolve(__dirname, 'Secondary_logo.svg');
const pngPath = path.resolve(__dirname, 'icon.png');
const icoPath = path.resolve(__dirname, 'icon.ico');

if (!fs.existsSync(svgPath)) {
  console.error('[icon] SVG not found at', svgPath);
  process.exit(1);
}

const svgBuffer = fs.readFileSync(svgPath);
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

(async () => {
  try {
    // 1. Render the master 512x512 PNG (window icon, fallback)
    const pngInfo = await sharp(svgBuffer, { density: 384 })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath);
    console.log('[icon] icon.png —', pngInfo.width + 'x' + pngInfo.height, '(', pngInfo.size, 'bytes )');

    // 2. Render every ICO size as a separate PNG buffer (transparent background)
    const pngBuffers = await Promise.all(
      ICO_SIZES.map((size) =>
        sharp(svgBuffer, { density: 384 })
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer()
      )
    );

    // 3. Pack all sizes into a single ICO file
    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('[icon] icon.ico — sizes:', ICO_SIZES.join(', '), '(', icoBuffer.length, 'bytes )');
  } catch (err) {
    console.error('[icon] failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();

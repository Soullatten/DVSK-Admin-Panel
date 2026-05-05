/**
 * Generates themed BMPs for the NSIS installer wizard:
 *   - installerSidebar.bmp  (164x314) — left strip on Welcome / Finish pages
 *   - installerHeader.bmp   (150x57)  — small banner at top of inner pages
 *
 * Both match the dark luxury DVSK theme (obsidian + indigo + purple glow).
 * BMP is required because NSIS does not accept PNG natively — sharp renders
 * the composition, then bmp-js encodes the raw pixels into a BMP file.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const bmp = require('bmp-js');

const buildDir = __dirname;
const svgPath = path.join(buildDir, 'Secondary_logo.svg');

if (!fs.existsSync(svgPath)) {
  console.error('[installer-art] SVG not found at', svgPath);
  process.exit(1);
}

const svgBuffer = fs.readFileSync(svgPath);

async function makeSidebar() {
  const W = 164;
  const H = 314;
  const bgSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stop-color="#0A0914"/>
          <stop offset="55%" stop-color="#1B0F2E"/>
          <stop offset="100%" stop-color="#0A0914"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stop-color="#6D28D9" stop-opacity="0.45"/>
          <stop offset="60%" stop-color="#4F46E5" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#0A0914" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#glow)"/>
      <text x="${W / 2}" y="${H - 28}" fill="#ffffff" fill-opacity="0.85"
            font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700"
            text-anchor="middle" letter-spacing="3">DVSK</text>
      <text x="${W / 2}" y="${H - 12}" fill="#ffffff" fill-opacity="0.35"
            font-family="Arial, Helvetica, sans-serif" font-size="8" font-weight="600"
            text-anchor="middle" letter-spacing="3">ADMIN</text>
    </svg>`;

  const logoSize = 96;
  const logoPng = await sharp(svgBuffer, { density: 384 })
    .resize(logoSize, logoSize, { fit: 'contain' })
    .png()
    .toBuffer();

  const composed = await sharp(Buffer.from(bgSvg))
    .composite([{ input: logoPng, gravity: 'north', top: 70, left: Math.round((W - logoSize) / 2) }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  writeBmp(path.join(buildDir, 'installerSidebar.bmp'), composed.data, composed.info.width, composed.info.height);
  // Reuse the same art for the uninstaller — keeps the brand consistent both ways.
  fs.copyFileSync(path.join(buildDir, 'installerSidebar.bmp'), path.join(buildDir, 'uninstallerSidebar.bmp'));
}

async function makeHeader() {
  const W = 150;
  const H = 57;
  const bgSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0A0914"/>
          <stop offset="100%" stop-color="#1B0F2E"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="${W - 8}" y="22" fill="#ffffff" fill-opacity="0.92"
            font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700"
            text-anchor="end" letter-spacing="2">DVSK</text>
      <text x="${W - 8}" y="40" fill="#a78bfa" fill-opacity="0.85"
            font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="600"
            text-anchor="end" letter-spacing="3">ADMIN</text>
    </svg>`;

  const logoSize = 38;
  const logoPng = await sharp(svgBuffer, { density: 384 })
    .resize(logoSize, logoSize, { fit: 'contain' })
    .png()
    .toBuffer();

  const composed = await sharp(Buffer.from(bgSvg))
    .composite([{ input: logoPng, gravity: 'west', left: 12, top: Math.round((H - logoSize) / 2) }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  writeBmp(path.join(buildDir, 'installerHeader.bmp'), composed.data, composed.info.width, composed.info.height);
  fs.copyFileSync(path.join(buildDir, 'installerHeader.bmp'), path.join(buildDir, 'uninstallerHeader.bmp'));
}

// Convert raw RGBA from sharp into the ABGR layout bmp-js expects, then encode.
function writeBmp(outPath, rgba, width, height) {
  const total = width * height;
  const abgr = Buffer.alloc(total * 4);
  for (let i = 0; i < total; i++) {
    abgr[i * 4 + 0] = 0xff;             // A
    abgr[i * 4 + 1] = rgba[i * 4 + 2];  // B
    abgr[i * 4 + 2] = rgba[i * 4 + 1];  // G
    abgr[i * 4 + 3] = rgba[i * 4 + 0];  // R
  }
  const encoded = bmp.encode({ data: abgr, width, height });
  fs.writeFileSync(outPath, encoded.data);
  console.log('[installer-art] wrote', path.basename(outPath), '(' + width + 'x' + height + ')');
}

(async () => {
  try {
    await makeSidebar();
    await makeHeader();
    console.log('[installer-art] done.');
  } catch (err) {
    console.error('[installer-art] failed:', err);
    process.exit(1);
  }
})();

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#2c3e50"/>
  <g transform="translate(32, 32)">
    <!-- Checkerboard pattern -->
    <rect x="0" y="0" width="112" height="112" fill="#b58863"/>
    <rect x="112" y="0" width="112" height="112" fill="#f0d9b5"/>
    <rect x="224" y="0" width="112" height="112" fill="#b58863"/>
    <rect x="336" y="0" width="112" height="112" fill="#f0d9b5"/>
    
    <rect x="0" y="112" width="112" height="112" fill="#f0d9b5"/>
    <rect x="112" y="112" width="112" height="112" fill="#b58863"/>
    <rect x="224" y="112" width="112" height="112" fill="#f0d9b5"/>
    <rect x="336" y="112" width="112" height="112" fill="#b58863"/>
    
    <rect x="0" y="224" width="112" height="112" fill="#b58863"/>
    <rect x="112" y="224" width="112" height="112" fill="#f0d9b5"/>
    <rect x="224" y="224" width="112" height="112" fill="#b58863"/>
    <rect x="336" y="224" width="112" height="112" fill="#f0d9b5"/>
    
    <rect x="0" y="336" width="112" height="112" fill="#f0d9b5"/>
    <rect x="112" y="336" width="112" height="112" fill="#b58863"/>
    <rect x="224" y="336" width="112" height="112" fill="#f0d9b5"/>
    <rect x="336" y="336" width="112" height="112" fill="#b58863"/>
    
    <!-- Red piece -->
    <circle cx="168" cy="168" r="40" fill="#dc3545" stroke="#a52a2a" stroke-width="4"/>
    
    <!-- Black piece -->
    <circle cx="280" cy="280" r="40" fill="#333" stroke="#111" stroke-width="4"/>
  </g>
</svg>`;

async function generateIcons() {
  const publicDir = join(__dirname, 'public');
  
  // Generate 192x192 PNG
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'pwa-192x192.png'));
  
  // Generate 512x512 PNG
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'pwa-512x512.png'));
  
  // Generate Apple touch icon (180x180)
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  
  // Generate favicon (32x32)
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);

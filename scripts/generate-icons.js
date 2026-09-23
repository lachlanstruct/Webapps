import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  // getPixel(x, y) returns [r, g, b, a]
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const toCrc = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const c = crc32(toCrc);
  chunk.writeUInt32BE(c, 8 + len);
  return chunk;
}

function renderIcon(size, isMaskable = false) {
  return createPNG(size, size, (x, y) => {
    const nx = x / size;
    const ny = y / size;

    // Background: Dark Slate #0f172a
    let r = 15, g = 23, b = 42, a = 255;

    // Subtle gradient to #1e293b at bottom
    g += Math.floor(ny * 18);
    b += Math.floor(ny * 17);

    // Padding bounds
    const pad = isMaskable ? 0.15 : 0.08;
    const effW = 1 - 2 * pad;
    const effH = 1 - 2 * pad;

    // Footing coordinates: bottom center
    const fLeft = pad + effW * 0.18;
    const fRight = pad + effW * 0.82;
    const fTop = pad + effH * 0.65;
    const fBottom = pad + effH * 0.88;

    // Wall coordinates: vertical stem
    const wLeft = pad + effW * 0.44;
    const wRight = pad + effW * 0.56;
    const wTop = pad + effH * 0.15;
    const wBottom = fTop;

    // Check Wall
    if (nx >= wLeft && nx <= wRight && ny >= wTop && ny <= wBottom) {
      // Wall cyan/blue #0284c7 to #38bdf8
      return [56, 189, 248, 255];
    }

    // Check Footing
    if (nx >= fLeft && nx <= fRight && ny >= fTop && ny <= fBottom) {
      // Footing slate #64748b
      return [148, 163, 184, 255];
    }

    // Overturning Toe Marker (bottom right of footing)
    const toeX = fRight;
    const toeY = fBottom;
    const dToe = Math.hypot(nx - toeX, ny - toeY);
    if (dToe < 0.04) {
      return [244, 63, 94, 255]; // Rose-500
    }

    // Wind arrows (left side)
    const arrowLevels = [pad + effH * 0.25, pad + effH * 0.40, pad + effH * 0.55];
    for (const al of arrowLevels) {
      if (Math.abs(ny - al) < 0.012 && nx >= pad + effW * 0.08 && nx <= wLeft - 0.03) {
        return [56, 189, 248, 255];
      }
    }

    return [r, g, b, a];
  });
}

// Generate files in public/
fs.writeFileSync('public/pwa-192x192.png', renderIcon(192));
fs.writeFileSync('public/pwa-512x512.png', renderIcon(512));
fs.writeFileSync('public/pwa-maskable-512x512.png', renderIcon(512, true));
fs.writeFileSync('public/apple-touch-icon.png', renderIcon(180));
fs.writeFileSync('public/favicon.ico', renderIcon(32));
console.log('Icons generated successfully!');

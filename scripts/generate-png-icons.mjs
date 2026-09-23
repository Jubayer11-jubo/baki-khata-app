import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, r = 37, g = 99, b = 235) {
  // Simple uncompressed or deflate PNG generator
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data: filter byte 0 per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.44;
  const innerR = radius * 0.7;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Card-like shape in center
      const isInCard = Math.abs(dx) < width * 0.32 && Math.abs(dy) < height * 0.36;
      const isRedSpine = isInCard && dx < -width * 0.18;
      const isCenterCircle = dist < innerR * 0.55;

      if (dist > radius) {
        // Outside rounded corners: soften or primary blue
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      } else if (isCenterCircle) {
        // Center white circle for Taka symbol
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
        rawData[pxOffset + 3] = 255;
      } else if (isRedSpine) {
        // Red spine
        rawData[pxOffset] = 220;
        rawData[pxOffset + 1] = 38;
        rawData[pxOffset + 2] = 38;
        rawData[pxOffset + 3] = 255;
      } else if (isInCard) {
        // White ledger card
        rawData[pxOffset] = 248;
        rawData[pxOffset + 1] = 250;
        rawData[pxOffset + 2] = 252;
        rawData[pxOffset + 3] = 255;
      } else {
        // Vibrant royal blue background
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcData = chunk.subarray(4, 8 + len);
  const crc = crc32(crcData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Generate assets
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));
fs.writeFileSync('public/favicon.ico', createPNG(64, 64));

console.log('PNG PWA assets generated successfully!');

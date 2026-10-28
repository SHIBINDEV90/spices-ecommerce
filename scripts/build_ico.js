const fs = require('fs');
const path = require('path');

function createIco(pngBuffers, outputPath) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  const imageBuffers = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color palette (0 for no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // image size in bytes
    entry.writeUInt32LE(offset, 12); // image offset

    entries.push(entry);
    imageBuffers.push(item.buffer);
    offset += item.buffer.length;
  }

  const finalIcoBuffer = Buffer.concat([header, ...entries, ...imageBuffers]);
  fs.writeFileSync(outputPath, finalIcoBuffer);
  console.log(`Generated ${outputPath} (${finalIcoBuffer.length} bytes)`);
}

module.exports = { createIco };

if (require.main === module) {
  const baseDir = path.resolve(__dirname, '../public');
  const sizes = [16, 32, 48];
  const pngs = sizes.map(s => {
    const file = path.join(baseDir, `favicon-${s}x${s}.png`);
    return {
      width: s,
      height: s,
      buffer: fs.readFileSync(file)
    };
  });

  const appIcoPath = path.resolve(__dirname, '../src/app/favicon.ico');
  createIco(pngs, appIcoPath);
  console.log(`Generated Next.js app favicon at ${appIcoPath}`);
}

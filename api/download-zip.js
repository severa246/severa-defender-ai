/**
 * Serverless ZIP Exporter for Severa Defender AI
 * Serves PKZIP 2.0 archives with real HTTP Content-Disposition headers.
 * Guarantees that Chrome, Edge, Safari, and download managers
 * save the file with the exact folder name and .zip extension without UUID fallbacks.
 */

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let c = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xFF];
  }
  return (c ^ (-1)) >>> 0;
}

function createZipBuffer(files = []) {
  const enc = new TextEncoder();
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  const fileEntries = files.map((f) => {
    const rawPath = f.path || f.name || 'file.txt';
    const cleanPath = rawPath.replace(/^[/\\]+/, '');
    const nameBytes = enc.encode(cleanPath);
    const content = f.code !== undefined ? f.code : (f.content !== undefined ? f.content : '');
    const contentBytes = typeof content === 'string' ? enc.encode(content) : content;
    const crc = crc32(contentBytes);
    return {
      nameBytes,
      contentBytes,
      crc,
      size: contentBytes.length
    };
  });

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of fileEntries) {
    const localHeader = new Uint8Array(30 + entry.nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, dosTime, true);
    view.setUint16(12, dosDate, true);
    view.setUint32(14, entry.crc, true);
    view.setUint32(18, entry.size, true);
    view.setUint32(22, entry.size, true);
    view.setUint16(26, entry.nameBytes.length, true);
    view.setUint16(28, 0, true);
    localHeader.set(entry.nameBytes, 30);

    localParts.push(localHeader, entry.contentBytes);

    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const cView = new DataView(centralHeader.buffer);
    cView.setUint32(0, 0x02014b50, true);
    cView.setUint16(4, 20, true);
    cView.setUint16(6, 20, true);
    cView.setUint16(8, 0, true);
    cView.setUint16(10, 0, true);
    cView.setUint16(12, dosTime, true);
    cView.setUint16(14, dosDate, true);
    cView.setUint32(16, entry.crc, true);
    cView.setUint32(20, entry.size, true);
    cView.setUint32(24, entry.size, true);
    cView.setUint16(28, entry.nameBytes.length, true);
    cView.setUint16(30, 0, true);
    cView.setUint16(32, 0, true);
    cView.setUint16(34, 0, true);
    cView.setUint16(36, 0, true);
    cView.setUint32(38, 0x81a40000, true);
    cView.setUint32(42, offset, true);
    centralHeader.set(entry.nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + entry.contentBytes.length;
  }

  const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);
  const eocd = new Uint8Array(22);
  const eView = new DataView(eocd.buffer);
  eView.setUint32(0, 0x06054b50, true);
  eView.setUint16(4, 0, true);
  eView.setUint16(6, 0, true);
  eView.setUint16(8, fileEntries.length, true);
  eView.setUint16(10, fileEntries.length, true);
  eView.setUint32(12, centralSize, true);
  eView.setUint32(16, offset, true);
  eView.setUint16(20, 0, true);

  const totalLength = offset + centralSize + 22;
  const out = new Uint8Array(totalLength);
  let p = 0;
  for (const part of [...localParts, ...centralParts, eocd]) {
    out.set(part, p);
    p += part.length;
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        const parsed = new URLSearchParams(body);
        body = {
          folderName: parsed.get('folderName'),
          files: parsed.get('files')
        };
      }
    }

    const folderName = (body?.folderName || req.query?.folderName || 'workspace').trim();
    const cleanName = folderName.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'workspace';
    const fileName = `${cleanName}.zip`;

    let files = body?.files || [];
    if (typeof files === 'string') {
      try {
        files = JSON.parse(files);
      } catch {
        files = [];
      }
    }

    const zipBytes = createZipBuffer(Array.isArray(files) ? files : []);
    const buffer = Buffer.from(zipBytes);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    return res.status(200).send(buffer);
  } catch (err) {
    console.error('ZIP export error:', err);
    return res.status(500).json({ error: 'Failed to generate zip file', details: err.message });
  }
}

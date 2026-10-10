/**
 * Lightweight Zero-Dependency PKZIP Exporter
 * Generates standard PKZIP 2.0 archives directly in the browser for fixed working directories.
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

export function createZipBuffer(files = []) {
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
    // Local File Header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + entry.nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true); // Local header signature
    view.setUint16(4, 20, true);         // Version needed: 2.0
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression method: 0 (Stored)
    view.setUint16(10, dosTime, true);   // Modification time
    view.setUint16(12, dosDate, true);   // Modification date
    view.setUint32(14, entry.crc, true); // CRC-32
    view.setUint32(18, entry.size, true);// Compressed size
    view.setUint32(22, entry.size, true);// Uncompressed size
    view.setUint16(26, entry.nameBytes.length, true); // File name length
    view.setUint16(28, 0, true);         // Extra field length
    localHeader.set(entry.nameBytes, 30);

    localParts.push(localHeader, entry.contentBytes);

    // Central Directory File Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const cView = new DataView(centralHeader.buffer);
    cView.setUint32(0, 0x02014b50, true); // Central directory file header signature
    cView.setUint16(4, 20, true);         // Version made by: 2.0
    cView.setUint16(6, 20, true);         // Version needed to extract: 2.0
    cView.setUint16(8, 0, true);          // Bit flag
    cView.setUint16(10, 0, true);         // Compression: Stored
    cView.setUint16(12, dosTime, true);   // Time
    cView.setUint16(14, dosDate, true);   // Date
    cView.setUint32(16, entry.crc, true); // CRC-32
    cView.setUint32(20, entry.size, true);// Comp size
    cView.setUint32(24, entry.size, true);// Uncomp size
    cView.setUint16(28, entry.nameBytes.length, true); // File name length
    cView.setUint16(30, 0, true);         // Extra field length
    cView.setUint16(32, 0, true);         // Comment length
    cView.setUint16(34, 0, true);         // Disk number start
    cView.setUint16(36, 0, true);         // Internal attributes
    cView.setUint32(38, 0x81a40000, true);// External attributes (regular unix file 0644)
    cView.setUint32(42, offset, true);    // Offset of local header
    centralHeader.set(entry.nameBytes, 46);

    centralParts.push(centralHeader);

    offset += localHeader.length + entry.contentBytes.length;
  }

  const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eView = new DataView(eocd.buffer);
  eView.setUint32(0, 0x06054b50, true);  // EOCD signature
  eView.setUint16(4, 0, true);          // Disk number
  eView.setUint16(6, 0, true);          // Start disk
  eView.setUint16(8, fileEntries.length, true);  // Entries on this disk
  eView.setUint16(10, fileEntries.length, true); // Total entries
  eView.setUint32(12, centralSize, true);        // Central directory size
  eView.setUint32(16, offset, true);             // Central directory offset
  eView.setUint16(20, 0, true);                  // Comment length

  const totalLength = offset + centralSize + 22;
  const out = new Uint8Array(totalLength);
  let p = 0;
  for (const part of [...localParts, ...centralParts, eocd]) {
    out.set(part, p);
    p += part.length;
  }
  return out;
}

function uint8ArrayToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 16384;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export function downloadProjectZip(projectName = 'workspace', files = []) {
  if (!files || files.length === 0) return;

  // Use exact current folder name with .zip extension
  const rawName = (projectName || 'workspace').trim();
  const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'workspace';
  const fileName = `${cleanName}.zip`;

  const zipBytes = createZipBuffer(files);

  // Strategy 1: Data URI for archives (< 15MB)
  // Data URIs do not have a blob UUID in the URL path.
  // Chrome and all Chromium browsers are forced to use the `download="${fileName}"` attribute!
  if (zipBytes.length < 15 * 1024 * 1024) {
    try {
      const base64 = uint8ArrayToBase64(zipBytes);
      const dataUri = `data:application/zip;base64,${base64}`;

      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      link.setAttribute('download', fileName);
      link.style.position = 'fixed';
      link.style.left = '-9999px';
      link.style.top = '-9999px';
      link.style.opacity = '0';
      document.body.appendChild(link);
      
      link.click();

      setTimeout(() => {
        try {
          if (link.parentNode) document.body.removeChild(link);
        } catch {}
      }, 5000);
      return;
    } catch (e) {
      console.warn('Data URI export fallback to Blob/File:', e);
    }
  }

  // Strategy 2: Blob/File Object Fallback for very large archives
  let blob;
  try {
    blob = new File([zipBytes], fileName, { type: 'application/zip' });
  } catch {
    blob = new Blob([zipBytes], { type: 'application/octet-stream' });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.setAttribute('download', fileName);
  link.style.position = 'fixed';
  link.style.left = '-9999px';
  link.style.top = '-9999px';
  link.style.opacity = '0';
  document.body.appendChild(link);
  
  link.click();

  // Generous 60-second window before revoking to prevent browser from reverting to UUID
  setTimeout(() => {
    try {
      if (link.parentNode) document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 60000);
}

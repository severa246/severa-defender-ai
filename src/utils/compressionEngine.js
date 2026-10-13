// Severa AI Security Platform - High-Performance Compression & Decompression Engine
// Powered by browser-native CompressionStream ('gzip') with zero loss and bit-for-bit fidelity.

/**
 * Compresses any arbitrary string or JavaScript object using Gzip.
 * Returns Base64-encoded string, byte statistics, and compression savings percentage.
 */
export async function compressData(data) {
  if (data === null || data === undefined) return null;
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const enc = new TextEncoder();
  const rawBytes = enc.encode(jsonStr);

  // Fallback for environments lacking CompressionStream (e.g., very old browsers)
  if (typeof CompressionStream === 'undefined') {
    return {
      compressedBase64: btoa(unescape(encodeURIComponent(jsonStr))),
      originalBytes: rawBytes.length,
      compressedBytes: rawBytes.length,
      ratio: 0,
      isCompressed: false
    };
  }

  try {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(rawBytes);
    writer.close();

    const compressedBuffer = await new Response(cs.readable).arrayBuffer();
    const bytes = new Uint8Array(compressedBuffer);

    // Efficient chunked base64 conversion (avoids call stack overflow on large buffers)
    let binary = '';
    const chunkSize = 16384;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk);
    }
    const compressedBase64 = btoa(binary);

    const originalBytes = rawBytes.length;
    const compressedBytes = compressedBuffer.byteLength;
    const ratio = originalBytes > 0 
      ? Math.max(0, Math.min(99.9, ((1 - (compressedBytes / originalBytes)) * 100))) 
      : 0;

    return {
      compressedBase64,
      originalBytes,
      compressedBytes,
      ratio: Number(ratio.toFixed(1)),
      isCompressed: true
    };
  } catch (err) {
    console.warn('CompressionStream failed, using raw fallback:', err);
    return {
      compressedBase64: btoa(unescape(encodeURIComponent(jsonStr))),
      originalBytes: rawBytes.length,
      compressedBytes: rawBytes.length,
      ratio: 0,
      isCompressed: false
    };
  }
}

/**
 * Decompresses a Base64-encoded Gzip payload back into its original JavaScript object or string.
 */
export async function decompressData(base64Payload, isJson = true) {
  if (!base64Payload || typeof base64Payload !== 'string') return null;

  try {
    const binary = atob(base64Payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Check if this is a Gzip stream (Gzip magic header: 0x1F, 0x8B)
    const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;

    if (isGzip && typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      writer.write(bytes);
      writer.close();

      const decompressedText = await new Response(ds.readable).text();
      return isJson ? JSON.parse(decompressedText) : decompressedText;
    }

    // Non-gzip Base64 fallback
    const rawText = decodeURIComponent(escape(binary));
    return isJson ? JSON.parse(rawText) : rawText;
  } catch (err) {
    console.warn('Decompression failed:', err);
    return null;
  }
}

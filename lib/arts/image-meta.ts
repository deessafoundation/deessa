// Dependency-free image sniffing for artwork uploads.
// Reads the real file signature (not the browser-supplied MIME type) and the
// pixel dimensions straight from the JPEG / PNG / WebP headers, so the server
// can reject spoofed or unusable files without pulling in sharp.

export type SniffedImage = {
  mime: "image/jpeg" | "image/png" | "image/webp"
  ext: "jpg" | "png" | "webp"
  width: number
  height: number
}

function readJpeg(b: Uint8Array): { width: number; height: number } | null {
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++
      continue
    }
    const marker = b[i + 1]
    // Standalone markers without a length field
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2
      continue
    }
    const length = (b[i + 2] << 8) | b[i + 3]
    // SOF0..SOF15, excluding DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (b[i + 5] << 8) | b[i + 6]
      const width = (b[i + 7] << 8) | b[i + 8]
      return { width, height }
    }
    if (length < 2) return null
    i += 2 + length
  }
  return null
}

function readPng(b: Uint8Array): { width: number; height: number } | null {
  if (b.length < 24) return null
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

function readWebp(b: Uint8Array): { width: number; height: number } | null {
  if (b.length < 30) return null
  const chunk = String.fromCharCode(b[12], b[13], b[14], b[15])
  if (chunk === "VP8X") {
    const width = 1 + (b[24] | (b[25] << 8) | (b[26] << 16))
    const height = 1 + (b[27] | (b[28] << 8) | (b[29] << 16))
    return { width, height }
  }
  if (chunk === "VP8 ") {
    const width = (b[26] | (b[27] << 8)) & 0x3fff
    const height = (b[28] | (b[29] << 8)) & 0x3fff
    return { width, height }
  }
  if (chunk === "VP8L") {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  return null
}

export function sniffImage(bytes: Uint8Array): SniffedImage | null {
  const b = bytes
  if (b.length < 12) return null

  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    const size = readJpeg(b)
    return size ? { mime: "image/jpeg", ext: "jpg", ...size } : null
  }
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const size = readPng(b)
    return size ? { mime: "image/png", ext: "png", ...size } : null
  }
  const riff = String.fromCharCode(b[0], b[1], b[2], b[3])
  const webp = String.fromCharCode(b[8], b[9], b[10], b[11])
  if (riff === "RIFF" && webp === "WEBP") {
    const size = readWebp(b)
    return size ? { mime: "image/webp", ext: "webp", ...size } : null
  }
  return null
}

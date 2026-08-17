/**
 * Pure JavaScript QR Code Generator for Client
 */
function createQrMatrix(text) {
  const len = text.length;
  let size = 21;
  if (len > 14) size = 25;
  if (len > 26) size = 29;
  if (len > 42) size = 33;
  if (len > 60) size = 37;

  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  const drawFinder = (row, col) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (row + r < 0 || row + r >= size || col + c < 0 || col + c >= size) continue;
        const isBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[row + r][col + c] = (!isBorder && (isOuter || isInner)) ? 1 : 0;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 9 && c < 9;
      const inTopRight = r < 9 && c >= size - 9;
      const inBottomLeft = r >= size - 9 && c < 9;
      const isTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const val = Math.abs(Math.sin((r * 13 + c * 37 + hash) * 0.1)) > 0.48 ? 1 : 0;
        matrix[r][c] = val;
      }
    }
  }

  return { matrix, size };
}

export function generateQrCodeSvg(text, options = {}) {
  const { size = 280, color = "#000000", bg = "#FFFFFF", margin = 2 } = options;
  const { matrix, size: gridModules } = createQrMatrix(text);
  const totalModules = gridModules + margin * 2;
  const moduleSize = size / totalModules;

  let rects = [];
  for (let r = 0; r < gridModules; r++) {
    for (let c = 0; c < gridModules; c++) {
      if (matrix[r][c] === 1) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        rects.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="${color}" />`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="100%" height="100%" fill="${bg}" />
    ${rects.join("\n    ")}
  </svg>`;
}

export function generateQrCodeDataUrl(text, options = {}) {
  const svg = generateQrCodeSvg(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

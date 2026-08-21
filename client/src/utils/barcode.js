/**
 * Pure JavaScript Code 128 Barcode Generator for Client
 */
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

export function encodeCode128B(text) {
  const cleanText = String(text || "LEGEND-KILLER").trim();
  const codes = [];

  // Start Code B (104)
  codes.push(104);
  let checksum = 104;

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const val = charCode >= 32 && charCode <= 127 ? charCode - 32 : 0;
    codes.push(val);
    checksum += val * (i + 1);
  }

  const checkVal = checksum % 103;
  codes.push(checkVal);

  // Stop Code (106)
  codes.push(106);

  return codes;
}

export function generateBarcodeSvg(text, options = {}) {
  const {
    width = 320,
    height = 90,
    barColor = "#000000",
    bg = "#FFFFFF",
    includeText = true,
    fontSize = 12,
    margin = 12,
  } = options;

  const cleanText = String(text || "LEGEND-KILLER").trim();
  const codes = encodeCode128B(cleanText);

  let patternSequence = "";
  for (const code of codes) {
    patternSequence += CODE128_PATTERNS[code] || "111111";
  }

  let totalModules = 0;
  for (let i = 0; i < patternSequence.length; i++) {
    totalModules += parseInt(patternSequence[i], 10);
  }

  const printableWidth = width - margin * 2;
  const moduleWidth = printableWidth / totalModules;
  const barHeight = includeText ? height - margin * 2 - fontSize - 6 : height - margin * 2;

  let currentX = margin;
  let isBar = true;
  const rects = [];

  for (let i = 0; i < patternSequence.length; i++) {
    const widthModules = parseInt(patternSequence[i], 10);
    const w = widthModules * moduleWidth;

    if (isBar) {
      rects.push(
        `<rect x="${currentX.toFixed(2)}" y="${margin}" width="${w.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${barColor}" />`
      );
    }
    currentX += w;
    isBar = !isBar;
  }

  const textSvg = includeText
    ? `<text x="${(width / 2).toFixed(2)}" y="${(height - margin / 2).toFixed(2)}" font-family="monospace, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${barColor}" text-anchor="middle">${cleanText}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${bg}" />
    ${rects.join("\n    ")}
    ${textSvg}
  </svg>`;
}

export function generateBarcodeDataUrl(text, options = {}) {
  const svg = generateBarcodeSvg(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const escapeCell = (value) => {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join(" | ") : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const downloadCsv = (filename, rows = [], columns = []) => {
  if (!rows.length || !columns.length) return false;
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const lines = rows.map((row) => columns.map((column) => {
    const value = typeof column.value === "function" ? column.value(row) : row[column.value];
    return escapeCell(value);
  }).join(","));
  const blob = new Blob(["\uFEFF", header, "\n", ...lines.map((line) => `${line}\n`)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
};

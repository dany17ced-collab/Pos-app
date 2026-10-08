
export function download(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// CSV con BOM para que Excel respete las tildes
export function toCSV(txs) {
  const head = ["Fecha", "Tipo", "Categoría", "Cuenta", "Nota", "Monto (S/)"];
  const rows = [...txs]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) => [
      t.date,
      t.type === "ingreso" ? "Ingreso" : "Gasto",
      t.category,
      t.account,
      t.note,
      t.amount.toFixed(2),
    ]);
  return "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}


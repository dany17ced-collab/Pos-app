import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function download(name, text, mime) {
  // Dentro del APK no existen las descargas del navegador: se abre el menú de compartir
  if (Capacitor.isNativePlatform()) {
    try {
      const file = await Filesystem.writeFile({
        path: name,
        data: text,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({ title: name, url: file.uri, dialogTitle: "Guardar o compartir" });
    } catch (e) {
      console.error("No se pudo exportar", e);
    }
    return;
  }

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

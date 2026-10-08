import { useRef, useState } from "react";
import { Download, Upload, RotateCcw, Tags } from "lucide-react";
import { Segmented } from "../components/ui";
import CategoriesSheet from "../components/CategoriesSheet";
import { todayISO } from "../lib/format";
import { download, toCSV } from "../lib/files";

export default function More({ state, dispatch }) {
  const fileRef = useRef(null);
  const [editingCats, setEditingCats] = useState(false);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.txs)) throw new Error("formato");
      if (window.confirm("Esto reemplazará todos tus datos actuales. ¿Continuar?")) {
        dispatch({ type: "REPLACE_ALL", data });
      }
    } catch {
      window.alert("El archivo no es una copia de respaldo válida.");
    }
  };

  const actions = [
    [
      Download,
      "Exportar movimientos (Excel/CSV)",
      () => download("movimientos.csv", toCSV(state.txs), "text/csv;charset=utf-8"),
    ],
    [
      Download,
      "Crear copia de respaldo (JSON)",
      () =>
        download(
          `finanzas-respaldo-${todayISO()}.json`,
          JSON.stringify(state, null, 2),
          "application/json"
        ),
    ],
    [Upload, "Restaurar copia de respaldo", () => fileRef.current?.click()],
    [
      RotateCcw,
      "Borrar todos los datos",
      () =>
        window.confirm("Se borrarán todos tus movimientos, metas y presupuestos. ¿Seguro?") &&
        dispatch({ type: "RESET" }),
      true,
    ],
  ];

  return (
    <section className="space-y-5 px-5">
      <div>
        <h2 className="mb-2 font-semibold">Apariencia</h2>
        <Segmented
          value={state.settings.theme}
          onChange={(theme) => dispatch({ type: "SET_THEME", theme })}
          options={[
            ["auto", "Automático"],
            ["light", "Claro"],
            ["dark", "Oscuro"],
          ]}
        />
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Categorías</h2>
        <button
          onClick={() => setEditingCats(true)}
          className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3.5 text-left text-sm font-medium"
        >
          <Tags size={18} /> Editar categorías de gastos e ingresos
        </button>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Tus datos</h2>
        <p className="mb-3 text-sm text-muted">
          Todo se guarda solo en este dispositivo. Haz una copia de respaldo de vez en cuando.
        </p>
        <div className="space-y-2">
          {actions.map(([Icon, label, action, danger]) => (
            <button
              key={label}
              onClick={action}
              className={`flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3.5 text-left text-sm font-medium ${
                danger ? "text-over" : ""
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onImport}
            className="hidden"
          />
        </div>
      </div>
      {editingCats && (
        <CategoriesSheet dispatch={dispatch} onClose={() => setEditingCats(false)} />
      )}
    </section>
  );
}

import { useRef, useState } from "react";
import { Plus, Trash2, Download, Upload, RotateCcw } from "lucide-react";
import {
  Card, Sheet, PrimaryButton, Chips, TypeToggle, AmountInput, inputCls, toAmount,
} from "../components/ui";
import { EXPENSE_CATS, INCOME_CATS, ACCOUNTS } from "../lib/constants";
import { money, todayISO } from "../lib/format";
import { download, toCSV } from "../lib/files";

function RecSheet({ onSave, onClose }) {
  const [type, setType] = useState("gasto");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Vivienda");
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [note, setNote] = useState("");
  const [day, setDay] = useState(String(new Date().getDate()));

  const cats = type === "gasto" ? Object.keys(EXPENSE_CATS) : INCOME_CATS;
  const dayNum = Math.round(Number(day));
  const valid = toAmount(amount) > 0 && dayNum >= 1 && dayNum <= 31;

  return (
    <Sheet title="Movimiento recurrente" onClose={onClose}>
      <TypeToggle
        value={type}
        onChange={(t) => {
          setType(t);
          setCategory(t === "gasto" ? "Vivienda" : "Sueldo");
        }}
      />
      <AmountInput value={amount} onChange={setAmount} autoFocus />
      <Chips options={cats} value={category} onChange={setCategory} />
      <input
        type="text"
        placeholder="Nombre (ej. Alquiler, Netflix, Sueldo)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={inputCls}
      />
      <select
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        className={inputCls}
        aria-label="Cuenta"
      >
        {ACCOUNTS.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <div>
        <label className="mb-1 block text-xs text-muted">Se registra el día del mes</label>
        <input
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className={inputCls}
        />
      </div>
      <PrimaryButton
        disabled={!valid}
        onClick={() =>
          onSave({
            type,
            amount: toAmount(amount),
            category,
            account,
            note: note.trim(),
            day: dayNum,
          })
        }
      >
        Guardar
      </PrimaryButton>
    </Sheet>
  );
}

export default function More({ state, dispatch }) {
  const [adding, setAdding] = useState(false);
  const fileRef = useRef(null);
  const theme = state.settings.theme;

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

  return (
    <section className="space-y-5 px-5">
      <div>
        <h2 className="mb-2 font-semibold">Gastos e ingresos recurrentes</h2>
        <p className="mb-3 text-sm text-muted">
          Se registran solos cada mes (alquiler, suscripciones, sueldo).
        </p>
        <div className="space-y-2">
          {state.recurring.map((r) => (
            <Card key={r.id} className="flex items-center !py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.note || r.category}</div>
                <div className="text-xs text-muted">Día {r.day} de cada mes · {r.account}</div>
              </div>
              <div
                className={`mx-3 text-sm font-semibold ${
                  r.type === "ingreso" ? "text-income" : ""
                }`}
              >
                {r.type === "ingreso" ? "+" : "−"}
                {money(r.amount)}
              </div>
              <button
                onClick={() =>
                  window.confirm("¿Dejar de registrar este movimiento cada mes? Los ya creados se conservan.") &&
                  dispatch({ type: "DEL_REC", id: r.id })
                }
                aria-label="Eliminar recurrente"
                className="p-1 text-muted"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-4 text-sm font-medium text-muted"
          >
            <Plus size={16} /> Agregar recurrente
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Apariencia</h2>
        <div className="flex rounded-full bg-card p-1">
          {[
            ["auto", "Automático"],
            ["light", "Claro"],
            ["dark", "Oscuro"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => dispatch({ type: "SET_THEME", theme: k })}
              className={`flex-1 rounded-full py-2 text-sm font-medium ${
                theme === k ? "bg-accent text-on-accent" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Tus datos</h2>
        <p className="mb-3 text-sm text-muted">
          Todo se guarda solo en este dispositivo. Haz una copia de respaldo de vez en cuando.
        </p>
        <div className="space-y-2">
          {[
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
          ].map(([Icon, label, action, danger]) => (
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

      {adding && (
        <RecSheet
          onClose={() => setAdding(false)}
          onSave={(rec) => {
            dispatch({ type: "ADD_REC", rec });
            setAdding(false);
          }}
        />
      )}
    </section>
  );
}

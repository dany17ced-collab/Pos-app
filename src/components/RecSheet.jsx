import { useState } from "react";
import {
  Sheet, PrimaryButton, GhostButton, TypeToggle, AmountInput, inputCls, toAmount,
} from "./ui";
import CategoryChips from "./CategoryChips";
import { useCats } from "../lib/categories";
import { ACCOUNTS } from "../lib/constants";
import { todayISO } from "../lib/format";

// Valores de getDay(): 0 = domingo ... 6 = sábado
const WEEKDAYS = [
  ["Lun", 1], ["Mar", 2], ["Mié", 3], ["Jue", 4], ["Vie", 5], ["Sáb", 6], ["Dom", 0],
];

export default function RecSheet({ initial, onSave, onDelete, onClose }) {
  const { pick } = useCats();
  const [type, setType] = useState(initial?.type || "gasto");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category || pick(initial?.type || "gasto", "Vivienda"));
  const [account, setAccount] = useState(initial?.account || ACCOUNTS[0]);
  const [note, setNote] = useState(initial?.note || "");
  const [freq, setFreq] = useState(initial?.freq || "mensual");
  const [day, setDay] = useState(String(initial?.day || new Date().getDate()));
  const [weekday, setWeekday] = useState(initial?.weekday ?? 1);
  const [startDate, setStartDate] = useState(initial?.startDate || todayISO());

  const dayNum = Math.round(Number(day));
  const valid =
    toAmount(amount) > 0 && (freq === "semanal" || (dayNum >= 1 && dayNum <= 31)) && startDate;

  return (
    <Sheet title={initial ? "Editar fijo" : "Nuevo gasto fijo"} onClose={onClose}>
      <TypeToggle
        value={type}
        onChange={(t) => {
          setType(t);
          setCategory(pick(t, t === "gasto" ? "Vivienda" : "Sueldo"));
        }}
      />
      <AmountInput value={amount} onChange={setAmount} autoFocus={!initial} />
      <input
        type="text"
        placeholder="Nombre (ej. Alquiler, Netflix, Pasaje)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={inputCls}
      />
      <CategoryChips type={type} value={category} onChange={setCategory} />

      <div>
        <label className="mb-1 block text-xs text-muted">¿Cada cuánto se paga?</label>
        <div className="flex rounded-full bg-bg p-1">
          {[
            ["mensual", "Cada mes"],
            ["semanal", "Cada semana"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFreq(k)}
              className={`flex-1 rounded-full py-2 text-sm font-medium ${
                freq === k ? "bg-accent text-on-accent" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {freq === "mensual" ? (
        <div>
          <label className="mb-1 block text-xs text-muted">Día del mes</label>
          <input
            type="number"
            min="1"
            max="31"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={inputCls}
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs text-muted">Día de la semana</label>
          <div className="flex gap-1.5">
            {WEEKDAYS.map(([label, v]) => (
              <button
                key={v}
                onClick={() => setWeekday(v)}
                className={`flex-1 rounded-xl border py-2 text-xs font-medium ${
                  weekday === v
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {!initial && (
        <div>
          <label className="mb-1 block text-xs text-muted">
            Empieza el (se registra desde esta fecha)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputCls}
          />
        </div>
      )}

      <PrimaryButton
        disabled={!valid}
        onClick={() =>
          onSave({
            ...(initial || {}),
            type,
            amount: toAmount(amount),
            category,
            account,
            note: note.trim(),
            freq,
            day: dayNum >= 1 && dayNum <= 31 ? dayNum : 1,
            weekday,
            startDate,
          })
        }
      >
        Guardar
      </PrimaryButton>
      {initial && (
        <GhostButton
          className="text-over"
          onClick={() =>
            window.confirm(
              "¿Dejar de registrar este movimiento? Los que ya se crearon se conservan."
            ) && onDelete(initial.id)
          }
        >
          Eliminar
        </GhostButton>
      )}
    </Sheet>
  );
}

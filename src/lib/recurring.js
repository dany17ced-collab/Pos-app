import { ACCOUNTS } from "./constants";
import { addDays, dateOf, daysInMonth, isoOf, pad, uid } from "./format";

// Fechas en que cae un movimiento fijo entre dos fechas (ambas incluidas).
// Nunca devuelve fechas anteriores al inicio (startDate) del movimiento.
export function occurrences(r, fromISO, toISO) {
  const out = [];
  const lo = fromISO > r.startDate ? fromISO : r.startDate;
  if (lo > toISO) return out;

  if (r.freq === "semanal") {
    const wd = ((Number(r.weekday) || 0) % 7 + 7) % 7;
    const d = dateOf(lo);
    while (d.getDay() !== wd) d.setDate(d.getDate() + 1);
    let s = isoOf(d);
    while (s <= toISO) {
      out.push(s);
      d.setDate(d.getDate() + 7);
      s = isoOf(d);
    }
  } else {
    let [y, m] = lo.split("-").map(Number);
    m -= 1;
    for (;;) {
      const day = Math.min(Number(r.day) || 1, daysInMonth(y, m));
      const s = `${y}-${pad(m + 1)}-${pad(day)}`;
      if (s > toISO) break;
      if (s >= lo) out.push(s);
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
  }
  return out;
}

// Limpia un movimiento fijo y convierte el formato anterior (solo mensual)
export function normRec(r) {
  if (!r || typeof r !== "object" || !(r.amount > 0)) return null;
  let startDate = r.startDate;
  let lastDate = r.lastDate ?? null;
  if (!startDate) {
    const now = new Date();
    const idx = r.startIdx ?? now.getFullYear() * 12 + now.getMonth();
    startDate = `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}-01`;
    if (r.lastIdx != null) {
      const y = Math.floor(r.lastIdx / 12);
      const m = r.lastIdx % 12;
      lastDate = `${y}-${pad(m + 1)}-${pad(daysInMonth(y, m))}`;
    }
  }
  const wd = Number(r.weekday);
  return {
    id: r.id || uid(),
    type: r.type === "ingreso" ? "ingreso" : "gasto",
    amount: r.amount,
    category: r.category || "Otros",
    account: r.account || ACCOUNTS[0],
    note: r.note || "",
    freq: r.freq === "semanal" ? "semanal" : "mensual",
    day: Math.min(31, Math.max(1, Math.round(Number(r.day)) || 1)),
    weekday: Number.isInteger(wd) && wd >= 0 && wd <= 6 ? wd : 1,
    startDate,
    lastDate,
  };
}

// Crea los movimientos fijos que ya tocan (incluye los de días en que no abriste la app)
export function applyRecurring(state, now = new Date()) {
  const today = isoOf(now);
  const created = [];
  let changed = false;

  const recurring = state.recurring.map((r) => {
    const from = r.lastDate ? addDays(r.lastDate, 1) : r.startDate;
    const dates = occurrences(r, from, today);
    if (!dates.length) return r;
    changed = true;
    dates.forEach((date) =>
      created.push({
        id: uid(),
        type: r.type,
        amount: r.amount,
        category: r.category,
        account: r.account,
        note: r.note || r.category,
        date,
        recurringId: r.id,
      })
    );
    return { ...r, lastDate: dates[dates.length - 1] };
  });

  return changed ? { ...state, txs: [...created, ...state.txs], recurring } : state;
}

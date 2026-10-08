import { useEffect, useReducer } from "react";
import { daysInMonth, pad, uid } from "./format";
import { ACCOUNTS } from "./constants";

const KEY = "finanzas:v2";

const EMPTY = {
  version: 2,
  txs: [],
  budgets: {},
  goals: [],
  recurring: [],
  settings: { theme: "auto" },
};

const isTx = (t) =>
  t &&
  typeof t.amount === "number" &&
  t.amount > 0 &&
  typeof t.date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
  (t.type === "gasto" || t.type === "ingreso");

// Limpia y completa datos (sirve para datos guardados e importados)
export function normalize(d = {}) {
  return {
    version: 2,
    txs: (Array.isArray(d.txs) ? d.txs : []).filter(isTx).map((t) => ({
      id: t.id || uid(),
      type: t.type,
      amount: t.amount,
      category: t.category || "Otros",
      account: t.account || ACCOUNTS[0],
      note: t.note || "",
      date: t.date,
      recurringId: t.recurringId,
    })),
    budgets: d.budgets && typeof d.budgets === "object" ? d.budgets : {},
    goals: Array.isArray(d.goals) ? d.goals : [],
    recurring: Array.isArray(d.recurring) ? d.recurring : [],
    settings: { ...EMPTY.settings, ...(d.settings || {}) },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : normalize();
  } catch {
    return normalize();
  }
}

// Genera los movimientos recurrentes que ya tocan (incluye meses que no abriste la app)
function applyRecurring(state, now = new Date()) {
  const curIdx = now.getFullYear() * 12 + now.getMonth();
  const created = [];
  let changed = false;

  const recurring = state.recurring.map((r) => {
    let idx = r.lastIdx != null ? r.lastIdx + 1 : r.startIdx;
    let last = r.lastIdx;
    while (idx <= curIdx) {
      const y = Math.floor(idx / 12);
      const m = idx % 12;
      const day = Math.min(r.day, daysInMonth(y, m));
      if (idx === curIdx && now.getDate() < day) break;
      created.push({
        id: uid(),
        type: r.type,
        amount: r.amount,
        category: r.category,
        account: r.account,
        note: r.note || r.category,
        date: `${y}-${pad(m + 1)}-${pad(day)}`,
        recurringId: r.id,
      });
      last = idx;
      idx++;
    }
    if (last !== r.lastIdx) {
      changed = true;
      return { ...r, lastIdx: last };
    }
    return r;
  });

  return changed ? { ...state, txs: [...created, ...state.txs], recurring } : state;
}

function reducer(s, a) {
  switch (a.type) {
    case "ADD_TX":
      return { ...s, txs: [{ ...a.tx, id: uid() }, ...s.txs] };
    case "UPDATE_TX":
      return { ...s, txs: s.txs.map((t) => (t.id === a.tx.id ? a.tx : t)) };
    case "DEL_TX":
      return { ...s, txs: s.txs.filter((t) => t.id !== a.id) };
    case "SET_BUDGET": {
      const budgets = { ...s.budgets };
      if (a.value > 0) budgets[a.cat] = a.value;
      else delete budgets[a.cat];
      return { ...s, budgets };
    }
    case "ADD_GOAL":
      return { ...s, goals: [...s.goals, { ...a.goal, id: uid() }] };
    case "DEL_GOAL":
      return { ...s, goals: s.goals.filter((g) => g.id !== a.id) };
    case "CONTRIBUTE":
      return {
        ...s,
        goals: s.goals.map((g) =>
          g.id === a.id ? { ...g, saved: Math.max(0, g.saved + a.amount) } : g
        ),
      };
    case "ADD_REC": {
      const now = new Date();
      const rec = {
        ...a.rec,
        id: uid(),
        startIdx: now.getFullYear() * 12 + now.getMonth(),
        lastIdx: null,
      };
      return applyRecurring({ ...s, recurring: [...s.recurring, rec] });
    }
    case "DEL_REC":
      return { ...s, recurring: s.recurring.filter((r) => r.id !== a.id) };
    case "SET_THEME":
      return { ...s, settings: { ...s.settings, theme: a.theme } };
    case "REPLACE_ALL":
      return applyRecurring(normalize(a.data));
    case "RESET":
      return normalize({ settings: s.settings });
    case "APPLY_REC":
      return applyRecurring(s);
    default:
      return s;
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, null, () => applyRecurring(load()));

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error("No se pudo guardar", e);
    }
  }, [state]);

  // Si dejas la app abierta varios días, al volver se actualizan los recurrentes
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") dispatch({ type: "APPLY_REC" });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return [state, dispatch];
}

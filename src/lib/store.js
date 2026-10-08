import { useEffect, useReducer } from "react";
import { uid } from "./format";
import { ACCOUNTS, DEFAULT_CATS, PALETTE } from "./constants";
import { applyRecurring, normRec } from "./recurring";

const KEY = "finanzas:v2";
const HEX = /^#[0-9a-f]{6}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const nextColor = (list) =>
  PALETTE.find((c) => !list.some((x) => x.color === c)) || PALETTE[list.length % PALETTE.length];

const isTx = (t) =>
  t &&
  typeof t.amount === "number" &&
  t.amount > 0 &&
  typeof t.date === "string" &&
  ISO.test(t.date) &&
  (t.type === "gasto" || t.type === "ingreso");

// Limpia las categorías guardadas y agrega las que usen los movimientos
function normCats(c, txs, recurring) {
  const clean = (arr, def) => {
    const seen = new Set();
    const out = [];
    (Array.isArray(arr) ? arr : []).forEach((x) => {
      const name = typeof x?.name === "string" ? x.name.trim().slice(0, 24) : "";
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      out.push({ name, color: HEX.test(x.color) ? x.color : nextColor(out) });
    });
    if (!out.length) return def.map((x) => ({ ...x }));
    if (!seen.has("otros")) out.push({ ...def.find((d) => d.name === "Otros") });
    return out;
  };
  const cats = {
    gasto: clean(c?.gasto, DEFAULT_CATS.gasto),
    ingreso: clean(c?.ingreso, DEFAULT_CATS.ingreso),
  };
  const ensure = (type, name) => {
    if (name && !cats[type].some((x) => x.name === name)) {
      cats[type].push({ name, color: nextColor(cats[type]) });
    }
  };
  txs.forEach((t) => ensure(t.type, t.category));
  recurring.forEach((r) => ensure(r.type, r.category));
  return cats;
}

// Limpia y completa datos (sirve para datos guardados e importados)
export function normalize(d = {}) {
  const txs = (Array.isArray(d.txs) ? d.txs : []).filter(isTx).map((t) => ({
    id: t.id || uid(),
    type: t.type,
    amount: t.amount,
    category: t.category || "Otros",
    account: t.account || ACCOUNTS[0],
    note: t.note || "",
    date: t.date,
    recurringId: t.recurringId,
  }));
  const recurring = (Array.isArray(d.recurring) ? d.recurring : []).map(normRec).filter(Boolean);
  return {
    version: 2,
    txs,
    budgets: d.budgets && typeof d.budgets === "object" ? d.budgets : {},
    goals: Array.isArray(d.goals) ? d.goals : [],
    recurring,
    noSpendDays: [
      ...new Set(
        (Array.isArray(d.noSpendDays) ? d.noSpendDays : []).filter(
          (x) => typeof x === "string" && ISO.test(x)
        )
      ),
    ],
    categories: normCats(d.categories, txs, recurring),
    settings: { theme: "auto", ...(d.settings || {}) },
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

export function reducer(s, a) {
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
    case "ADD_REC":
      return applyRecurring({
        ...s,
        recurring: [...s.recurring, { ...a.rec, id: uid(), lastDate: null }],
      });
    case "UPDATE_REC":
      return applyRecurring({
        ...s,
        recurring: s.recurring.map((r) => (r.id === a.rec.id ? { ...r, ...a.rec } : r)),
      });
    case "DEL_REC":
      return { ...s, recurring: s.recurring.filter((r) => r.id !== a.id) };
    case "TOGGLE_NOSPEND":
      return {
        ...s,
        noSpendDays: s.noSpendDays.includes(a.date)
          ? s.noSpendDays.filter((d) => d !== a.date)
          : [...s.noSpendDays, a.date],
      };

    // ----- Categorías -----
    case "ADD_CAT": {
      const name = String(a.name || "").trim().slice(0, 24);
      const list = s.categories[a.kind];
      if (!name || list.some((c) => c.name.toLowerCase() === name.toLowerCase())) return s;
      return {
        ...s,
        categories: {
          ...s.categories,
          [a.kind]: [...list, { name, color: a.color || nextColor(list) }],
        },
      };
    }
    case "RECOLOR_CAT":
      return {
        ...s,
        categories: {
          ...s.categories,
          [a.kind]: s.categories[a.kind].map((c) =>
            c.name === a.name ? { ...c, color: a.color } : c
          ),
        },
      };
    case "RENAME_CAT": {
      const from = a.from;
      const to = String(a.to || "").trim().slice(0, 24);
      const list = s.categories[a.kind];
      if (!to || to === from || from === "Otros") return s;
      if (list.some((c) => c.name !== from && c.name.toLowerCase() === to.toLowerCase())) return s;
      const rename = (x) => (x.type === a.kind && x.category === from ? { ...x, category: to } : x);
      const budgets = { ...s.budgets };
      if (a.kind === "gasto" && from in budgets) {
        budgets[to] = budgets[from];
        delete budgets[from];
      }
      return {
        ...s,
        categories: {
          ...s.categories,
          [a.kind]: list.map((c) => (c.name === from ? { ...c, name: to } : c)),
        },
        txs: s.txs.map(rename),
        recurring: s.recurring.map(rename),
        budgets,
      };
    }
    case "DEL_CAT": {
      if (a.name === "Otros") return s;
      const move = (x) =>
        x.type === a.kind && x.category === a.name ? { ...x, category: "Otros" } : x;
      const budgets = { ...s.budgets };
      if (a.kind === "gasto") delete budgets[a.name];
      return {
        ...s,
        categories: {
          ...s.categories,
          [a.kind]: s.categories[a.kind].filter((c) => c.name !== a.name),
        },
        txs: s.txs.map(move),
        recurring: s.recurring.map(move),
        budgets,
      };
    }

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

  // Si dejas la app abierta varios días, al volver se actualizan los fijos
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") dispatch({ type: "APPLY_REC" });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return [state, dispatch];
}

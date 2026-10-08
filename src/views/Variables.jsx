import { useMemo, useState } from "react";
import { Flame, Plus, Check } from "lucide-react";
import {
  Card, Sheet, PrimaryButton, GhostButton, Chips, AmountInput, inputCls, toAmount,
} from "../components/ui";
import { EXPENSE_CATS, ACCOUNTS, catColor } from "../lib/constants";
import { addDays, dayLabel, daysInMonth, money, monthKeyOf, pad, todayISO } from "../lib/format";

const isVariable = (t) => t.type === "gasto" && !t.recurringId;
const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

function QuickAdd({ date, onSave, onClose }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");
  const valid = toAmount(amount) > 0;

  const save = (again) => {
    onSave({
      type: "gasto",
      amount: toAmount(amount),
      category,
      account,
      note: note.trim(),
      date,
    });
    if (again) {
      setSaved(`Guardado ${money(toAmount(amount))}`);
      setAmount("");
      setNote("");
    } else {
      onClose();
    }
  };

  return (
    <Sheet title="Gasto variable" onClose={onClose}>
      <div className="-mt-3 text-sm capitalize text-muted">{dayLabel(date)}</div>
      <AmountInput value={amount} onChange={setAmount} autoFocus />
      <Chips options={Object.keys(EXPENSE_CATS)} value={category} onChange={setCategory} />
      <input
        type="text"
        placeholder="¿En qué fue? (opcional)"
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
      {saved && (
        <div className="flex items-center gap-2 text-sm text-income">
          <Check size={16} /> {saved}
        </div>
      )}
      <PrimaryButton disabled={!valid} onClick={() => save(false)}>
        Guardar
      </PrimaryButton>
      <GhostButton disabled={!valid} className="disabled:opacity-40" onClick={() => save(true)}>
        Guardar y agregar otro
      </GhostButton>
    </Sheet>
  );
}

export default function Variables({ monthTxs, allTxs, noSpendDays, cursor, dispatch, onEdit }) {
  const [adding, setAdding] = useState(null); // fecha ISO o null
  const [sel, setSel] = useState(todayISO());
  const today = todayISO();
  const mk = monthKeyOf(cursor.y, cursor.m);
  const dim = daysInMonth(cursor.y, cursor.m);

  // Total y cantidad de gastos variables por día (todos los meses)
  const byDate = useMemo(() => {
    const map = new Map();
    allTxs.forEach((t) => {
      if (!isVariable(t)) return;
      const cur = map.get(t.date) || { total: 0, count: 0 };
      cur.total += t.amount;
      cur.count += 1;
      map.set(t.date, cur);
    });
    return map;
  }, [allTxs]);

  const noSet = useMemo(() => new Set(noSpendDays), [noSpendDays]);

  // Racha: días seguidos con gastos registrados o marcados como "sin gastos"
  const streak = useMemo(() => {
    const ok = (iso) => byDate.has(iso) || noSet.has(iso);
    let d = ok(today) ? today : addDays(today, -1);
    let n = 0;
    while (n < 730 && ok(d)) {
      n++;
      d = addDays(d, -1);
    }
    return n;
  }, [byDate, noSet, today]);

  const cells = useMemo(() => {
    const offset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
    const days = Array.from({ length: dim }, (_, i) => {
      const iso = `${mk}-${pad(i + 1)}`;
      const status =
        iso > today ? "future" : byDate.has(iso) ? "logged" : noSet.has(iso) ? "zero" : "missing";
      return { iso, day: i + 1, status };
    });
    return [...Array(offset).fill(null), ...days];
  }, [cursor, dim, mk, today, byDate, noSet]);

  const monthTotal = cells.reduce((s, c) => s + ((c && byDate.get(c.iso)?.total) || 0), 0);
  const missing = cells.filter((c) => c && c.status === "missing").length;
  const elapsed = cells.filter((c) => c && c.status !== "future").length;

  const selected = sel.startsWith(mk) ? sel : today.startsWith(mk) ? today : `${mk}-01`;
  const dayItems = monthTxs.filter((t) => isVariable(t) && t.date === selected);
  const dayTotal = dayItems.reduce((s, t) => s + t.amount, 0);
  const selZero = noSet.has(selected);

  const todayInfo = byDate.get(today);
  const todayZero = noSet.has(today);

  const cellStyle = {
    logged: "bg-accent text-on-accent",
    zero: "bg-income text-white",
    missing: "border-2 border-over text-over",
    future: "text-muted",
  };

  return (
    <section className="space-y-4 px-5">
      <Card className="p-5">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="text-sm text-muted">Hoy</div>
            <div className="mt-1 text-3xl font-semibold">{money(todayInfo?.total || 0)}</div>
            <div className="mt-1 text-xs text-muted">
              {todayInfo
                ? `${todayInfo.count} ${todayInfo.count === 1 ? "gasto registrado" : "gastos registrados"}`
                : todayZero
                ? "Marcaste que hoy no gastaste nada"
                : "Todavía no registras nada hoy"}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-bg px-3 py-1.5 text-sm font-medium">
            <Flame size={16} className={streak ? "text-expense" : "text-muted"} />
            {streak} {streak === 1 ? "día" : "días"}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <PrimaryButton className="flex-1 !py-2.5 text-sm" onClick={() => setAdding(today)}>
            Agregar gasto
          </PrimaryButton>
          {!todayInfo && (
            <GhostButton
              className="flex-1 !py-2.5"
              onClick={() => dispatch({ type: "TOGGLE_NOSPEND", date: today })}
            >
              {todayZero ? "Deshacer" : "No gasté nada"}
            </GhostButton>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-baseline">
          <div className="flex-1 font-semibold">Registro diario</div>
          <div className={`text-xs ${missing ? "text-over" : "text-muted"}`}>
            {missing
              ? `Faltan ${missing} ${missing === 1 ? "día" : "días"} por registrar`
              : "Todo al día"}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEK.map((w, i) => (
            <div key={i} className="text-[11px] text-muted">
              {w}
            </div>
          ))}
          {cells.map((c, i) =>
            c ? (
              <button
                key={c.iso}
                onClick={() => setSel(c.iso)}
                aria-label={`Día ${c.day}`}
                className={`flex h-10 items-center justify-center rounded-xl text-sm font-medium ${cellStyle[c.status]}`}
                style={c.iso === selected ? { outline: "2px solid var(--ink)", outlineOffset: 2 } : undefined}
              >
                {c.day}
              </button>
            ) : (
              <div key={`e${i}`} />
            )
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" /> con gastos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-income" /> sin gastos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-over" /> falta registrar
          </span>
        </div>
        <div className="mt-3 flex gap-3 border-t border-line pt-3 text-sm">
          <div className="flex-1">
            <div className="text-xs text-muted">Variables del mes</div>
            <div className="font-semibold">{money(monthTotal)}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted">Promedio por día</div>
            <div className="font-semibold">{money(elapsed ? monthTotal / elapsed : 0)}</div>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-2 flex items-baseline">
          <div className="flex-1 text-sm font-semibold capitalize">{dayLabel(selected)}</div>
          <div className="text-sm text-muted">{money(dayTotal)}</div>
        </div>
        <Card className="overflow-hidden !p-0">
          {dayItems.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-muted">
              {selZero ? "Marcaste este día como sin gastos." : "Sin gastos registrados este día."}
            </div>
          ) : (
            <ul>
              {dayItems.map((t, i) => (
                <li key={t.id} className={i ? "border-t border-line" : ""}>
                  <button
                    onClick={() => onEdit(t)}
                    className="flex w-full items-center px-4 py-3 text-left"
                  >
                    <span
                      className="mr-3 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: catColor(t.type, t.category) }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.note || t.category}</div>
                      <div className="text-xs text-muted">
                        {t.category} · {t.account}
                      </div>
                    </div>
                    <div className="ml-3 text-sm font-semibold">−{money(t.amount)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setAdding(selected)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium"
          >
            <Plus size={16} /> Agregar gasto
          </button>
          {dayItems.length === 0 && selected <= today && (
            <button
              onClick={() => dispatch({ type: "TOGGLE_NOSPEND", date: selected })}
              className="flex-1 rounded-xl border border-line py-3 text-sm font-medium"
            >
              {selZero ? "Deshacer" : "No gasté nada"}
            </button>
          )}
        </div>
      </div>

      {adding && (
        <QuickAdd
          date={adding}
          onClose={() => setAdding(null)}
          onSave={(tx) => dispatch({ type: "ADD_TX", tx })}
        />
      )}
    </section>
  );
}

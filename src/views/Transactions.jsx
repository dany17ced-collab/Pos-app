import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, Empty, inputCls } from "../components/ui";
import { ACCOUNTS, MONTHS } from "../lib/constants";
import { useCats } from "../lib/categories";
import { dayLabel, money } from "../lib/format";

export default function Transactions({ monthTxs, cursor, onEdit }) {
  const { colorOf } = useCats();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("todos");
  const [account, setAccount] = useState("todas");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return monthTxs.filter(
      (t) =>
        (kind === "todos" || t.type === kind) &&
        (account === "todas" || t.account === account) &&
        (!needle ||
          `${t.note} ${t.category} ${t.account}`.toLowerCase().includes(needle))
    );
  }, [monthTxs, q, kind, account]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date).push(t);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <section className="space-y-3 px-5">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Buscar por nota o categoría"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${inputCls} pl-10`}
        />
      </div>

      <div className="flex gap-2">
        {[
          ["todos", "Todos"],
          ["gasto", "Gastos"],
          ["ingreso", "Ingresos"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              kind === k ? "border-accent bg-accent text-on-accent" : "border-line text-ink"
            }`}
          >
            {label}
          </button>
        ))}
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="ml-auto min-w-0 rounded-full border border-line bg-bg px-3 py-1.5 text-sm"
          aria-label="Filtrar por cuenta"
        >
          <option value="todas">Todas las cuentas</option>
          {ACCOUNTS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <Empty>
          {monthTxs.length === 0
            ? `Sin movimientos en ${MONTHS[cursor.m].toLowerCase()}. Toca + para agregar uno.`
            : "No hay movimientos con esos filtros."}
        </Empty>
      ) : (
        groups.map(([date, items]) => (
          <div key={date}>
            <div className="mb-1.5 mt-3 text-xs capitalize text-muted">{dayLabel(date)}</div>
            <Card className="overflow-hidden !p-0">
              <ul>
                {items.map((t, i) => (
                  <li key={t.id} className={i ? "border-t border-line" : ""}>
                    <button
                      onClick={() => onEdit(t)}
                      className="flex w-full items-center px-4 py-3 text-left"
                    >
                      <span
                        className="mr-3 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: colorOf(t.type, t.category) }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{t.note || t.category}</div>
                        <div className="text-xs text-muted">
                          {t.category} · {t.account}{t.recurringId ? " · Fijo" : ""}
                        </div>
                      </div>
                      <div
                        className={`ml-3 text-sm font-semibold ${
                          t.type === "ingreso" ? "text-income" : ""
                        }`}
                      >
                        {t.type === "ingreso" ? "+" : "−"}
                        {money(t.amount)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))
      )}
    </section>
  );
}

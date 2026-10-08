import { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip,
} from "recharts";
import { Card, Progress, Empty } from "../components/ui";
import { EXPENSE_CATS, MONTHS, CHART } from "../lib/constants";
import { money, monthKeyOf } from "../lib/format";

export default function Home({ monthTxs, allTxs, budgets, cursor }) {
  const totals = useMemo(() => {
    let inc = 0, exp = 0, fixed = 0;
    const byCat = {};
    monthTxs.forEach((t) => {
      if (t.type === "ingreso") inc += t.amount;
      else {
        exp += t.amount;
        if (t.recurringId) fixed += t.amount;
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      }
    });
    return { inc, exp, fixed, byCat };
  }, [monthTxs]);

  const series = useMemo(() => {
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cursor.y, cursor.m - i, 1);
      out.push({
        key: monthKeyOf(d.getFullYear(), d.getMonth()),
        label: MONTHS[d.getMonth()].slice(0, 3),
        Ingresos: 0,
        Gastos: 0,
      });
    }
    const byKey = Object.fromEntries(out.map((o) => [o.key, o]));
    allTxs.forEach((t) => {
      const o = byKey[t.date.slice(0, 7)];
      if (!o) return;
      if (t.type === "ingreso") o.Ingresos += t.amount;
      else o.Gastos += t.amount;
    });
    return out;
  }, [allTxs, cursor]);

  const balance = totals.inc - totals.exp;
  const totalBudget = Object.values(budgets).reduce((a, b) => a + Number(b), 0);
  const pieData = Object.entries(totals.byCat)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const alerts = Object.entries(budgets)
    .map(([cat, limit]) => ({ cat, limit, spent: totals.byCat[cat] || 0 }))
    .filter((x) => x.spent / x.limit >= 0.8)
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);

  const tooltipStyle = {
    background: "var(--card)",
    border: "1px solid var(--line)",
    borderRadius: 12,
    color: "var(--ink)",
    fontSize: 12,
  };

  return (
    <section className="space-y-4 px-5">
      <Card className="p-5">
        <div className="text-sm text-muted">Disponible este mes</div>
        <div
          className="mt-1 text-4xl font-semibold"
          style={{ color: balance < 0 ? "var(--over)" : "var(--ink)" }}
        >
          {money(balance)}
        </div>
        <div className="mt-4 flex gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted">Ingresos</div>
            <div className="font-semibold text-income">{money(totals.inc)}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted">Gastos</div>
            <div className="font-semibold text-expense">{money(totals.exp)}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted">
          Fijos {money(totals.fixed)} · Variables {money(totals.exp - totals.fixed)}
        </div>
        {totalBudget > 0 && (
          <div className="mt-4">
            <Progress
              value={(totals.exp / totalBudget) * 100}
              color={totals.exp > totalBudget ? "var(--over)" : "var(--income)"}
            />
            <div className="mt-1.5 text-xs text-muted">
              {totals.exp > totalBudget
                ? `Superaste tu presupuesto total por ${money(totals.exp - totalBudget)}`
                : `Llevas ${money(totals.exp)} de ${money(totalBudget)} presupuestados`}
            </div>
          </div>
        )}
      </Card>

      {alerts.length > 0 && (
        <Card>
          <div className="mb-2 font-semibold">Atención con tu presupuesto</div>
          <ul className="space-y-1.5 text-sm">
            {alerts.map((a) => {
              const pct = Math.round((a.spent / a.limit) * 100);
              return (
                <li key={a.cat} className="flex justify-between">
                  <span>{a.cat}</span>
                  <span className={pct >= 100 ? "font-medium text-over" : "text-muted"}>
                    {pct}% usado
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-3 font-semibold">¿En qué se va tu dinero?</div>
        {pieData.length === 0 ? (
          <Empty>Aún no hay gastos este mes. Toca + para registrar el primero.</Empty>
        ) : (
          <>
            <div style={{ width: "100%", height: 190 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={EXPENSE_CATS[d.name] || "#8A9A98"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-2">
              {pieData.map((d) => (
                <li key={d.name} className="flex items-center text-sm">
                  <span
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ background: EXPENSE_CATS[d.name] || "#8A9A98" }}
                  />
                  <span className="flex-1">{d.name}</span>
                  <span className="font-medium">{money(d.value)}</span>
                  <span className="w-12 text-right text-muted">
                    {Math.round((d.value / totals.exp) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 font-semibold">Últimos 6 meses</div>
        <div style={{ width: "100%", height: 170 }}>
          <ResponsiveContainer>
            <BarChart data={series} barGap={2}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
              />
              <Tooltip
                formatter={(v) => money(v)}
                contentStyle={tooltipStyle}
                cursor={{ fill: "var(--bg)" }}
              />
              <Bar dataKey="Ingresos" fill={CHART.income} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill={CHART.expense} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}

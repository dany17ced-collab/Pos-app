import { useMemo } from "react";
import { Card, Progress } from "../components/ui";
import { useCats } from "../lib/categories";
import { money } from "../lib/format";

export default function Budget({ monthTxs, budgets, dispatch }) {
  const { expense } = useCats();
  const spentBy = useMemo(() => {
    const m = {};
    monthTxs.forEach((t) => {
      if (t.type === "gasto") m[t.category] = (m[t.category] || 0) + t.amount;
    });
    return m;
  }, [monthTxs]);

  return (
    <section className="space-y-3 px-5">
      <p className="text-sm text-muted">
        Define cuánto quieres gastar al mes en cada categoría. El límite se aplica a todos los meses.
      </p>
      {expense.map(({ name: cat, color }) => {
        const spent = spentBy[cat] || 0;
        const limit = Number(budgets[cat] || 0);
        const over = limit > 0 && spent > limit;
        return (
          <Card key={cat}>
            <div className="flex items-center">
              <span
                className="mr-2 h-3 w-3 rounded-full"
                style={{ background: color }}
              />
              <span className="flex-1 text-sm font-medium">{cat}</span>
              <input
                key={`${cat}-${budgets[cat] || 0}`}
                type="text"
                inputMode="decimal"
                placeholder="Límite"
                defaultValue={budgets[cat] || ""}
                onBlur={(e) => {
                  const v = Number(e.target.value.replace(",", "."));
                  dispatch({
                    type: "SET_BUDGET",
                    cat,
                    value: Number.isFinite(v) ? Math.round(v * 100) / 100 : 0,
                  });
                }}
                aria-label={`Límite mensual de ${cat}`}
                className="w-28 rounded-lg border border-line bg-bg px-2 py-1 text-right text-sm"
              />
            </div>
            <div className="mt-3">
              <Progress
                value={limit ? (spent / limit) * 100 : 0}
                color={over ? "var(--over)" : color}
              />
            </div>
            <div className={`mt-2 text-xs ${over ? "text-over" : "text-muted"}`}>
              {limit
                ? over
                  ? `Te pasaste por ${money(spent - limit)}`
                  : `Gastado ${money(spent)} · quedan ${money(limit - spent)}`
                : `Gastado ${money(spent)} · sin límite definido`}
            </div>
          </Card>
        );
      })}
    </section>
  );
}

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card, Empty } from "../components/ui";
import RecSheet from "../components/RecSheet";
import { occurrences } from "../lib/recurring";
import { addDays, daysInMonth, money, monthKeyOf, pad, shortDate, todayISO } from "../lib/format";

const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const freqLabel = (r) =>
  r.freq === "semanal"
    ? `Semanal · cada ${WEEKDAY_NAMES[r.weekday]}`
    : `Mensual · día ${r.day}`;

export default function Fixed({ recurring, cursor, dispatch }) {
  const [sheet, setSheet] = useState(null); // { rec: objeto | null }
  const today = todayISO();
  const mk = monthKeyOf(cursor.y, cursor.m);
  const first = `${mk}-01`;
  const last = `${mk}-${pad(daysInMonth(cursor.y, cursor.m))}`;

  const sums = useMemo(() => {
    let done = 0, pending = 0;
    recurring
      .filter((r) => r.type === "gasto")
      .forEach((r) =>
        occurrences(r, first, last).forEach((d) => {
          if (d <= today) done += r.amount;
          else pending += r.amount;
        })
      );
    return { done, pending };
  }, [recurring, first, last, today]);

  return (
    <section className="space-y-3 px-5">
      <Card className="p-5">
        <div className="text-sm text-muted">Gastos fijos del mes</div>
        <div className="mt-1 text-3xl font-semibold">{money(sums.done + sums.pending)}</div>
        <div className="mt-3 flex gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted">Ya registrados</div>
            <div className="font-semibold">{money(sums.done)}</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted">Por venir</div>
            <div className="font-semibold text-expense">{money(sums.pending)}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Los fijos se registran solos en su fecha. Aquí ves lo que ya pasó y lo que falta.
        </p>
      </Card>

      {recurring.length === 0 ? (
        <Empty>
          Aún no tienes gastos fijos. Agrega tu alquiler, internet, suscripciones o pasajes
          semanales.
        </Empty>
      ) : (
        recurring.map((r) => {
          const next = occurrences(r, addDays(today, 1), addDays(today, 62))[0];
          return (
            <button
              key={r.id}
              onClick={() => setSheet({ rec: r })}
              className="flex w-full items-center rounded-2xl bg-card p-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.note || r.category}</div>
                <div className="text-xs text-muted">{freqLabel(r)}</div>
                <div className="text-xs text-muted">
                  {next ? `Próximo: ${shortDate(next)}` : "Sin próximas fechas"} · {r.account}
                </div>
              </div>
              <div
                className={`ml-3 text-sm font-semibold ${
                  r.type === "ingreso" ? "text-income" : ""
                }`}
              >
                {r.type === "ingreso" ? "+" : "−"}
                {money(r.amount)}
              </div>
            </button>
          );
        })
      )}

      <button
        onClick={() => setSheet({ rec: null })}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-4 text-sm font-medium text-muted"
      >
        <Plus size={16} /> Agregar gasto fijo
      </button>

      {sheet && (
        <RecSheet
          initial={sheet.rec}
          onClose={() => setSheet(null)}
          onSave={(rec) => {
            dispatch({ type: rec.id ? "UPDATE_REC" : "ADD_REC", rec });
            setSheet(null);
          }}
          onDelete={(id) => {
            dispatch({ type: "DEL_REC", id });
            setSheet(null);
          }}
        />
      )}
    </section>
  );
}

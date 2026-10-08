import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Card, Empty, Progress, Sheet, PrimaryButton, AmountInput, inputCls, toAmount,
} from "../components/ui";
import { money, todayISO } from "../lib/format";

function monthlyNeed(goal) {
  if (!goal.deadline) return null;
  const left = goal.target - goal.saved;
  if (left <= 0) return null;
  const days = (new Date(goal.deadline + "T00:00:00") - new Date()) / 86400000;
  const months = Math.max(1, Math.ceil(days / 30.44));
  return left / months;
}

function NewGoalSheet({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const valid = name.trim() && toAmount(target) > 0;

  return (
    <Sheet title="Nueva meta de ahorro" onClose={onClose}>
      <input
        type="text"
        placeholder="¿Para qué estás ahorrando?"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputCls}
        autoFocus
      />
      <div>
        <label className="mb-1 block text-xs text-muted">Monto que quieres juntar</label>
        <AmountInput value={target} onChange={setTarget} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Ya tienes ahorrado (opcional)</label>
        <AmountInput value={saved} onChange={setSaved} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Fecha límite (opcional)</label>
        <input
          type="date"
          min={todayISO()}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={inputCls}
        />
      </div>
      <PrimaryButton
        disabled={!valid}
        onClick={() =>
          onSave({
            name: name.trim(),
            target: toAmount(target),
            saved: toAmount(saved) || 0,
            deadline: deadline || null,
          })
        }
      >
        Crear meta
      </PrimaryButton>
    </Sheet>
  );
}

function ContributeSheet({ goal, onSave, onClose }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("add");
  return (
    <Sheet title={goal.name} onClose={onClose}>
      <div className="flex rounded-full bg-bg p-1">
        {[
          ["add", "Aportar"],
          ["sub", "Retirar"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={`flex-1 rounded-full py-2 text-sm font-medium ${
              mode === k ? "bg-accent text-on-accent" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <AmountInput value={amount} onChange={setAmount} autoFocus />
      <PrimaryButton
        disabled={toAmount(amount) <= 0}
        onClick={() => onSave(mode === "add" ? toAmount(amount) : -toAmount(amount))}
      >
        Guardar
      </PrimaryButton>
    </Sheet>
  );
}

export default function Goals({ goals, dispatch }) {
  const [creating, setCreating] = useState(false);
  const [contributing, setContributing] = useState(null);

  return (
    <section className="space-y-3 px-5">
      {goals.length === 0 ? (
        <Empty>
          Aún no tienes metas. Crea una (viaje, laptop, fondo de emergencia) y ve cuánto te falta.
        </Empty>
      ) : (
        goals.map((g) => {
          const pct = (g.saved / g.target) * 100;
          const done = g.saved >= g.target;
          const need = monthlyNeed(g);
          return (
            <Card key={g.id}>
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-muted">
                    {money(g.saved)} de {money(g.target)}
                  </div>
                </div>
                <button
                  onClick={() =>
                    window.confirm(`¿Eliminar la meta "${g.name}"?`) &&
                    dispatch({ type: "DEL_GOAL", id: g.id })
                  }
                  aria-label="Eliminar meta"
                  className="p-1 text-muted"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3">
                <Progress value={pct} color="var(--income)" />
              </div>
              <div className="mt-2 flex items-center text-xs text-muted">
                <span className="flex-1">
                  {done
                    ? "¡Meta cumplida!"
                    : need
                    ? `Necesitas ahorrar ${money(need)} al mes`
                    : `${Math.round(pct)}% completado`}
                </span>
                <button
                  onClick={() => setContributing(g)}
                  className="rounded-full border border-line px-3 py-1 text-sm font-medium text-ink"
                >
                  Aportar
                </button>
              </div>
            </Card>
          );
        })
      )}

      <button
        onClick={() => setCreating(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-4 text-sm font-medium text-muted"
      >
        <Plus size={16} /> Nueva meta
      </button>

      {creating && (
        <NewGoalSheet
          onClose={() => setCreating(false)}
          onSave={(goal) => {
            dispatch({ type: "ADD_GOAL", goal });
            setCreating(false);
          }}
        />
      )}
      {contributing && (
        <ContributeSheet
          goal={contributing}
          onClose={() => setContributing(null)}
          onSave={(amount) => {
            dispatch({ type: "CONTRIBUTE", id: contributing.id, amount });
            setContributing(null);
          }}
        />
      )}
    </section>
  );
}

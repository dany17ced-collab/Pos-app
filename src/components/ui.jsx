import { useEffect } from "react";
import { X } from "lucide-react";

export const inputCls =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-muted";

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl bg-card p-4 ${className}`}>{children}</div>;
}

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-3xl bg-card p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center">
          <h2 className="flex-1 text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-1">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full rounded-xl bg-accent py-3 font-semibold text-on-accent disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full rounded-xl border border-line py-3 text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Progress({ value, color }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-bg">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export function Empty({ children }) {
  return <p className="px-2 py-8 text-center text-sm text-muted">{children}</p>;
}

export function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1.5 text-sm ${
            value === o
              ? "border-accent bg-accent text-on-accent"
              : "border-line text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function TypeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-full bg-bg p-1">
      {[
        ["gasto", "Gasto", "bg-expense"],
        ["ingreso", "Ingreso", "bg-income"],
      ].map(([k, label, bg]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            value === k ? `${bg} text-white` : "text-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Campo de monto: acepta coma o punto como decimal
export function AmountInput({ value, onChange, autoFocus }) {
  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder="0.00"
      value={value}
      autoFocus={autoFocus}
      onChange={(e) =>
        onChange(e.target.value.replace(",", ".").replace(/[^0-9.]/g, ""))
      }
      className={`${inputCls} text-3xl font-semibold`}
      aria-label="Monto en soles"
    />
  );
}

export const toAmount = (s) => Math.round(Number(s) * 100) / 100;

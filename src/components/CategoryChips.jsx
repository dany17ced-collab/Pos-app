import { useState } from "react";
import { Plus } from "lucide-react";
import { useCats } from "../lib/categories";
import { inputCls } from "./ui";

// Categorías para elegir, con la opción de crear una nueva en el momento
export default function CategoryChips({ type, value, onChange }) {
  const { names, colorOf, add } = useCats();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const list = names(type);

  const submit = () => {
    const name = text.trim().slice(0, 24);
    if (!name) return;
    const existing = list.find((n) => n.toLowerCase() === name.toLowerCase());
    if (existing) {
      onChange(existing);
    } else {
      add(type, name);
      onChange(name);
    }
    setText("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {list.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
              value === c ? "border-accent bg-accent text-on-accent" : "border-line text-ink"
            }`}
          >
            {type === "gasto" && (
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: colorOf("gasto", c) }}
              />
            )}
            {c}
          </button>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted"
        >
          <Plus size={14} /> Nueva
        </button>
      </div>
      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            maxLength={24}
            placeholder="Nombre de la categoría"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={`${inputCls} !py-2`}
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}

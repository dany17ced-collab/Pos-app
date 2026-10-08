import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Sheet, Segmented, inputCls } from "./ui";
import { useCats } from "../lib/categories";
import { PALETTE } from "../lib/constants";

export default function CategoriesSheet({ dispatch, onClose }) {
  const { list } = useCats();
  const [kind, setKind] = useState("gasto");
  const [openColor, setOpenColor] = useState(null);
  const [newName, setNewName] = useState("");
  const items = list(kind);

  const addNew = () => {
    const name = newName.trim().slice(0, 24);
    if (!name) return;
    if (items.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      window.alert("Ya existe una categoría con ese nombre.");
      return;
    }
    dispatch({ type: "ADD_CAT", kind, name });
    setNewName("");
  };

  return (
    <Sheet title="Categorías" onClose={onClose}>
      <Segmented
        value={kind}
        onChange={(k) => {
          setKind(k);
          setOpenColor(null);
        }}
        options={[
          ["gasto", "Gastos"],
          ["ingreso", "Ingresos"],
        ]}
      />

      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.name}>
            <div className="flex items-center gap-2">
              {kind === "gasto" ? (
                <button
                  onClick={() => setOpenColor(openColor === c.name ? null : c.name)}
                  aria-label={`Cambiar color de ${c.name}`}
                  className="h-7 w-7 shrink-0 rounded-full border-2 border-line"
                  style={{ background: c.color }}
                />
              ) : (
                <span
                  className="h-7 w-7 shrink-0 rounded-full"
                  style={{ background: "var(--income)" }}
                />
              )}
              <input
                defaultValue={c.name}
                maxLength={24}
                disabled={c.name === "Otros"}
                aria-label={`Nombre de ${c.name}`}
                onBlur={(e) => {
                  const to = e.target.value.trim();
                  if (!to || to === c.name) {
                    e.target.value = c.name;
                    return;
                  }
                  if (
                    items.some(
                      (x) => x.name !== c.name && x.name.toLowerCase() === to.toLowerCase()
                    )
                  ) {
                    window.alert("Ya existe una categoría con ese nombre.");
                    e.target.value = c.name;
                    return;
                  }
                  dispatch({ type: "RENAME_CAT", kind, from: c.name, to });
                }}
                className={`${inputCls} !py-2 disabled:opacity-60`}
              />
              {c.name !== "Otros" && (
                <button
                  onClick={() =>
                    window.confirm(
                      `¿Eliminar "${c.name}"? Sus movimientos pasarán a "Otros".`
                    ) && dispatch({ type: "DEL_CAT", kind, name: c.name })
                  }
                  aria-label={`Eliminar ${c.name}`}
                  className="p-1.5 text-muted"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            {kind === "gasto" && openColor === c.name && (
              <div className="mt-2 flex flex-wrap gap-2 pl-9">
                {PALETTE.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      dispatch({ type: "RECOLOR_CAT", kind, name: c.name, color: col });
                      setOpenColor(null);
                    }}
                    aria-label={`Color ${col}`}
                    className="h-7 w-7 rounded-full"
                    style={{
                      background: col,
                      outline: col === c.color ? "2px solid var(--ink)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          maxLength={24}
          placeholder="Nueva categoría (ej. Deporte)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNew()}
          className={inputCls}
        />
        <button
          onClick={addNew}
          disabled={!newName.trim()}
          className="rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-40"
        >
          Agregar
        </button>
      </div>
      <p className="text-xs text-muted">
        Al cambiar un nombre se actualizan tus movimientos. Si eliminas una categoría, sus
        movimientos pasan a "Otros", que no se puede borrar.
      </p>
    </Sheet>
  );
}

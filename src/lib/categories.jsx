import { createContext, useContext, useMemo } from "react";

const CatsContext = createContext(null);

export function CatsProvider({ categories, dispatch, children }) {
  const value = useMemo(() => {
    const list = (type) => categories[type === "ingreso" ? "ingreso" : "gasto"];
    const names = (type) => list(type).map((c) => c.name);
    return {
      expense: categories.gasto,
      list,
      names,
      colorOf: (type, name) =>
        type === "ingreso"
          ? "var(--income)"
          : categories.gasto.find((c) => c.name === name)?.color || "#8A9A98",
      // Devuelve la categoría preferida si existe; si no, la primera de la lista
      pick: (type, preferred) => (names(type).includes(preferred) ? preferred : names(type)[0]),
      add: (type, name) => dispatch({ type: "ADD_CAT", kind: type, name }),
    };
  }, [categories, dispatch]);

  return <CatsContext.Provider value={value}>{children}</CatsContext.Provider>;
}

export const useCats = () => useContext(CatsContext);

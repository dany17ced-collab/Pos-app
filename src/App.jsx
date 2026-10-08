import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Home as HomeIcon, List, Target, Menu, Plus, Wallet } from "lucide-react";
import { useStore } from "./lib/store";
import { MONTHS } from "./lib/constants";
import { monthKeyOf } from "./lib/format";
import TxSheet from "./components/TxSheet";
import Home from "./views/Home";
import Transactions from "./views/Transactions";
import Budget from "./views/Budget";
import Goals from "./views/Goals";
import More from "./views/More";

const TABS = [
  ["home", "Inicio", HomeIcon],
  ["tx", "Movimientos", List],
  ["budget", "Presupuesto", Wallet],
  ["goals", "Metas", Target],
  ["more", "Más", Menu],
];

function useTheme(theme) {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", dark ? "#0F1C1B" : "#EDF1EE");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}

const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

export default function App() {
  const [state, dispatch] = useStore();
  const [tab, setTab] = useState("home");
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [sheet, setSheet] = useState(null); // { tx: movimiento | null }

  useTheme(state.settings.theme);

  const mk = monthKeyOf(cursor.y, cursor.m);
  const monthTxs = useMemo(
    () => state.txs.filter((t) => t.date.startsWith(mk)).sort(byDateDesc),
    [state.txs, mk]
  );

  const moveMonth = (d) =>
    setCursor((c) => {
      const n = new Date(c.y, c.m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });

  const saveTx = (tx) => {
    dispatch({ type: tx.id ? "UPDATE_TX" : "ADD_TX", tx });
    const [y, m] = tx.date.split("-").map(Number);
    setCursor({ y, m: m - 1 });
    setSheet(null);
  };

  const showMonth = tab === "home" || tab === "tx" || tab === "budget";
  const showFab = tab === "home" || tab === "tx";

  return (
    <div className="mx-auto min-h-screen max-w-md pb-36">
      <header className="flex items-center justify-between px-5 pb-3 pt-6">
        {showMonth ? (
          <>
            <button
              onClick={() => moveMonth(-1)}
              aria-label="Mes anterior"
              className="rounded-full bg-card p-2"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <div className="text-xl font-semibold">{MONTHS[cursor.m]}</div>
              <div className="text-xs text-muted">{cursor.y}</div>
            </div>
            <button
              onClick={() => moveMonth(1)}
              aria-label="Mes siguiente"
              className="rounded-full bg-card p-2"
            >
              <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <h1 className="text-xl font-semibold">
            {TABS.find(([k]) => k === tab)[1]}
          </h1>
        )}
      </header>

      <main>
        {tab === "home" && (
          <Home
            monthTxs={monthTxs}
            allTxs={state.txs}
            budgets={state.budgets}
            cursor={cursor}
          />
        )}
        {tab === "tx" && (
          <Transactions
            monthTxs={monthTxs}
            cursor={cursor}
            onEdit={(tx) => setSheet({ tx })}
          />
        )}
        {tab === "budget" && (
          <Budget monthTxs={monthTxs} budgets={state.budgets} dispatch={dispatch} />
        )}
        {tab === "goals" && <Goals goals={state.goals} dispatch={dispatch} />}
        {tab === "more" && <More state={state} dispatch={dispatch} />}
      </main>

      {showFab && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-md">
          <button
            onClick={() => setSheet({ tx: null })}
            aria-label="Agregar movimiento"
            className="pointer-events-auto ml-auto mr-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg"
          >
            <Plus size={26} />
          </button>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-current={tab === k ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                tab === k ? "text-ink" : "text-muted"
              }`}
            >
              <Icon size={20} strokeWidth={tab === k ? 2.4 : 1.8} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {sheet && (
        <TxSheet
          initial={sheet.tx}
          onClose={() => setSheet(null)}
          onSave={saveTx}
          onDelete={(id) => {
            dispatch({ type: "DEL_TX", id });
            setSheet(null);
          }}
        />
      )}
    </div>
  );
}

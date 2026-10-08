import { useState } from "react";
import { Segmented } from "../components/ui";
import Variables from "./Variables";
import Fixed from "./Fixed";
import Budget from "./Budget";

export default function Spending({ state, monthTxs, cursor, dispatch, onEdit }) {
  const [seg, setSeg] = useState("variables");
  return (
    <div className="space-y-4">
      <div className="px-5">
        <Segmented
          value={seg}
          onChange={setSeg}
          options={[
            ["variables", "Variables"],
            ["fijos", "Fijos"],
            ["presupuesto", "Presupuesto"],
          ]}
        />
      </div>
      {seg === "variables" && (
        <Variables
          monthTxs={monthTxs}
          allTxs={state.txs}
          noSpendDays={state.noSpendDays}
          cursor={cursor}
          dispatch={dispatch}
          onEdit={onEdit}
        />
      )}
      {seg === "fijos" && (
        <Fixed recurring={state.recurring} cursor={cursor} dispatch={dispatch} />
      )}
      {seg === "presupuesto" && (
        <Budget monthTxs={monthTxs} budgets={state.budgets} dispatch={dispatch} />
      )}
    </div>
  );
}

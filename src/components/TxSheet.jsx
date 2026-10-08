import { useState } from "react";
import {
  Sheet, PrimaryButton, GhostButton, Chips, TypeToggle, AmountInput, inputCls, toAmount,
} from "./ui";
import { EXPENSE_CATS, INCOME_CATS, ACCOUNTS } from "../lib/constants";
import { todayISO } from "../lib/format";

export default function TxSheet({ initial, onSave, onDelete, onClose }) {
  const [type, setType] = useState(initial?.type || "gasto");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category || "Comida");
  const [account, setAccount] = useState(initial?.account || ACCOUNTS[0]);
  const [note, setNote] = useState(initial?.note || "");
  const [date, setDate] = useState(initial?.date || todayISO());

  const cats = type === "gasto" ? Object.keys(EXPENSE_CATS) : INCOME_CATS;
  const valid = toAmount(amount) > 0 && date;

  const changeType = (t) => {
    setType(t);
    setCategory(t === "gasto" ? "Comida" : "Sueldo");
  };

  return (
    <Sheet title={initial ? "Editar movimiento" : "Nuevo movimiento"} onClose={onClose}>
      <TypeToggle value={type} onChange={changeType} />
      <AmountInput value={amount} onChange={setAmount} autoFocus={!initial} />
      <Chips options={cats} value={category} onChange={setCategory} />
      <select
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        className={inputCls}
        aria-label="Cuenta"
      >
        {ACCOUNTS.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Nota (opcional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={inputCls}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={inputCls}
        aria-label="Fecha"
      />
      <PrimaryButton
        disabled={!valid}
        onClick={() =>
          onSave({
            ...(initial || {}),
            type,
            amount: toAmount(amount),
            category,
            account,
            note: note.trim(),
            date,
          })
        }
      >
        Guardar
      </PrimaryButton>
      {initial && (
        <GhostButton
          className="text-over"
          onClick={() => window.confirm("¿Eliminar este movimiento?") && onDelete(initial.id)}
        >
          Eliminar
        </GhostButton>
      )}
    </Sheet>
  );
}

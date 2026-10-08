export const money = (n) =>
  "S/ " +
  Number(n || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const pad = (n) => String(n).padStart(2, "0");

export const isoOf = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Fecha local (no UTC) para que de noche no cambie al día siguiente
export const todayISO = () => isoOf(new Date());

// Se usa el mediodía para evitar problemas con cambios de horario
export const dateOf = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};

export const addDays = (iso, n) => {
  const d = dateOf(iso);
  d.setDate(d.getDate() + n);
  return isoOf(d);
};

export const monthKeyOf = (y, m) => `${y}-${pad(m + 1)}`;

export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const dayLabel = (iso) =>
  dateOf(iso).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const shortDate = (iso) =>
  dateOf(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

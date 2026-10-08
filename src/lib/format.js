export const money = (n) =>
  "S/ " +
  Number(n || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const pad = (n) => String(n).padStart(2, "0");

// Fecha local (no UTC) para que de noche no cambie al día siguiente
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const monthKeyOf = (y, m) => `${y}-${pad(m + 1)}`;

export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const dayLabel = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

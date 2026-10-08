export const EXPENSE_CATS = {
  Comida: "#D9822B",
  Transporte: "#3E7CB1",
  Vivienda: "#7A5C99",
  Servicios: "#4FA3A5",
  Salud: "#C9546B",
  Educación: "#5B6FBF",
  Ocio: "#E0B33B",
  Compras: "#6C8E3E",
  Otros: "#8A9A98",
};

export const INCOME_CATS = ["Sueldo", "Extra", "Otros"];

export const ACCOUNTS = ["Efectivo", "Débito", "Tarjeta de crédito", "Yape / Plin"];

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const catColor = (type, cat) =>
  type === "ingreso" ? "var(--income)" : EXPENSE_CATS[cat] || "#8A9A98";

// Colores fijos para las gráficas (se ven bien en modo claro y oscuro)
export const CHART = { income: "#2E9C8B", expense: "#E0902F" };

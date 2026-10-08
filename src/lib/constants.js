// Categorías iniciales (el usuario puede agregar, renombrar, recolorear y eliminar)
export const DEFAULT_CATS = {
  gasto: [
    { name: "Comida", color: "#D9822B" },
    { name: "Transporte", color: "#3E7CB1" },
    { name: "Vivienda", color: "#7A5C99" },
    { name: "Servicios", color: "#4FA3A5" },
    { name: "Salud", color: "#C9546B" },
    { name: "Educación", color: "#5B6FBF" },
    { name: "Ocio", color: "#E0B33B" },
    { name: "Compras", color: "#6C8E3E" },
    { name: "Deporte", color: "#E2725B" },
    { name: "Otros", color: "#8A9A98" },
  ],
  ingreso: [
    { name: "Sueldo", color: "#2E9C8B" },
    { name: "Extra", color: "#3E7CB1" },
    { name: "Otros", color: "#8A9A98" },
  ],
};

export const PALETTE = [
  "#D9822B", "#3E7CB1", "#7A5C99", "#4FA3A5", "#C9546B", "#5B6FBF",
  "#E0B33B", "#6C8E3E", "#E2725B", "#2E9C8B", "#A0522D", "#8A9A98",
];

export const ACCOUNTS = ["Efectivo", "Débito", "Tarjeta de crédito", "Yape / Plin"];

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];


// Colores fijos para las gráficas (se ven bien en modo claro y oscuro)
export const CHART = { income: "#2E9C8B", expense: "#E0902F" };

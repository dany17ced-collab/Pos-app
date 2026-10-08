# Mis Finanzas

App de control financiero personal en **soles (S/)**. Funciona en el navegador, se puede instalar en el celular y también sin internet. Tus datos se guardan solo en tu dispositivo.

## Qué incluye

- **Inicio:** disponible del mes, ingresos vs. gastos, gráfica por categoría, comparación de los últimos 6 meses y alertas de presupuesto.
- **Movimientos:** registro de gastos e ingresos con categoría, cuenta (efectivo, débito, tarjeta, Yape/Plin), nota y fecha. Búsqueda y filtros. Se pueden editar y eliminar.
- **Gastos → Variables:** registro diario hasta del gasto más pequeño, con calendario del mes que marca los días sin registrar, racha de días seguidos y botón "No gasté nada".
- **Gastos → Fijos:** gastos que se repiten cada mes o cada semana; se registran solos y ves cuánto ya pasó y cuánto falta del mes.
- **Gastos → Presupuesto:** límite mensual por categoría con barra de avance.
- **Metas de ahorro:** aportes, retiros y cuánto necesitas ahorrar al mes para llegar a la fecha.
- **Categorías editables:** agrega las tuyas (deporte, mascotas, etc.) al registrar un gasto con "+ Nueva", o en Más → Editar categorías para renombrar, cambiar color o eliminar.
- **Datos:** exportar a Excel/CSV, copia de respaldo y restauración (JSON), modo claro/oscuro.

## Probarla en tu computadora

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que aparece en la terminal (normalmente http://localhost:5173).

Para generar la versión final: `npm run build` (queda en la carpeta `dist`).

## Publicarla gratis en GitHub Pages

1. Crea un repositorio en GitHub y sube todo este proyecto a la rama `main`.
2. En el repositorio ve a **Settings → Pages** y en **Source** elige **GitHub Actions**.
3. Cada vez que hagas `push` a `main`, se compila y publica sola. La dirección será `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

Puedes seguir el avance en la pestaña **Actions** del repositorio.

## Instalarla en el celular

Abre la dirección publicada en el navegador del celular:

- **Android (Chrome):** menú ⋮ → *Instalar aplicación*.
- **iPhone (Safari):** botón Compartir → *Agregar a pantalla de inicio*.

## Descargar el APK (Android)

Cada `push` a `main` compila un APK automáticamente:

1. En GitHub abre la pestaña **Actions** y entra a la última ejecución de **Compilar APK de Android** (tarda unos 5 minutos).
2. Baja hasta **Artifacts** y descarga **finanzas-apk** (viene en un .zip).
3. Descomprime el zip en el celular y abre `app-debug.apk`. Android pedirá permitir instalar apps de origen desconocido.

Dentro del APK, exportar y crear copias de respaldo abre el menú de compartir de Android para guardar el archivo donde quieras.

## Importante sobre tus datos

Los datos viven en el almacenamiento del navegador de cada dispositivo. No se sincronizan entre celular y computadora, y se pierden si borras los datos del navegador. Usa **Más → Crear copia de respaldo** con regularidad.

## Ideas para seguir

Deudas y tarjetas con fecha de pago, varias monedas (soles y dólares), sincronización en la nube, gastos compartidos, escaneo de recibos.

## Estructura

```
src/
  App.jsx            Estructura general y navegación
  lib/               Datos (store), formato, constantes, exportación
  components/        Piezas reutilizables y formulario de movimientos
  views/             Pantallas: Inicio, Movimientos, Presupuesto, Metas, Más
public/              Íconos, manifest y service worker (modo sin internet)
.github/workflows/   Publicación automática en GitHub Pages
```

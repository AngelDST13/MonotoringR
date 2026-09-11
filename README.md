# Sistema de Auto-Sincronización de Datos (Auto-Refresh)

Laboratorio de **Automatización en React** — Vite + React + Tailwind CSS.

## ¿Qué hace?

Simula un panel que se sincroniza solo con un "servidor" (mockeado) cada
cierto intervalo configurable, guarda el último snapshot en
`localStorage`, y refleja visualmente el ciclo completo de la
automatización: `inactivo → ejecutando → éxito | error`.

## Instalación

```bash
npm install
npm run dev
```

Luego abre la URL que muestra Vite (por defecto `http://localhost:5173`).

## Estructura

```
src/
├── App.jsx                      # Lógica: useState, useEffect, setInterval, localStorage
├── components/
│   ├── AutomationControls.jsx   # Iniciar/pausar, cambiar intervalo, badge de estado
│   └── DataViewer.jsx           # Renderizado condicional por estado
├── services/
│   └── mockApi.js               # API simulada (Promise + setTimeout, con % de error)
└── index.css                    # Tailwind + animación del spinner
```

## Requisitos técnicos cubiertos

- **Hooks**: `useState` (estado, activo, intervalo, datos, error, timestamp) y
  `useEffect` (temporizador del auto-refresh).
- **Limpieza de efectos**: `return () => clearInterval(id)` dentro del
  `useEffect`, evita temporizadores duplicados al pausar, cambiar el
  intervalo o desmontar el componente.
- **Disparador (trigger)**: `setInterval` configurable (5s / 10s / 20s).
- **Asíncrono**: `async/await` + `fetch` simulado en `mockApi.js`.
- **Estados de la automatización**: `inactivo`, `ejecutando`, `exito`, `error`,
  gestionados explícitamente con `useState` y renderizados de forma
  condicional en `DataViewer`.
- **Componentización**: `AutomationControls` y `DataViewer` son componentes
  reutilizables y desacoplados de la lógica de negocio (reciben todo por
  props).
- **Persistencia**: cada sincronización exitosa se guarda en
  `localStorage` (`auto-sync:ultimo-snapshot`), y se recupera al recargar
  la página.

## Ajustar la tasa de error simulada

En `src/services/mockApi.js`, la función `fetchDatosSimulados(errorRate)`
recibe la probabilidad de fallo (0 a 1). En `App.jsx` se llama con `0.2`
(20% de probabilidad) para poder probar fácilmente el estado `error` y el
botón de reintento manual.

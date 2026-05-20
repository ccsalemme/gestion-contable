# Frontend - Plataforma de Gestión Contable Multiempresa

React + Vite + TypeScript + Handsontable + TailwindCSS

## Estructura

```
src/
├── api/              # Clientes HTTP y configuración
├── auth/             # Contexto y hooks de autenticación
├── components/       # Componentes reutilizables
├── features/         # Módulos de funcionalidades
├── hooks/            # Custom hooks
├── layouts/          # Layouts de página
├── pages/            # Páginas/vistas
├── routes/           # Configuración de rutas
├── services/         # Servicios de negocio
├── store/            # Estado global (Zustand)
├── styles/           # Estilos globales
├── types/            # Tipos TypeScript
└── utils/            # Utilidades
```

## Primeros pasos

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Lint & Format

```bash
npm run lint
npm run lint:fix
npm run format
```

## Type Check

```bash
npm run type-check
```

## Características

- ✅ React 18 con Fast Refresh
- ✅ TypeScript estricto
- ✅ Handsontable para tablas tipo spreadsheet
- ✅ TailwindCSS para estilos
- ✅ React Router para navegación
- ✅ Zustand para estado global
- ✅ Axios para HTTP
- ✅ React Hook Form para formularios
- ✅ ESLint + Prettier

## Variables de entorno

Ver `.env.example`

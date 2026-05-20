# Backend - Plataforma de Gestión Contable Multiempresa

NestJS + TypeScript + TypeORM + Supabase PostgreSQL

## Estructura

```
src/
├── auth/              # Autenticación y JWT
├── users/             # Gestión de usuarios
├── tenants/           # Gestión de empresas/tenants
├── permissions/       # Control de permisos
├── sheets/            # Integración con Google Sheets
├── spreadsheet/       # Datos de spreadsheet
├── logs/              # Auditoría y logs
├── common/            # Excepciones y utilidades
├── config/            # Configuración
├── database/          # Configuración DB
├── guards/            # Guards de autenticación
├── interceptors/      # Interceptors
├── middlewares/       # Middlewares
├── dto/               # DTOs
└── entities/          # Entidades TypeORM
```

## Primeros pasos

```bash
cd backend
npm install
npm run dev
```

## Build

```bash
npm run build
npm run prod
```

## Testing

```bash
npm run test
npm run test:watch
npm run test:cov
```

## Lint

```bash
npm run lint
```

## API Endpoints

Base URL: `http://localhost:3001/api`

### Auth
- POST `/auth/login` - Login
- POST `/auth/register` - Registrar usuario
- POST `/auth/refresh` - Renovar token

### Users
- GET `/users` - Listar usuarios
- GET `/users/:id` - Obtener usuario
- POST `/users` - Crear usuario
- PUT `/users/:id` - Actualizar usuario
- DELETE `/users/:id` - Eliminar usuario

### Tenants
- GET `/tenants` - Listar empresas
- GET `/tenants/:id` - Obtener empresa
- POST `/tenants` - Crear empresa
- PUT `/tenants/:id` - Actualizar empresa

### Spreadsheet Data
- GET `/spreadsheet/:tenantId` - Obtener datos
- POST `/spreadsheet/:tenantId/sync` - Sincronizar
- PUT `/spreadsheet/:tenantId/cell` - Actualizar celda

## Características

- ✅ NestJS modular
- ✅ TypeScript estricto
- ✅ JWT authentication
- ✅ TypeORM + PostgreSQL
- ✅ Role-based access control
- ✅ DTOs y validación
- ✅ Google Sheets API integration
- ✅ Logging
- ✅ Error handling

## Variables de entorno

Ver `.env.example`

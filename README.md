# README - Plataforma de Gestión Contable Multiempresa

Plataforma web empresarial, escalable y segura para gestionar información financiera multiempresa con Google Sheets como fuente de datos.

## 🎯 Características

- ✅ **Multiempresa**: Separación completa de datos por empresa
- ✅ **Autenticación Segura**: JWT + bcrypt
- ✅ **Roles y Permisos**: SUPER_ADMIN, ADMIN_CLIENT, USER_FINAL
- ✅ **Spreadsheet UI**: Experiencia similar a Google Sheets
- ✅ **Integración Google Sheets**: Datos financieros sincronizados
- ✅ **API REST**: Endpoints bien documentados
- ✅ **TypeScript**: Código fuertemente tipado
- ✅ **Escalable**: Arquitectura preparada para crecimiento

## 🚀 Quick Start

### Requisitos

- Node.js >= 18
- npm >= 9
- PostgreSQL 12+

### Instalación

```bash
# Clonar repositorio
git clone <repository>
cd plataforma-gestion-contable-multiempresa

# Instalar dependencias
npm install

# Crear archivos .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Configurar base de datos
# 1. Crear database PostgreSQL
# 2. Actualizar credenciales en backend/.env
```

### Desarrollo

```bash
# Ambos (frontend + backend)
npm run dev

# Frontend solo (puerto 3000)
npm run dev:frontend

# Backend solo (puerto 3001)
npm run dev:backend
```

### URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 📁 Estructura

```
.
├── frontend/              React + Vite + TailwindCSS
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── store/
│   │   └── styles/
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/               NestJS + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tenants/
│   │   ├── permissions/
│   │   ├── sheets/
│   │   ├── spreadsheet/
│   │   ├── logs/
│   │   ├── entities/
│   │   └── main.ts
│   ├── test/
│   └── package.json
│
├── docs/                  Documentación
│   ├── PROJECT.md
│   ├── API.md
│   ├── DEVELOPMENT.md
│   └── ADR.md
│
└── package.json          Root (monorepo)
```

## 🔧 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| React | 18 | UI Framework |
| Vite | 5 | Build Tool |
| TypeScript | 5 | Lenguaje |
| TailwindCSS | 3 | Styling |
| Handsontable | 14 | Spreadsheet |
| React Router | 6 | Routing |
| Zustand | 4 | State Management |
| Axios | 1 | HTTP Client |

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| NestJS | 10 | Framework |
| TypeScript | 5 | Lenguaje |
| TypeORM | 0.3 | ORM |
| PostgreSQL | 12+ | Database |
| JWT | - | Auth |
| Passport | 0.7 | Auth Middleware |
| Swagger | 7 | API Docs |

## 📋 API Endpoints

### Autenticación
```
POST   /api/auth/login       - Login
POST   /api/auth/register    - Registrar
```

### Usuarios
```
GET    /api/users            - Listar usuarios
POST   /api/users            - Crear usuario
GET    /api/users/:id        - Obtener usuario
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario
```

### Empresas
```
GET    /api/tenants          - Listar empresas
POST   /api/tenants          - Crear empresa
GET    /api/tenants/:id      - Obtener empresa
PUT    /api/tenants/:id      - Actualizar empresa
DELETE /api/tenants/:id      - Eliminar empresa
```

### Datos Spreadsheet
```
GET    /api/spreadsheet/:id  - Obtener datos
POST   /api/spreadsheet/:id/sync - Sincronizar
PUT    /api/spreadsheet/:id/cell - Actualizar celda
```

Documentación completa en: http://localhost:3001/api/docs

## 🔐 Seguridad

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ CORS Configuration
- ✅ Input Validation
- ✅ Role-Based Access Control
- ✅ Environment Variables
- ✅ Error Handling

## 🧪 Testing

```bash
# Backend
npm run test:backend
npm run test:backend -- --watch
npm run test:backend -- --cov

# Frontend
npm run test:frontend
npm run test:frontend -- --watch
```

## 📦 Build

```bash
# Frontend
npm run build:frontend

# Backend
npm run build:backend

# Ambos
npm run build
```

## 🐛 Troubleshooting

### Error de conexión a BD
1. Verificar PostgreSQL está corriendo
2. Validar credenciales en `.env`
3. Crear database si no existe

### Puerto en uso
```bash
# Windows
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3001
kill -9 <PID>
```

### Dependencias perdidas
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentación

- [PROJECT.md](docs/PROJECT.md) - Descripción general
- [API.md](docs/API.md) - API endpoints
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Guía para desarrolladores
- [ADR.md](docs/ADR.md) - Decisiones de arquitectura

## 🤝 Contribuir

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes y commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/feature-name`
4. Create Pull Request

## 📝 Licencia

Propietario - Todos los derechos reservados

## 🔗 Enlaces

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

## 📞 Soporte

Para reportar issues o sugerencias, crear un GitHub Issue.

---

**Versión**: 0.1.0  
**Última actualización**: Enero 2025

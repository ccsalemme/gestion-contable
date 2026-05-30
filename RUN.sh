#!/bin/bash
# Ejecuta este archivo desde Git Bash: ./RUN.sh

echo "🚀 Iniciando aplicación..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del proyecto raíz..."
    npm install --legacy-peer-deps
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd frontend && npm install --legacy-peer-deps && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend && npm install --legacy-peer-deps && cd ..
fi

echo ""
echo "✅ Dependencias listas"
echo ""
echo "🔥 Iniciando servicios..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "💡 Presiona Ctrl+C para detener"
echo ""

# Ejecutar
npm run dev

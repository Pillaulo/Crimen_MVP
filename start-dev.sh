#!/bin/bash

echo "🚀 Iniciando servidor y frontend..."

# Iniciar servidor en background
npm run server &
SERVER_PID=$!

# Esperar un poco para que el servidor inicie
sleep 2

# Iniciar frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servidor API: http://localhost:3001"
echo "✅ Frontend: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Esperar a que se presione Ctrl+C
trap "kill $SERVER_PID $FRONTEND_PID; exit" INT
wait




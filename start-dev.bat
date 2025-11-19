@echo off
echo Iniciando servidor y frontend...
start "Servidor API" cmd /k "npm run server"
timeout /t 2 /nobreak >nul
start "Frontend Vite" cmd /k "npm run dev"
echo.
echo Servidor API: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para cerrar esta ventana (los servidores seguirán corriendo)
pause >nul




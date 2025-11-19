# Instrucciones para ejecutar el proyecto

## Paso 1: Instalar dependencias (si no lo has hecho)

```bash
npm install
```

## Paso 2: Iniciar el servidor

**Opción A: Usar el script de Windows (más fácil)**
- Doble clic en `start-dev.bat`
- O desde PowerShell/CMD: `.\start-dev.bat`

**Opción B: Manualmente en dos terminales**

Terminal 1 - Servidor API:
```bash
npm run server
```

Deberías ver:
```
🚀 Servidor API corriendo en http://localhost:3001
📁 Archivo de datos: ...
✅ Servidor listo para recibir peticiones
```

Terminal 2 - Frontend (espera 2-3 segundos después de iniciar el servidor):
```bash
npm run dev
```

**Opción C: Todo junto**
```bash
npm run dev:all
```

## Paso 3: Verificar que funciona

1. Abre tu navegador
2. Ve a: `http://localhost:3001/api/health`
3. Deberías ver: `{"status":"ok","message":"Servidor API funcionando correctamente"}`
4. Luego ve a: `http://localhost:5173` para la aplicación

## Solución de problemas

### Error: "Cannot find package 'express'"
**Solución:** Ejecuta `npm install` primero

### Error: "El puerto 3001 ya está en uso"
**Solución:** 
- Cierra cualquier aplicación que esté usando el puerto 3001
- O cambia el puerto en `server.js` (línea 11)

### Error: "ERR_CONNECTION_REFUSED"
**Solución:**
- Asegúrate de que el servidor esté corriendo (`npm run server`)
- Verifica que veas el mensaje "✅ Servidor listo para recibir peticiones"
- Espera unos segundos antes de abrir el navegador

### La página no carga
**Solución:**
- Verifica que ambos servidores estén corriendo (servidor en puerto 3001, frontend en 5173)
- Revisa la consola del navegador (F12) para ver errores
- Asegúrate de que no haya errores en las terminales




# Reportes de Seguridad Ciudadana - Viña del Mar

MVP funcional de una aplicación web para reportes de seguridad ciudadana específicamente para Viña del Mar, Chile.

## 🚀 Stack Tecnológico

- **Lenguaje**: JavaScript
- **Framework Frontend**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Estilos**: TailwindCSS 3.3.6
- **Mapas**: Leaflet 1.9.4 + React-Leaflet 4.2.1
- **Backend**: Express.js (servidor API como intermediario)
- **Persistencia**: Archivo JSON (`src/data/reportes.json`)

## 🏛️ Arquitectura del Sistema

Este proyecto utiliza una arquitectura cliente-servidor donde el servidor Express actúa como **intermediario** entre el navegador y el sistema de archivos.

### ¿Por qué necesitamos un servidor intermediario?

Los navegadores web tienen restricciones de seguridad que **impiden que JavaScript escriba archivos directamente** en el sistema de archivos de la computadora. Por esta razón, necesitamos un servidor que:

1. **Reciba peticiones** del navegador (frontend)
2. **Lea y escriba** archivos en el sistema de archivos
3. **Devuelva respuestas** al navegador

### Diagrama de Arquitectura

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install
```

Esto instalará:
- React y React-DOM
- Vite y plugin de React
- TailwindCSS, PostCSS y Autoprefixer
- Leaflet y React-Leaflet
- Express.js y CORS (para el servidor API)
- Concurrently (para ejecutar servidor y frontend juntos)

### 2. Ejecutar en modo desarrollo

**Opción A: Ejecutar servidor y frontend juntos (recomendado)**

```bash
npm run dev:all
```

Esto iniciará:
- Servidor API en `http://localhost:3001`
- Frontend en `http://localhost:5173`

**Opción B: Ejecutar por separado**

En una terminal:
```bash
npm run server
```

En otra terminal:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` y el servidor API en `http://localhost:3001`

**Opción C: Scripts alternativos para Windows**

Si `npm run dev:all` no funciona en Windows, puedes usar:

- **Windows (PowerShell/CMD)**: Doble clic en `start-dev.bat` o ejecutar desde terminal:
  ```bash
  start-dev.bat
  ```

- **Linux/Mac**: 
  ```bash
  chmod +x start-dev.sh
  ./start-dev.sh
  ```

### 🔍 Verificar que el servidor está funcionando

Puedes verificar que el servidor API está funcionando visitando:
- `http://localhost:3001/api/health` - Debe mostrar `{"status":"ok",...}`

### ⚠️ Solución de problemas

**Error: "No se pudo conectar con el servidor"**
- Asegúrate de que el servidor esté corriendo (`npm run server` o `npm run dev:all`)
- Verifica que el puerto 3001 no esté en uso por otra aplicación

**Error: "El puerto 3001 ya está en uso"**
- Cierra la aplicación que está usando el puerto 3001
- O cambia el puerto en `server.js` (línea 11) y actualiza `vite.config.js` también

**La página no carga con `npm run dev:all`**
- Espera unos segundos a que ambos servidores inicien
- Verifica que no haya errores en la consola
- Intenta ejecutar servidor y frontend por separado (Opción B)

### 3. Construir para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

### 4. Previsualizar build de producción

```bash
npm run preview
```

## 🏗️ Estructura del Proyecto

```
MVP/
├── src/
│   ├── components/
│   │   ├── FormReporte.jsx      # Formulario para crear reportes
│   │   └── MapaSelector.jsx      # Mapa interactivo con Leaflet
│   ├── data/
│   │   ├── reportsStore.js      # Store con llamadas a API
│   │   └── reportes.json        # Archivo JSON con los datos
│   ├── pages/
│   │   └── Home.jsx             # Página principal
│   ├── App.jsx                  # Componente raíz
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales + Tailwind
├── server.js                    # Servidor Express para API
├── index.html                   # HTML principal
├── package.json                 # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
├── tailwind.config.js          # Configuración de TailwindCSS
└── postcss.config.js           # Configuración de PostCSS
```

## 🔄 Flujo de Datos

### 1. Selección de Ubicación

```
Usuario → Clic en mapa / Botón GPS → MapaSelector.jsx
  → Actualiza estado `selectedPosition` → FormReporte.jsx recibe posición
```

### 2. Creación de Reporte

```
Usuario llena formulario → FormReporte.jsx valida datos
  → onSubmit() → Home.jsx.handleSubmitReporte()
  → addReport() en reportsStore.js → POST /api/reportes
  → server.js guarda en src/data/reportes.json
  → Actualiza estado `reportes` → Re-renderiza lista
```

### 3. Visualización de Reportes

```
Home.jsx → getReports() desde reportsStore.js
  → GET /api/reportes → server.js lee reportes.json
  → Mapea reportes → Renderiza lista con detalles
```

## 📝 Funcionalidades

### Formulario de Reporte
- ✅ Select con 14 tipos de aviso predefinidos
- ✅ Textarea para descripción (obligatorio)
- ✅ Input de archivo para foto opcional (convierte a base64)
- ✅ Validaciones: tipo_aviso, descripción y ubicación obligatorios

### Mapa Interactivo
- ✅ Centrado en Viña del Mar (lat: -33.0245, lng: -71.5520)
- ✅ Clic en mapa para seleccionar ubicación
- ✅ Botón "Usar mi ubicación" con GPS
- ✅ Marcador visual en ubicación seleccionada
- ✅ Muestra coordenadas (lat/lng)

### Lista de Reportes
- ✅ Muestra todos los reportes ingresados
- ✅ Ordenados del más reciente al más antiguo
- ✅ Muestra: tipo, descripción, fecha, coordenadas, foto (si existe)
- ✅ Scroll automático para muchos reportes

## 💾 Almacenamiento de Datos

Los reportes se guardan en `src/data/reportes.json`. Este archivo:
- Se crea automáticamente si no existe
- Persiste los datos entre sesiones
- Puede ser accedido directamente sin tener la página abierta
- Se actualiza cada vez que se crea un nuevo reporte

**Estructura del archivo:**
```json
{
  "reports": [
    {
      "id": 1,
      "tipo_aviso": "Robo por sorpresa",
      "descripcion": "...",
      "latitud": -33.025,
      "longitud": -71.552,
      "fecha_reporte": "2025-01-17T12:45:00Z",
      "foto": "data:image/jpeg;base64,..." // o null
    }
  ],
  "nextId": 2
}
```

## 🔮 Preparación para Backend Futuro

El código está preparado para migrar fácilmente a un backend en Python (FastAPI):

### 1. **reportsStore.js**
```javascript
// Ya usa llamadas a API REST
// POST /api/reportes - Crear reporte
// GET /api/reportes - Obtener todos
// GET /api/reportes/{id} - Obtener por ID
// FUTURO: GET /api/reportes/analisis - Análisis con IA
```

### 2. **FormReporte.jsx**
```javascript
// FUTURO: Enviar datos mediante POST a /api/reportes
// El backend validará, almacenará en PostgreSQL
// y ejecutará análisis con modelos de IA
```

### 3. **Home.jsx**
```javascript
// FUTURO: Llamadas a API REST
// GET /api/reportes para cargar al iniciar
// POST /api/reportes para crear nuevos
// WebSocket o polling para actualizaciones en tiempo real
```

### Estructura de Datos Compatible

La estructura JSON actual es compatible con el futuro backend:

```json
{
  "id": 1,
  "tipo_aviso": "Robo por sorpresa",
  "descripcion": "Descripción del usuario",
  "latitud": -33.025,
  "longitud": -71.552,
  "fecha_reporte": "2025-11-17T12:45:00Z",
  "foto": "data:image/jpeg;base64,..." // o null
}
```

### Backend Futuro (Python + FastAPI)

El backend futuro incluirá:
- **API REST** con FastAPI
- **Base de datos** PostgreSQL o Supabase
- **Modelos de IA** (scikit-learn) para:
  - Clustering geoespacial de incidentes
  - Predicción de zonas de riesgo
  - Análisis de patrones temporales
  - Detección de anomalías

## 🎨 Características de UI/UX

- Diseño responsive (mobile-first)
- Interfaz limpia y moderna con TailwindCSS
- Feedback visual en validaciones
- Preview de fotos antes de enviar
- Marcadores interactivos en el mapa
- Lista de reportes con scroll automático

## 📱 Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Soporte para geolocalización (GPS)
- Responsive para móviles y tablets

## 🔒 Notas de Seguridad

- **MVP**: Los datos se almacenan en un archivo JSON local
- **Futuro**: El backend implementará autenticación, validación de datos, y almacenamiento seguro en PostgreSQL
- **Nota**: El servidor actual es solo para desarrollo. En producción se requiere un backend robusto con autenticación y validación adecuada

## 📄 Licencia

Este es un MVP de desarrollo. Todos los derechos reservados.

---

**Desarrollado para Viña del Mar, Chile** 🇨🇱



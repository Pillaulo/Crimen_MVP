import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Permitir fotos en base64

// Ruta de salud para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor API funcionando correctamente' });
});

// Ruta al archivo JSON
const DATA_DIR = path.join(__dirname, 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'reportes.json');

// Asegurar que el directorio y archivo existen
function ensureDataFile() {
  try {
    // Crear directorio si no existe
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Crear o reparar archivo si no existe o está vacío/corrupto
    let needsInit = false;
    
    if (!fs.existsSync(DATA_FILE)) {
      needsInit = true;
      console.log('📝 Archivo no existe, creando...');
    } else {
      // Verificar si el archivo está vacío o corrupto
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8').trim();
      if (fileContent === '' || fileContent === '{}') {
        needsInit = true;
        console.log('⚠️ Archivo vacío o corrupto, reinicializando...');
      } else {
        // Intentar parsear para verificar que es válido
        try {
          JSON.parse(fileContent);
        } catch (e) {
          needsInit = true;
          console.log('⚠️ Archivo JSON corrupto, reinicializando...');
        }
      }
    }
    
    if (needsInit) {
      const initialData = {
        reports: [],
        nextId: 1
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('✅ Archivo de datos inicializado:', DATA_FILE);
    }
  } catch (error) {
    console.error('❌ Error al inicializar archivo de datos:', error);
    throw error;
  }
}

// Función auxiliar para leer y validar el archivo JSON
function readDataFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      ensureDataFile();
    }
    
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8').trim();
    
    // Si está vacío, reinicializar
    if (fileContent === '' || fileContent === '{}') {
      console.log('⚠️ Archivo vacío detectado, reinicializando...');
      ensureDataFile();
      return { reports: [], nextId: 1 };
    }
    
    const jsonData = JSON.parse(fileContent);
    
    // Validar estructura
    if (!jsonData.reports || !Array.isArray(jsonData.reports)) {
      console.log('⚠️ Estructura inválida, reinicializando...');
      ensureDataFile();
      return { reports: [], nextId: 1 };
    }
    
    if (typeof jsonData.nextId !== 'number') {
      jsonData.nextId = jsonData.reports.length > 0 
        ? Math.max(...jsonData.reports.map(r => r.id || 0)) + 1 
        : 1;
    }
    
    return jsonData;
  } catch (error) {
    console.error('❌ Error al leer archivo, reinicializando...', error);
    ensureDataFile();
    return { reports: [], nextId: 1 };
  }
}

// Inicializar archivo al iniciar el servidor
ensureDataFile();

/**
 * GET /api/reportes - Obtener todos los reportes
 */
app.get('/api/reportes', (req, res) => {
  try {
    const jsonData = readDataFile();
    res.json(jsonData);
  } catch (error) {
    console.error('Error al leer reportes:', error);
    res.status(500).json({ error: 'Error al leer los reportes', details: error.message });
  }
});

/**
 * POST /api/reportes - Crear un nuevo reporte
 */
app.post('/api/reportes', (req, res) => {
  try {
    // Validar datos requeridos
    if (!req.body.tipo_aviso || !req.body.descripcion || req.body.latitud === undefined || req.body.longitud === undefined) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        required: ['tipo_aviso', 'descripcion', 'latitud', 'longitud'] 
      });
    }

    // Leer datos actuales (con validación y reparación automática)
    const jsonData = readDataFile();
    
    // Crear nuevo reporte
    const nuevoReporte = {
      id: jsonData.nextId++,
      tipo_aviso: req.body.tipo_aviso,
      descripcion: req.body.descripcion,
      latitud: req.body.latitud,
      longitud: req.body.longitud,
      fecha_reporte: new Date().toISOString(),
      foto: req.body.foto || null
    };
    
    // Agregar a la lista
    jsonData.reports.push(nuevoReporte);
    
    // Guardar en archivo
    fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    console.log(`✅ Reporte #${nuevoReporte.id} guardado exitosamente`);
    console.log(`📊 Total de reportes: ${jsonData.reports.length}`);
    res.status(201).json(nuevoReporte);
  } catch (error) {
    console.error('Error al guardar reporte:', error);
    res.status(500).json({ error: 'Error al guardar el reporte', details: error.message });
  }
});

/**
 * GET /api/reportes/:id - Obtener un reporte por ID
 */
app.get('/api/reportes/:id', (req, res) => {
  try {
    const jsonData = readDataFile();
    const reporte = jsonData.reports.find(r => r.id === parseInt(req.params.id));
    
    if (reporte) {
      res.json(reporte);
    } else {
      res.status(404).json({ error: 'Reporte no encontrado' });
    }
  } catch (error) {
    console.error('Error al leer reporte:', error);
    res.status(500).json({ error: 'Error al leer el reporte' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivo de datos: ${DATA_FILE}`);
  console.log(`✅ Servidor listo para recibir peticiones`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso.`);
    console.error(`   Cierra la aplicación que está usando el puerto ${PORT} o cambia el puerto en server.js`);
  } else {
    console.error('❌ Error al iniciar el servidor:', err);
  }
  process.exit(1);
});
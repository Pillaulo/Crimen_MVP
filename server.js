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
    
    // Crear archivo si no existe
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = {
        reports: [],
        nextId: 1
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('✅ Archivo de datos creado:', DATA_FILE);
    }
  } catch (error) {
    console.error('❌ Error al inicializar archivo de datos:', error);
    throw error;
  }
}

// Inicializar archivo al iniciar el servidor
ensureDataFile();

/**
 * GET /api/reportes - Obtener todos los reportes
 */
app.get('/api/reportes', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      ensureDataFile();
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
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

    // Asegurar que el archivo existe
    if (!fs.existsSync(DATA_FILE)) {
      ensureDataFile();
    }

    // Leer datos actuales
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
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
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
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

/**
 * DELETE /api/reportes/:id - Eliminar un reporte por ID
 */
app.delete('/api/reportes/:id', (req, res) => {
  try {
    // Asegurar que el archivo existe
    if (!fs.existsSync(DATA_FILE)) {
      ensureDataFile();
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Leer datos actuales
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const jsonData = JSON.parse(data);
    
    const id = parseInt(req.params.id);
    const index = jsonData.reports.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    // Eliminar el reporte
    jsonData.reports.splice(index, 1);
    
    // Guardar en archivo
    fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    
    console.log(`🗑️ Reporte #${id} eliminado exitosamente`);
    res.status(200).json({ message: 'Reporte eliminado exitosamente', id });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ error: 'Error al eliminar el reporte', details: error.message });
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
/**
 * Store de reportes con persistencia en archivo JSON
 * 
 * Los datos se guardan en src/data/reportes.json mediante un servidor Express
 * que expone una API REST en http://localhost:3001
 * 
 * FUTURO BACKEND: Este módulo puede migrarse fácilmente a una API REST
 * construida con FastAPI (Python) que almacenará los reportes en PostgreSQL.
 * 
 * Endpoints actuales:
 * - POST /api/reportes - Crear nuevo reporte
 * - GET /api/reportes - Obtener todos los reportes
 * - GET /api/reportes/{id} - Obtener reporte por ID
 * 
 * Endpoints futuros:
 * - GET /api/reportes/analisis - Análisis con IA (clustering, predicciones, etc.)
 */

const API_BASE_URL = '/api/reportes';

// Cache local para mejorar rendimiento
let reportsCache = [];
let cacheInitialized = false;

/**
 * Agrega un nuevo reporte al almacenamiento y lo guarda en el archivo JSON
 * 
 * @param {Object} reporte - Objeto con los datos del reporte
 * @param {string} reporte.tipo_aviso - Tipo de aviso seleccionado
 * @param {string} reporte.descripcion - Descripción del incidente
 * @param {number} reporte.latitud - Latitud de la ubicación
 * @param {number} reporte.longitud - Longitud de la ubicación
 * @param {string|null} reporte.foto - Foto en base64 (opcional)
 * @returns {Promise<Object>} El reporte creado con ID y fecha
 */
export async function addReport(reporte) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reporte)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || 'Error al guardar el reporte';
      throw new Error(errorMessage);
    }

    const nuevoReporte = await response.json();
    // Actualizar cache
    reportsCache.push(nuevoReporte);
    return nuevoReporte;
  } catch (error) {
    console.error('Error al agregar reporte:', error);
    // Si es un error de red, dar un mensaje más útil
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que el servidor esté corriendo con "npm run server" o "npm run dev:all"');
    }
    throw error;
  }
}

/**
 * Obtiene todos los reportes almacenados
 * 
 * @returns {Promise<Array>} Array con todos los reportes
 */
export async function getReports() {
  try {
    const response = await fetch(API_BASE_URL);
    
    if (!response.ok) {
      throw new Error('Error al cargar los reportes');
    }

    const data = await response.json();
    reportsCache = data.reports || [];
    cacheInitialized = true;
    return [...reportsCache]; // Retorna copia para evitar mutaciones directas
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    // Si es un error de red, mostrar mensaje pero no fallar silenciosamente
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('⚠️ Servidor no disponible. Asegúrate de ejecutar "npm run server" o "npm run dev:all"');
    }
    // Si hay error, retornar cache si está disponible
    if (cacheInitialized) {
      return [...reportsCache];
    }
    return [];
  }
}

/**
 * Obtiene un reporte por su ID
 * 
 * @param {number} id - ID del reporte
 * @returns {Promise<Object|null>} El reporte encontrado o null
 */
export async function getReportById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Error al obtener el reporte');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener reporte por ID:', error);
    // Intentar buscar en cache
    return reportsCache.find(r => r.id === id) || null;
  }
}

/**
 * Elimina un reporte por su ID
 * 
 * @param {number} id - ID del reporte a eliminar
 * @returns {Promise<boolean>} true si se eliminó exitosamente, false si no se encontró
 */
export async function deleteReport(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error('Error al eliminar el reporte');
    }

    // Actualizar cache
    reportsCache = reportsCache.filter(r => r.id !== id);
    return true;
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que el servidor esté corriendo.');
    }
    throw error;
  }
}

/**
 * Recarga los reportes desde el servidor
 * Útil cuando se necesita refrescar los datos
 * 
 * @returns {Promise<void>}
 */
export async function reloadReports() {
  try {
    const data = await getReports();
    reportsCache = data;
    cacheInitialized = true;
  } catch (error) {
    console.error('Error al recargar reportes:', error);
  }
}

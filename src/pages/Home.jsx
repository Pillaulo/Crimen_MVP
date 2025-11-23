import { useState, useEffect } from 'react';
import MapaSelector from '../components/MapaSelector';
import MapaCalor from '../components/MapaCalor';
import FormReporte from '../components/FormReporte';
import { addReport, getReports, reloadReports, deleteReport } from '../data/reportsStore';

/**
 * Página principal de la aplicación
 * 
 * FUTURO BACKEND: Esta página realizará llamadas a la API REST:
 * - GET /api/reportes para cargar reportes al iniciar
 * - POST /api/reportes para crear nuevos reportes
 * - WebSocket o polling para actualizaciones en tiempo real
 * - GET /api/reportes/analisis para visualizar análisis de IA
 * 
 * El backend en Python (FastAPI) procesará los datos y ejecutará
 * modelos de machine learning (scikit-learn, etc.) para análisis
 * geoespacial, clustering de incidentes, predicción de zonas de riesgo, etc.
 */
export default function Home() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [mostrarHeatmap, setMostrarHeatmap] = useState(true);

  // Cargar reportes desde el archivo JSON al iniciar
  useEffect(() => {
    const loadData = async () => {
      await reloadReports();
      const reportesData = await getReports();
      setReportes(reportesData);
    };
    loadData();
  }, []);

  /**
   * Maneja la creación de un nuevo reporte
   */
  const handleSubmitReporte = async (reporte) => {
    try {
      // Guardar en el archivo JSON mediante la API
      await addReport(reporte);
      
      // Actualizar lista de reportes
      const reportesData = await getReports();
      setReportes(reportesData);
      
      // Limpiar posición seleccionada
      setSelectedPosition(null);
      
      alert('Reporte enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.');
    }
  };

  /**
   * Maneja la eliminación de un reporte
   */
  const handleDeleteReporte = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      return;
    }

    try {
      const eliminado = await deleteReport(id);
      
      if (eliminado) {
        // Actualizar lista de reportes
        const reportesData = await getReports();
        setReportes(reportesData);
        alert('Reporte eliminado exitosamente');
      } else {
        alert('No se pudo encontrar el reporte para eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      alert('Error al eliminar el reporte. Por favor, intenta nuevamente.');
    }
  };

  /**
   * Formatea la fecha para mostrar
   */
  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Reportes de Seguridad Ciudadana
          </h1>
          <p className="text-sm text-gray-600 mt-1">Viña del Mar, Chile</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mapa de Calor - Vista General */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Mapa de Calor de Incidentes
            </h2>
            <button
              onClick={() => setMostrarHeatmap(!mostrarHeatmap)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              {mostrarHeatmap ? 'Ocultar' : 'Mostrar'} Mapa de Calor
            </button>
          </div>
          {mostrarHeatmap && (
            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapaCalor key={`heatmap-${reportes.length}`} reportes={reportes} />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Las zonas rojas indican mayor concentración de incidentes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Formulario y Mapa */}
          <div className="space-y-6">
            {/* Formulario */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Nuevo Reporte
              </h2>
              <FormReporte
                position={selectedPosition}
                onSubmit={handleSubmitReporte}
              />
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Selecciona la Ubicación
              </h2>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                <MapaSelector
                  position={selectedPosition}
                  onPositionChange={setSelectedPosition}
                />
              </div>
              {selectedPosition && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <strong>Latitud:</strong> {selectedPosition[0].toFixed(6)}
                  </p>
                  <p>
                    <strong>Longitud:</strong> {selectedPosition[1].toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Lista de Reportes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Reportes Ingresados ({reportes.length})
            </h2>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {reportes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay reportes aún. ¡Sé el primero en reportar!
                </p>
              ) : (
                reportes
                  .slice()
                  .reverse()
                  .map((reporte) => (
                    <div
                      key={reporte.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {reporte.tipo_aviso}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{reporte.id}
                          </span>
                          <button
                            onClick={() => handleDeleteReporte(reporte.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Eliminar reporte"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {reporte.descripcion}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>
                          📅 {formatFecha(reporte.fecha_reporte)}
                        </span>
                        <span>•</span>
                        <span>
                          📍 {reporte.latitud.toFixed(4)}, {reporte.longitud.toFixed(4)}
                        </span>
                        {reporte.foto && (
                          <>
                            <span>•</span>
                            <span>📷 Con foto</span>
                          </>
                        )}
                      </div>
                      {reporte.foto && (
                        <div className="mt-2">
                          <img
                            src={reporte.foto}
                            alt="Foto del reporte"
                            className="max-w-full h-32 object-cover rounded border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información sobre futuro backend */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            MVP Frontend - Preparado para integración con backend Python (FastAPI) + PostgreSQL + IA
          </p>
        </div>
      </footer>
    </div>
  );
}


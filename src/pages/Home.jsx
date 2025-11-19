import { useState, useEffect } from 'react';
import MapaSelector from '../components/MapaSelector';
import FormReporte from '../components/FormReporte';
import { addReport, getReports, reloadReports } from '../data/reportsStore';

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
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{reporte.id}
                        </span>
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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapaSelector from '../components/MapaSelector';
import FormReporte from '../components/FormReporte';
import { addReport } from '../data/reportsStore';

/**
 * Página para crear nuevos reportes de seguridad
 */
export default function Reporte() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const navigate = useNavigate();

  /**
   * Maneja la creación de un nuevo reporte
   */
  const handleSubmitReporte = async (reporte) => {
    try {
      // Guardar en el archivo JSON mediante la API
      await addReport(reporte);
      
      // Limpiar posición seleccionada
      setSelectedPosition(null);
      
      // Mostrar mensaje de éxito y opción de navegar
      const continuar = window.confirm(
        'Reporte enviado exitosamente.\n\n¿Deseas ver el dashboard con todos los reportes?'
      );
      
      if (continuar) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      alert('Error al enviar el reporte. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nuevo Reporte de Seguridad
          </h1>
          <p className="text-gray-600">
            Completa el formulario y selecciona la ubicación del incidente en el mapa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Formulario */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Información del Reporte
              </h2>
              <FormReporte
                position={selectedPosition}
                onSubmit={handleSubmitReporte}
              />
            </div>
          </div>

          {/* Columna derecha: Mapa */}
          <div className="space-y-6">
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
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Ubicación seleccionada:
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Latitud:</strong> {selectedPosition[0].toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Longitud:</strong> {selectedPosition[1].toFixed(6)}
                  </p>
                </div>
              )}
              {!selectedPosition && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Haz clic en el mapa o usa el botón "Usar mi ubicación" para seleccionar dónde ocurrió el incidente
                  </p>
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Instrucciones
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Selecciona el tipo de aviso del incidente</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Describe detalladamente lo que ocurrió</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Haz clic en el mapa para marcar la ubicación exacta</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Opcionalmente, agrega una foto del incidente</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">5.</span>
                  <span>Envía el reporte haciendo clic en "Enviar Reporte"</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


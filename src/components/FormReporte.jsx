import { useState, useEffect } from 'react';

/**
 * Tipos de aviso predefinidos según especificación
 */
const TIPOS_AVISO = [
  'Robo con violencia o intimidación',
  'Robo por sorpresa',
  'Robo de vehículo',
  'Hurtos',
  'Robo en lugar habitado',
  'Robo con fuerza en lugar no habitado',
  'Robo de accesorios de vehículos',
  'Robo desde el interior de vehículos',
  'Robo de objetos de la vía pública',
  'Robo frustrado',
  'Desórdenes / Riñas',
  'Consumo de alcohol en la vía pública',
  'Comercio ambulante no autorizado',
  'Lesiones leves'
];

/**
 * Componente de formulario para crear reportes de seguridad
 * 
 * FUTURO BACKEND: Este formulario enviará los datos mediante POST a
 * /api/reportes usando fetch o axios. El backend en FastAPI validará
 * los datos, los almacenará en PostgreSQL y potencialmente ejecutará
 * análisis en tiempo real con modelos de IA (detección de patrones,
 * clustering geoespacial, etc.).
 * 
 * @param {Object} props
 * @param {Array} props.position - [lat, lng] posición seleccionada en el mapa
 * @param {Function} props.onSubmit - Callback cuando se envía el formulario
 */
export default function FormReporte({ position, onSubmit }) {
  const [tipoAviso, setTipoAviso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Limpiar formulario cuando se envía exitosamente
  useEffect(() => {
    if (!position) {
      setErrors(prev => ({ ...prev, position: 'Debes seleccionar una ubicación en el mapa' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.position;
        return newErrors;
      });
    }
  }, [position]);

  /**
   * Convierte la imagen seleccionada a base64
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Valida el formulario antes de enviar
   */
  const validate = () => {
    const newErrors = {};

    if (!tipoAviso) {
      newErrors.tipoAviso = 'El tipo de aviso es obligatorio';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (!position || position.length !== 2) {
      newErrors.position = 'Debes seleccionar una ubicación en el mapa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const reporte = {
      tipo_aviso: tipoAviso,
      descripcion: descripcion.trim(),
      latitud: position[0],
      longitud: position[1],
      foto: foto
    };

    onSubmit(reporte);

    // Limpiar formulario
    setTipoAviso('');
    setDescripcion('');
    setFoto(null);
    setFotoPreview(null);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tipo_aviso" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Aviso <span className="text-red-500">*</span>
        </label>
        <select
          id="tipo_aviso"
          value={tipoAviso}
          onChange={(e) => setTipoAviso(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.tipoAviso ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Seleccione un tipo de aviso</option>
          {TIPOS_AVISO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        {errors.tipoAviso && (
          <p className="mt-1 text-sm text-red-500">{errors.tipoAviso}</p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.descripcion ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe el incidente..."
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
        )}
      </div>

      <div>
        <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
          Foto (opcional)
        </label>
        <input
          type="file"
          id="foto"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fotoPreview && (
          <div className="mt-2">
            <img
              src={fotoPreview}
              alt="Vista previa"
              className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                setFoto(null);
                setFotoPreview(null);
              }}
              className="mt-1 text-sm text-red-600 hover:text-red-800"
            >
              Eliminar foto
            </button>
          </div>
        )}
      </div>

      {errors.position && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.position}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Enviar Reporte
      </button>
    </form>
  );
}



import Home from './pages/Home';
import './index.css';

/**
 * Componente principal de la aplicación
 * 
 * FUTURO BACKEND: Aquí se puede agregar:
 * - Configuración de cliente API (axios, fetch wrapper)
 * - Manejo de autenticación si es necesario
 * - Context providers para estado global
 * - Manejo de errores de red
 */
function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;


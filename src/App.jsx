import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Heatmap from './pages/Heatmap';
import Reporte from './pages/Reporte';
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
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Heatmap />} />
          <Route path="/reporte" element={<Reporte />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


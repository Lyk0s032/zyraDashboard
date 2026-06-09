import { useState, useEffect } from 'react';
import { excepcionesService } from '../api/services';

function ModalExcepciones({ complejoId, onClose, onActualizar }) {
  const [loading, setLoading] = useState(false);
  const [loadingExcepciones, setLoadingExcepciones] = useState(true);
  const [error, setError] = useState(null);
  const [excepciones, setExcepciones] = useState([]);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista', 'agregar', 'importar'
  
  const [nuevaExcepcion, setNuevaExcepcion] = useState({
    fecha: '',
    esta_abierto: true,
    es_festivo: true,
    descripcion: ''
  });

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    cargarExcepciones();
  }, [complejoId]);

  const cargarExcepciones = async () => {
    try {
      setLoadingExcepciones(true);
      const response = await excepcionesService.obtener(complejoId);
      if (response.success) {
        setExcepciones(response.data.excepciones || response.data);
      }
    } catch (err) {
      console.error('Error cargando excepciones:', err);
    } finally {
      setLoadingExcepciones(false);
    }
  };

  const festivosColombia2026 = [
    { fecha: '2026-01-01', descripcion: 'Año Nuevo' },
    { fecha: '2026-01-12', descripcion: 'Día de los Reyes Magos' },
    { fecha: '2026-03-23', descripcion: 'Día de San José' },
    { fecha: '2026-04-09', descripcion: 'Jueves Santo' },
    { fecha: '2026-04-10', descripcion: 'Viernes Santo' },
    { fecha: '2026-05-01', descripcion: 'Día del Trabajo' },
    { fecha: '2026-05-18', descripcion: 'Ascensión del Señor' },
    { fecha: '2026-06-08', descripcion: 'Corpus Christi' },
    { fecha: '2026-06-15', descripcion: 'Sagrado Corazón de Jesús' },
    { fecha: '2026-06-29', descripcion: 'San Pedro y San Pablo' },
    { fecha: '2026-07-20', descripcion: 'Día de la Independencia de Colombia' },
    { fecha: '2026-08-07', descripcion: 'Batalla de Boyacá' },
    { fecha: '2026-08-17', descripcion: 'Asunción de la Virgen' },
    { fecha: '2026-10-12', descripcion: 'Día de la Raza' },
    { fecha: '2026-11-02', descripcion: 'Día de Todos los Santos' },
    { fecha: '2026-11-16', descripcion: 'Independencia de Cartagena' },
    { fecha: '2026-12-08', descripcion: 'Inmaculada Concepción' },
    { fecha: '2026-12-25', descripcion: 'Navidad' }
  ];

  const handleAgregarExcepcion = async () => {
    if (!nuevaExcepcion.fecha) {
      setError('La fecha es obligatoria');
      return;
    }

    if (!nuevaExcepcion.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await excepcionesService.agregar(complejoId, nuevaExcepcion, token);

      if (response.success) {
        alert('✅ Excepción agregada exitosamente');
        setNuevaExcepcion({
          fecha: '',
          esta_abierto: true,
          es_festivo: true,
          descripcion: ''
        });
        setVistaActual('lista');
        cargarExcepciones();
      }
    } catch (err) {
      console.error('Error agregando excepción:', err);
      setError(err.response?.data?.message || 'Error al agregar excepción');
    } finally {
      setLoading(false);
    }
  };

  const handleImportarFestivos = async () => {
    if (!window.confirm(`¿Importar ${festivosColombia2026.length} festivos de Colombia 2026?`)) return;

    try {
      setLoading(true);
      setError(null);

      const excepcionesImportar = festivosColombia2026.map(f => ({
        fecha: f.fecha,
        esta_abierto: true,
        es_festivo: true,
        descripcion: f.descripcion
      }));

      const response = await excepcionesService.agregarMasivas(complejoId, excepcionesImportar, token);

      if (response.success) {
        alert(`✅ ${response.data.total_creadas || festivosColombia2026.length} festivos importados`);
        setVistaActual('lista');
        cargarExcepciones();
      }
    } catch (err) {
      console.error('Error importando festivos:', err);
      alert(err.response?.data?.message || 'Error al importar festivos');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarExcepcion = async (fecha, descripcion) => {
    if (!window.confirm(`¿Eliminar "${descripcion}"?`)) return;
    try {
      setLoading(true);
      const response = await excepcionesService.eliminar(complejoId, fecha, token);
      if (response.success) {
        alert('✅ Excepción eliminada');
        cargarExcepciones();
      }
    } catch (err) {
      alert('Error al eliminar excepción');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Gestión de Excepciones</h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Configura festivos, cierres y eventos especiales para el complejo
        </p>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* Botones de navegación */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
          <button
            onClick={() => setVistaActual('lista')}
            style={{
              padding: '8px 16px',
              backgroundColor: vistaActual === 'lista' ? '#3498db' : 'transparent',
              color: vistaActual === 'lista' ? 'white' : '#666',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: vistaActual === 'lista' ? 'bold' : 'normal'
            }}
          >
            📅 Lista ({excepciones.length})
          </button>
          <button
            onClick={() => setVistaActual('agregar')}
            style={{
              padding: '8px 16px',
              backgroundColor: vistaActual === 'agregar' ? '#3498db' : 'transparent',
              color: vistaActual === 'agregar' ? 'white' : '#666',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: vistaActual === 'agregar' ? 'bold' : 'normal'
            }}
          >
            + Agregar
          </button>
          <button
            onClick={() => setVistaActual('importar')}
            style={{
              padding: '8px 16px',
              backgroundColor: vistaActual === 'importar' ? '#3498db' : 'transparent',
              color: vistaActual === 'importar' ? 'white' : '#666',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: vistaActual === 'importar' ? 'bold' : 'normal'
            }}
          >
            📥 Importar Festivos
          </button>
        </div>

        {/* Vista: Lista */}
        {vistaActual === 'lista' && (
          <div>
            {loadingExcepciones ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Cargando excepciones...
              </div>
            ) : excepciones.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                  No hay excepciones configuradas
                </p>
                <p style={{ color: '#999', fontSize: '14px' }}>
                  Agrega festivos o días de cierre para este complejo
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                {excepciones.map((excepcion) => (
                  <div
                    key={excepcion.id}
                    style={{
                      padding: '15px',
                      backgroundColor: excepcion.esta_abierto ? '#e8f5e9' : '#ffebee',
                      borderRadius: '8px',
                      border: `1px solid ${excepcion.esta_abierto ? '#c8e6c9' : '#ffcdd2'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#2c3e50' }}>
                        {excepcion.es_festivo && '🎉 '}
                        {!excepcion.esta_abierto && '🔒 '}
                        {excepcion.descripcion}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {formatearFecha(excepcion.fecha)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                        {excepcion.es_festivo && 'Festivo'}
                        {excepcion.es_festivo && !excepcion.esta_abierto && ' • '}
                        {!excepcion.esta_abierto && 'Cerrado'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEliminarExcepcion(excepcion.fecha, excepcion.descripcion)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista: Agregar */}
        {vistaActual === 'agregar' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={nuevaExcepcion.fecha}
                onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, fecha: e.target.value })}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Descripción *
              </label>
              <input
                type="text"
                value={nuevaExcepcion.descripcion}
                onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, descripcion: e.target.value })}
                placeholder="Ej: Navidad, Mantenimiento General"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={nuevaExcepcion.es_festivo}
                  onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, es_festivo: e.target.checked })}
                  disabled={loading}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>Es un festivo (se aplican precios especiales)</span>
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={nuevaExcepcion.esta_abierto}
                  onChange={(e) => setNuevaExcepcion({ ...nuevaExcepcion, esta_abierto: e.target.checked })}
                  disabled={loading}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>El complejo está abierto</span>
              </label>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '28px' }}>
                Si no está marcado, el complejo estará cerrado este día
              </p>
            </div>

            <button
              onClick={handleAgregarExcepcion}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {loading ? 'Agregando...' : 'Agregar Excepción'}
            </button>
          </div>
        )}

        {/* Vista: Importar */}
        {vistaActual === 'importar' && (
          <div>
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #90caf9'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
                📅 Festivos de Colombia 2026
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                Importa automáticamente los {festivosColombia2026.length} festivos oficiales de Colombia para el año 2026.
                Todos serán marcados como días abiertos con precios especiales.
              </p>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                {festivosColombia2026.map((festivo, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>🎉 {festivo.descripcion}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>{festivo.fecha}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleImportarFestivos}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#9b59b6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {loading ? 'Importando...' : `Importar ${festivosColombia2026.length} Festivos`}
            </button>
          </div>
        )}

        {/* Botón cerrar */}
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalExcepciones;

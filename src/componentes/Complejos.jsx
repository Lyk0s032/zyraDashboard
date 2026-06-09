import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

function Complejos() {
  const navigate = useNavigate();
  const [complejos, setComplejos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarComplejos();
  }, []);

  const cargarComplejos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/explorar/complejos');
      
      console.log('Respuesta completa:', response.data);
      
      // Verificar el formato de la respuesta y extraer el array
      let datosComplejos = response.data;
      
      // Si la respuesta tiene una propiedad que contiene el array
      if (datosComplejos.complejos && Array.isArray(datosComplejos.complejos)) {
        datosComplejos = datosComplejos.complejos;
      } else if (datosComplejos.data && Array.isArray(datosComplejos.data)) {
        datosComplejos = datosComplejos.data;
      } else if (datosComplejos.results && Array.isArray(datosComplejos.results)) {
        datosComplejos = datosComplejos.results;
      } else if (!Array.isArray(datosComplejos)) {
        // Si no es array, convertirlo a array vacío
        console.warn('La respuesta no es un array:', datosComplejos);
        datosComplejos = [];
      }
      
      setComplejos(datosComplejos);
    } catch (err) {
      setError(err.message || 'Error al cargar los complejos');
      console.error('Error cargando complejos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatearHorario = (horario) => {
    if (!horario) return 'No especificado';
    return horario;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>
          Cargando complejos deportivos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#fee',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#c33' }}>Error al cargar los complejos</h3>
        <p style={{ color: '#666' }}>{error}</p>
        <button 
          onClick={cargarComplejos}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0 }}>Complejos Deportivos</h1>
        <button 
          onClick={cargarComplejos}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {complejos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            No hay complejos deportivos disponibles
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {complejos.map((complejo) => (
            <div 
              key={complejo.id} 
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {complejo.fotos && complejo.fotos[0] && (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={complejo.fotos[0]} 
                    alt={complejo.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999">📷 Sin imagen</div>';
                    }}
                  />
                </div>
              )}

              <h3 style={{ 
                margin: '0 0 10px 0',
                fontSize: '20px',
                color: '#2c3e50'
              }}>
                {complejo.nombre}
              </h3>

              <div style={{ 
                fontSize: '14px',
                color: '#666',
                marginBottom: '15px'
              }}>
                {complejo.ubicacion && (
                  <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>📍</span>
                    {complejo.ubicacion}
                  </p>
                )}

                {complejo.horario_general && (
                  <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>🕐</span>
                    {formatearHorario(complejo.horario_general)}
                  </p>
                )}

                {complejo.telefono && (
                  <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>📞</span>
                    {complejo.telefono}
                  </p>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '10px',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #eee'
              }}>
                <button
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => navigate(`/complejos/${complejo.id}`)}
                >
                  Ver Detalles
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  onClick={() => console.log('Ver canchas:', complejo.id)}
                >
                  Ver Canchas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Complejos;

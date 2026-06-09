import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { horariosService, canchasService, preciosCanchaService } from '../api/services';
import ModalHorarios from './ModalHorarios';
import ModalNuevaCancha from './ModalNuevaCancha';
import ModalPreciosDinamicos from './ModalPreciosDinamicos';
import ModalExcepciones from './ModalExcepciones';
import ModalReservasComplejo from './ModalReservasComplejo';
import ModalCalendarioCancha from './ModalCalendarioCancha';

function DetalleComplejo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complejo, setComplejo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalHorarios, setMostrarModalHorarios] = useState(false);
  const [mostrarModalCancha, setMostrarModalCancha] = useState(false);
  const [mostrarModalPrecios, setMostrarModalPrecios] = useState(false);
  const [mostrarModalExcepciones, setMostrarModalExcepciones] = useState(false);
  const [mostrarModalReservas, setMostrarModalReservas] = useState(false);
  const [mostrarModalCalendario, setMostrarModalCalendario] = useState(false);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [preciosPorCancha, setPreciosPorCancha] = useState({});
  
  const token = localStorage.getItem('token') || 'tu_token_aqui';

  useEffect(() => {
    cargarDetalleComplejo();
  }, [id]);

  const cargarDetalleComplejo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/api/complexes/${id}`);
      
      if (response.data.success) {
        setComplejo(response.data.data);
        if (response.data.data.canchas) {
          cargarPreciosCanchas(response.data.data.canchas);
        }
      } else {
        setError('No se pudo cargar el complejo');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el complejo');
      console.error('Error cargando detalle del complejo:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarPreciosCanchas = async (canchas) => {
    const preciosMap = {};
    for (const cancha of canchas) {
      try {
        const response = await preciosCanchaService.obtener(cancha.id);
        if (response.success && response.data.precios) {
          preciosMap[cancha.id] = response.data.precios;
        }
      } catch (err) {
        console.error(`Error cargando precios de cancha ${cancha.id}:`, err);
      }
    }
    setPreciosPorCancha(preciosMap);
  };

  const getDiaSemana = (dia) => {
    const dias = {
      0: 'Dom',
      1: 'Lun',
      2: 'Mar',
      3: 'Mié',
      4: 'Jue',
      5: 'Vie',
      6: 'Sáb',
      7: 'Festivo'
    };
    return dias[dia] || 'N/A';
  };

  const formatearHora = (hora) => hora ? hora.substring(0, 5) : '';
  const formatearPrecio = (precio) => {
    if (!precio) return '0';
    const p = typeof precio === 'string' ? parseFloat(precio) : precio;
    return isNaN(p) ? '0' : p.toLocaleString('es-CO');
  };

  const obtenerRangoPreciosCancha = (canchaId) => {
    const precios = preciosPorCancha[canchaId];
    if (!precios || precios.length === 0) return null;
    
    const valores = precios.map(p => parseFloat(p.precio_hora));
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    
    return min === max 
      ? `$${formatearPrecio(min)}`
      : `$${formatearPrecio(min)} - $${formatearPrecio(max)}`;
  };

  const handleGuardarHorarios = async (config) => {
    try {
      setError(null);
      if (!token || token === 'tu_token_aqui') {
        alert('⚠️ Error: No hay token de autenticación válido');
        return;
      }

      const response = config.tipo === 'estandar'
        ? await horariosService.configurarEstandar(id, config.data, token)
        : await horariosService.configurarPersonalizado(id, config.data, token);

      if (response.success) {
        alert('✅ Horarios configurados');
        setMostrarModalHorarios(false);
        cargarDetalleComplejo();
      } else {
        alert('❌ ' + (response.message || 'Error al configurar horarios'));
      }
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleGuardarCancha = async (datosCancha) => {
    try {
      setError(null);
      const response = await canchasService.crear(datosCancha, token);
      if (response.success) {
        alert('✅ Cancha creada');
        setMostrarModalCancha(false);
        cargarDetalleComplejo();
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error al crear cancha');
    }
  };

  const handleToggleDiaCerrado = async (diaSemana, estaCerrado) => {
    if (!window.confirm(`¿${estaCerrado ? 'Cerrar' : 'Abrir'} el complejo este día?`)) return;
    try {
      const response = await horariosService.actualizarEstadoDia(id, diaSemana, estaCerrado, token);
      if (response.success) {
        alert(`✅ Día ${estaCerrado ? 'cerrado' : 'abierto'}`);
        cargarDetalleComplejo();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleAbrirModalPrecios = (cancha) => {
    setCanchaSeleccionada(cancha);
    setMostrarModalPrecios(true);
  };

  const handleCerrarModalPrecios = () => {
    setMostrarModalPrecios(false);
    setCanchaSeleccionada(null);
    cargarDetalleComplejo();
  };

  const handleAbrirCalendario = (cancha) => {
    setCanchaSeleccionada(cancha);
    setMostrarModalCalendario(true);
  };

  const handleCerrarCalendario = () => {
    setMostrarModalCalendario(false);
    setCanchaSeleccionada(null);
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
          Cargando detalles del complejo...
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
        <h3 style={{ color: '#c33' }}>Error al cargar el complejo</h3>
        <p style={{ color: '#666' }}>{error}</p>
        <button 
          onClick={() => navigate('/complejos')}
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
          Volver a Complejos
        </button>
      </div>
    );
  }

  if (!complejo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No se encontró el complejo</p>
        <button 
          onClick={() => navigate('/complejos')}
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
          Volver a Complejos
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/complejos')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#95a5a6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Volver
      </button>

      {/* Wallpaper */}
      {complejo.wallpaper && (
        <div style={{
          width: '100%',
          height: '300px',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px',
          marginBottom: '30px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img 
            src={complejo.wallpaper} 
            alt={`Wallpaper ${complejo.nombre}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {complejo.photo && (
            <div style={{
              position: 'absolute',
              bottom: '-50px',
              left: '30px',
              width: '150px',
              height: '150px',
              borderRadius: '10px',
              border: '5px solid white',
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <img 
                src={complejo.photo} 
                alt={complejo.nombre}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: complejo.photo ? '60px' : '0' }}>
        {/* Información Principal */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
            {complejo.nombre}
          </h1>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '16px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>📍</span>
            {complejo.ubicacion}
          </p>

          {/* Información del Dueño */}
          {complejo.dueño && (
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#34495e', fontSize: '18px' }}>
                Propietario
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {complejo.dueño.photo && (
                  <img 
                    src={complejo.dueño.photo} 
                    alt={complejo.dueño.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>
                    {complejo.dueño.name}
                  </p>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    @{complejo.dueño.nick}
                  </p>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px' }}>📞</span>
                    {complejo.dueño.telefono}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Horarios */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>
              Horarios de Atención
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMostrarModalExcepciones(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📅 Gestionar Excepciones
              </button>
              <button
                onClick={() => setMostrarModalHorarios(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ⚙️ {complejo.horarios && complejo.horarios.length > 0 ? 'Editar Horarios' : 'Configurar Horarios'}
              </button>
            </div>
          </div>
          
          {complejo.horarios && complejo.horarios.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {complejo.horarios.map((horario) => (
                <div 
                  key={horario.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: horario.esta_cerrado ? '#fee' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${horario.esta_cerrado ? '#fcc' : '#e9ecef'}`
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: '#34495e', minWidth: '100px' }}>
                    {getDiaSemana(horario.dia_semana)}
                  </span>
                  {horario.esta_cerrado ? (
                    <span style={{ color: '#c33', fontWeight: '500' }}>Cerrado</span>
                  ) : (
                    <span style={{ color: '#27ae60', fontWeight: '500' }}>
                      {formatearHora(horario.hora_apertura)} - {formatearHora(horario.hora_cierre)}
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleDiaCerrado(horario.dia_semana, !horario.esta_cerrado)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: horario.esta_cerrado ? '#27ae60' : '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {horario.esta_cerrado ? '✓ Abrir' : '✕ Cerrar'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #ddd'
            }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                No hay horarios configurados para este complejo
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Haz clic en "Configurar Horarios" para empezar
              </p>
            </div>
          )}
        </div>

        {/* Canchas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '22px' }}>
              Canchas Disponibles {complejo.canchas && `(${complejo.canchas.length})`}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setMostrarModalReservas(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8e44ad',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📋 Ver Reservas
              </button>
              <button
                onClick={() => setMostrarModalCancha(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                + Nueva Cancha
              </button>
            </div>
          </div>
          
          {complejo.canchas && complejo.canchas.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {complejo.canchas.map((cancha) => (
                <div 
                  key={cancha.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s'
                  }}
                >
                  {cancha.photo && (
                    <div style={{
                      width: '100%',
                      height: '150px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px',
                      marginBottom: '15px',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={cancha.photo} 
                        alt={cancha.nombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#2c3e50' }}>
                    {cancha.nombre}
                  </h3>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Deporte:</strong> {cancha.sport?.name || cancha.tipo_deporte}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Precio base:</strong> ${formatearPrecio(cancha.precio_hora)}/hora
                    </p>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Estado:</strong>{' '}
                      <span style={{ 
                        color: cancha.state === 'DISPONIBLE' ? '#27ae60' : '#e74c3c',
                        fontWeight: '500'
                      }}>
                        {cancha.state}
                      </span>
                    </p>
                  </div>

                  {preciosPorCancha[cancha.id] && preciosPorCancha[cancha.id].length > 0 && (
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      padding: '10px',
                      marginTop: '10px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', color: '#2c3e50' }}>
                        💰 Precios Dinámicos:
                      </div>
                      <div style={{ fontSize: '12px', display: 'grid', gap: '4px' }}>
                        {preciosPorCancha[cancha.id].slice(0, 3).map((precio, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#666' }}>
                              {getDiaSemana(precio.tipo_dia)} {formatearHora(precio.hora_inicio)}-{formatearHora(precio.hora_fin)}
                            </span>
                            <span style={{ fontWeight: '500', color: '#27ae60' }}>
                              ${formatearPrecio(precio.precio_hora)}
                            </span>
                          </div>
                        ))}
                        {preciosPorCancha[cancha.id].length > 3 && (
                          <div style={{ color: '#999', fontSize: '11px', marginTop: '4px' }}>
                            +{preciosPorCancha[cancha.id].length - 3} franjas más...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleAbrirModalPrecios(cancha)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      💰 Precios
                    </button>
                    <button
                      onClick={() => handleAbrirCalendario(cancha)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#2980b9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      📅 Calendario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #ddd'
            }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                No hay canchas registradas en este complejo
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Haz clic en "Nueva Cancha" para agregar la primera
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {mostrarModalHorarios && (
        <ModalHorarios
          complejo={complejo}
          onClose={() => setMostrarModalHorarios(false)}
          onGuardar={handleGuardarHorarios}
        />
      )}

      {mostrarModalCancha && (
        <ModalNuevaCancha
          complejoId={id}
          onClose={() => setMostrarModalCancha(false)}
          onGuardar={handleGuardarCancha}
        />
      )}

      {mostrarModalPrecios && canchaSeleccionada && (
        <ModalPreciosDinamicos
          cancha={canchaSeleccionada}
          complejoId={id}
          onClose={handleCerrarModalPrecios}
          onActualizar={cargarDetalleComplejo}
        />
      )}

      {mostrarModalExcepciones && (
        <ModalExcepciones
          complejoId={id}
          onClose={() => setMostrarModalExcepciones(false)}
          onActualizar={cargarDetalleComplejo}
        />
      )}

      {mostrarModalReservas && (
        <ModalReservasComplejo
          complejoId={id}
          complejoNombre={complejo.nombre}
          onClose={() => setMostrarModalReservas(false)}
        />
      )}

      {mostrarModalCalendario && canchaSeleccionada && (
        <ModalCalendarioCancha
          cancha={canchaSeleccionada}
          onClose={handleCerrarCalendario}
        />
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

export default DetalleComplejo;

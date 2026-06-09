import { useState, useEffect } from 'react';
import { preciosCanchaService } from '../api/services';

function ModalPreciosDinamicos({ cancha, complejoId, onClose, onActualizar }) {
  const [loading, setLoading] = useState(false);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [error, setError] = useState(null);
  const [preciosActuales, setPreciosActuales] = useState(null);
  const [estrategiaSeleccionada, setEstrategiaSeleccionada] = useState('personalizado');
  const [precios, setPrecios] = useState([]);
  
  const token = localStorage.getItem('token') || '';

  const dias = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 0, nombre: 'Domingo' },
    { valor: 7, nombre: 'Festivos' }
  ];

  const estrategiasPredef = {
    premium: {
      nombre: 'Premium',
      descripcion: 'Precios más altos en fin de semana y festivos',
      precios: [
        { tipo_dia: 1, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 60000 },
        { tipo_dia: 2, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 60000 },
        { tipo_dia: 3, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 60000 },
        { tipo_dia: 4, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 60000 },
        { tipo_dia: 5, hora_inicio: '08:00', hora_fin: '18:00', precio_hora: 60000 },
        { tipo_dia: 5, hora_inicio: '18:00', hora_fin: '23:00', precio_hora: 100000 },
        { tipo_dia: 6, hora_inicio: '09:00', hora_fin: '23:00', precio_hora: 90000 },
        { tipo_dia: 7, hora_inicio: '08:00', hora_fin: '23:00', precio_hora: 120000 }
      ]
    },
    simple: {
      nombre: 'Simple',
      descripcion: 'Precio único por día, más caro el fin de semana',
      precios: [
        { tipo_dia: 1, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 40000 },
        { tipo_dia: 2, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 40000 },
        { tipo_dia: 3, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 40000 },
        { tipo_dia: 4, hora_inicio: '08:00', hora_fin: '22:00', precio_hora: 40000 },
        { tipo_dia: 5, hora_inicio: '08:00', hora_fin: '23:00', precio_hora: 50000 },
        { tipo_dia: 6, hora_inicio: '09:00', hora_fin: '23:00', precio_hora: 60000 },
        { tipo_dia: 0, hora_inicio: '09:00', hora_fin: '20:00', precio_hora: 60000 },
        { tipo_dia: 7, hora_inicio: '08:00', hora_fin: '23:00', precio_hora: 80000 }
      ]
    }
  };

  useEffect(() => {
    cargarPreciosActuales();
  }, [cancha.id]);

  const cargarPreciosActuales = async () => {
    try {
      setLoadingPrecios(true);
      const response = await preciosCanchaService.obtener(cancha.id);
      
      if (response.success) {
        setPreciosActuales(response.data);
        
        if (response.data.precios && response.data.precios.length > 0) {
          const preciosPlanos = [];
          response.data.precios.forEach(dia => {
            dia.franjas.forEach(franja => {
              preciosPlanos.push({
                tipo_dia: dia.tipo_dia,
                hora_inicio: franja.hora_inicio,
                hora_fin: franja.hora_fin,
                precio_hora: franja.precio_hora
              });
            });
          });
          setPrecios(preciosPlanos);
        }
      }
    } catch (err) {
      console.error('Error cargando precios:', err);
    } finally {
      setLoadingPrecios(false);
    }
  };

  const agregarFranja = () => {
    setPrecios([...precios, {
      tipo_dia: 1,
      hora_inicio: '08:00',
      hora_fin: '22:00',
      precio_hora: cancha.precio_hora || 50000
    }]);
  };

  const eliminarFranja = (index) => {
    setPrecios(precios.filter((_, i) => i !== index));
  };

  const actualizarFranja = (index, campo, valor) => {
    const nuevosPrecios = [...precios];
    nuevosPrecios[index][campo] = campo === 'precio_hora' ? parseFloat(valor) : valor;
    setPrecios(nuevosPrecios);
  };

  const aplicarEstrategia = (estrategia) => {
    setPrecios(estrategiasPredef[estrategia].precios);
    setEstrategiaSeleccionada(estrategia);
  };

  const handleGuardar = async () => {
    if (precios.length === 0) {
      setError('Debes agregar al menos una franja horaria');
      return;
    }

    // Validaciones
    for (const precio of precios) {
      if (!precio.hora_inicio || !precio.hora_fin) {
        setError('Todas las franjas deben tener hora de inicio y fin');
        return;
      }
      if (precio.precio_hora <= 0) {
        setError('El precio debe ser mayor a 0');
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await preciosCanchaService.configurar(cancha.id, precios, token);

      if (response.success) {
        alert('✅ Precios configurados exitosamente');
        if (onActualizar) onActualizar();
        onClose();
      }
    } catch (err) {
      console.error('Error guardando precios:', err);
      setError(err.response?.data?.message || 'Error al guardar precios');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarTodos = async () => {
    if (!window.confirm('¿Estás seguro de eliminar todos los precios dinámicos? La cancha volverá a usar el precio base.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await preciosCanchaService.eliminarTodos(cancha.id, token);

      if (response.success) {
        alert('✅ Precios dinámicos eliminados');
        if (onActualizar) onActualizar();
        onClose();
      }
    } catch (err) {
      console.error('Error eliminando precios:', err);
      alert('Error al eliminar precios');
    } finally {
      setLoading(false);
    }
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
        maxWidth: '900px',
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
          <div>
            <h2 style={{ margin: 0, marginBottom: '5px' }}>Precios Dinámicos</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{cancha.nombre}</p>
          </div>
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

        {/* Información de precios actuales */}
        {loadingPrecios ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Cargando precios actuales...
          </div>
        ) : preciosActuales && preciosActuales.tiene_precios_dinamicos ? (
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, color: '#2e7d32' }}>✅ Precios dinámicos configurados</h4>
              <button
                onClick={handleEliminarTodos}
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
                Eliminar todos
              </button>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
              Esta cancha tiene {preciosActuales.precios.reduce((total, dia) => total + dia.franjas.length, 0)} configuraciones de precios activas:
            </p>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              backgroundColor: 'white', 
              borderRadius: '6px', 
              padding: '10px',
              fontSize: '13px'
            }}>
              {preciosActuales.precios.map((dia, diaIdx) => (
                <div key={diaIdx}>
                  {dia.franjas.map((franja, franjaIdx) => {
                    const dias = {
                      0: 'Domingo',
                      1: 'Lunes',
                      2: 'Martes',
                      3: 'Miércoles',
                      4: 'Jueves',
                      5: 'Viernes',
                      6: 'Sábado',
                      7: 'Festivos'
                    };
                    
                    return (
                      <div key={`${diaIdx}-${franjaIdx}`} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '6px 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span style={{ color: '#666' }}>
                          <strong>{dias[dia.tipo_dia]}</strong> {franja.hora_inicio?.substring(0,5)} - {franja.hora_fin?.substring(0,5)}
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                          ${franja.precio_hora?.toLocaleString('es-CO') || '0'}/h
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
              ℹ️ Esta cancha usa el precio base: ${cancha.precio_hora}/hora
            </p>
          </div>
        )}

        {/* Estrategias predefinidas */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Estrategias Predefinidas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {Object.entries(estrategiasPredef).map(([key, estrategia]) => (
              <button
                key={key}
                onClick={() => aplicarEstrategia(key)}
                disabled={loading}
                style={{
                  padding: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: estrategiaSeleccionada === key ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{estrategia.nombre}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{estrategia.descripcion}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulario personalizado */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              {precios.length > 0 ? 'Editar Precios' : 'Configuración Personalizada'}
            </h3>
            <button
              onClick={agregarFranja}
              disabled={loading}
              style={{
                padding: '8px 15px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              + Agregar Franja
            </button>
          </div>

          {precios.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #ddd'
            }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                {preciosActuales && preciosActuales.tiene_precios_dinamicos 
                  ? 'Carga exitosa. Los precios se muestran arriba.' 
                  : 'No hay franjas horarias configuradas'
                }
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Usa una estrategia predefinida o agrega franjas manualmente
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {precios.map((precio, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        Día
                      </label>
                      <select
                        value={precio.tipo_dia}
                        onChange={(e) => actualizarFranja(index, 'tipo_dia', parseInt(e.target.value))}
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      >
                        {dias.map(dia => (
                          <option key={dia.valor} value={dia.valor}>{dia.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        Inicio
                      </label>
                      <input
                        type="time"
                        value={precio.hora_inicio}
                        onChange={(e) => actualizarFranja(index, 'hora_inicio', e.target.value)}
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        Fin
                      </label>
                      <input
                        type="time"
                        value={precio.hora_fin}
                        onChange={(e) => actualizarFranja(index, 'hora_fin', e.target.value)}
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        Precio/Hora
                      </label>
                      <input
                        type="number"
                        value={precio.precio_hora}
                        onChange={(e) => actualizarFranja(index, 'precio_hora', e.target.value)}
                        disabled={loading}
                        min="0"
                        step="1000"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => eliminarFranja(index)}
                      disabled={loading}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Guardando...' : (precios.length > 0 ? 'Actualizar Precios' : 'Guardar Precios')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPreciosDinamicos;

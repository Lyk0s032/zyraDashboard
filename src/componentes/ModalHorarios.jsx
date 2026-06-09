import { useState, useEffect } from 'react';

function ModalHorarios({ complejo, onClose, onGuardar }) {
  const [modoConfig, setModoConfig] = useState('estandar'); // 'estandar' o 'personalizado'
  const [horariosEstandar, setHorariosEstandar] = useState({
    lun_vie_apertura: '08:00',
    lun_vie_cierre: '22:00',
    sab_apertura: '09:00',
    sab_cierre: '23:00',
    dom_apertura: '10:00',
    dom_cierre: '20:00'
  });

  const [horariosPersonalizados, setHorariosPersonalizados] = useState([
    { dia_semana: 1, hora_apertura: '08:00', hora_cierre: '22:00' },
    { dia_semana: 2, hora_apertura: '08:00', hora_cierre: '22:00' },
    { dia_semana: 3, hora_apertura: '08:00', hora_cierre: '22:00' },
    { dia_semana: 4, hora_apertura: '08:00', hora_cierre: '22:00' },
    { dia_semana: 5, hora_apertura: '08:00', hora_cierre: '22:00' },
    { dia_semana: 6, hora_apertura: '09:00', hora_cierre: '23:00' },
    { dia_semana: 0, hora_apertura: '10:00', hora_cierre: '20:00' }
  ]);

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (complejo?.horarios && complejo.horarios.length > 0) {
      const horariosExistentes = complejo.horarios.map(h => ({
        dia_semana: h.dia_semana,
        hora_apertura: h.hora_apertura ? h.hora_apertura.substring(0, 5) : '08:00',
        hora_cierre: h.hora_cierre ? h.hora_cierre.substring(0, 5) : '22:00'
      }));
      setHorariosPersonalizados(horariosExistentes);
    }
  }, [complejo]);

  const handleGuardarEstandar = () => {
    onGuardar({ tipo: 'estandar', data: horariosEstandar });
  };

  const handleGuardarPersonalizado = () => {
    onGuardar({ tipo: 'personalizado', data: horariosPersonalizados });
  };

  const actualizarHorarioPersonalizado = (diaSemana, campo, valor) => {
    setHorariosPersonalizados(prev =>
      prev.map(h =>
        h.dia_semana === diaSemana ? { ...h, [campo]: valor } : h
      )
    );
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>Configurar Horarios</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Selector de modo */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setModoConfig('estandar')}
            style={{
              padding: '10px 20px',
              backgroundColor: modoConfig === 'estandar' ? '#3498db' : 'white',
              color: modoConfig === 'estandar' ? 'white' : '#666',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: modoConfig === 'estandar' ? 'bold' : 'normal'
            }}
          >
            Horario Estándar
          </button>
          <button
            onClick={() => setModoConfig('personalizado')}
            style={{
              padding: '10px 20px',
              backgroundColor: modoConfig === 'personalizado' ? '#3498db' : 'white',
              color: modoConfig === 'personalizado' ? 'white' : '#666',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: modoConfig === 'personalizado' ? 'bold' : 'normal'
            }}
          >
            Horario Personalizado
          </button>
        </div>

        {/* Formulario Horario Estándar */}
        {modoConfig === 'estandar' && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Configura un horario simple: uno para Lunes-Viernes, otro para Sábado y otro para Domingo.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Lunes a Viernes</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Apertura</span>
                  <input
                    type="time"
                    value={horariosEstandar.lun_vie_apertura}
                    onChange={(e) => setHorariosEstandar({ ...horariosEstandar, lun_vie_apertura: e.target.value })}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </label>
                <span style={{ marginTop: '20px' }}>-</span>
                <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Cierre</span>
                  <input
                    type="time"
                    value={horariosEstandar.lun_vie_cierre}
                    onChange={(e) => setHorariosEstandar({ ...horariosEstandar, lun_vie_cierre: e.target.value })}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Sábado</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Apertura</span>
                  <input
                    type="time"
                    value={horariosEstandar.sab_apertura}
                    onChange={(e) => setHorariosEstandar({ ...horariosEstandar, sab_apertura: e.target.value })}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </label>
                <span style={{ marginTop: '20px' }}>-</span>
                <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Cierre</span>
                  <input
                    type="time"
                    value={horariosEstandar.sab_cierre}
                    onChange={(e) => setHorariosEstandar({ ...horariosEstandar, sab_cierre: e.target.value })}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Domingo</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Apertura</span>
                  <input
                    type="time"
                    value={horariosEstandar.dom_apertura}
                    onChange={(e) => setHorariosEstandar({ ...horariosEstandar, dom_apertura: e.target.value })}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </label>
                <span style={{ marginTop: '20px' }}>-</span>
                <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Cierre</span>
                  <input
                    type="time"
                    value={horariosEstandar.dom_cierre}
                    onChange={(e) => setHorariosEstandar({ ...horariosEstandar, dom_cierre: e.target.value })}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Horario Personalizado */}
        {modoConfig === 'personalizado' && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Configura horarios específicos para cada día de la semana.
            </p>
            {horariosPersonalizados.sort((a, b) => {
              const orden = [1, 2, 3, 4, 5, 6, 0];
              return orden.indexOf(a.dia_semana) - orden.indexOf(b.dia_semana);
            }).map((horario) => (
              <div
                key={horario.dia_semana}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '15px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}
              >
                <span style={{ minWidth: '100px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {diasSemana[horario.dia_semana]}
                </span>
                <input
                  type="time"
                  value={horario.hora_apertura}
                  onChange={(e) => actualizarHorarioPersonalizado(horario.dia_semana, 'hora_apertura', e.target.value)}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 }}
                />
                <span>-</span>
                <input
                  type="time"
                  value={horario.hora_cierre}
                  onChange={(e) => actualizarHorarioPersonalizado(horario.dia_semana, 'hora_cierre', e.target.value)}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={modoConfig === 'estandar' ? handleGuardarEstandar : handleGuardarPersonalizado}
            style={{
              padding: '10px 20px',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Guardar Horarios
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalHorarios;

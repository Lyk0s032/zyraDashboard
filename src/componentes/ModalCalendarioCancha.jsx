import { useState, useEffect, useCallback } from 'react';
import { reservasService } from '../api/services';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Construye la grilla de días del mes (con padding de días vacíos al inicio)
function construirGrilla(anio, mes) {
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const grilla = Array(primerDia).fill(null);
  for (let d = 1; d <= diasEnMes; d++) grilla.push(d);
  return grilla;
}

function formatFecha(anio, mes, dia) {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function hoy() {
  const d = new Date();
  return { anio: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
}

export default function ModalCalendarioCancha({ cancha, onClose }) {
  const ahora = hoy();
  const [anio, setAnio] = useState(ahora.anio);
  const [mes, setMes] = useState(ahora.mes);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [cargandoDia, setCargandoDia] = useState(false);
  const [resumenMes, setResumenMes] = useState({});

  const grilla = construirGrilla(anio, mes);

  // Cargar disponibilidad de los próximos 30 días del mes para pintar el calendario
  const cargarResumenMes = useCallback(async () => {
    const hoyStr = formatFecha(ahora.anio, ahora.mes, ahora.dia);
    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const mapa = {};

    const promesas = [];
    for (let d = 1; d <= diasDelMes; d++) {
      const fecha = formatFecha(anio, mes, d);
      if (fecha >= hoyStr) {
        promesas.push(
          reservasService.getDisponibilidad(cancha.id, fecha)
            .then(resp => {
              if (resp.success) {
                mapa[d] = {
                  abierto: resp.data.esta_abierto,
                  ocupados: resp.data.total_reservas_activas,
                  esFestivo: resp.data.es_festivo
                };
              }
            })
            .catch(() => {})
        );
      }
    }
    await Promise.all(promesas);
    setResumenMes(mapa);
  }, [anio, mes, cancha.id, ahora.anio, ahora.mes, ahora.dia]);

  useEffect(() => { cargarResumenMes(); }, [cargarResumenMes]);

  const handleSeleccionarDia = async (dia) => {
    if (!dia) return;
    const fecha = formatFecha(anio, mes, dia);
    const hoyStr = formatFecha(ahora.anio, ahora.mes, ahora.dia);
    if (fecha < hoyStr) return;

    setDiaSeleccionado(dia);
    setCargandoDia(true);
    setDisponibilidad(null);
    try {
      const resp = await reservasService.getDisponibilidad(cancha.id, fecha);
      if (resp.success) setDisponibilidad(resp.data);
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
    } finally {
      setCargandoDia(false);
    }
  };

  const irMesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
    setDiaSeleccionado(null);
    setDisponibilidad(null);
  };

  const irMesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
    setDiaSeleccionado(null);
    setDisponibilidad(null);
  };

  const esHoy = (dia) => dia === ahora.dia && mes === ahora.mes && anio === ahora.anio;
  const esPasado = (dia) => {
    const fecha = formatFecha(anio, mes, dia);
    const hoyStr = formatFecha(ahora.anio, ahora.mes, ahora.dia);
    return fecha < hoyStr;
  };

  // Genera franjas horarias de 1 hora dentro del horario del complejo para el día seleccionado
  const generarFranjas = () => {
    if (!disponibilidad) return [];
    const inicio = disponibilidad.horario_apertura || '06:00:00';
    const fin = disponibilidad.horario_cierre || '23:00:00';

    const [hIni] = inicio.split(':').map(Number);
    const [hFin] = fin.split(':').map(Number);
    const franjas = [];

    for (let h = hIni; h < hFin; h++) {
      const horaStr = `${String(h).padStart(2, '0')}:00`;
      const horaFinStr = `${String(h + 1).padStart(2, '0')}:00`;

      const ocupada = disponibilidad.horarios_ocupados.some(o => {
        const oIni = o.hora_inicio.substring(0, 5);
        const oFin = o.hora_fin.substring(0, 5);
        return oIni < horaFinStr && oFin > horaStr;
      });

      franjas.push({ hora: horaStr, horaFin: horaFinStr, ocupada });
    }
    return franjas;
  };

  const franjas = generarFranjas();
  const fechaSeleccionada = diaSeleccionado ? formatFecha(anio, mes, diaSeleccionado) : null;

  const colorDia = (dia) => {
    if (!dia) return 'transparent';
    if (esPasado(dia)) return '#f0f0f0';
    const info = resumenMes[dia];
    if (!info) return '#fff';
    if (!info.abierto) return '#fde8e8';
    if (info.ocupados > 0) return '#fff3cd';
    return '#e8f8e8';
  };

  return (
    <div style={sty.overlay} onClick={onClose}>
      <div
        style={{ ...sty.modal, maxWidth: '880px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={sty.header}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Calendario — {cancha.nombre}</h2>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>
              {cancha.tipo_deporte} · Precio base: ${Number(cancha.precio_hora || 0).toLocaleString('es-CO')}/h
            </p>
          </div>
          <button onClick={onClose} style={sty.btnCerrar}>✕</button>
        </div>

        {/* Leyenda */}
        <div style={sty.leyenda}>
          <span style={sty.leyItem('#e8f8e8')}>Sin reservas</span>
          <span style={sty.leyItem('#fff3cd')}>Con reservas</span>
          <span style={sty.leyItem('#fde8e8')}>Cerrado</span>
          <span style={sty.leyItem('#f0f0f0')}>Pasado</span>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Calendario */}
          <div style={{ flex: '1 1 340px' }}>
            {/* Navegación mes */}
            <div style={sty.navMes}>
              <button onClick={irMesAnterior} style={sty.btnNav}>‹</button>
              <span style={{ fontWeight: '700', fontSize: '16px' }}>{MESES[mes]} {anio}</span>
              <button onClick={irMesSiguiente} style={sty.btnNav}>›</button>
            </div>

            {/* Cabecera días semana */}
            <div style={sty.gridSemana}>
              {DIAS_SEMANA.map(d => (
                <div key={d} style={sty.cabeceraD}>{d}</div>
              ))}
            </div>

            {/* Días */}
            <div style={sty.gridDias}>
              {grilla.map((dia, idx) => {
                if (!dia) return <div key={idx} />;
                const pasado = esPasado(dia);
                const seleccionado = dia === diaSeleccionado;
                const info = resumenMes[dia];
                return (
                  <div
                    key={idx}
                    onClick={() => !pasado && handleSeleccionarDia(dia)}
                    style={{
                      ...sty.celdaDia,
                      backgroundColor: seleccionado ? '#3498db' : colorDia(dia),
                      color: seleccionado ? 'white' : pasado ? '#bbb' : '#2c3e50',
                      cursor: pasado ? 'default' : 'pointer',
                      border: esHoy(dia) ? '2px solid #3498db' : seleccionado ? '2px solid #2980b9' : '1px solid #e0e0e0',
                      fontWeight: esHoy(dia) ? '700' : '400'
                    }}
                    title={info && !pasado ? `${info.ocupados} reserva(s) activa(s)` : ''}
                  >
                    {dia}
                    {info && info.ocupados > 0 && !seleccionado && (
                      <span style={sty.puntito} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel de franjas horarias */}
          <div style={{ flex: '1 1 280px' }}>
            {!diaSeleccionado && (
              <div style={sty.panelVacio}>
                <p style={{ color: '#999', fontSize: '15px' }}>
                  Selecciona un día en el calendario para ver la disponibilidad horaria
                </p>
              </div>
            )}

            {diaSeleccionado && cargandoDia && (
              <div style={sty.panelVacio}>
                <p style={{ color: '#666' }}>Cargando disponibilidad...</p>
              </div>
            )}

            {diaSeleccionado && !cargandoDia && disponibilidad && (
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#2c3e50' }}>
                  {fechaSeleccionada}
                  {disponibilidad.es_festivo && (
                    <span style={sty.badgeFestivo}>Festivo</span>
                  )}
                </h3>

                {!disponibilidad.esta_abierto ? (
                  <div style={sty.cerradoBox}>
                    El complejo está cerrado este día
                  </div>
                ) : (
                  <>
                    <p style={{ color: '#666', fontSize: '13px', margin: '0 0 14px' }}>
                      Horario: {disponibilidad.horario_apertura?.substring(0,5) || '—'} – {disponibilidad.horario_cierre?.substring(0,5) || '—'}
                      {' · '}
                      <strong>{disponibilidad.total_reservas_activas}</strong> reserva{disponibilidad.total_reservas_activas !== 1 ? 's' : ''} activa{disponibilidad.total_reservas_activas !== 1 ? 's' : ''}
                    </p>

                    {franjas.length === 0 ? (
                      <p style={{ color: '#999', fontSize: '13px' }}>No hay horario configurado para este día</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {franjas.map((franja, i) => (
                          <div key={i} style={{
                            ...sty.franja,
                            backgroundColor: franja.ocupada ? '#fde8e8' : '#e8f8e8',
                            borderLeft: `4px solid ${franja.ocupada ? '#e74c3c' : '#27ae60'}`
                          }}>
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>
                              {franja.hora} – {franja.horaFin}
                            </span>
                            <span style={{
                              fontSize: '12px', fontWeight: '600',
                              color: franja.ocupada ? '#c0392b' : '#27ae60'
                            }}>
                              {franja.ocupada ? 'OCUPADA' : 'LIBRE'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const sty = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'white', borderRadius: '12px', padding: '28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', width: '100%'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '16px'
  },
  btnCerrar: {
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: '#666', padding: '4px 8px', borderRadius: '4px'
  },
  leyenda: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' },
  leyItem: (color) => ({
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#555',
    padding: '4px 10px', borderRadius: '4px', backgroundColor: color, border: '1px solid #ddd'
  }),
  navMes: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px'
  },
  btnNav: {
    background: 'none', border: '1px solid #ddd', borderRadius: '6px',
    fontSize: '18px', cursor: 'pointer', padding: '4px 10px', color: '#555'
  },
  gridSemana: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px'
  },
  cabeceraD: {
    textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#666', padding: '4px 0'
  },
  gridDias: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' },
  celdaDia: {
    position: 'relative', textAlign: 'center', padding: '8px 4px',
    borderRadius: '8px', fontSize: '13px', transition: 'all 0.15s',
    userSelect: 'none', minHeight: '36px', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  puntito: {
    position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
    width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#e67e22'
  },
  panelVacio: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '200px', backgroundColor: '#f8f9fa', borderRadius: '10px',
    border: '2px dashed #ddd', padding: '20px', textAlign: 'center'
  },
  franja: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderRadius: '8px'
  },
  badgeFestivo: {
    marginLeft: '10px', padding: '2px 8px', borderRadius: '10px',
    backgroundColor: '#9b59b6', color: 'white', fontSize: '11px', fontWeight: '600'
  },
  cerradoBox: {
    padding: '20px', backgroundColor: '#fde8e8', borderRadius: '8px',
    color: '#c0392b', fontWeight: '600', textAlign: 'center', fontSize: '15px'
  }
};

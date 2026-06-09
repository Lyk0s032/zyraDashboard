import { useState, useEffect, useCallback } from 'react';
import { reservasService } from '../api/services';

const ESTADOS_RESERVA = ['', 'CONFIRMADA', 'FINALIZADA', 'NO_SHOW', 'CANCELADA'];
const ESTADOS_PAGO = { ABONADA: '#f39c12', PAGADA_TOTAL: '#27ae60', CANCELADA: '#e74c3c' };
const BADGE_RESERVA = { CONFIRMADA: '#3498db', FINALIZADA: '#27ae60', NO_SHOW: '#e67e22', CANCELADA: '#e74c3c' };

function ModalMoverReserva({ reserva, token, onClose, onExito }) {
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleMover = async () => {
    if (!nuevaFecha || !nuevaHora || !motivo.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await reservasService.mover(reserva.id, {
        nueva_fecha: nuevaFecha,
        nueva_hora_inicio: nuevaHora,
        motivo: motivo.trim()
      }, token);
      onExito();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al mover la reserva');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Mover Reserva #{reserva.id}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Fecha actual: <strong>{reserva.fecha}</strong> a las <strong>{reserva.hora_inicio?.substring(0, 5)}</strong>
        </p>

        <label style={styles.label}>Nueva fecha</label>
        <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)} style={styles.input} />

        <label style={styles.label}>Nueva hora de inicio</label>
        <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)} style={styles.input} />

        <label style={styles.label}>Motivo del movimiento</label>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ej: Mantenimiento de la cancha"
          rows={3}
          style={{ ...styles.input, resize: 'vertical' }}
        />

        {error && <p style={styles.errorMsg}>{error}</p>}

        <div style={styles.modalBtns}>
          <button onClick={onClose} style={styles.btnGris} disabled={cargando}>Cancelar</button>
          <button onClick={handleMover} style={styles.btnAzul} disabled={cargando}>
            {cargando ? 'Moviendo...' : 'Confirmar movimiento'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalPagoTotal({ reserva, token, onClose, onExito }) {
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handlePagar = async () => {
    setCargando(true);
    setError('');
    try {
      await reservasService.registrarPagoTotal(reserva.id, { metodo_pago: metodoPago }, token);
      onExito();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Registrar Pago Total</h3>
        <div style={styles.resumenPago}>
          <p style={{ margin: '4px 0' }}>Reserva: <strong>#{reserva.id}</strong></p>
          <p style={{ margin: '4px 0' }}>Total: <strong>${formatearPrecio(reserva.monto_total)}</strong></p>
          <p style={{ margin: '4px 0' }}>Abono pagado: <strong>${formatearPrecio(reserva.monto_abono)}</strong></p>
          <p style={{ margin: '4px 0', color: '#e74c3c' }}>
            Saldo pendiente: <strong>${formatearPrecio(reserva.saldo_pendiente)}</strong>
          </p>
        </div>

        <label style={styles.label}>Método de pago del saldo</label>
        <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={styles.input}>
          <option value="EFECTIVO">Efectivo</option>
          <option value="NEQUI">Nequi</option>
          <option value="PAGOS_APP">Pagos App</option>
        </select>

        {error && <p style={styles.errorMsg}>{error}</p>}

        <div style={styles.modalBtns}>
          <button onClick={onClose} style={styles.btnGris} disabled={cargando}>Cancelar</button>
          <button onClick={handlePagar} style={{ ...styles.btnAzul, backgroundColor: '#27ae60' }} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Confirmar pago completo'}
          </button>
        </div>
      </div>
    </div>
  );
}

const formatearPrecio = (valor) => {
  if (!valor && valor !== 0) return '0';
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return isNaN(num) ? '0' : num.toLocaleString('es-CO');
};

function ModalReservasComplejo({ complejoId, complejoNombre, onClose }) {
  const token = localStorage.getItem('token') || '';
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [reservaMover, setReservaMover] = useState(null);
  const [reservaPago, setReservaPago] = useState(null);

  const cargarReservas = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const filtros = {};
      if (filtroEstado) filtros.estado = filtroEstado;
      if (filtroDesde) filtros.fecha_desde = filtroDesde;
      if (filtroHasta) filtros.fecha_hasta = filtroHasta;
      const resp = await reservasService.obtenerPorComplejo(complejoId, filtros, token);
      setReservas(resp.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  }, [complejoId, filtroEstado, filtroDesde, filtroHasta, token]);

  useEffect(() => { cargarReservas(); }, [cargarReservas]);

  const handleCancelar = async (reserva) => {
    if (!window.confirm(`¿Cancelar la reserva #${reserva.id} de ${reserva.usuario?.nombre || 'este usuario'}?`)) return;
    try {
      await reservasService.cancelar(reserva.id, token);
      cargarReservas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar');
    }
  };

  const handleExitoMover = () => { setReservaMover(null); cargarReservas(); };
  const handleExitoPago = () => { setReservaPago(null); cargarReservas(); };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.modal, maxWidth: '1000px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Reservas — {complejoNombre}</h2>
          <button onClick={onClose} style={styles.btnCerrar}>✕</button>
        </div>

        {/* Filtros */}
        <div style={styles.filtrosRow}>
          <div>
            <label style={styles.labelSm}>Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={styles.selectSm}>
              {ESTADOS_RESERVA.map(e => (
                <option key={e} value={e}>{e || 'Todos'}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.labelSm}>Desde</label>
            <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} style={styles.inputSm} />
          </div>
          <div>
            <label style={styles.labelSm}>Hasta</label>
            <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} style={styles.inputSm} />
          </div>
          <button onClick={cargarReservas} style={styles.btnFiltro}>Filtrar</button>
        </div>

        {cargando && <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>Cargando reservas...</p>}
        {error && <p style={styles.errorMsg}>{error}</p>}

        {!cargando && !error && reservas.length === 0 && (
          <div style={styles.vacio}>
            <p style={{ fontSize: '16px', color: '#666' }}>No hay reservas con los filtros seleccionados</p>
          </div>
        )}

        {!cargando && reservas.length > 0 && (
          <>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
              {reservas.length} reserva{reservas.length !== 1 ? 's' : ''} encontrada{reservas.length !== 1 ? 's' : ''}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.tabla}>
                <thead>
                  <tr style={styles.tHead}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Cancha</th>
                    <th style={styles.th}>Usuario</th>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Hora</th>
                    <th style={styles.th}>Duración</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Abono</th>
                    <th style={styles.th}>Saldo</th>
                    <th style={styles.th}>Pago</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r, idx) => {
                    const cancelada = r.estado_reserva === 'CANCELADA';
                    const pagadaTotal = r.estado_pago === 'PAGADA_TOTAL';
                    return (
                      <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={styles.td}>{r.id}</td>
                        <td style={styles.td}><strong>{r.cancha?.nombre}</strong></td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '13px' }}>
                            {r.usuario?.nombre || '—'}
                            {r.fue_movida && (
                              <span title={`Movida. Motivo: ${r.motivo_movimiento}`} style={styles.badgeMoved}>
                                Movida
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={styles.td}>{r.fecha}</td>
                        <td style={styles.td}>{r.hora_inicio?.substring(0, 5)} – {r.hora_fin?.substring(0, 5)}</td>
                        <td style={styles.td}>{r.duracion_minutos} min</td>
                        <td style={styles.td}>${formatearPrecio(r.monto_total)}</td>
                        <td style={styles.td}>${formatearPrecio(r.monto_abono)}</td>
                        <td style={{ ...styles.td, color: r.saldo_pendiente > 0 ? '#e74c3c' : '#27ae60', fontWeight: '600' }}>
                          ${formatearPrecio(r.saldo_pendiente)}
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: ESTADOS_PAGO[r.estado_pago] || '#95a5a6' }}>
                            {r.estado_pago}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, backgroundColor: BADGE_RESERVA[r.estado_reserva] || '#95a5a6' }}>
                            {r.estado_reserva}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {!cancelada && !pagadaTotal && r.estado_reserva !== 'FINALIZADA' && (
                              <button
                                onClick={() => setReservaPago(r)}
                                style={styles.btnAccion('#27ae60')}
                                title="Registrar pago total"
                              >
                                Pago
                              </button>
                            )}
                            {!cancelada && r.estado_reserva !== 'FINALIZADA' && (
                              <button
                                onClick={() => setReservaMover(r)}
                                style={styles.btnAccion('#3498db')}
                                title="Mover reserva"
                              >
                                Mover
                              </button>
                            )}
                            {!cancelada && r.estado_reserva !== 'FINALIZADA' && (
                              <button
                                onClick={() => handleCancelar(r)}
                                style={styles.btnAccion('#e74c3c')}
                                title="Cancelar reserva"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {reservaMover && (
        <ModalMoverReserva
          reserva={reservaMover}
          token={token}
          onClose={() => setReservaMover(null)}
          onExito={handleExitoMover}
        />
      )}

      {reservaPago && (
        <ModalPagoTotal
          reserva={reservaPago}
          token={token}
          onClose={() => setReservaPago(null)}
          onExito={handleExitoPago}
        />
      )}
    </div>
  );
}

// ============================================================
// ESTILOS
// ============================================================
const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '16px'
  },
  modalTitle: { margin: '0 0 16px 0', fontSize: '18px', color: '#2c3e50' },
  btnCerrar: {
    background: 'none', border: 'none', fontSize: '20px',
    cursor: 'pointer', color: '#666', padding: '4px 8px',
    borderRadius: '4px', lineHeight: 1
  },
  filtrosRow: {
    display: 'flex', gap: '16px', flexWrap: 'wrap',
    alignItems: 'flex-end', marginBottom: '20px',
    padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px'
  },
  labelSm: { display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px', fontWeight: '500', marginTop: '12px' },
  inputSm: { padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' },
  selectSm: { padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  btnFiltro: {
    padding: '8px 18px', backgroundColor: '#3498db', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
  },
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  tHead: { backgroundColor: '#2c3e50', color: 'white' },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
  badge: {
    display: 'inline-block', padding: '3px 8px', borderRadius: '12px',
    color: 'white', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap'
  },
  badgeMoved: {
    display: 'inline-block', padding: '2px 6px', borderRadius: '8px',
    backgroundColor: '#9b59b6', color: 'white', fontSize: '10px',
    fontWeight: '600', marginLeft: '6px'
  },
  btnAccion: (color) => ({
    padding: '4px 8px', backgroundColor: color, color: 'white',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500'
  }),
  vacio: {
    textAlign: 'center', padding: '50px 20px',
    backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ddd'
  },
  errorMsg: { color: '#e74c3c', fontSize: '13px', margin: '8px 0', padding: '8px 12px', backgroundColor: '#fee', borderRadius: '6px' },
  modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  btnGris: { padding: '9px 18px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnAzul: { padding: '9px 18px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  resumenPago: { backgroundColor: '#f8f9fa', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }
};

export default ModalReservasComplejo;

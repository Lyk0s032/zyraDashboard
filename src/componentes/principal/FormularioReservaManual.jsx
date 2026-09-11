import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Banknote, Smartphone, ArrowLeftRight, Clock } from 'lucide-react';
import { TARIFAS_DEMO, formatearCOP } from './constantesAgenda';
import {
  DURACION_ANIM_MS,
  calcularPosicionFlotante,
  calcularTransformDesdeAncla,
  estilosContenedorExpandido,
  obtenerDimensionesContenedor,
} from './overlayIOS';
import HistorialCliente from './HistorialCliente';
import axiosInstance from '../../api/axiosConfig';

const ANCHO_FORM = 420;
const VALOR_RESERVA_DEFAULT = 60000;

// ============================================
// FUNCIONES DE CARGA DE PRECIOS REALES
// ============================================

/**
 * Convierte hora "8:00 AM" o "20:00" a minutos desde medianoche
 */
function convertirHoraAMinutos(horaTexto) {
  // Si es formato "HH:MM" sin AM/PM (formato 24h)
  if (/^\d{1,2}:\d{2}$/.test(horaTexto)) {
    const [h, m] = horaTexto.split(':').map(Number);
    const mins = h * 60 + m;
    console.log(`⏰ Hora 24h: ${horaTexto} → ${mins} minutos`);
    return mins;
  }
  
  // Si es formato "8:00 AM" con AM/PM
  const match = horaTexto.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    console.warn('⚠️ Formato de hora no reconocido:', horaTexto);
    return 0;
  }
  const [, h, m, periodo] = match;
  let horas = parseInt(h);
  const minutos = parseInt(m);
  if (periodo.toUpperCase() === 'PM' && horas !== 12) horas += 12;
  else if (periodo.toUpperCase() === 'AM' && horas === 12) horas = 0;
  const mins = horas * 60 + minutos;
  console.log(`⏰ Hora 12h: ${horaTexto} → ${mins} minutos`);
  return mins;
}

/**
 * Convierte "HH:MM" a minutos
 */
function convertirHoraStringAMinutos(horaString) {
  const [horas, minutos] = horaString.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Convierte día string a número
 */
function convertirDiaANumero(diaString) {
  const mapaDias = { 'Do': 0, 'Lu': 1, 'Ma': 2, 'Mi': 3, 'Ju': 4, 'Vi': 5, 'Sá': 6 };
  return mapaDias[diaString] ?? 0;
}

/**
 * Busca precio en bloques
 */
function buscarPrecioEnBloques(bloques, diaSemana, horaMinutos, duracion) {
  console.log('🔍 Buscando precio en bloques:', { totalBloques: bloques.length, diaSemana, horaMinutos, duracion });
  
  for (let i = 0; i < bloques.length; i++) {
    const bloque = bloques[i];
    const diasBloque = bloque.dias || bloque.dias_semana || [];
    const horariosBloque = bloque.horarios || bloque.franjas_horarias || [];
    
    console.log(`  📋 Bloque ${i+1}:`, { dias: diasBloque, franjas: horariosBloque.length });
    
    const aplicaEsteBloque = diasBloque.some(dia => {
      if (dia === 'Fes') return false;
      const match = convertirDiaANumero(dia) === diaSemana;
      if (match) console.log(`    ✅ Día ${dia} coincide con ${diaSemana}`);
      return match;
    });

    if (!aplicaEsteBloque) {
      console.log(`    ❌ Bloque no aplica para día ${diaSemana}`);
      continue;
    }

    for (const franja of horariosBloque) {
      const inicioMinutos = convertirHoraStringAMinutos(franja.hora_inicio);
      const finMinutos = convertirHoraStringAMinutos(franja.hora_fin);
      const dentroFranja = horaMinutos >= inicioMinutos && horaMinutos < finMinutos;
      const precioHora = franja.precio_hora || franja.precio_por_hora || 0;
      
      console.log(`    🕐 Franja ${franja.hora_inicio}-${franja.hora_fin}: ${
        dentroFranja ? '✅ MATCH' : '❌'
      } · Precio: $${precioHora?.toLocaleString('es-CO')}`);
      
      if (dentroFranja) {
        const precioTotal = Math.round((precioHora * duracion) / 60);
        console.log(`    💰 PRECIO CALCULADO: $${precioTotal.toLocaleString('es-CO')}`);
        return precioTotal;
      }
    }
  }
  
  console.log('  ⚠️ Ninguna franja coincidió');
  return null;
}

/**
 * Obtiene precio real desde la API
 */
async function obtenerPrecioRealFranja(canchaId, fecha, hora, duracion = 60) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return VALOR_RESERVA_DEFAULT;

    console.log('📞 Llamando API precios:', `/api/canchas/${canchaId}/precios`);
    const response = await axiosInstance.get(`/api/canchas/${canchaId}/precios`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📦 Respuesta API:', response.data);

    const bloques = response.data.data?.bloques || response.data.bloques || [];
    console.log('📋 Bloques obtenidos:', bloques.length);
    
    if (!response.data.success || !bloques.length) {
      console.warn('⚠️ Sin bloques, usando default');
      return VALOR_RESERVA_DEFAULT;
    }

    // Parse fecha (YYYY-MM-DD o Date object)
    let fechaObj = fecha;
    if (typeof fecha === 'string') {
      const [year, month, day] = fecha.split('-').map(Number);
      fechaObj = new Date(year, month - 1, day);
    }
    const diaSemana = fechaObj.getDay();
    
    // hora puede ser "20:00" o { clave: "20:00", etiqueta: "8:00 PM" }
    const horaClave = typeof hora === 'string' ? hora : hora.clave || hora.etiqueta;
    console.log('🕐 Procesando hora:', { horaOriginal: hora, horaClave });
    
    const horaMinutos = convertirHoraAMinutos(horaClave);
    
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    console.log('📅 Búsqueda:', { 
      fecha: fechaObj.toISOString().split('T')[0],
      diaSemana, 
      nombreDia: nombresDias[diaSemana],
      horaClave,
      horaMinutos: `${Math.floor(horaMinutos/60)}:${(horaMinutos%60).toString().padStart(2,'0')}`,
      duracion 
    });
    
    const precioEncontrado = buscarPrecioEnBloques(bloques, diaSemana, horaMinutos, duracion);
    
    console.log(precioEncontrado 
      ? `💰 PRECIO ENCONTRADO: $${precioEncontrado.toLocaleString('es-CO')}`
      : '⚠️ NO se encontró precio en bloques, usando default'
    );
    
    return precioEncontrado || VALOR_RESERVA_DEFAULT;
    
  } catch (error) {
    console.error('❌ Error al obtener precio real:', error);
    return VALOR_RESERVA_DEFAULT;
  }
}

const ESTADOS_PAGO = [
  { id: 'ABONADA', label: 'Anticipo (30%)' },
  { id: 'PAGADA_TOTAL', label: 'Pago Total' },
  { id: 'pendiente', label: 'Paga Después' },
];

const METODOS_PAGO = [
  { id: 'NEQUI', label: 'Nequi', icon: Smartphone },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: ArrowLeftRight },
  { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
];

const DURACIONES = [
  { id: 60, label: '1 hora (60 min)', icon: Clock },
  { id: 120, label: '2 horas (120 min)', icon: Clock },
];

function normalizarTelefono(valor) {
  return valor.replace(/\D/g, '');
}

function CampoEtiqueta({ children }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {children}
    </label>
  );
}

export default function FormularioReservaManual({
  anchorRect,
  cancha,
  hora,
  fecha,
  fechaTexto,
  franjaHoraria,
  onCerrar,
  onConfirmar,
}) {
  const contenedorRef = useRef(null);
  const layoutRef = useRef(null);
  const busquedaRef = useRef(null);
  const reposicionarRafRef = useRef(null);
  const listoParaReposicionRef = useRef(false);
  const contenidoPrevRef = useRef(null);

  const [estiloPanel, setEstiloPanel] = useState(null);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const [telefono, setTelefono] = useState('');
  const [nombre, setNombre] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [historialCliente, setHistorialCliente] = useState(null);
  const [estadisticasCliente, setEstadisticasCliente] = useState(null);
  const [datosCliente, setDatosCliente] = useState(null);
  const [muestraHistorial, setMuestraHistorial] = useState(false);

  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [estadoPago, setEstadoPago] = useState('ABONADA');
  const [montoAnticipo, setMontoAnticipo] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [guardando, setGuardando] = useState(false);
  
  // Estados para precio real
  const [precioReal, setPrecioReal] = useState(TARIFAS_DEMO[cancha.id] ?? 120000);
  const [cargandoPrecio, setCargandoPrecio] = useState(false);

  const tarifa = precioReal;
  const muestraMetodo = estadoPago === 'ABONADA' || estadoPago === 'PAGADA_TOTAL';
  
  // TODO: Obtener del contexto o props
  const complejoId = 1;

  // Cargar precio real cuando se abre el formulario o cambia la duración
  useEffect(() => {
    console.log('🎯 FormularioReservaManual montado/actualizado', { 
      cancha, 
      fecha, 
      hora, 
      duracionMinutos 
    });

    const cargarPrecio = async () => {
      if (!cancha?.id || !fecha || !hora) {
        console.warn('⚠️ Faltan datos para cargar precio:', { 
          tieneCancha: !!cancha?.id, 
          tieneFecha: !!fecha, 
          tieneHora: !!hora 
        });
        return;
      }
      
      console.log('🚀 Iniciando carga de precio real...');
      setCargandoPrecio(true);
      
      try {
        // Usar idNumerico si existe (desde dashboard), sino extraer de id string
        const canchaIdNumerico = cancha.idNumerico 
          || (typeof cancha.id === 'string' ? cancha.id.replace('cancha-', '') : cancha.id);
        
        console.log('🔢 ID cancha para API:', canchaIdNumerico);
        
        const precio = await obtenerPrecioRealFranja(
          canchaIdNumerico, 
          fecha, 
          hora.clave || hora, 
          duracionMinutos
        );
        
        console.log('✅ Precio obtenido:', precio);
        setPrecioReal(precio);
      } catch (error) {
        console.error('❌ Error cargando precio:', error);
        setPrecioReal(TARIFAS_DEMO[cancha.id] ?? 120000);
      } finally {
        setCargandoPrecio(false);
      }
    };
    
    cargarPrecio();
  }, [cancha?.id, cancha?.idNumerico, fecha, hora, duracionMinutos]);

  const reposicionarPanel = useCallback(() => {
    const el = contenedorRef.current;
    const layout = layoutRef.current;
    if (!el || !anchorRect || !layout || cerrando) return;

    const { width, height: alturaNatural } = obtenerDimensionesContenedor(el);

    const vh = window.innerHeight;
    const margen = 16;
    const alturaParaLayout = Math.min(alturaNatural, vh - margen * 2);

    const posicion = calcularPosicionFlotante(anchorRect, width, alturaParaLayout);
    const alturaMaximaDisponible = vh - posicion.top - margen;

    const transform = calcularTransformDesdeAncla(anchorRect, posicion, width, alturaParaLayout);

    if (
      posicion.top === layout.posicion.top &&
      posicion.left === layout.posicion.left
    ) {
      return;
    }

    const nuevoLayout = { ...layout, posicion, ...transform, alturaMaximaDisponible };
    layoutRef.current = nuevoLayout;
    setEstiloPanel(
      estilosContenedorExpandido(nuevoLayout, {
        expandido: true,
        conTransicion: false,
        transicionPosicion: true,
      }),
    );
  }, [anchorRect, cerrando]);

  const programarReposicion = useCallback(() => {
    if (reposicionarRafRef.current) cancelAnimationFrame(reposicionarRafRef.current);
    reposicionarRafRef.current = requestAnimationFrame(() => {
      reposicionarRafRef.current = null;
      reposicionarPanel();
    });
  }, [reposicionarPanel]);

  const cerrarConAnimacion = useCallback(() => {
    const layout = layoutRef.current;
    if (cerrando || !layout) return;

    setCerrando(true);
    setBackdropVisible(false);
    setEstiloPanel(estilosContenedorExpandido(layout, { expandido: false, conTransicion: true }));
    window.setTimeout(() => onCerrar?.(), DURACION_ANIM_MS);
  }, [cerrando, onCerrar]);

  useLayoutEffect(() => {
    const el = contenedorRef.current;
    if (!el || !anchorRect) return;

    listoParaReposicionRef.current = false;
    contenidoPrevRef.current = `${estadoPago}-${muestraMetodo}`;

    const { width, height: alturaNatural } = obtenerDimensionesContenedor(el);
    const vh = window.innerHeight;
    const margen = 16;
    const alturaParaLayout = Math.min(alturaNatural, vh - margen * 2);

    const posicion = calcularPosicionFlotante(anchorRect, width, alturaParaLayout);
    const alturaMaximaDisponible = vh - posicion.top - margen;

    const transform = calcularTransformDesdeAncla(anchorRect, posicion, width, alturaParaLayout);
    const layout = { posicion, ...transform, alturaMaximaDisponible };

    layoutRef.current = layout;
    setEstiloPanel(estilosContenedorExpandido(layout, { expandido: false, conTransicion: false }));

    const frame = requestAnimationFrame(() => {
      setBackdropVisible(true);
      setEstiloPanel(estilosContenedorExpandido(layout, { expandido: true, conTransicion: true }));
    });

    return () => cancelAnimationFrame(frame);
  }, [anchorRect]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') cerrarConAnimacion();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [cerrarConAnimacion]);

  useLayoutEffect(() => {
    const el = contenedorRef.current;
    if (!el || !anchorRect) return;

    const timeout = window.setTimeout(() => {
      listoParaReposicionRef.current = true;
    }, DURACION_ANIM_MS + 20);

    const observer = new ResizeObserver(() => {
      if (!listoParaReposicionRef.current) return;
      programarReposicion();
    });
    observer.observe(el);

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      if (reposicionarRafRef.current) cancelAnimationFrame(reposicionarRafRef.current);
    };
  }, [anchorRect, programarReposicion]);

  const claveContenido = `${estadoPago}-${muestraMetodo}`;

  useLayoutEffect(() => {
    if (!layoutRef.current || cerrando || !listoParaReposicionRef.current) return;
    if (contenidoPrevRef.current === claveContenido) return;

    contenidoPrevRef.current = claveContenido;
    programarReposicion();
  }, [claveContenido, programarReposicion, cerrando]);

  const buscarCliente = useCallback(async (valorTelefono) => {
    const digits = normalizarTelefono(valorTelefono);
    if (digits.length < 10) {
      setMuestraHistorial(false);
      setHistorialCliente(null);
      setEstadisticasCliente(null);
      setDatosCliente(null);
      return;
    }

    if (busquedaRef.current) clearTimeout(busquedaRef.current);

    setBuscandoCliente(true);
    setMuestraHistorial(false);

    busquedaRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(
          `/api/reservas/historial-cliente/${digits}`,
          {
            params: { complejo_id: complejoId },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          const { cliente, estadisticas, historial } = response.data;
          setDatosCliente(cliente);
          setEstadisticasCliente(estadisticas);
          setHistorialCliente(historial);
          setNombre(cliente.nombre);
          setMuestraHistorial(true);
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error);
        setMuestraHistorial(false);
        setHistorialCliente(null);
      } finally {
        setBuscandoCliente(false);
      }
    }, 800);
  }, [complejoId]);

  useEffect(() => () => {
    if (busquedaRef.current) clearTimeout(busquedaRef.current);
  }, []);

  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    setTelefono(valor);
    if (!valor.trim()) {
      setNombre('');
      setMuestraHistorial(false);
      setBuscandoCliente(false);
      return;
    }
    buscarCliente(valor);
  };

  const handleTelefonoBlur = () => {
    if (telefono.trim()) buscarCliente(telefono);
  };

  const handleConfirmar = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim() || !telefono.trim()) {
      alert('Por favor completa el nombre y teléfono del cliente');
      return;
    }

    setGuardando(true);

    try {
      const token = localStorage.getItem('token');
      
      // Usar idNumerico si existe, sino extraer de id string
      const canchaIdNumerico = cancha.idNumerico 
        || (typeof cancha.id === 'string' ? cancha.id.replace('cancha-', '') : cancha.id);
      
      // Usar la fecha seleccionada en el dashboard, no la fecha de hoy
      const fechaReserva = fecha ? fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      const payload = {
        cancha_id: parseInt(canchaIdNumerico),
        fecha: fechaReserva,
        hora_inicio: hora.clave,
        duracion_minutos: duracionMinutos,
        metodo_pago: muestraMetodo ? metodoPago : null,
        estado_pago: estadoPago === 'pendiente' ? 'ABONADA' : estadoPago,
        origen_reserva: 'MANUAL',
        telefono_contacto: telefono,
        nombre_contacto: nombre
      };
      
      console.log('📅 Creando reserva para la fecha:', fechaReserva, '(seleccionada en dashboard)');

      const response = await axiosInstance.post('/api/reservas', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onConfirmar?.({
          ...payload,
          ...response.data.data,
          cliente: datosCliente
        });
        cerrarConAnimacion();
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      const mensaje = error.response?.data?.message || 'Error al crear la reserva';
      alert(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  if (!anchorRect) return null;

  const layout = layoutRef.current;
  const alturaMaxima = layout?.alturaMaximaDisponible 
    ? `${Math.min(layout.alturaMaximaDisponible, window.innerHeight - 48)}px`
    : 'calc(100vh - 3rem)';

  const estiloContenedor = estiloPanel ?? {
    top: anchorRect.top,
    left: anchorRect.left,
    visibility: 'hidden',
    pointerEvents: 'none',
  };

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Cerrar formulario"
        onClick={cerrarConAnimacion}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-all duration-300"
        style={{
          opacity: backdropVisible && !cerrando ? 1 : 0,
          transitionDuration: `${DURACION_ANIM_MS + 40}ms`,
        }}
      />

      <div
        ref={contenedorRef}
        role="dialog"
        aria-label="Crear reserva manual"
        className="fixed z-50 flex items-start gap-3 will-change-transform"
        style={estiloContenedor}
        onClick={(e) => e.stopPropagation()}
      >
          <form
            onSubmit={handleConfirmar}
            className="flex w-[420px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-[#1e293b]/80 shadow-2xl backdrop-blur-md"
            style={{ maxHeight: alturaMaxima }}
          >
            <div className="shrink-0 border-b border-slate-700/50 px-5 pb-3 pt-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Nueva reserva manual
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{cancha.nombre}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {fechaTexto} • {franjaHoraria}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
              Tarifa ({duracionMinutos}min): 
              {cargandoPrecio ? (
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono text-slate-300">Calculando...</span>
                  <span className="inline-block w-3 h-3 border border-slate-500 border-t-slate-300 rounded-full animate-spin" />
                </span>
              ) : (
                <span className="font-mono text-slate-300">{formatearCOP(tarifa)}</span>
              )}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
            <div>
              <CampoEtiqueta>Teléfono / WhatsApp</CampoEtiqueta>
              <input
                type="tel"
                value={telefono}
                onChange={handleTelefonoChange}
                onBlur={handleTelefonoBlur}
                placeholder="+57 300 123 4567"
                autoFocus
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-slate-500"
              />
              {buscandoCliente && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Buscando historial...
                </p>
              )}
              {!buscandoCliente && muestraHistorial && datosCliente && (
                <p className="mt-1.5 text-[11px] text-emerald-400/90">
                  {datosCliente.es_cliente_registrado ? 'Cliente registrado' : 'Cliente encontrado'} • {estadisticasCliente?.total_reservas || 0} reservas
                </p>
              )}
            </div>

            <div>
              <CampoEtiqueta>Nombre del cliente</CampoEtiqueta>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                readOnly={muestraHistorial && datosCliente?.es_cliente_registrado}
                className={`w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-slate-500 ${
                  muestraHistorial ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : ''
                }`}
              />
            </div>

            <div>
              <CampoEtiqueta>Duración del partido</CampoEtiqueta>
              <div className="grid grid-cols-2 gap-1.5">
                {DURACIONES.map(({ id, label, icon: Icono }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDuracionMinutos(id)}
                    className={`flex items-center gap-1.5 rounded-lg border p-2 text-[11px] font-medium transition-all duration-150 ${
                      duracionMinutos === id
                        ? 'border-emerald-500 bg-emerald-500/[0.06] text-emerald-300'
                        : 'border-slate-700/80 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <Icono className="h-3 w-3" strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <CampoEtiqueta>Estado de pago inicial</CampoEtiqueta>
              <div className="flex flex-nowrap gap-1.5">
                {ESTADOS_PAGO.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => setEstadoPago(opcion.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
                      estadoPago === opcion.id
                        ? 'bg-white/10 text-white ring-1 ring-slate-500'
                        : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    {opcion.label}
                  </button>
                ))}
              </div>

              {estadoPago === 'ABONADA' && (
                <div className="mt-2.5">
                  <p className="text-[11px] text-slate-400">
                    Monto de anticipo (30%): <span className="font-mono text-slate-300">{formatearCOP(tarifa * 0.3)}</span>
                  </p>
                </div>
              )}
              {estadoPago === 'pendiente' && (
                <div className="mt-2.5">
                  <p className="text-[11px] text-amber-400/80">
                    El cliente pagará el total al llegar a la cancha
                  </p>
                </div>
              )}
            </div>

            {muestraMetodo && (
              <div>
                <CampoEtiqueta>Método de pago</CampoEtiqueta>
                <div className="grid grid-cols-3 gap-1.5">
                  {METODOS_PAGO.map(({ id, label, icon: Icono }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMetodoPago(id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] font-medium transition-all duration-150 ${
                        metodoPago === id
                          ? 'border-emerald-500 bg-emerald-500/[0.06] text-emerald-300'
                          : 'border-slate-700/80 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <Icono className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 px-5 pb-5 pt-2">
            <button
              type="submit"
              disabled={guardando || !nombre.trim() || !telefono.trim()}
              className="w-full rounded-lg bg-emerald-500 p-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Agendar y Confirmar Reserva'}
            </button>
          </div>
        </form>

        {muestraHistorial && !cerrando && (
          <div
            className="shrink-0 transition-all duration-300"
            style={{
              opacity: backdropVisible ? 1 : 0,
              transform: backdropVisible ? 'translateX(0)' : 'translateX(-10px)',
              maxHeight: alturaMaxima,
              overflowY: 'auto',
            }}
          >
            <HistorialCliente
              cliente={datosCliente}
              estadisticas={estadisticasCliente}
              historial={historialCliente}
              cargando={buscandoCliente}
            />
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

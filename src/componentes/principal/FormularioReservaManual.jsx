import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Banknote, Smartphone, ArrowLeftRight } from 'lucide-react';
import { TARIFAS_DEMO, formatearCOP } from './constantesAgenda';
import {
  DURACION_ANIM_MS,
  calcularPosicionFlotante,
  calcularTransformDesdeAncla,
  estilosContenedorExpandido,
  obtenerDimensionesContenedor,
} from './overlayIOS';

const ANCHO_FORM = 360;

const CLIENTES_DEMO = {
  '3001234567': 'Felipe Aristizábal',
  '3109876543': 'Clara Mendoza',
  '3205558899': 'Grupo Los Halcones',
  '3154442211': 'Academia Tenis Pro',
};

const ESTADOS_PAGO = [
  { id: 'pendiente', label: 'Pendiente por pagar' },
  { id: 'anticipo', label: 'Abonó Anticipo' },
  { id: 'total', label: 'Pago Total' },
];

const METODOS_PAGO = [
  { id: 'nequi', label: 'Nequi', icon: Smartphone },
  { id: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight },
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
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
  const [clienteEncontrado, setClienteEncontrado] = useState(false);

  const [estadoPago, setEstadoPago] = useState('pendiente');
  const [montoAnticipo, setMontoAnticipo] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');

  const tarifa = TARIFAS_DEMO[cancha.id] ?? 120000;
  const muestraMetodo = estadoPago === 'anticipo' || estadoPago === 'total';

  const reposicionarPanel = useCallback(() => {
    const el = contenedorRef.current;
    const layout = layoutRef.current;
    if (!el || !anchorRect || !layout || cerrando) return;

    const { width, height } = obtenerDimensionesContenedor(el);
    const posicion = calcularPosicionFlotante(anchorRect, width, height);

    if (
      posicion.top === layout.posicion.top &&
      posicion.left === layout.posicion.left
    ) {
      return;
    }

    const nuevoLayout = { ...layout, posicion };
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

    const { width, height } = obtenerDimensionesContenedor(el);
    const posicion = calcularPosicionFlotante(anchorRect, width, height);
    const transform = calcularTransformDesdeAncla(anchorRect, posicion, width, height);
    const layout = { posicion, ...transform };

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

  const buscarCliente = useCallback((valorTelefono) => {
    const digits = normalizarTelefono(valorTelefono);
    if (digits.length < 10) {
      setClienteEncontrado(false);
      return;
    }

    if (busquedaRef.current) clearTimeout(busquedaRef.current);

    setBuscandoCliente(true);
    setClienteEncontrado(false);

    busquedaRef.current = setTimeout(() => {
      const encontrado = CLIENTES_DEMO[digits];
      if (encontrado) {
        setNombre(encontrado);
        setClienteEncontrado(true);
      } else {
        setClienteEncontrado(false);
      }
      setBuscandoCliente(false);
    }, 650);
  }, []);

  useEffect(() => () => {
    if (busquedaRef.current) clearTimeout(busquedaRef.current);
  }, []);

  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    setTelefono(valor);
    if (!valor.trim()) {
      setNombre('');
      setClienteEncontrado(false);
      setBuscandoCliente(false);
      return;
    }
    buscarCliente(valor);
  };

  const handleTelefonoBlur = () => {
    if (telefono.trim()) buscarCliente(telefono);
  };

  const handleConfirmar = (e) => {
    e.preventDefault();
    onConfirmar?.({
      telefono,
      nombre,
      estadoPago,
      montoAnticipo: estadoPago === 'anticipo' ? Number(montoAnticipo) || 0 : 0,
      metodoPago: muestraMetodo ? metodoPago : null,
      tarifa,
      canchaId: cancha.id,
      hora: hora.clave,
    });
    cerrarConAnimacion();
  };

  if (!anchorRect) return null;

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
        className="fixed z-50 will-change-transform"
        style={estiloContenedor}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleConfirmar}
          className="flex max-h-[calc(100vh-2rem)] w-[360px] flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-[#1e293b]/80 shadow-2xl backdrop-blur-md"
        >
          <div className="shrink-0 border-b border-slate-700/50 px-5 pb-3 pt-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Nueva reserva manual
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{cancha.nombre}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {fechaTexto} • {franjaHoraria}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Tarifa: <span className="font-mono text-slate-300">{formatearCOP(tarifa)}</span>
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
                  Buscando cliente...
                </p>
              )}
              {!buscandoCliente && clienteEncontrado && (
                <p className="mt-1.5 text-[11px] text-emerald-400/90">
                  Cliente encontrado en Zyra
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
                readOnly={clienteEncontrado}
                className={`w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-slate-500 ${
                  clienteEncontrado ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : ''
                }`}
              />
            </div>

            <div>
              <CampoEtiqueta>Estado de pago inicial</CampoEtiqueta>
              <div className="flex flex-wrap gap-1.5">
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

              {estadoPago === 'anticipo' && (
                <div className="mt-2.5">
                  <CampoEtiqueta>¿Cuánto abonó?</CampoEtiqueta>
                  <input
                    type="number"
                    min="0"
                    max={tarifa}
                    value={montoAnticipo}
                    onChange={(e) => setMontoAnticipo(e.target.value)}
                    placeholder="Ej: 40000"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-2 text-sm text-white outline-none focus:border-slate-500"
                  />
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
              className="w-full rounded-lg bg-emerald-500 p-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-600"
            >
              Agendar y Confirmar Reserva
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}

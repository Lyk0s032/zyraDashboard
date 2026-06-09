import { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, CreditCard, Banknote, MousePointerClick, CalendarCheck } from 'lucide-react';

export function BotonAyuda({ onClick, activo = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`bg-zinc-900 border text-xs px-2.5 py-2 rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
        activo
          ? 'border-purple-500/40 text-purple-400'
          : 'border-white/5 text-zinc-400 hover:border-purple-500/30 hover:text-purple-400'
      }`}
    >
      <Sparkles size={13} strokeWidth={1.5} />
      Ayuda
    </button>
  );
}

function usePosicionElemento(ref, activo) {
  const [rect, setRect] = useState(null);

  const actualizar = useCallback(() => {
    if (!ref?.current) {
      setRect(null);
      return;
    }
    const r = ref.current.getBoundingClientRect();
    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      bottom: r.bottom,
      right: r.right,
    });
  }, [ref]);

  useEffect(() => {
    if (!activo) {
      setRect(null);
      return;
    }
    actualizar();
    window.addEventListener('resize', actualizar);
    window.addEventListener('scroll', actualizar, true);
    return () => {
      window.removeEventListener('resize', actualizar);
      window.removeEventListener('scroll', actualizar, true);
    };
  }, [activo, actualizar]);

  return rect;
}

function ResaltadorTour({ rect }) {
  if (!rect) return null;

  return (
    <div
      className="fixed z-[45] rounded-lg pointer-events-none transition-all duration-300 ring-2 ring-purple-500/60 shadow-[0_0_24px_rgba(168,85,247,0.25)]"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />
  );
}

function GloboTour({
  rect,
  paso,
  totalPasos,
  texto,
  onSiguiente,
  onAtras,
  onOmitir,
  esUltimo,
  esPrimero,
}) {
  if (!rect) return null;

  const espacioAbajo = window.innerHeight - rect.bottom;
  const mostrarArriba = espacioAbajo < 220;
  const tooltipLeft = Math.min(
    Math.max(rect.left + rect.width / 2, 160),
    window.innerWidth - 160
  );

  return (
    <div
      className="fixed z-[55] max-w-xs w-[calc(100vw-2rem)] sm:w-80 transition-all duration-300"
      style={
        mostrarArriba
          ? {
              bottom: window.innerHeight - rect.top + 12,
              left: tooltipLeft,
              transform: 'translateX(-50%)',
            }
          : {
              top: rect.bottom + 12,
              left: tooltipLeft,
              transform: 'translateX(-50%)',
            }
      }
    >
      <div className="bg-zinc-900 border border-white/10 text-zinc-200 text-xs rounded-xl p-4 shadow-xl">
        <p className="text-[10px] uppercase tracking-widest text-purple-400/70 mb-2">
          {paso} / {totalPasos}
        </p>
        <p className="leading-relaxed">{texto}</p>
        <div className="flex items-center justify-between gap-2 mt-4">
          <button
            type="button"
            onClick={onOmitir}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors duration-300"
          >
            Omitir
          </button>
          <div className="flex items-center gap-2">
            {!esPrimero && (
              <button
                type="button"
                onClick={onAtras}
                className="text-[11px] text-zinc-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors duration-300"
              >
                Atrás
              </button>
            )}
            <button
              type="button"
              onClick={onSiguiente}
              className="bg-white text-black text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors duration-300"
            >
              {esUltimo ? 'Entendido' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`w-2.5 h-2.5 bg-zinc-900 border-white/10 rotate-45 mx-auto ${
          mostrarArriba
            ? 'border-r border-b -mb-1.5'
            : 'border-l border-t -mt-1.5'
        }`}
      />
    </div>
  );
}

const PASOS_TOUR_PRECIOS = [
  {
    id: 'anadir-bloque',
    refKey: 'anadirBloque',
    texto:
      '🎯 Paso 1: Añadir bloque de días. Empieza creando un contenedor exclusivo para tus jornadas. Puedes tener tantos bloques independientes como estructuras de precios maneje tu complejo.',
  },
  {
    id: 'agrupacion',
    refKey: 'agrupacionDias',
    texto:
      '📅 Paso 2: La agrupación. Marca aquí los días que van a compartir las mismas tarifas (ej: agrupa de Lunes a Viernes). Usa \'[✓ Seleccionar todos]\' para encenderlos con un solo clic.',
  },
  {
    id: 'festivos',
    refKey: 'botonFestivos',
    texto:
      '🇨🇴 Paso 3: El festivo. Enciende este botón si quieres que los días de puente festivo apliquen automáticamente los precios de este bloque, protegiendo tus ganancias en días de alta demanda.',
  },
  {
    id: 'franja-horario',
    refKey: 'franjaHorario',
    texto:
      '⏰ Paso 4: Horas y Precios. Define el rango de tiempo (ej: 06:00 p. m. a 10:00 p. m.) y el valor de la hora. El sistema usará estos datos para liquidar y cobrar las reservas en la agenda diaria.',
  },
  {
    id: 'agregar-horario',
    refKey: 'agregarHorario',
    texto:
      '➕ Paso 5: Agregar horarios anidados. ¿Manejas tarifa diurna (barata) y nocturna (con luces) para estos mismos días? Haz clic aquí para añadir más franjas horarias dentro de este mismo bloque.',
  },
  {
    id: 'favoritos',
    refKey: 'guardarFavoritos',
    texto:
      '⭐ Paso 6: Guardar en Favoritos. Guarda esta configuración completa con un nombre personalizado. Así, cuando crees una nueva cancha, podrás clonar toda esta matriz de precios en un segundo sin repetir el trabajo.',
  },
];

export function TourGuiadoPrecios({ activo, paso, onCambiarPaso, onCerrar, refsTour }) {
  const pasoActual = PASOS_TOUR_PRECIOS[paso - 1];
  const refActivo = pasoActual ? refsTour?.[pasoActual.refKey] : null;
  const rect = usePosicionElemento(refActivo, activo && paso > 0);

  useEffect(() => {
    if (!activo) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activo, onCerrar]);

  useEffect(() => {
    if (!activo || !refActivo?.current) return;
    const elemento = refActivo.current;
    elemento.classList.add('relative', 'z-[46]');
    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return () => {
      elemento.classList.remove('relative', 'z-[46]');
    };
  }, [activo, paso, refActivo]);

  if (!activo || !pasoActual) return null;

  const esUltimo = paso === PASOS_TOUR_PRECIOS.length;
  const esPrimero = paso === 1;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 transition-opacity duration-300"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <ResaltadorTour rect={rect} />
      <GloboTour
        rect={rect}
        paso={paso}
        totalPasos={PASOS_TOUR_PRECIOS.length}
        texto={pasoActual.texto}
        esUltimo={esUltimo}
        esPrimero={esPrimero}
        onOmitir={onCerrar}
        onAtras={() => onCambiarPaso(paso - 1)}
        onSiguiente={() => (esUltimo ? onCerrar() : onCambiarPaso(paso + 1))}
      />
    </>
  );
}

const GLOSSARIO_ACTIVIDAD = [
  {
    id: 'pasarela',
    icono: CreditCard,
    titulo: 'Ingresos Pasarela',
    descripcion:
      'Dinero cobrado en línea a través de la pasarela de pagos de Zyra (tarjetas, PSE, Nequi, etc.). Ya está confirmado y registrado en el sistema.',
  },
  {
    id: 'efectivo',
    icono: Banknote,
    titulo: 'Recaudo en Efectivo',
    descripcion:
      'Pagos recibidos directamente en el complejo al momento de la reserva o al llegar el cliente. Debes liquidarlos manualmente en caja.',
  },
  {
    id: 'conversion',
    icono: MousePointerClick,
    titulo: 'Tasa de Conversión',
    descripcion:
      'Porcentaje de visitas al perfil de la cancha que terminan en una reserva confirmada. Una tasa alta indica que tu ficha convence y el precio calza.',
  },
  {
    id: 'reservas',
    icono: CalendarCheck,
    titulo: 'Total Reservas',
    descripcion:
      'Cantidad de reservas confirmadas en el periodo. Incluye pagos en línea y reservas registradas en recepción.',
  },
];

export function PanelGlosarioActividad({ abierto, onCerrar }) {
  useEffect(() => {
    if (!abierto) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [abierto, onCerrar]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          abierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCerrar}
        aria-hidden={!abierto}
      />

      <aside
        className={`fixed right-0 top-0 h-full w-80 bg-[#0e0e0e] border-l border-white/5 z-50 p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          abierto ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        role="dialog"
        aria-labelledby="glosario-actividad-titulo"
        aria-hidden={!abierto}
      >
        <div className="flex items-start justify-between gap-3 mb-6 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Centro de Ayuda
            </p>
            <h2 id="glosario-actividad-titulo" className="text-sm font-semibold text-white">
              Glosario de Métricas
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Interpreta tus números como un panel financiero profesional.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar glosario"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/5 transition-all duration-300 shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-0.5">
          {GLOSSARIO_ACTIVIDAD.map((item) => {
            const Icono = item.icono;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-[#121212] p-3.5 transition-all duration-300 hover:border-white/10"
              >
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-purple-500/10 text-purple-400/80">
                    <Icono size={13} strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200 mb-1">{item.titulo}</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{item.descripcion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-zinc-600 mt-4 pt-3 border-t border-white/5 shrink-0">
          Tip: pasa el cursor sobre las barras del gráfico para ver el detalle diario.
        </p>
      </aside>
    </>
  );
}

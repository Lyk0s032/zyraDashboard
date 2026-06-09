import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarRange, PlayCircle, Trash2 } from 'lucide-react';

const DURACION_ANIM_MS = 280;
const EASING_IOS = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const ANCHO_INFO = 360;
const ANCHO_MENU = 240;
const GAP = 12;
const MARGEN = 16;

const ICON_PROPS = { size: 14, strokeWidth: 1.5 };

function formatearCOP(monto) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto);
}

function IconoWhatsApp({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function BadgeEstadoPago({ reserva, afectadaPorLluvia }) {
  const base = 'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium';

  if (afectadaPorLluvia) {
    return <span className={`${base} bg-cyan-500/10 text-cyan-400`}>Reagendable</span>;
  }
  if (reserva.pagoPendiente && reserva.estadoPago !== 'Anticipo recibido') {
    return <span className={`${base} bg-rose-500/10 text-rose-400`}>{reserva.estadoPago}</span>;
  }
  if (reserva.estadoPago === 'Anticipo recibido') {
    return <span className={`${base} bg-amber-500/10 text-amber-400`}>Anticipo recibido</span>;
  }
  return <span className={`${base} bg-emerald-500/10 text-emerald-400`}>Pago Confirmado</span>;
}

function FilaFinanciera({ etiqueta, valor, destacado = false }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="text-zinc-500">{etiqueta}</span>
      <span
        className={
          destacado
            ? 'font-mono text-xs font-bold text-amber-400'
            : 'font-mono text-zinc-300'
        }
      >
        {valor}
      </span>
    </div>
  );
}

function OpcionMenuFila({ icon: Icon, children, onClick, variant = 'default' }) {
  if (variant === 'danger') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-red-400 transition-all duration-150 ease-out hover:bg-red-500/10"
      >
        <Icon {...ICON_PROPS} className="shrink-0 text-red-400/80" />
        <span className="text-left leading-snug">{children}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg p-2 text-xs font-medium text-slate-300 transition-all duration-150 ease-out hover:bg-white/[0.04]"
    >
      <Icon {...ICON_PROPS} className="shrink-0 text-zinc-500" />
      <span className="text-left leading-snug">{children}</span>
    </button>
  );
}

function construirMensajeWhatsApp(reserva, nombreCancha, franjaHoraria, fechaTexto) {
  return `Hola ${reserva.nombre.split(' ')[0]}, te confirmamos tu reserva en ${nombreCancha} para el ${fechaTexto}, horario ${franjaHoraria}. ¡Te esperamos! — Zyra`;
}

function abrirWhatsApp(telefono, mensaje) {
  const numero = telefono.replace(/\D/g, '');
  const prefijo = numero.startsWith('57') ? numero : `57${numero}`;
  const url = `https://wa.me/${prefijo}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function clamp(valor, min, max) {
  return Math.max(min, Math.min(valor, max));
}

function calcularPosicionGemelos(anchorRect, anchoTotal, altoBloque) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const candidatos = [
    { top: anchorRect.top, left: anchorRect.right + GAP, menuPrimero: false },
    { top: anchorRect.top, left: anchorRect.left - anchoTotal - GAP, menuPrimero: true },
    { top: anchorRect.bottom + GAP, left: anchorRect.left, menuPrimero: false },
    {
      top: anchorRect.top,
      left: anchorRect.left + anchorRect.width / 2 - anchoTotal / 2,
      menuPrimero: false,
    },
  ];

  for (const c of candidatos) {
    const top = clamp(c.top, MARGEN, vh - altoBloque - MARGEN);
    const left = clamp(c.left, MARGEN, vw - anchoTotal - MARGEN);
    if (
      top >= MARGEN &&
      left >= MARGEN &&
      top + altoBloque <= vh - MARGEN &&
      left + anchoTotal <= vw - MARGEN
    ) {
      return { top, left, menuPrimero: c.menuPrimero };
    }
  }

  return {
    top: clamp((vh - altoBloque) / 2, MARGEN, vh - altoBloque - MARGEN),
    left: clamp((vw - anchoTotal) / 2, MARGEN, vw - anchoTotal - MARGEN),
    menuPrimero: false,
  };
}

function TarjetaInformacion({
  reserva,
  nombreCancha,
  fechaTexto,
  franjaHoraria,
  afectadaPorLluvia,
  saldoPendiente,
  totalPartido,
  pagadoOnline,
  tieneDeuda,
}) {
  return (
    <div
      className="w-full shrink-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#0f0f11] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] md:w-[360px]"
      style={{ maxWidth: ANCHO_INFO }}
    >
      <div className="border-b border-zinc-800/60 px-4 pb-3 pt-4">
        <h2 className="text-base font-semibold text-white">{reserva.nombre}</h2>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-zinc-500">{reserva.telefono}</span>
          <button
            type="button"
            aria-label="Contactar por WhatsApp"
            onClick={() =>
              abrirWhatsApp(
                reserva.telefono,
                construirMensajeWhatsApp(reserva, nombreCancha, franjaHoraria, fechaTexto)
              )
            }
            className="rounded-lg p-1.5 text-emerald-500 transition-all duration-200 ease-out hover:bg-emerald-500/10"
          >
            <IconoWhatsApp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 px-4 py-3">
        <p className="text-xs text-slate-300">
          {fechaTexto} • {franjaHoraria}
        </p>
        <p className="text-xs text-zinc-500">
          <span aria-hidden>🏟️ </span>
          {nombreCancha}
          {reserva.deporte ? ` · ${reserva.deporte}` : ''}
        </p>
        {afectadaPorLluvia && (
          <p className="text-[11px] font-medium text-cyan-400/90">Modo Lluvia — Reagendable</p>
        )}
      </div>

      <div className="space-y-1.5 px-4 pb-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          Historial de Reserva
        </p>
        <p className="text-[11px] text-slate-400">
          <span className="text-zinc-500">Creada: </span>
          {reserva.creadaEn}
        </p>
        <p className="text-[11px] text-slate-400">
          <span className="text-zinc-500">Origen: </span>
          {reserva.origen}
        </p>
      </div>

      <div className="mx-4 mb-4 rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Estado Actual
          </span>
          <BadgeEstadoPago reserva={reserva} afectadaPorLluvia={afectadaPorLluvia} />
        </div>
        <p className="mb-2 text-[11px] text-zinc-500">{reserva.metodoPago}</p>
        <div className="space-y-1.5 border-t border-zinc-800/60 pt-2">
          <FilaFinanciera etiqueta="Total Partido" valor={formatearCOP(totalPartido)} />
          <FilaFinanciera etiqueta="Pagado Online" valor={formatearCOP(pagadoOnline)} />
          {tieneDeuda && (
            <FilaFinanciera
              etiqueta="Saldo pendiente en recepción"
              valor={formatearCOP(saldoPendiente)}
              destacado
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MenuOpcionesFlotante({ tieneDeuda, saldoPendiente, onAccion }) {
  return (
    <div className="flex w-[240px] shrink-0 flex-col gap-1 rounded-xl border border-zinc-800/80 bg-[#16161a] p-1.5 shadow-2xl">
      {tieneDeuda && (
        <button
          type="button"
          onClick={() => onAccion('liquidar-efectivo')}
          className="w-full rounded-lg bg-emerald-500 px-2.5 py-2.5 text-xs font-semibold text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-150 ease-out hover:bg-emerald-400"
        >
          Liquidar Saldo ({formatearCOP(saldoPendiente)})
        </button>
      )}

      <OpcionMenuFila icon={PlayCircle} onClick={() => onAccion('iniciar-partido')}>
        Dar Entrada
      </OpcionMenuFila>
      <OpcionMenuFila icon={CalendarRange} onClick={() => onAccion('reprogramar')}>
        Cambiar Cancha / Hora
      </OpcionMenuFila>

      <div className="my-0.5 border-t border-zinc-800/60" />

      <OpcionMenuFila icon={Trash2} variant="danger" onClick={() => onAccion('cancelar')}>
        Cancelar Partido
      </OpcionMenuFila>
    </div>
  );
}

function calcularTransformDesdeAncla(anchorRect, posicion, anchoContenedor, altoContenedor) {
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const anchorCenterY = anchorRect.top + anchorRect.height / 2;
  const scaleX = anchorRect.width / anchoContenedor;
  const scaleY = anchorRect.height / altoContenedor;

  return {
    originLocalX: anchorCenterX - posicion.left,
    originLocalY: anchorCenterY - posicion.top,
    scaleInicial: clamp(Math.min(scaleX, scaleY), 0.18, 0.96),
  };
}

function estilosContenedor(layout, { expandido, conTransicion }) {
  const transicion = conTransicion
    ? `transform ${DURACION_ANIM_MS}ms ${EASING_IOS}`
    : 'none';

  return {
    top: layout.posicion.top,
    left: layout.posicion.left,
    transformOrigin: `${layout.originLocalX}px ${layout.originLocalY}px`,
    transform: expandido ? 'scale(1)' : `scale(${layout.scaleInicial})`,
    transition: transicion,
    visibility: 'visible',
  };
}

export default function ContextMenuReserva({
  reserva,
  anchorRect,
  nombreCancha,
  fechaTexto,
  franjaHoraria,
  afectadaPorLluvia,
  onCerrar,
  onAccion,
}) {
  const contenedorRef = useRef(null);
  const layoutRef = useRef(null);
  const [estiloPanel, setEstiloPanel] = useState(null);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  const saldoPendiente = reserva?.saldoPendiente ?? 0;
  const totalPartido = reserva?.totalPartido ?? 0;
  const pagadoOnline = reserva?.pagadoOnline ?? 0;
  const tieneDeuda = saldoPendiente > 0;

  const cerrarConAnimacion = useCallback(() => {
    const layout = layoutRef.current;
    if (cerrando || !layout) return;

    setCerrando(true);
    setBackdropVisible(false);
    setEstiloPanel(estilosContenedor(layout, { expandido: false, conTransicion: true }));

    window.setTimeout(() => onCerrar?.(), DURACION_ANIM_MS);
  }, [cerrando, onCerrar]);

  useLayoutEffect(() => {
    const el = contenedorRef.current;
    if (!el || !anchorRect) return;

    const { width, height } = el.getBoundingClientRect();
    const posicion = calcularPosicionGemelos(anchorRect, width, height);
    const transform = calcularTransformDesdeAncla(anchorRect, posicion, width, height);
    const layout = { posicion, ...transform };

    layoutRef.current = layout;

    setEstiloPanel(estilosContenedor(layout, { expandido: false, conTransicion: false }));

    const frame = requestAnimationFrame(() => {
      setBackdropVisible(true);
      setEstiloPanel(estilosContenedor(layout, { expandido: true, conTransicion: true }));
    });

    return () => cancelAnimationFrame(frame);
  }, [anchorRect, tieneDeuda]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') cerrarConAnimacion();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [cerrarConAnimacion]);

  if (!reserva || !anchorRect) return null;

  const ejecutar = (accion) => {
    onAccion?.(accion, reserva);
    cerrarConAnimacion();
  };

  const estiloContenedor = estiloPanel ?? {
    top: anchorRect.top,
    left: anchorRect.left,
    visibility: 'hidden',
    pointerEvents: 'none',
  };

  const menuPrimero = layoutRef.current?.posicion?.menuPrimero;

  const infoCard = (
    <TarjetaInformacion
      reserva={reserva}
      nombreCancha={nombreCancha}
      fechaTexto={fechaTexto}
      franjaHoraria={franjaHoraria}
      afectadaPorLluvia={afectadaPorLluvia}
      saldoPendiente={saldoPendiente}
      totalPartido={totalPartido}
      pagadoOnline={pagadoOnline}
      tieneDeuda={tieneDeuda}
    />
  );

  const menuOpciones = (
    <MenuOpcionesFlotante
      tieneDeuda={tieneDeuda}
      saldoPendiente={saldoPendiente}
      onAccion={ejecutar}
    />
  );

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Cerrar detalle"
        onClick={cerrarConAnimacion}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity ease-out"
        style={{
          opacity: backdropVisible && !cerrando ? 1 : 0,
          transitionDuration: `${DURACION_ANIM_MS + 40}ms`,
          pointerEvents: 'auto',
        }}
      />

      <div
        ref={contenedorRef}
        role="dialog"
        aria-label={`Detalle de reserva: ${reserva.nombre}`}
        className="fixed z-50 flex flex-col items-start gap-3 will-change-transform md:flex-row"
        style={estiloContenedor}
        onClick={(e) => e.stopPropagation()}
      >
        {menuPrimero ? (
          <>
            {menuOpciones}
            {infoCard}
          </>
        ) : (
          <>
            {infoCard}
            {menuOpciones}
          </>
        )}
      </div>
    </>,
    document.body
  );
}

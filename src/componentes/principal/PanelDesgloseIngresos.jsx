import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DURACION_ANIM_MS,
  MARGEN,
  GAP,
  clamp,
  calcularTransformDesdeAncla,
  estilosContenedorExpandido,
  obtenerDimensionesContenedor,
} from './overlayIOS';

const ANCHO_PANEL = 340;

const TOTAL_INGRESOS = 320000;
const RECAUDADO_ONLINE = 80000;
const POR_COBRAR_RECEPCION = 240000;

const FILAS_DESGLOSE = [
  {
    id: 'felipe',
    titulo: 'Felipe Aristizábal — Maracaná F5',
    monto: '$120,000',
    estado: 'Pago Total',
    claseEstado: 'text-emerald-400',
    nota: null,
  },
  {
    id: 'clara',
    titulo: 'Clara Mendoza — Centenario F7',
    monto: '$40,000',
    estado: 'Anticipo',
    claseEstado: 'text-amber-400',
    nota: 'Falta: $120,000',
  },
  {
    id: 'academia',
    titulo: 'Academia Tenis Pro — Pista Norte',
    monto: '$0',
    estado: 'Pendiente',
    claseEstado: 'text-rose-400',
    nota: null,
  },
];

function formatearCOP(monto) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto);
}

function calcularPosicionPanelIngresos(anchorRect, anchoBloque, altoBloque) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const candidatos = [
    { top: anchorRect.bottom + GAP, left: anchorRect.right - anchoBloque },
    { top: anchorRect.top - altoBloque - GAP, left: anchorRect.right - anchoBloque },
    { top: anchorRect.bottom + GAP, left: anchorRect.left },
  ];

  for (const c of candidatos) {
    const top = clamp(c.top, MARGEN, vh - altoBloque - MARGEN);
    const left = clamp(c.left, MARGEN, vw - anchoBloque - MARGEN);
    if (
      top >= MARGEN &&
      left >= MARGEN &&
      top + altoBloque <= vh - MARGEN &&
      left + anchoBloque <= vw - MARGEN
    ) {
      return { top, left };
    }
  }

  return {
    top: clamp(anchorRect.bottom + GAP, MARGEN, vh - altoBloque - MARGEN),
    left: clamp(anchorRect.right - anchoBloque, MARGEN, vw - anchoBloque - MARGEN),
  };
}

function calcularTransformDesdeAnclaSuperiorDerecha(anchorRect, posicion, anchoContenedor, altoContenedor) {
  const scaleX = anchorRect.width / anchoContenedor;
  const scaleY = anchorRect.height / altoContenedor;

  return {
    originLocalX: clamp(anchorRect.right - posicion.left, 0, anchoContenedor),
    originLocalY: clamp(anchorRect.top - posicion.top, 0, altoContenedor),
    scaleInicial: clamp(Math.min(scaleX, scaleY), 0.2, 0.92),
  };
}

export default function PanelDesgloseIngresos({ anchorRect, onCerrar }) {
  const contenedorRef = useRef(null);
  const layoutRef = useRef(null);
  const [estiloPanel, setEstiloPanel] = useState(null);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

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

    const { width, height } = obtenerDimensionesContenedor(el);
    const posicion = calcularPosicionPanelIngresos(anchorRect, width, height);
    const transform = calcularTransformDesdeAnclaSuperiorDerecha(anchorRect, posicion, width, height);
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

  if (!anchorRect) return null;

  const estiloContenedor = estiloPanel ?? {
    top: anchorRect.top,
    left: anchorRect.right - ANCHO_PANEL,
    visibility: 'hidden',
    pointerEvents: 'none',
  };

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Cerrar desglose de ingresos"
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
        aria-label="Desglose de ingresos"
        className="fixed z-50 will-change-transform"
        style={estiloContenedor}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[340px] rounded-xl border border-slate-700/50 bg-[#1e293b]/80 p-4 shadow-2xl backdrop-blur-md">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Desglose de Ingresos — Hoy
          </p>

          <p className="font-mono text-2xl font-bold text-white">{formatearCOP(TOTAL_INGRESOS)}</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded bg-emerald-500/[0.06] px-2 py-1 font-mono text-xs text-emerald-400">
              Online: {formatearCOP(RECAUDADO_ONLINE)}
            </div>
            <div className="rounded bg-amber-500/[0.06] px-2 py-1 font-mono text-xs text-amber-400">
              En Recepción: {formatearCOP(POR_COBRAR_RECEPCION)}
            </div>
          </div>

          <div className="my-3 border-t border-slate-700/50" />

          <ul className="space-y-2.5">
            {FILAS_DESGLOSE.map((fila) => (
              <li key={fila.id} className="flex items-start justify-between gap-3">
                <span className="min-w-0 flex-1 text-[11px] leading-snug text-slate-300">
                  {fila.titulo}
                </span>
                <div className="shrink-0 text-right">
                  <p className={`text-[11px] font-medium ${fila.claseEstado}`}>
                    {fila.monto}{' '}
                    <span className="text-slate-500">[{fila.estado}]</span>
                  </p>
                  {fila.nota && (
                    <p className="mt-0.5 text-[10px] text-amber-400/80">{fila.nota}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>,
    document.body
  );
}

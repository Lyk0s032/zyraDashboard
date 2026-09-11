import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatearCOP } from './constantesAgenda';
import {
  DURACION_ANIM_MS,
  EASING_IOS,
  calcularPosicionCentradaEnCelda,
  calcularTransformDesdeAncla,
  estilosContenedorExpandido,
  obtenerDimensionesContenedor,
} from './overlayIOS';

const RETARDO_ENTRADA_MS = 80;

export default function MicroConfirmacionReprogramacion({
  origen,
  destino,
  diferenciaTarifa,
  anchorRect,
  onConfirmar,
  onCancelar,
}) {
  const panelRef = useRef(null);
  const layoutRef = useRef(null);
  const [estiloPanel, setEstiloPanel] = useState(null);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [motivo, setMotivo] = useState('');

  const cerrarConAnimacion = useCallback(
    (accion) => {
      const layout = layoutRef.current;
      if (cerrando || !layout) return;

      setCerrando(true);
      setBackdropVisible(false);
      setEstiloPanel(estilosContenedorExpandido(layout, { expandido: false, conTransicion: true }));
      window.setTimeout(() => accion(), DURACION_ANIM_MS);
    },
    [cerrando],
  );

  const handleCancelar = useCallback(
    () => cerrarConAnimacion(onCancelar),
    [cerrarConAnimacion, onCancelar],
  );

  const handleConfirmar = useCallback(
    () => cerrarConAnimacion(() => onConfirmar(motivo)),
    [cerrarConAnimacion, onConfirmar, motivo],
  );

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || !anchorRect) return undefined;

    const { width, height } = obtenerDimensionesContenedor(el);
    const posicion = calcularPosicionCentradaEnCelda(anchorRect, width, height);
    const transform = calcularTransformDesdeAncla(anchorRect, posicion, width, height);
    const layout = { posicion, ...transform };

    layoutRef.current = layout;
    setEstiloPanel(estilosContenedorExpandido(layout, { expandido: false, conTransicion: false }));

    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setBackdropVisible(true);
        setEstiloPanel(estilosContenedorExpandido(layout, { expandido: true, conTransicion: true }));
      });
    }, RETARDO_ENTRADA_MS);

    return () => window.clearTimeout(timer);
  }, [anchorRect]);

  useEffect(() => {
    const manejarEscape = (evento) => {
      if (evento.key === 'Escape') handleCancelar();
    };
    window.addEventListener('keydown', manejarEscape);
    return () => window.removeEventListener('keydown', manejarEscape);
  }, [handleCancelar]);

  const detalle = `${origen.nombreCancha} • ${origen.horaEtiqueta} ➡️ ${destino.nombreCancha} • ${destino.horaEtiqueta}`;

  const notaTarifa =
    diferenciaTarifa !== 0 ? (
      <p className="mt-2 text-[10px] leading-snug text-amber-400/90">
        ⚠️ Nota:{' '}
        {diferenciaTarifa > 0
          ? `La tarifa de esta cancha es mayor (+${formatearCOP(diferenciaTarifa)}). El saldo pendiente se actualizará automáticamente.`
          : `La tarifa de esta cancha es menor (${formatearCOP(diferenciaTarifa)}). El saldo pendiente se actualizará automáticamente.`}
      </p>
    ) : null;

  const estiloContenedor = estiloPanel ?? {
    top: anchorRect.top,
    left: anchorRect.left,
    visibility: 'hidden',
    pointerEvents: 'none',
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10"
        aria-hidden
        onClick={handleCancelar}
        style={{
          opacity: backdropVisible ? 1 : 0,
          transition: `opacity ${DURACION_ANIM_MS}ms ${EASING_IOS}`,
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-labelledby="confirmar-reprogramacion-titulo"
        className="fixed z-50 w-[260px] rounded-xl border border-slate-700 bg-[#1e293b]/90 p-3 shadow-xl backdrop-blur-md"
        style={estiloContenedor}
      >
        <p
          id="confirmar-reprogramacion-titulo"
          className="text-xs font-semibold text-slate-300"
        >
          ¿Confirmar reprogramación de partido?
        </p>

        <p className="mt-1.5 text-[11px] leading-snug text-slate-400">{detalle}</p>

        {notaTarifa}

        <div className="mt-3">
          <label className="mb-1 block text-[10px] font-medium text-slate-500">
            Motivo (opcional)
          </label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Por lluvia, Mantenimiento..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-2 py-1.5 text-[11px] text-white outline-none transition-colors placeholder:text-slate-600 focus:border-slate-500"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancelar}
            className="flex-1 rounded-lg border border-slate-600/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition-all duration-200 ease-out hover:border-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            className="flex-1 rounded-lg bg-emerald-600/90 px-2.5 py-1.5 text-[11px] font-medium text-white transition-all duration-200 ease-out hover:bg-emerald-500"
          >
            Confirmar Cambio
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

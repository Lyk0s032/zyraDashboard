export const DURACION_ANIM_MS = 280;
export const EASING_IOS = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
export const GAP = 12;
export const MARGEN = 16;

export function clamp(valor, min, max) {
  return Math.max(min, Math.min(valor, max));
}

/** Dimensiones sin transform CSS — evita medir el panel mientras hace scale-in. */
export function obtenerDimensionesContenedor(el) {
  return { width: el.offsetWidth, height: el.offsetHeight };
}

/** Centra el panel sobre la celda destino — ideal para confirmaciones post drag & drop. */
export function calcularPosicionCentradaEnCelda(anchorRect, anchoBloque, altoBloque) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const candidatos = [
    {
      top: anchorRect.top + anchorRect.height / 2 - altoBloque / 2,
      left: anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
    },
    {
      top: anchorRect.top,
      left: anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
    },
    {
      top: anchorRect.bottom - altoBloque,
      left: anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
    },
    {
      top: anchorRect.bottom + GAP,
      left: anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
    },
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
    top: clamp(anchorRect.top, MARGEN, vh - altoBloque - MARGEN),
    left: clamp(
      anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
      MARGEN,
      vw - anchoBloque - MARGEN,
    ),
  };
}

export function calcularPosicionFlotante(anchorRect, anchoBloque, altoBloque) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const candidatos = [
    { top: anchorRect.top, left: anchorRect.right + GAP },
    { top: anchorRect.top, left: anchorRect.left - anchoBloque - GAP },
    { top: anchorRect.bottom + GAP, left: anchorRect.left },
    {
      top: anchorRect.top,
      left: anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
    },
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
    top: clamp((vh - altoBloque) / 2, MARGEN, vh - altoBloque - MARGEN),
    left: clamp((vw - anchoBloque) / 2, MARGEN, vw - anchoBloque - MARGEN),
  };
}

export function calcularTransformDesdeAncla(anchorRect, posicion, anchoContenedor, altoContenedor) {
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

export function estilosContenedorExpandido(
  layout,
  { expandido, conTransicion, transicionPosicion = false },
) {
  const transiciones = [];
  if (conTransicion) {
    transiciones.push(`transform ${DURACION_ANIM_MS}ms ${EASING_IOS}`);
  }
  if (transicionPosicion) {
    transiciones.push(
      `top ${DURACION_ANIM_MS}ms ${EASING_IOS}`,
      `left ${DURACION_ANIM_MS}ms ${EASING_IOS}`,
    );
  }

  return {
    top: layout.posicion.top,
    left: layout.posicion.left,
    transformOrigin: `${layout.originLocalX}px ${layout.originLocalY}px`,
    transform: expandido ? 'scale(1)' : `scale(${layout.scaleInicial})`,
    transition: transiciones.length > 0 ? transiciones.join(', ') : 'none',
    visibility: 'visible',
  };
}

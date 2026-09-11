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

  // Calcular espacio disponible en cada dirección desde el anchor
  const espacioArriba = anchorRect.top - MARGEN;
  const espacioAbajo = vh - anchorRect.bottom - MARGEN;
  const espacioIzquierda = anchorRect.left - MARGEN;
  const espacioDerecha = vw - anchorRect.right - MARGEN;

  // Lista de candidatos con score de cuánto espacio tienen
  const candidatos = [
    // A la derecha del anchor
    { 
      top: anchorRect.top, 
      left: anchorRect.right + GAP,
      espacioV: Math.max(espacioArriba, espacioAbajo),
      espacioH: espacioDerecha - GAP,
      prioridad: 1
    },
    // A la izquierda del anchor
    { 
      top: anchorRect.top, 
      left: anchorRect.left - anchoBloque - GAP,
      espacioV: Math.max(espacioArriba, espacioAbajo),
      espacioH: espacioIzquierda - GAP,
      prioridad: 2
    },
    // Debajo del anchor
    { 
      top: anchorRect.bottom + GAP, 
      left: anchorRect.left,
      espacioV: espacioAbajo - GAP,
      espacioH: Math.max(espacioIzquierda, espacioDerecha),
      prioridad: 3
    },
    // Arriba del anchor
    { 
      top: anchorRect.top - altoBloque - GAP, 
      left: anchorRect.left,
      espacioV: espacioArriba - GAP,
      espacioH: Math.max(espacioIzquierda, espacioDerecha),
      prioridad: 4
    },
  ];

  // Intentar cada candidato
  for (const c of candidatos) {
    // Ajustar top para que no se salga por arriba o abajo
    let top = c.top;
    if (top + altoBloque > vh - MARGEN) {
      top = vh - altoBloque - MARGEN;
    }
    if (top < MARGEN) {
      top = MARGEN;
    }

    // Ajustar left para que no se salga por izquierda o derecha
    let left = c.left;
    if (left + anchoBloque > vw - MARGEN) {
      left = vw - anchoBloque - MARGEN;
    }
    if (left < MARGEN) {
      left = MARGEN;
    }

    // Verificar si cabe completamente en esta posición
    if (
      top >= MARGEN &&
      left >= MARGEN &&
      top + altoBloque <= vh - MARGEN &&
      left + anchoBloque <= vw - MARGEN
    ) {
      return { top, left };
    }
  }

  // FALLBACK: anclar arriba y alinear horizontalmente con la celda origen
  const topFinal = MARGEN;
  const leftFinal = clamp(
    anchorRect.left + anchorRect.width / 2 - anchoBloque / 2,
    MARGEN,
    vw - anchoBloque - MARGEN,
  );

  return { top: topFinal, left: leftFinal };
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

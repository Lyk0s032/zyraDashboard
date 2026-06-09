import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AccessibilityContext = createContext(null);

const STORAGE_KEYS = {
  theme: 'zyra-theme',
  fontSize: 'zyra-font-size',
};

export const FONT_SIZE_CLASS = {
  COMPACT: 'compact',
  NORMAL: 'normal',
  LARGE: 'large',
};

/** Estado natural del software: Normal (18px en raíz HTML). */
export const TAMANIO_POR_DEFECTO = FONT_SIZE_CLASS.NORMAL;

const FONT_SIZE_ROOT = {
  [FONT_SIZE_CLASS.COMPACT]: '16px',
  [FONT_SIZE_CLASS.NORMAL]: '18px',
  [FONT_SIZE_CLASS.LARGE]: '20px',
};

function aplicarTamanioRaiz(tamanio) {
  const valor = FONT_SIZE_ROOT[tamanio] ?? FONT_SIZE_ROOT[FONT_SIZE_CLASS.NORMAL];
  document.documentElement.style.fontSize = valor;
}

function leerTemaGuardado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEYS.theme);
    return guardado === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function persistirTamanio(tamanio) {
  try {
    localStorage.setItem(STORAGE_KEYS.fontSize, tamanio);
  } catch {
    /* almacenamiento no disponible */
  }
}

function leerTamanioGuardado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEYS.fontSize);

    if (!guardado) {
      persistirTamanio(TAMANIO_POR_DEFECTO);
      return TAMANIO_POR_DEFECTO;
    }

    if (guardado === FONT_SIZE_CLASS.COMPACT || guardado === FONT_SIZE_CLASS.LARGE) {
      return guardado;
    }

    return TAMANIO_POR_DEFECTO;
  } catch {
    return TAMANIO_POR_DEFECTO;
  }
}

if (typeof document !== 'undefined') {
  aplicarTamanioRaiz(leerTamanioGuardado());
}

export function AccessibilityProvider({ children }) {
  const [theme, setThemeState] = useState(leerTemaGuardado);
  const [fontSizeClass, setFontSizeClassState] = useState(leerTamanioGuardado);

  const setTheme = useCallback((nuevoTema) => {
    const valor = nuevoTema === 'light' ? 'light' : 'dark';
    setThemeState(valor);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, valor);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const setFontSizeClass = useCallback((nuevoTamanio) => {
    const valor = Object.values(FONT_SIZE_CLASS).includes(nuevoTamanio)
      ? nuevoTamanio
      : TAMANIO_POR_DEFECTO;

    aplicarTamanioRaiz(valor);
    setFontSizeClassState(valor);
    persistirTamanio(valor);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    aplicarTamanioRaiz(fontSizeClass);
  }, [fontSizeClass]);

  const isLight = theme === 'light';

  const value = useMemo(
    () => ({
      theme,
      isLight,
      fontSizeClass,
      setTheme,
      setFontSizeClass,
    }),
    [theme, isLight, fontSizeClass, setTheme, setFontSizeClass]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de un AccessibilityProvider');
  }
  return context;
}

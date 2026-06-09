import { useState, useEffect, useCallback, useRef } from 'react';
import { useRainMode } from '../estados/RainModeContext';
import { useAccessibility, FONT_SIZE_CLASS } from '../estados/AccessibilityContext';
import EstadoCanchasSidebar from './EstadoCanchasSidebar';

const ANCHO_ZONA_BORDE = 10;
const UMBRAL_BORDE_PX = 2;

function TituloSeccion({ children }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 mb-2.5">
      {children}
    </p>
  );
}

function BotonOpcionLluvia({ children, onClick, variante = 'default' }) {
  const esPrimario = variante === 'primario';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
        esPrimario
          ? 'bg-cyan-500/10 border-cyan-400/25 text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_16px_rgba(56,189,248,0.25)]'
          : 'bg-sky-500/5 border-sky-400/15 text-sky-200/90 hover:bg-sky-500/15 hover:border-sky-400/30 hover:shadow-[0_0_12px_rgba(14,165,233,0.2)]'
      }`}
    >
      {children}
    </button>
  );
}

function BotonSegmentado({ activo, children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={activo}
      className={`flex-1 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-200 border ${
        activo
          ? 'bg-cyan-500/15 border-cyan-400/35 text-cyan-100 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
          : 'bg-slate-800/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function HotEdgeSidebar() {
  const [abierto, setAbierto] = useState(false);
  const [opcionesVisibles, setOpcionesVisibles] = useState(false);
  const bloqueoAperturaRef = useRef(false);

  const {
    isRainModeActive,
    activate2Hours,
    activateIndefinite,
    deactivate,
    descripcionActiva,
  } = useRainMode();

  const { theme, setTheme, fontSizeClass, setFontSizeClass } = useAccessibility();

  const abrirPanel = useCallback(() => {
    if (bloqueoAperturaRef.current) return;
    setAbierto(true);
  }, []);

  const cerrarPanel = useCallback(() => {
    setAbierto(false);
    if (!isRainModeActive) setOpcionesVisibles(false);

    bloqueoAperturaRef.current = true;
    window.setTimeout(() => {
      bloqueoAperturaRef.current = false;
    }, 250);
  }, [isRainModeActive]);

  useEffect(() => {
    const detectarBordeDerecho = (e) => {
      if (abierto || bloqueoAperturaRef.current) return;
      if (e.clientX >= window.innerWidth - UMBRAL_BORDE_PX) {
        setAbierto(true);
      }
    };

    document.addEventListener('mousemove', detectarBordeDerecho);
    return () => document.removeEventListener('mousemove', detectarBordeDerecho);
  }, [abierto]);

  const handleBotonPrincipal = () => {
    if (isRainModeActive) {
      deactivate();
      setOpcionesVisibles(false);
      return;
    }
    setOpcionesVisibles((prev) => !prev);
  };

  const handleActivar2Horas = () => {
    activate2Hours();
    setOpcionesVisibles(false);
  };

  const handleActivarIndefinido = () => {
    activateIndefinite();
    setOpcionesVisibles(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[60] pointer-events-none">
      <div
        className="absolute top-0 right-0 h-full pointer-events-auto"
        style={{ width: ANCHO_ZONA_BORDE }}
        onMouseEnter={abrirPanel}
        aria-hidden="true"
      />

      <aside
        onMouseLeave={cerrarPanel}
        className={`absolute top-0 right-0 w-80 h-full bg-[#060a12]/95 backdrop-blur-md border-l border-white/10 p-6 shadow-2xl transition-transform duration-300 flex flex-col overflow-y-auto ${
          abierto
            ? 'translate-x-0 pointer-events-auto'
            : 'translate-x-full pointer-events-none'
        }`}
        aria-label="Acciones rápidas"
        aria-hidden={!abierto}
      >
        <header className="mb-6 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/60 mb-1">
            Zyra
          </p>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Acciones Rápidas
          </h2>
          <div className="mt-3 h-px bg-gradient-to-r from-cyan-500/40 via-sky-400/20 to-transparent" />
        </header>

        <section className="space-y-6 shrink-0">
          <div>
            <TituloSeccion>Control de Clima</TituloSeccion>

            {isRainModeActive && descripcionActiva && (
              <p className="text-[10px] text-cyan-300/70 mb-2.5 px-1 leading-relaxed">
                Activo · {descripcionActiva}
              </p>
            )}

            <button
              type="button"
              onClick={handleBotonPrincipal}
              className={`w-full px-3.5 py-3 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                isRainModeActive
                  ? 'bg-red-500/10 border-red-400/30 text-red-300 hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_0_16px_rgba(248,113,113,0.2)]'
                  : 'bg-slate-800/60 border-cyan-400/20 text-cyan-50 hover:bg-slate-800/90 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.18)]'
              }`}
            >
              {isRainModeActive ? '❌ Desactivar Modo Lluvia' : '🌧️ Activar Modo Lluvia'}
            </button>

            {opcionesVisibles && !isRainModeActive && (
              <div className="mt-2 space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
                <BotonOpcionLluvia onClick={handleActivar2Horas} variante="primario">
                  Próximas 2 Horas
                </BotonOpcionLluvia>
                <BotonOpcionLluvia onClick={handleActivarIndefinido}>
                  Tiempo Indefinido
                </BotonOpcionLluvia>
              </div>
            )}
          </div>

          <EstadoCanchasSidebar />

          <div>
            <TituloSeccion>Apariencia</TituloSeccion>
            <div className="flex gap-1.5">
              <BotonSegmentado
                activo={theme === 'light'}
                onClick={() => setTheme('light')}
                ariaLabel="Tema claro"
              >
                ☀️ Claro
              </BotonSegmentado>
              <BotonSegmentado
                activo={theme === 'dark'}
                onClick={() => setTheme('dark')}
                ariaLabel="Tema oscuro"
              >
                🌙 Oscuro
              </BotonSegmentado>
            </div>
          </div>

          <div>
            <TituloSeccion>Tamaño de Interfaz</TituloSeccion>
            <div className="flex gap-1.5">
              <BotonSegmentado
                activo={fontSizeClass === FONT_SIZE_CLASS.COMPACT}
                onClick={() => setFontSizeClass(FONT_SIZE_CLASS.COMPACT)}
                ariaLabel="Reducir tamaño de letra"
              >
                A-
              </BotonSegmentado>
              <BotonSegmentado
                activo={fontSizeClass === FONT_SIZE_CLASS.NORMAL}
                onClick={() => setFontSizeClass(FONT_SIZE_CLASS.NORMAL)}
                ariaLabel="Tamaño de letra normal"
              >
                Normal
              </BotonSegmentado>
              <BotonSegmentado
                activo={fontSizeClass === FONT_SIZE_CLASS.LARGE}
                onClick={() => setFontSizeClass(FONT_SIZE_CLASS.LARGE)}
                ariaLabel="Aumentar tamaño de letra"
              >
                A+
              </BotonSegmentado>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-6 shrink-0">
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Pega el cursor al extremo derecho de la pantalla para abrir este panel.
          </p>
        </footer>
      </aside>
    </div>
  );
}

export default HotEdgeSidebar;

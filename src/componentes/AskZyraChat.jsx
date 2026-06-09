import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles } from 'lucide-react';

function AskZyraChat() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const contenedorRef = useRef(null);

  const alternar = useCallback(() => {
    setAbierto((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleAtajo = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        alternar();
      }
    };

    document.addEventListener('keydown', handleAtajo);
    return () => document.removeEventListener('keydown', handleAtajo);
  }, [alternar]);

  useEffect(() => {
    if (!abierto) return;

    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto]);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setMensaje('');
  };

  return (
    <div ref={contenedorRef} className="fixed bottom-4 right-4 z-50">
      {abierto && (
        <div
          role="dialog"
          aria-label="Chat con Zyra AI"
          className="absolute bottom-full right-0 mb-2 w-80 animate-fade-in rounded-xl border border-purple-500/30 bg-[#161618] p-4 shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles size={14} strokeWidth={1.5} className="text-purple-400" />
            <span className="text-xs font-medium text-white">Zyra AI</span>
            <span className="ml-auto text-[10px] text-purple-400/70">En línea</span>
          </div>

          <div className="max-h-56 space-y-3 overflow-y-auto py-3">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-lg rounded-tr-sm border border-white/5 bg-white/5 px-3 py-2 text-left text-xs leading-relaxed text-zinc-200">
                ¿Cómo estuvo la ocupación de la Maracaná F5 esta semana?
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/20">
                <Sparkles size={12} strokeWidth={1.5} className="text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="rounded-lg rounded-tl-sm border border-purple-500/20 bg-purple-500/[0.06] px-3 py-2 text-xs leading-relaxed text-zinc-300 shadow-[0_0_12px_rgba(168,85,247,0.08)]">
                  Estuvo al 82%. Tu hora pico fue el jueves a las 7:00 PM. Detecté que el
                  grupo de &apos;Fútbol Club Cali&apos; no ha reservado su horario habitual de
                  este viernes. ¿Quieres que les envíe un mensaje de reactivación por WhatsApp
                  ahora mismo?
                </p>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[#00FF66]/20 bg-[#00FF66]/10 px-2.5 py-1 text-[11px] text-[#00FF66] transition-colors hover:bg-[#00FF66]/20"
                  >
                    ✅ Sí, enviar WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    className="rounded-md border border-white/5 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    ❌ No, gracias
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleEnviar} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Pregúntale a Zyra AI..."
              className="min-w-0 flex-1 rounded-lg border border-white/5 bg-[#121212] px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-purple-500/30"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              className="shrink-0 rounded-lg bg-purple-600/80 p-2 text-white transition-colors hover:bg-purple-500"
            >
              <Send size={14} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-expanded={abierto}
        aria-label="Abrir Ask Zyra"
        onClick={alternar}
        className="flex items-center gap-1.5 bg-transparent text-xs text-[#6b6b7b] transition-all hover:text-white"
      >
        <Sparkles className="h-3.5 w-3.5 opacity-40" strokeWidth={1.5} />
        <span>Ask Zyra</span>
      </button>
    </div>
  );
}

export default AskZyraChat;

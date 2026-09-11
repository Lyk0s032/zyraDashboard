/** Pantallas de la app embebidas en mockups (reemplazables por PNG reales en /public/landing/). */

const POS = [
  { n: 1, x: 18, y: 72 },
  { n: 2, x: 42, y: 58 },
  { n: 3, x: 68, y: 74 },
  { n: 4, x: 28, y: 38 },
  { n: 5, x: 55, y: 28 },
  { n: 6, x: 78, y: 42 },
];

export function ScreenMarcador() {
  return (
    <div className="flex h-full flex-col bg-[#070707] text-white">
      <div className="flex items-center justify-between px-3 pb-2 pt-8 text-[9px] text-zinc-500">
        <span>EN VIVO</span>
        <span className="rounded-sm bg-[#00FF66]/15 px-1.5 py-0.5 font-semibold text-[#00FF66]">SET 2</span>
      </div>

      <div className="mx-2 rounded-xl border border-white/10 bg-[#111] px-3 py-3">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide">Ángeles</p>
            <p className="text-[8px] text-zinc-500">Local</p>
          </div>
          <div className="flex items-baseline gap-1.5 font-black tabular-nums leading-none">
            <span className="text-4xl text-white">21</span>
            <span className="text-lg text-zinc-600">–</span>
            <span className="text-4xl text-[#00FF66]">19</span>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide">Norte</p>
            <p className="text-[8px] text-zinc-500">Visitante</p>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[1, 1, 0].map((won, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${won ? 'bg-[#00FF66]' : 'bg-zinc-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="mx-2 mt-2 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] p-2">
        <p className="mb-1.5 text-[8px] font-medium uppercase tracking-wider text-zinc-500">
          Rotación · mapa de calor
        </p>
        <div className="relative h-[58%] overflow-hidden rounded-lg border border-white/5 bg-[#0a1a12]">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                'radial-gradient(circle at 42% 58%, rgba(0,255,102,0.55) 0%, transparent 28%), radial-gradient(circle at 68% 74%, rgba(0,255,102,0.35) 0%, transparent 24%), radial-gradient(circle at 28% 38%, rgba(255,200,0,0.25) 0%, transparent 22%), linear-gradient(180deg, #0a1a12, #06100c)',
            }}
          />
          <div className="absolute inset-x-[8%] top-1/2 h-px bg-white/20" />
          <div className="absolute inset-y-[10%] left-1/2 w-px bg-white/15" />
          {POS.map((p) => (
            <span
              key={p.n}
              className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#00FF66]/50 bg-black/70 text-[8px] font-bold text-[#00FF66]"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.n}
            </span>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          {['Ace · #12 Ángeles', 'Ataque fuera · #7 Norte', 'Bloqueo · #5 Ángeles'].map((ev) => (
            <div key={ev} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1 text-[8px] text-zinc-400">
              <span className="h-1 w-1 rounded-full bg-[#00FF66]" />
              {ev}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex justify-around border-t border-white/5 px-2 py-2 text-[8px] text-zinc-600">
        <span className="text-white">Marcador</span>
        <span>Stats</span>
        <span>Chat</span>
      </div>
    </div>
  );
}

export function ScreenClub() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      <div className="relative h-[28%] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-black text-sm font-black">
            VC
          </div>
          <div className="min-w-0 pb-0.5">
            <p className="truncate text-sm font-semibold">Volley Club Norte</p>
            <p className="text-[9px] text-zinc-400">4 divisiones · 86 atletas</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/5 px-2 pt-2 text-[8px]">
        {['Inicio', 'Plantel', 'Eventos'].map((t, i) => (
          <span
            key={t}
            className={`rounded-full px-2.5 py-1 ${i === 2 ? 'bg-white text-black' : 'text-zinc-500'}`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="space-y-2 p-3">
        <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Próximo entrenamiento</p>
        <div className="rounded-xl border border-white/10 bg-[#111] p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold">Sesión táctica · U18</p>
              <p className="mt-0.5 text-[9px] text-zinc-500">Vie 18:30 · Cancha 2</p>
            </div>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold">RSVP</span>
          </div>
          <div className="mt-3 flex gap-1.5">
            {['Voy', 'Tal vez', 'No'].map((label, i) => (
              <button
                key={label}
                type="button"
                className={`flex-1 rounded-lg py-1.5 text-[9px] font-semibold ${
                  i === 0 ? 'bg-[#00FF66] text-black' : 'border border-white/10 text-zinc-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[8px] text-zinc-500">24 confirmados · asistencia registrada</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111] p-3">
          <p className="text-[9px] font-medium text-zinc-400">Evaluación de rendimiento</p>
          <div className="mt-2 space-y-1.5">
            {[
              { label: 'Recepción', v: 78 },
              { label: 'Ataque', v: 64 },
              { label: 'Bloqueo', v: 71 },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-0.5 flex justify-between text-[8px] text-zinc-500">
                  <span>{m.label}</span>
                  <span>{m.v}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-white" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenRotacion() {
  const cells = Array.from({ length: 48 }, (_, i) => {
    const heat = [0.05, 0.12, 0.2, 0.35, 0.55, 0.75, 0.9][Math.abs((i * 7) % 7)];
    return heat;
  });

  return (
    <div className="flex h-full flex-col bg-[#050505] text-white">
      <div className="px-3 pb-2 pt-8">
        <p className="text-[9px] uppercase tracking-wider text-zinc-500">Función destacada</p>
        <p className="text-sm font-semibold">Mapa de calor · rotación</p>
      </div>

      <div className="mx-2 flex-1 rounded-xl border border-white/10 bg-[#0b0b0b] p-2">
        <div className="relative h-full overflow-hidden rounded-lg border border-[#00FF66]/20 bg-[#06140e]">
          <div
            className="absolute inset-0 grid grid-cols-6 gap-px p-1 opacity-90"
            style={{ gridTemplateRows: 'repeat(8, 1fr)' }}
          >
            {cells.map((h, i) => (
              <div
                key={i}
                className="rounded-[2px]"
                style={{ backgroundColor: `rgba(0, 255, 102, ${h})` }}
              />
            ))}
          </div>
          <div className="absolute inset-x-[6%] top-1/2 h-px bg-white/25" />
          <div className="absolute inset-y-[8%] left-1/2 w-px bg-white/20" />
          {[
            { n: 1, x: '22%', y: '70%' },
            { n: 2, x: '48%', y: '55%' },
            { n: 3, x: '74%', y: '72%' },
            { n: 4, x: '26%', y: '32%' },
            { n: 5, x: '52%', y: '22%' },
            { n: 6, x: '78%', y: '35%' },
          ].map((p) => (
            <span
              key={p.n}
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-bold"
              style={{ left: p.x, top: p.y }}
            >
              {p.n}
            </span>
          ))}
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-2 py-1.5 backdrop-blur-sm">
            <p className="text-[8px] leading-snug text-zinc-300">
              Zonas calientes = dónde cae el balón. Cruza con la rotación real del set.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 p-3 text-center text-[8px] text-zinc-500">
        <div className="rounded-lg border border-white/5 py-2">
          <p className="text-sm font-bold text-white">142</p>
          <p>Peloteos</p>
        </div>
        <div className="rounded-lg border border-white/5 py-2">
          <p className="text-sm font-bold text-[#00FF66]">38%</p>
          <p>Zona 1</p>
        </div>
        <div className="rounded-lg border border-white/5 py-2">
          <p className="text-sm font-bold text-white">6</p>
          <p>Rotación</p>
        </div>
      </div>
    </div>
  );
}

export function ScreenComplejos() {
  const slots = [
    { h: '08:00', s: 'libre' },
    { h: '09:00', s: 'ocupado' },
    { h: '10:00', s: 'ocupado' },
    { h: '11:00', s: 'libre' },
    { h: '12:00', s: 'bloqueado' },
    { h: '14:00', s: 'ocupado' },
    { h: '16:00', s: 'libre' },
    { h: '18:00', s: 'ocupado' },
  ];

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-white">
      <div className="border-b border-[#21262D] px-3 pb-2 pt-8">
        <p className="text-[9px] uppercase tracking-wider text-[#00B488]">Dashboard complejos</p>
        <p className="text-sm font-semibold">Cancha Central</p>
        <p className="text-[9px] text-zinc-500">Hoy · 8 reservas</p>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden p-2">
        {slots.map((slot) => (
          <div
            key={slot.h}
            className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-[9px] ${
              slot.s === 'ocupado'
                ? 'border-[#00B488]/30 bg-[#00B488]/10 text-[#00B488]'
                : slot.s === 'bloqueado'
                  ? 'border-white/5 bg-zinc-900 text-zinc-600'
                  : 'border-[#21262D] text-zinc-400'
            }`}
          >
            <span className="font-mono tabular-nums">{slot.h}</span>
            <span className="capitalize">{slot.s === 'libre' ? 'Disponible' : slot.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

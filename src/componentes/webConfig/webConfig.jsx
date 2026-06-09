import { useCallback, useState } from 'react';
import { ExternalLink, Upload } from 'lucide-react';

const INPUT_CLASS =
  'w-full rounded-lg border border-[#21262D] bg-[#0d1117] px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none transition focus:border-[#00B488]/40 focus:ring-1 focus:ring-[#00B488]/20';
const LABEL_CLASS = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500';
const CARD_CLASS = 'rounded-lg border border-[#21262D] bg-[#161B22] p-4';

const TIPOGRAFIAS = [
  { value: 'inter', label: 'Inter (Moderna)' },
  { value: 'dm-sans', label: 'DM Sans (Limpia)' },
  { value: 'playfair', label: 'Playfair Display (Elegante)' },
];

const CONFIG_INICIAL = {
  titulo: 'Complejo Deportivo Zyra',
  eslogan: 'Reserva tu cancha en segundos. Fútbol, pádel y más.',
  fotoPortada: null,
  colorAcento: '#00B488',
  tipografia: 'inter',
  whatsapp: '+57 300 123 4567',
  instagram: '@complejozyra',
  direccion: 'Calle 45 #12-34, Medellín',
  trasladarPasarela: false,
};

const FUENTES_PREVIEW = {
  inter: 'font-sans',
  'dm-sans': 'font-sans',
  playfair: 'font-serif',
};

function ToggleSwitch({ activo, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={ariaLabel}
      onClick={() => onChange(!activo)}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: activo ? '#00B488' : '#52525b' }}
    >
      <span
        className={`absolute top-[3px] left-[3px] h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          activo ? 'translate-x-[16px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function BloqueEditor({ titulo, children }) {
  return (
    <section className={CARD_CLASS}>
      <h3 className="mb-4 text-xs font-semibold text-white">{titulo}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function CampoTexto({ label, value, onChange, placeholder, multiline = false }) {
  const props = {
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    className: INPUT_CLASS,
  };

  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      {multiline ? (
        <textarea {...props} rows={3} className={`${INPUT_CLASS} resize-none`} />
      ) : (
        <input type="text" {...props} />
      )}
    </div>
  );
}

function ZonaSubidaPortada({ fotoPortada, onChange }) {
  const manejarArchivo = useCallback(
    (file) => {
      if (!file?.type.startsWith('image/')) return;
      onChange(URL.createObjectURL(file));
    },
    [onChange]
  );

  return (
    <div>
      <label className={LABEL_CLASS}>Foto de Portada</label>
      <div
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#30363D] bg-[#0d1117]/60 px-4 py-6 text-center transition hover:border-[#00B488]/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          manejarArchivo(e.dataTransfer.files[0]);
        }}
        onClick={() => document.getElementById('input-foto-portada')?.click()}
      >
        {fotoPortada ? (
          <img
            src={fotoPortada}
            alt="Vista previa portada"
            className="max-h-24 w-full rounded-md object-cover"
          />
        ) : (
          <>
            <Upload size={18} className="mb-2 text-zinc-500" strokeWidth={1.5} />
            <p className="text-[11px] text-zinc-400">Arrastra una imagen o haz clic para subir</p>
            <p className="mt-1 text-[10px] text-zinc-600">PNG, JPG · Recomendado 1920×800</p>
          </>
        )}
        <input
          id="input-foto-portada"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => manejarArchivo(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

function PreviewLanding({ config }) {
  const fuente = FUENTES_PREVIEW[config.tipografia] ?? 'font-sans';

  return (
    <div className={`${fuente} bg-[#0a0a0a] text-white`}>
      <header
        className="relative flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center"
        style={{
          backgroundImage: config.fotoPortada
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${config.fotoPortada})`
            : 'linear-gradient(135deg, #161B22 0%, #0d1117 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="text-2xl font-bold tracking-tight">{config.titulo || 'Tu Complejo'}</h1>
        <p className="mt-2 max-w-md text-sm text-zinc-300">
          {config.eslogan || 'Eslogan de bienvenida'}
        </p>
        <button
          type="button"
          className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: config.colorAcento }}
        >
          Reservar Cancha Online
        </button>
      </header>

      <section className="border-b border-white/5 px-6 py-8">
        <h2 className="text-sm font-semibold text-white">Horarios de Atención</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-zinc-400">
          <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
            <span className="block text-zinc-500">Lun — Vie</span>
            <span className="text-zinc-200">6:00 AM — 11:00 PM</span>
          </div>
          <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
            <span className="block text-zinc-500">Sáb — Dom</span>
            <span className="text-zinc-200">7:00 AM — 10:00 PM</span>
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <h2 className="text-sm font-semibold text-white">Contacto</h2>
        <ul className="mt-3 space-y-2 text-[11px] text-zinc-400">
          {config.whatsapp && (
            <li>
              WhatsApp: <span className="text-zinc-200">{config.whatsapp}</span>
            </li>
          )}
          {config.instagram && (
            <li>
              Instagram: <span className="text-zinc-200">{config.instagram}</span>
            </li>
          )}
          {config.direccion && (
            <li>
              Dirección: <span className="text-zinc-200">{config.direccion}</span>
            </li>
          )}
        </ul>
      </section>

      {config.trasladarPasarela && (
        <div className="mx-6 mb-8 rounded-lg border border-[#00B488]/20 bg-[#00B488]/5 px-4 py-3 text-[10px] text-zinc-400">
          La comisión de pasarela se incluye de forma transparente en el anticipo del cliente.
        </div>
      )}
    </div>
  );
}

function WebConfig() {
  const [config, setConfig] = useState(CONFIG_INICIAL);

  const actualizar = useCallback((campo, valor) => {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden animate-fade-in">
      <header className="flex-shrink-0 border-b border-[#21262D] px-5 py-4">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-white">Configuración de tu Sitio Web</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#30363D] bg-[#161B22] px-3 py-2 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <ExternalLink size={13} strokeWidth={1.5} />
              Ver Sitio Vivo
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#00B488] px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-[#00c896]"
            >
              Publicar Cambios
            </button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <BloqueEditor titulo="Textos Hero">
              <CampoTexto
                label="Título Principal de la Web"
                value={config.titulo}
                onChange={(v) => actualizar('titulo', v)}
                placeholder="Nombre de tu complejo"
              />
              <CampoTexto
                label="Eslogan de bienvenida"
                value={config.eslogan}
                onChange={(v) => actualizar('eslogan', v)}
                placeholder="Una frase que invite a reservar"
                multiline
              />
              <ZonaSubidaPortada
                fotoPortada={config.fotoPortada}
                onChange={(v) => actualizar('fotoPortada', v)}
              />
            </BloqueEditor>

            <BloqueEditor titulo="Estilo">
              <div>
                <label className={LABEL_CLASS}>Color de Acento de los Botones</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.colorAcento}
                    onChange={(e) => actualizar('colorAcento', e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-[#21262D] bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.colorAcento}
                    onChange={(e) => actualizar('colorAcento', e.target.value)}
                    className={`${INPUT_CLASS} max-w-[120px] font-mono`}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="tipografia-select">
                  Tipografía
                </label>
                <select
                  id="tipografia-select"
                  value={config.tipografia}
                  onChange={(e) => actualizar('tipografia', e.target.value)}
                  className={INPUT_CLASS}
                >
                  {TIPOGRAFIAS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </BloqueEditor>

            <BloqueEditor titulo="Contacto">
              <CampoTexto
                label="WhatsApp"
                value={config.whatsapp}
                onChange={(v) => actualizar('whatsapp', v)}
                placeholder="+57 300 000 0000"
              />
              <CampoTexto
                label="Instagram"
                value={config.instagram}
                onChange={(v) => actualizar('instagram', v)}
                placeholder="@tucomplejo"
              />
              <CampoTexto
                label="Dirección física"
                value={config.direccion}
                onChange={(v) => actualizar('direccion', v)}
                placeholder="Calle, ciudad"
              />
            </BloqueEditor>

            <section className={`${CARD_CLASS} border-[#00B488]/20`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-white">
                    Trasladar costos de pasarela al usuario que reserva
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                    Si se activa, el sistema sumará la comisión bancaria de la pasarela al anticipo
                    del cliente de forma transparente. Tu recaudación online será 100% gratis.
                  </p>
                </div>
                <ToggleSwitch
                  activo={config.trasladarPasarela}
                  onChange={(v) => actualizar('trasladarPasarela', v)}
                  ariaLabel="Trasladar costos de pasarela al usuario"
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-7">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Previsualización en vivo
            </p>
            <div className="overflow-hidden rounded-xl border border-[#21262D] bg-[#161B22] shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-[#21262D] bg-[#0d1117] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 flex-1 truncate rounded-md border border-[#21262D] bg-[#161B22] px-3 py-1 text-[10px] text-zinc-500">
                  tucomplejo.zyra.app
                </span>
              </div>
              <div className="h-[650px] overflow-y-auto">
                <PreviewLanding config={config} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebConfig;

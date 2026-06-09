import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Droplets,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  Image,
  LayoutTemplate,
  Lightbulb,
  MapPin,
  Monitor,
  Plus,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Type,
  Upload,
  Users,
  X,
} from 'lucide-react';

const INPUT_CLASS =
  'w-full rounded-lg border border-[#21262D] bg-[#0d1117] px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none transition focus:border-[#00B488]/40 focus:ring-1 focus:ring-[#00B488]/20';
const LABEL_CLASS = 'mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500';
const SCROLL_HIDDEN = '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';
const MOBILE_PREVIEW_WIDTH = 390;

/** Contenedor interno: full-bleed en el canvas, contenido centrado y acotado en desktop */
function ContenedorSeccion({ children, className = '', estrecho = false }) {
  return (
    <div className={`mx-auto w-full ${estrecho ? 'max-w-3xl' : 'max-w-6xl'} ${className}`}>
      {children}
    </div>
  );
}

const TEMAS = [
  { id: 'esmeralda', label: 'Esmeralda', color: '#00B488' },
  { id: 'azul', label: 'Azul', color: '#3B82F6' },
  { id: 'naranja', label: 'Naranja', color: '#F97316' },
  { id: 'blanco', label: 'Blanco', color: '#F8FAFC' },
];

const SERVICIOS_DISPONIBLES = [
  { key: 'cafeteria', label: 'Cafetería', icon: Coffee },
  { key: 'parqueadero', label: 'Parqueadero', icon: Car },
  { key: 'duchas', label: 'Duchas', icon: Droplets },
  { key: 'zonaSocial', label: 'Zona Social', icon: Users },
  { key: 'iluminacionPro', label: 'Iluminación Pro', icon: Lightbulb },
];

const SECTION_META = {
  hero: { label: 'Sección Hero', emoji: '🚀', editLabel: 'Hero' },
  services: { label: 'Comodidades', emoji: '✨', editLabel: 'Comodidades' },
  courts: { label: 'Nuestras Canchas', emoji: '🏟️', editLabel: 'Canchas' },
  faqs: { label: 'Preguntas Frecuentes', emoji: '❓', editLabel: 'FAQs' },
  footer: { label: 'Pie de página', emoji: '📍', editLabel: 'Footer' },
  gallery: { label: 'Galería de Fotos', emoji: '🖼️', editLabel: 'Galería' },
  text: { label: 'Texto Libre', emoji: '📝', editLabel: 'Texto' },
  reviews: { label: 'Reseñas', emoji: '⭐', editLabel: 'Reseñas' },
  global: { label: 'Marca del sitio', emoji: '🎨', editLabel: 'Marca' },
};

const ADD_SECTION_OPTIONS = [
  { type: 'hero', label: 'Banner Principal', icon: LayoutTemplate },
  { type: 'services', label: 'Comodidades', icon: Sparkles },
  { type: 'courts', label: 'Nuestras Canchas', icon: MapPin },
  { type: 'gallery', label: 'Galería de Fotos', icon: Image },
  { type: 'text', label: 'Bloque de Texto', icon: Type },
  { type: 'reviews', label: 'Reseñas', icon: Star },
  { type: 'faqs', label: 'FAQs', icon: HelpCircle },
];

const FUENTES_HERO = [
  { id: 'sm', label: 'Compacta', class: 'text-2xl sm:text-3xl' },
  { id: 'md', label: 'Estándar', class: 'text-3xl sm:text-4xl' },
  { id: 'lg', label: 'Grande', class: 'text-4xl sm:text-5xl' },
  { id: 'xl', label: 'Impacto', class: 'text-5xl sm:text-6xl' },
];

let sectionCounter = 0;
function uid(type) {
  sectionCounter += 1;
  return `${type}-${sectionCounter}`;
}

const STYLE_DEFAULT = { paddingY: 56, fontSize: 'md', bgImage: null };

function crearSeccion(type) {
  const meta = SECTION_META[type];
  const base = { id: uid(type), type, title: meta?.label ?? type, visible: true };

  switch (type) {
    case 'hero':
      return {
        ...base,
        data: {
          titulo: 'Tu cancha, reservada en segundos',
          subtitulo: 'Fútbol, pádel y tenis con reserva online instantánea.',
          botonTexto: 'Reservar Ahora',
          socialProof: 'Más de 2,000 deportistas nos eligen',
          style: { ...STYLE_DEFAULT, paddingY: 72 },
        },
      };
    case 'services':
      return {
        ...base,
        data: {
          heading: 'Nuestras comodidades',
          servicios: { cafeteria: true, parqueadero: true, duchas: false, zonaSocial: true, iluminacionPro: true },
          style: { ...STYLE_DEFAULT, paddingY: 40 },
        },
      };
    case 'courts':
      return {
        ...base,
        data: {
          heading: 'Canchas disponibles',
          subtitulo: 'Reserva online al instante',
          canchas: [
            { id: 1, nombre: 'Cancha Central', tipo: 'Fútbol 7', precio: '$85.000/h' },
            { id: 2, nombre: 'Pista Premium', tipo: 'Pádel', precio: '$120.000/h' },
          ],
          style: { ...STYLE_DEFAULT },
        },
      };
    case 'faqs':
      return {
        ...base,
        data: {
          faqs: [
            { pregunta: '¿Cómo reservo una cancha?', respuesta: 'Elige deporte, fecha y hora, y confirma con anticipo online.' },
            { pregunta: '¿Puedo cancelar mi reserva?', respuesta: 'Sí, hasta 24 h antes con reintegro automático.' },
          ],
          style: { ...STYLE_DEFAULT },
        },
      };
    case 'footer':
      return {
        ...base,
        data: {
          whatsapp: '+57 300 123 4567',
          instagram: '@complejozyra',
          direccion: 'Calle 45 #12-34, Medellín',
          horarioSemana: '6:00 AM — 11:00 PM',
          horarioFinde: '7:00 AM — 10:00 PM',
          style: { ...STYLE_DEFAULT, paddingY: 48 },
        },
      };
    case 'gallery':
      return {
        ...base,
        data: {
          heading: 'Nuestras instalaciones',
          items: [
            { id: 1, caption: 'Cancha principal' },
            { id: 2, caption: 'Zona de pádel' },
            { id: 3, caption: 'Área social' },
          ],
          style: { ...STYLE_DEFAULT },
        },
      };
    case 'text':
      return {
        ...base,
        data: {
          heading: 'Sobre nosotros',
          body: 'Somos el complejo deportivo de referencia en la zona. Instalaciones premium y reservas 24/7.',
          style: { ...STYLE_DEFAULT },
        },
      };
    case 'reviews':
      return {
        ...base,
        data: {
          heading: 'Lo que dicen nuestros clientes',
          reviews: [
            { id: 1, nombre: 'Carlos M.', texto: 'Excelentes canchas y reserva rapidísimo.', estrellas: 5 },
            { id: 2, nombre: 'Laura P.', texto: 'La iluminación nocturna es increíble.', estrellas: 5 },
          ],
          style: { ...STYLE_DEFAULT },
        },
      };
    default:
      return { ...base, data: { style: { ...STYLE_DEFAULT } } };
  }
}

const WEB_CONFIG_INICIAL = {
  global: {
    identidad: { logo: null, nombre: 'Complejo Deportivo Zyra', temaColor: '#00B488', temaId: 'esmeralda' },
    finanzas: { asumeUsuario: false },
  },
  sections: [
    crearSeccion('hero'),
    crearSeccion('services'),
    {
      ...crearSeccion('courts'),
      data: {
        heading: 'Canchas disponibles',
        subtitulo: 'Reserva online al instante',
        canchas: [
          { id: 1, nombre: 'Cancha Central', tipo: 'Fútbol 7', precio: '$85.000/h' },
          { id: 2, nombre: 'Pista Premium', tipo: 'Pádel', precio: '$120.000/h' },
          { id: 3, nombre: 'Arena Norte', tipo: 'Tenis', precio: '$70.000/h' },
        ],
        style: { ...STYLE_DEFAULT },
      },
    },
    crearSeccion('faqs'),
    crearSeccion('footer'),
  ],
};

const EJEMPLO_DESGLOSE_PASARELA = [
  { id: 1, concepto: 'Anticipo reserva — Cancha Central · Sáb 18:00', fecha: '08/06/2026', anticipoBruto: '$42.500', comisionPasarela: '$1.487', netoAportado: '$41.013' },
  { id: 2, concepto: 'Anticipo reserva — Pista Premium · Dom 10:00', fecha: '08/06/2026', anticipoBruto: '$60.000', comisionPasarela: '$2.100', netoAportado: '$57.900' },
];

function colorTextoBoton(temaId) {
  return temaId === 'blanco' ? '#0f172a' : '#fff';
}

function claseFuenteHero(fontSize) {
  return FUENTES_HERO.find((f) => f.id === fontSize)?.class ?? FUENTES_HERO[1].class;
}

/* ─── Primitivos ─── */
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
      <span className={`absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${activo ? 'translate-x-[16px]' : 'translate-x-0'}`} />
    </button>
  );
}

function CampoTexto({ label, value, onChange, placeholder, multiline = false }) {
  const props = { value, onChange: (e) => onChange(e.target.value), placeholder, className: INPUT_CLASS };
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      {multiline ? <textarea {...props} rows={3} className={`${INPUT_CLASS} resize-none`} /> : <input type="text" {...props} />}
    </div>
  );
}

function EditableText({ value, onChange, as: Tag = 'span', className = '', onClick }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) ref.current.textContent = value ?? '';
  }, [value]);

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      className={`outline-none empty:before:text-zinc-600 empty:before:content-[attr(data-placeholder)] focus:rounded focus:ring-1 focus:ring-[#00B488]/50 ${className}`}
      data-placeholder="Escribe aquí..."
      onBlur={(e) => onChange(e.currentTarget.textContent?.trim() ?? '')}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' && Tag !== 'p' && Tag !== 'div') e.preventDefault(); }}
    />
  );
}

function ModalDesglosePasarela({ abierto, onCerrar }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCerrar} aria-label="Cerrar" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#21262D] bg-[#161B22] shadow-2xl">
        <div className="shrink-0 border-b border-[#21262D] px-6 py-4">
          <button type="button" onClick={onCerrar} className="absolute right-4 top-4 rounded-lg border border-[#30363D] p-2 text-zinc-400 hover:text-white"><X size={16} /></button>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#00B488]">Ejemplo de desglose</p>
          <h2 className="mt-1 pr-10 text-base font-semibold text-white">Cómo se traslada la comisión al cliente</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-6 py-3">
          <table className="w-full min-w-[520px] table-fixed text-left">
            <colgroup>
              <col className="w-[38%] min-w-[200px]" />
              <col className="w-[14%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-[#21262D] text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="pb-2 pr-4 text-left">Detalle</th>
                <th className="pb-2 pr-4 text-left whitespace-nowrap">Fecha</th>
                <th className="pb-2 pr-4 text-left whitespace-nowrap">Anticipo</th>
                <th className="pb-2 pr-4 text-left whitespace-nowrap">Comisión</th>
                <th className="pb-2 text-right whitespace-nowrap">Neto</th>
              </tr>
            </thead>
            <tbody>
              {EJEMPLO_DESGLOSE_PASARELA.map((tx) => (
                <tr key={tx.id} className="border-b border-[#21262D] last:border-b-0">
                  <td className="min-w-[200px] py-2.5 pr-4 align-top text-left"><p className="text-xs leading-snug text-white">{tx.concepto}</p></td>
                  <td className="py-2.5 pr-4 align-top text-xs tabular-nums text-zinc-400 whitespace-nowrap">{tx.fecha}</td>
                  <td className="py-2.5 pr-4 align-top font-mono text-xs tabular-nums text-zinc-300 whitespace-nowrap">{tx.anticipoBruto}</td>
                  <td className="py-2.5 pr-4 align-top font-mono text-xs tabular-nums text-red-400 whitespace-nowrap">{tx.comisionPasarela}</td>
                  <td className="py-2.5 align-top text-right font-mono text-xs font-semibold tabular-nums text-[#00B488] whitespace-nowrap">{tx.netoAportado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ControlSlider({ label, value, min, max, onChange, unidad = 'px' }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={LABEL_CLASS.replace('mb-1.5 ', '')}>{label}</label>
        <span className="text-[10px] tabular-nums text-zinc-500">{value}{unidad}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#00B488]" />
    </div>
  );
}

/* ─── Top bar Studio ─── */
function TopBarStudio({ nombreComplejo, viewport, onViewportChange, onVolverPanel }) {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-[#21262D] bg-[#0D1117] px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onVolverPanel}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#30363D] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Volver al Panel
        </button>
        <div className="hidden h-5 w-px bg-[#21262D] sm:block" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{nombreComplejo}</p>
          <p className="text-[10px] text-[#00B488]">Modo Edición</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-[#21262D] bg-[#161B22] p-0.5">
        <button
          type="button"
          onClick={() => onViewportChange('desktop')}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
            viewport === 'desktop' ? 'bg-[#21262D] text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Vista escritorio"
        >
          <Monitor size={13} strokeWidth={1.5} />
          <span className="hidden sm:inline">Desktop</span>
        </button>
        <button
          type="button"
          onClick={() => onViewportChange('mobile')}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
            viewport === 'mobile' ? 'bg-[#21262D] text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title="Vista móvil"
        >
          <Smartphone size={13} strokeWidth={1.5} />
          <span className="hidden sm:inline">Móvil</span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#30363D] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          <ExternalLink size={13} strokeWidth={1.5} />
          <span className="hidden sm:inline">Ver Sitio Vivo</span>
        </button>
        <button
          type="button"
          className="rounded-lg bg-[#00B488] px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#00c896]"
        >
          Publicar Cambios
        </button>
      </div>
    </header>
  );
}

/* ─── Panel izquierdo contextual ─── */
function PanelVistaMain({
  webConfig,
  onSelectSection,
  onSelectGlobal,
  onToggleVisible,
  onMoveSection,
  onDeleteSection,
  onAnadirSeccion,
  onFinanzas,
  onVerDesglose,
  menuAnadir,
  setMenuAnadir,
}) {
  const { global, sections } = webConfig;

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          onClick={onSelectGlobal}
          className="mb-3 flex w-full items-center gap-2.5 rounded-lg border border-[#21262D] bg-[#0d1117] px-3 py-2.5 text-left transition hover:border-[#00B488]/30"
        >
          <span className="text-base">🎨</span>
          <span className="text-[11px] font-medium text-white">Marca del sitio</span>
          <span className="ml-auto h-3 w-3 rounded-full ring-1 ring-white/10" style={{ backgroundColor: global.identidad.temaColor }} />
        </button>

        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Bloques de la página</p>
        <div className="space-y-1">
          {sections.map((section, index) => {
            const meta = SECTION_META[section.type] ?? { emoji: '📦', label: section.title };
            return (
              <div
                key={section.id}
                className={`group flex items-center gap-1 rounded-lg border px-1.5 py-1.5 transition ${
                  section.visible ? 'border-[#21262D] bg-[#161B22]' : 'border-[#21262D]/50 bg-[#0d1117]/60 opacity-60'
                }`}
              >
                <span className="cursor-grab px-0.5 text-zinc-600"><GripVertical size={12} /></span>
                <button type="button" onClick={() => onSelectSection(section.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="text-sm">{meta.emoji}</span>
                  <span className="truncate text-[11px] font-medium text-zinc-200">{section.title}</span>
                </button>
                <button type="button" onClick={() => onToggleVisible(section.id)} className="p-1 text-zinc-500 hover:text-white">
                  {section.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button type="button" disabled={index === 0} onClick={() => onMoveSection(section.id, -1)} className="p-1 text-[9px] text-zinc-600 hover:text-white disabled:opacity-30">▲</button>
                <button type="button" disabled={index === sections.length - 1} onClick={() => onMoveSection(section.id, 1)} className="p-1 text-[9px] text-zinc-600 hover:text-white disabled:opacity-30">▼</button>
                <button type="button" onClick={() => onDeleteSection(section.id)} className="p-1 text-zinc-600 hover:text-red-400"><Trash2 size={11} /></button>
              </div>
            );
          })}
        </div>

        <div className="relative mt-3">
          {menuAnadir && (
            <div className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-[220px] overflow-y-auto rounded-xl border border-[#21262D] bg-[#161B22] p-1 shadow-xl">
              {ADD_SECTION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button key={opt.type} type="button" onClick={() => { onAnadirSeccion(opt.type); setMenuAnadir(false); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] text-zinc-300 hover:bg-white/[0.06]">
                    <Icon size={12} className="text-zinc-500" />{opt.label}
                  </button>
                );
              })}
            </div>
          )}
          <button type="button" onClick={() => setMenuAnadir((v) => !v)} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#30363D] py-2 text-[11px] text-zinc-400 hover:border-[#00B488]/40 hover:text-white">
            <Plus size={13} className="text-[#00B488]" /> Añadir Sección
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#21262D] p-4">
        <div className="rounded-lg border border-[#00B488]/20 bg-[#00B488]/5 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-white">Trasladar costos al usuario</p>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">Comisión bancaria transparente al cliente.</p>
              <button type="button" onClick={onVerDesglose} className="mt-1.5 text-[9px] text-[#00B488] hover:underline">Ver desglose →</button>
            </div>
            <ToggleSwitch activo={global.finanzas.asumeUsuario} onChange={onFinanzas} ariaLabel="Trasladar costos" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorProfundoSeccion({ section, identidad, onPatchData, onPatchGlobal }) {
  const { type, data } = section;
  const style = data.style ?? STYLE_DEFAULT;
  const patchStyle = (patch) => onPatchData({ style: { ...style, ...patch } });

  if (type === 'global') {
    return (
      <div className="space-y-4">
        <CampoTexto label="Nombre del complejo" value={identidad.nombre} onChange={(v) => onPatchGlobal({ nombre: v })} />
        <div>
          <label className={LABEL_CLASS}>Color de marca</label>
          <div className="flex flex-wrap gap-2">
            {TEMAS.map((t) => (
              <button key={t.id} type="button" onClick={() => onPatchGlobal({ temaId: t.id, temaColor: t.color })} className={`h-8 w-8 rounded-full ring-2 transition hover:scale-110 ${identidad.temaId === t.id ? 'ring-[#00B488]' : 'ring-transparent'}`} style={{ backgroundColor: t.color }} title={t.label} />
            ))}
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS}>Logo</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#30363D] px-3 py-3 text-[11px] text-zinc-400 hover:border-[#00B488]/40">
            <Upload size={14} /> {identidad.logo ? 'Cambiar logo' : 'Subir logo'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f?.type.startsWith('image/')) onPatchGlobal({ logo: URL.createObjectURL(f) }); }} />
          </label>
          {identidad.logo && <img src={identidad.logo} alt="" className="mt-2 max-h-16 rounded-md object-contain" />}
        </div>
      </div>
    );
  }

  const bloqueEstilo = (
    <>
      <ControlSlider label="Padding vertical" value={style.paddingY ?? 56} min={24} max={120} onChange={(v) => patchStyle({ paddingY: v })} />
    </>
  );

  switch (type) {
    case 'hero':
      return (
        <div className="space-y-4">
          {bloqueEstilo}
          <div>
            <label className={LABEL_CLASS}>Tamaño del título</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FUENTES_HERO.map((f) => (
                <button key={f.id} type="button" onClick={() => patchStyle({ fontSize: f.id })} className={`rounded-lg border px-2 py-2 text-[10px] transition ${style.fontSize === f.id ? 'border-[#00B488]/50 bg-[#00B488]/10 text-white' : 'border-[#21262D] text-zinc-400 hover:border-zinc-600'}`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Imagen de fondo</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#30363D] px-3 py-3 text-[11px] text-zinc-400 hover:border-[#00B488]/40">
              <Upload size={14} /> {style.bgImage ? 'Cambiar imagen' : 'Subir imagen de fondo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f?.type.startsWith('image/')) patchStyle({ bgImage: URL.createObjectURL(f) }); }} />
            </label>
            {style.bgImage && (
              <div className="relative mt-2">
                <img src={style.bgImage} alt="" className="h-20 w-full rounded-lg object-cover" />
                <button type="button" onClick={() => patchStyle({ bgImage: null })} className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white"><X size={10} /></button>
              </div>
            )}
          </div>
          <CampoTexto label="Texto del botón CTA" value={data.botonTexto} onChange={(v) => onPatchData({ botonTexto: v })} />
        </div>
      );
    case 'services':
      return (
        <div className="space-y-4">
          {bloqueEstilo}
          <p className={LABEL_CLASS}>Comodidades visibles</p>
          <div className="space-y-1">
            {SERVICIOS_DISPONIBLES.map((s) => {
              const Icon = s.icon;
              const activo = data.servicios[s.key];
              return (
                <button key={s.key} type="button" onClick={() => onPatchData({ servicios: { ...data.servicios, [s.key]: !activo } })} className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] ${activo ? 'border-[#00B488]/30 bg-[#00B488]/5 text-white' : 'border-[#21262D] text-zinc-500'}`}>
                  <Icon size={13} />{s.label}
                  <span className={`ml-auto h-2 w-2 rounded-full ${activo ? 'bg-[#00B488]' : 'bg-zinc-700'}`} />
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'courts':
      return (
        <div className="space-y-4">
          {bloqueEstilo}
          {data.canchas.map((c, i) => (
            <div key={c.id} className="space-y-2 rounded-lg border border-[#21262D] bg-[#0d1117]/50 p-3">
              <p className="text-[9px] font-semibold uppercase text-zinc-600">Cancha {i + 1}</p>
              <CampoTexto label="Nombre" value={c.nombre} onChange={(v) => { const canchas = [...data.canchas]; canchas[i] = { ...canchas[i], nombre: v }; onPatchData({ canchas }); }} />
              <CampoTexto label="Tipo" value={c.tipo} onChange={(v) => { const canchas = [...data.canchas]; canchas[i] = { ...canchas[i], tipo: v }; onPatchData({ canchas }); }} />
              <CampoTexto label="Precio" value={c.precio} onChange={(v) => { const canchas = [...data.canchas]; canchas[i] = { ...canchas[i], precio: v }; onPatchData({ canchas }); }} />
            </div>
          ))}
        </div>
      );
    case 'faqs':
      return (
        <div className="space-y-4">
          {bloqueEstilo}
          {data.faqs.map((faq, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-[#21262D] bg-[#0d1117]/50 p-3">
              <CampoTexto label={`Pregunta ${i + 1}`} value={faq.pregunta} onChange={(v) => { const faqs = [...data.faqs]; faqs[i] = { ...faqs[i], pregunta: v }; onPatchData({ faqs }); }} />
              <CampoTexto label="Respuesta" value={faq.respuesta} onChange={(v) => { const faqs = [...data.faqs]; faqs[i] = { ...faqs[i], respuesta: v }; onPatchData({ faqs }); }} multiline />
            </div>
          ))}
        </div>
      );
    case 'footer':
      return (
        <div className="space-y-4">
          {bloqueEstilo}
          <CampoTexto label="WhatsApp" value={data.whatsapp} onChange={(v) => onPatchData({ whatsapp: v })} />
          <CampoTexto label="Instagram" value={data.instagram} onChange={(v) => onPatchData({ instagram: v })} />
          <CampoTexto label="Dirección" value={data.direccion} onChange={(v) => onPatchData({ direccion: v })} />
          <CampoTexto label="Horario semana" value={data.horarioSemana} onChange={(v) => onPatchData({ horarioSemana: v })} />
          <CampoTexto label="Horario fin de semana" value={data.horarioFinde} onChange={(v) => onPatchData({ horarioFinde: v })} />
        </div>
      );
    case 'gallery':
    case 'text':
    case 'reviews':
      return (
        <div className="space-y-4">
          {bloqueEstilo}
          <CampoTexto label="Título" value={data.heading} onChange={(v) => onPatchData({ heading: v })} />
          {type === 'text' && <CampoTexto label="Contenido" value={data.body} onChange={(v) => onPatchData({ body: v })} multiline />}
        </div>
      );
    default:
      return bloqueEstilo;
  }
}

function PanelVistaSeccion({ section, identidad, onVolver, onPatchData, onPatchGlobal }) {
  const meta = section?.type === 'global' ? SECTION_META.global : SECTION_META[section?.type];
  const editLabel = meta?.editLabel ?? section?.title;

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="shrink-0 border-b border-[#21262D] px-4 py-4">
        <button type="button" onClick={onVolver} className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-[#30363D] px-2.5 py-1.5 text-[10px] font-medium text-zinc-400 transition hover:border-[#00B488]/40 hover:text-white">
          <ArrowLeft size={12} /> Volver
        </button>
        <h2 className="text-sm font-semibold text-[#00B488]">
          {meta?.emoji} Editando {editLabel}
        </h2>
        <p className="mt-1 text-[10px] text-zinc-500">Ajustes profundos del bloque · El texto también se edita en el lienzo</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <EditorProfundoSeccion section={section} identidad={identidad} onPatchData={onPatchData} onPatchGlobal={onPatchGlobal} />
      </div>
    </div>
  );
}

function PanelContextual({
  abierto,
  activeEditorTab,
  activeSectionId,
  webConfig,
  onVolver,
  onSelectSection,
  onSelectGlobal,
  onPatchSection,
  onPatchGlobal,
  onToggleVisible,
  onMoveSection,
  onDeleteSection,
  onAnadirSeccion,
  onFinanzas,
  onVerDesglose,
  menuAnadir,
  setMenuAnadir,
  onTogglePanel,
}) {
  const section =
    activeSectionId === 'global'
      ? { type: 'global', id: 'global', title: 'Marca del sitio', data: {} }
      : webConfig.sections.find((s) => s.id === activeSectionId);

  return (
    <div className="relative z-20 flex h-full shrink-0">
      <aside
        className={`flex h-full max-w-[320px] flex-col overflow-hidden border-r border-[#21262D] bg-[#161B22] transition-[width] duration-300 ease-out ${
          abierto ? 'w-[320px]' : 'w-0 border-r-0'
        }`}
      >
        <div className={`flex h-full w-[320px] flex-col ${abierto ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity duration-200`}>
          {activeEditorTab === 'main' ? (
            <PanelVistaMain
              webConfig={webConfig}
              onSelectSection={onSelectSection}
              onSelectGlobal={onSelectGlobal}
              onToggleVisible={onToggleVisible}
              onMoveSection={onMoveSection}
              onDeleteSection={onDeleteSection}
              onAnadirSeccion={onAnadirSeccion}
              onFinanzas={onFinanzas}
              onVerDesglose={onVerDesglose}
              menuAnadir={menuAnadir}
              setMenuAnadir={setMenuAnadir}
            />
          ) : section ? (
            <PanelVistaSeccion
              section={section}
              identidad={webConfig.global.identidad}
              onVolver={onVolver}
              onPatchData={(patch) => activeSectionId !== 'global' && onPatchSection(activeSectionId, patch)}
              onPatchGlobal={onPatchGlobal}
            />
          ) : (
            <PanelVistaMain
              webConfig={webConfig}
              onSelectSection={onSelectSection}
              onSelectGlobal={onSelectGlobal}
              onToggleVisible={onToggleVisible}
              onMoveSection={onMoveSection}
              onDeleteSection={onDeleteSection}
              onAnadirSeccion={onAnadirSeccion}
              onFinanzas={onFinanzas}
              onVerDesglose={onVerDesglose}
              menuAnadir={menuAnadir}
              setMenuAnadir={setMenuAnadir}
            />
          )}
        </div>
      </aside>

      <button
        type="button"
        onClick={onTogglePanel}
        aria-label={abierto ? 'Ocultar panel' : 'Mostrar panel'}
        className={`absolute top-1/2 z-30 flex h-10 w-5 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-[#21262D] bg-[#161B22] text-zinc-500 shadow-md transition-all duration-300 hover:border-[#00B488]/40 hover:text-[#00B488] ${
          abierto ? 'left-[320px]' : 'left-0'
        }`}
      >
        {abierto ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
}

/* ─── Canvas secciones ─── */
function SeccionCanvas({ section, index, total, selected, onSelect, onMoveUp, onMoveDown, onDelete, children }) {
  const meta = SECTION_META[section.type] ?? { label: section.title, emoji: '📦' };
  const controlesVisibles = selected ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100';

  return (
    <div
      className={`group/section relative ${selected ? 'z-[2]' : ''}`}
      onClick={(e) => { if (!e.target.isContentEditable) onSelect(section.id); }}
    >
      <div className={`pointer-events-none absolute inset-0 z-[5] ring-1 ring-inset ring-[#00B488]/70 transition-opacity duration-150 ${selected ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100'}`} />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(section.id); }}
        className={`absolute left-0 top-0 z-[15] inline-flex max-w-[calc(100%-4rem)] items-center gap-0.5 rounded-br-md border border-t-0 border-l-0 border-[#00B488]/25 bg-[#0a0a0a]/80 px-1.5 py-0.5 text-[9px] font-medium leading-none text-[#00B488]/90 backdrop-blur-[2px] transition-opacity duration-150 ${controlesVisibles}`}
      >
        <span className="shrink-0">{meta.emoji}</span>
        <span className="truncate">{section.title || meta.label}</span>
      </button>

      <div className={`absolute right-0 top-0 z-[15] flex transition-opacity duration-150 ${controlesVisibles}`}>
        <button type="button" disabled={index === 0} onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="flex h-5 w-5 items-center justify-center border border-t-0 border-r-0 border-[#21262D]/80 bg-[#0a0a0a]/80 text-[8px] text-zinc-500 hover:text-white disabled:opacity-20" title="Subir">▲</button>
        <button type="button" disabled={index === total - 1} onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="flex h-5 w-5 items-center justify-center border border-t-0 border-r-0 border-[#21262D]/80 bg-[#0a0a0a]/80 text-[8px] text-zinc-500 hover:text-white disabled:opacity-20" title="Bajar">▼</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex h-5 w-5 items-center justify-center rounded-bl-md border border-t-0 border-r-0 border-red-500/20 bg-[#0a0a0a]/80 text-red-400/80 hover:text-red-400" title="Eliminar"><Trash2 size={9} /></button>
      </div>

      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function BotonCanvas({ children, identidad, onAbrirEditor, sectionId, className = '' }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onAbrirEditor(sectionId); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onAbrirEditor(sectionId);
        }
      }}
      className={`cursor-pointer transition hover:opacity-90 hover:ring-2 hover:ring-[#00B488]/40 ${className}`}
      style={{ backgroundColor: identidad.temaColor, color: colorTextoBoton(identidad.temaId) }}
    >
      {children}
    </div>
  );
}

function SeccionHero({ data, identidad, onPatch, onAbrirEditor, sectionId, isMobilePreview = false }) {
  const style = data.style ?? STYLE_DEFAULT;
  const py = style.paddingY ?? 72;

  return (
    <section
      className="relative w-full overflow-hidden px-4 py-0 text-center sm:px-6"
      style={{
        paddingTop: py,
        paddingBottom: py,
        backgroundImage: style.bgImage ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${style.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!style.bgImage && (
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${identidad.temaColor}, transparent)` }} />
      )}
      <ContenedorSeccion estrecho className="relative text-center">
        <EditableText as="p" value={data.socialProof} onChange={(v) => onPatch({ socialProof: v })} className="mb-4 text-[11px] font-medium uppercase tracking-widest text-zinc-500" />
        <EditableText
          as="h1"
          value={data.titulo}
          onChange={(v) => onPatch({ titulo: v })}
          className={`font-bold leading-tight tracking-tight text-white ${isMobilePreview ? 'text-3xl' : claseFuenteHero(style.fontSize)}`}
        />
        <EditableText as="p" value={data.subtitulo} onChange={(v) => onPatch({ subtitulo: v })} className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg" />
        <BotonCanvas
          identidad={identidad}
          onAbrirEditor={onAbrirEditor}
          sectionId={sectionId}
          className={`mt-8 inline-flex rounded-xl font-bold shadow-xl sm:mt-10 ${isMobilePreview ? 'px-8 py-3 text-sm' : 'px-10 py-4 text-base'}`}
        >
          <EditableText value={data.botonTexto} onChange={(v) => onPatch({ botonTexto: v })} className="inline-block min-w-[4rem]" onClick={(e) => e.stopPropagation()} />
        </BotonCanvas>
      </ContenedorSeccion>
    </section>
  );
}

function SeccionServices({ data, identidad, onPatch, isMobilePreview = false }) {
  const activos = SERVICIOS_DISPONIBLES.filter((s) => data.servicios[s.key]);
  const py = data.style?.paddingY ?? 40;

  return (
    <section className="w-full border-t border-white/5 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion>
        <EditableText as="h2" value={data.heading} onChange={(v) => onPatch({ heading: v })} className="text-center text-lg font-semibold text-white sm:text-xl" />
        {activos.length > 0 && (
          <ul className="mt-8 flex flex-wrap items-stretch justify-center gap-3 sm:mt-10 sm:gap-4">
            {activos.map((servicio) => {
              const Icon = servicio.icon;
              return (
                <li
                  key={servicio.key}
                  className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-5 text-center sm:px-4 sm:py-6 ${
                    isMobilePreview
                      ? 'w-[calc(50%-0.375rem)] min-w-0'
                      : 'w-[calc(50%-0.375rem)] sm:w-36 md:w-40 lg:w-[11rem]'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11" style={{ backgroundColor: `${identidad.temaColor}20`, color: identidad.temaColor }}>
                    <Icon size={20} />
                  </span>
                  <span className="text-xs font-medium leading-snug text-zinc-300 sm:text-sm">{servicio.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </ContenedorSeccion>
    </section>
  );
}

function SeccionCourts({ data, identidad, onPatch, onAbrirEditor, sectionId, isMobilePreview = false }) {
  const py = data.style?.paddingY ?? 56;
  return (
    <section className="w-full border-t border-white/5 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion>
        <EditableText as="h2" value={data.heading} onChange={(v) => onPatch({ heading: v })} className="text-lg font-semibold text-white sm:text-xl" />
        <EditableText as="p" value={data.subtitulo} onChange={(v) => onPatch({ subtitulo: v })} className="mt-2 text-sm text-zinc-500" />
        <div className="mt-6 space-y-3 sm:mt-8">
          {data.canchas.map((cancha, i) => (
            <div
              key={cancha.id}
              className={`flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 sm:px-6 ${
                isMobilePreview ? 'flex-col items-stretch' : 'flex-col sm:flex-row sm:items-center sm:justify-between'
              }`}
            >
              <div className="min-w-0 flex-1">
                <EditableText value={cancha.nombre} onChange={(v) => { const canchas = [...data.canchas]; canchas[i] = { ...canchas[i], nombre: v }; onPatch({ canchas }); }} className="block text-base font-medium text-white" />
                <EditableText value={cancha.tipo} onChange={(v) => { const canchas = [...data.canchas]; canchas[i] = { ...canchas[i], tipo: v }; onPatch({ canchas }); }} className="block text-sm text-zinc-500" />
              </div>
              <div className={`flex shrink-0 items-center gap-3 sm:gap-4 ${isMobilePreview ? 'justify-between' : 'justify-between sm:justify-end'}`}>
                <EditableText value={cancha.precio} onChange={(v) => { const canchas = [...data.canchas]; canchas[i] = { ...canchas[i], precio: v }; onPatch({ canchas }); }} className="font-mono text-sm font-semibold tabular-nums text-zinc-200" />
                <BotonCanvas identidad={identidad} onAbrirEditor={onAbrirEditor} sectionId={sectionId} className="rounded-lg px-4 py-2 text-xs font-semibold">Reservar</BotonCanvas>
              </div>
            </div>
          ))}
        </div>
      </ContenedorSeccion>
    </section>
  );
}

function SeccionFaqs({ data, onPatch }) {
  const py = data.style?.paddingY ?? 56;
  return (
    <section className="w-full border-t border-white/5 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion estrecho>
        <h2 className="text-lg font-semibold text-white sm:text-xl">Preguntas frecuentes</h2>
        <div className="mt-6 space-y-3">
          {data.faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 sm:px-5">
              <EditableText value={faq.pregunta} onChange={(v) => { const faqs = [...data.faqs]; faqs[i] = { ...faqs[i], pregunta: v }; onPatch({ faqs }); }} className="block text-sm font-medium text-zinc-200" />
              <EditableText as="p" value={faq.respuesta} onChange={(v) => { const faqs = [...data.faqs]; faqs[i] = { ...faqs[i], respuesta: v }; onPatch({ faqs }); }} className="mt-2 text-sm leading-relaxed text-zinc-500" />
            </div>
          ))}
        </div>
      </ContenedorSeccion>
    </section>
  );
}

function SeccionGallery({ data, identidad, onPatch, isMobilePreview = false }) {
  const py = data.style?.paddingY ?? 56;
  return (
    <section className="w-full border-t border-white/5 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion>
        <EditableText as="h2" value={data.heading} onChange={(v) => onPatch({ heading: v })} className="text-lg font-semibold text-white sm:text-xl" />
        <div className={`mt-6 grid w-full gap-3 sm:mt-8 ${isMobilePreview ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
          {data.items.map((item, i) => (
            <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/5" style={{ background: `linear-gradient(135deg, ${identidad.temaColor}18 0%, #161B22 100%)` }}>
              <div className="absolute inset-0 flex items-center justify-center"><Image size={24} className="text-zinc-600" /></div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3">
                <EditableText value={item.caption} onChange={(v) => { const items = [...data.items]; items[i] = { ...items[i], caption: v }; onPatch({ items }); }} className="block text-xs text-zinc-300" />
              </div>
            </div>
          ))}
        </div>
      </ContenedorSeccion>
    </section>
  );
}

function SeccionText({ data, onPatch }) {
  const py = data.style?.paddingY ?? 56;
  return (
    <section className="w-full border-t border-white/5 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion estrecho>
        <EditableText as="h2" value={data.heading} onChange={(v) => onPatch({ heading: v })} className="text-lg font-semibold text-white sm:text-xl" />
        <EditableText as="p" value={data.body} onChange={(v) => onPatch({ body: v })} className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base" />
      </ContenedorSeccion>
    </section>
  );
}

function SeccionReviews({ data, identidad, onPatch, isMobilePreview = false }) {
  const py = data.style?.paddingY ?? 56;
  return (
    <section className="w-full border-t border-white/5 px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion>
        <EditableText as="h2" value={data.heading} onChange={(v) => onPatch({ heading: v })} className="text-lg font-semibold text-white sm:text-xl" />
        <div className={`mt-6 grid w-full gap-4 sm:mt-8 ${isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {data.reviews.map((r, i) => (
            <div key={r.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-5 sm:px-5">
              <div className="flex items-center gap-1">{Array.from({ length: r.estrellas }).map((_, j) => <Star key={j} size={12} className="fill-current" style={{ color: identidad.temaColor }} />)}</div>
              <EditableText as="p" value={r.texto} onChange={(v) => { const reviews = [...data.reviews]; reviews[i] = { ...reviews[i], texto: v }; onPatch({ reviews }); }} className="mt-3 text-sm leading-relaxed text-zinc-400" />
              <EditableText value={r.nombre} onChange={(v) => { const reviews = [...data.reviews]; reviews[i] = { ...reviews[i], nombre: v }; onPatch({ reviews }); }} className="mt-2 block text-xs font-medium text-zinc-500" />
            </div>
          ))}
        </div>
      </ContenedorSeccion>
    </section>
  );
}

function SeccionFooter({ data, asumeUsuario, onPatch, isMobilePreview = false }) {
  const py = data.style?.paddingY ?? 48;
  return (
    <footer className="w-full border-t border-white/5 bg-[#050505] px-4 sm:px-6" style={{ paddingTop: py, paddingBottom: py }}>
      <ContenedorSeccion>
        <div className={`grid w-full gap-8 ${isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Horarios</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><span className="text-zinc-600">Lun — Vie · </span><EditableText value={data.horarioSemana} onChange={(v) => onPatch({ horarioSemana: v })} className="inline" /></li>
              <li><span className="text-zinc-600">Sáb — Dom · </span><EditableText value={data.horarioFinde} onChange={(v) => onPatch({ horarioFinde: v })} className="inline" /></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Redes</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><EditableText value={data.instagram} onChange={(v) => onPatch({ instagram: v })} className="block" /></li>
              <li><EditableText value={data.whatsapp} onChange={(v) => onPatch({ whatsapp: v })} className="block" /></li>
            </ul>
          </div>
          <div className={`${isMobilePreview ? '' : 'sm:col-span-2 lg:col-span-1'}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Contacto</h3>
            <EditableText as="p" value={data.direccion} onChange={(v) => onPatch({ direccion: v })} className="mt-4 text-sm leading-relaxed text-zinc-500" />
          </div>
        </div>
        {asumeUsuario && <p className="mt-8 w-full rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-zinc-500">Los abonos online incluyen la comisión de pasarela de forma transparente.</p>}
        <p className="mt-8 text-center text-xs text-zinc-600">Powered by <span className="text-zinc-500">Zyra</span></p>
      </ContenedorSeccion>
    </footer>
  );
}

function NavbarCanvas({ identidad, onPatchNombre, onAbrirEditor, isMobilePreview = false }) {
  return (
    <nav className={`sticky top-0 z-20 flex w-full items-center justify-between border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md ${isMobilePreview ? 'px-3 py-3' : 'px-4 py-4 sm:px-6'}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onAbrirEditor('global')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAbrirEditor('global');
          }
        }}
        className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg transition hover:ring-1 hover:ring-[#00B488]/30"
      >
        {identidad.logo ? (
          <img src={identidad.logo} alt="" className="h-9 w-9 shrink-0 rounded-md object-contain" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white" style={{ backgroundColor: identidad.temaColor }}>{identidad.nombre.charAt(0)}</div>
        )}
        <EditableText value={identidad.nombre} onChange={onPatchNombre} className="truncate text-base font-semibold text-white" onClick={(e) => e.stopPropagation()} />
      </div>
      <BotonCanvas
        identidad={identidad}
        onAbrirEditor={onAbrirEditor}
        sectionId="global"
        className={`shrink-0 rounded-lg font-semibold ${isMobilePreview ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        Reservar
      </BotonCanvas>
    </nav>
  );
}

function CanvasLanding({
  webConfig,
  selectedSectionId,
  onSelectSection,
  onPatchGlobal,
  onPatchSection,
  onMoveSection,
  onDeleteSection,
  viewport = 'desktop',
}) {
  const { global, sections } = webConfig;
  const visibles = sections.filter((s) => s.visible);
  const isMobilePreview = viewport === 'mobile';

  const abrirEditor = useCallback((sectionId) => onSelectSection(sectionId), [onSelectSection]);

  const renderSeccion = (section, index) => {
    const onPatch = (patch) => onPatchSection(section.id, patch);
    const props = { identidad: global.identidad, onAbrirEditor: abrirEditor, sectionId: section.id, isMobilePreview };

    let contenido;
    switch (section.type) {
      case 'hero': contenido = <SeccionHero data={section.data} onPatch={onPatch} {...props} />; break;
      case 'services': contenido = <SeccionServices data={section.data} onPatch={onPatch} identidad={global.identidad} isMobilePreview={isMobilePreview} />; break;
      case 'courts': contenido = <SeccionCourts data={section.data} onPatch={onPatch} {...props} />; break;
      case 'faqs': contenido = <SeccionFaqs data={section.data} onPatch={onPatch} />; break;
      case 'footer': contenido = <SeccionFooter data={section.data} asumeUsuario={global.finanzas.asumeUsuario} onPatch={onPatch} isMobilePreview={isMobilePreview} />; break;
      case 'gallery': contenido = <SeccionGallery data={section.data} onPatch={onPatch} identidad={global.identidad} isMobilePreview={isMobilePreview} />; break;
      case 'text': contenido = <SeccionText data={section.data} onPatch={onPatch} />; break;
      case 'reviews': contenido = <SeccionReviews data={section.data} onPatch={onPatch} identidad={global.identidad} isMobilePreview={isMobilePreview} />; break;
      default: contenido = null;
    }

    return (
      <SeccionCanvas
        key={section.id}
        section={section}
        index={index}
        total={visibles.length}
        selected={selectedSectionId === section.id}
        onSelect={onSelectSection}
        onMoveUp={() => onMoveSection(section.id, -1)}
        onMoveDown={() => onMoveSection(section.id, 1)}
        onDelete={() => onDeleteSection(section.id)}
      >
        {contenido}
      </SeccionCanvas>
    );
  };

  return (
    <div className="min-h-full w-full bg-[#0a0a0a] font-sans text-white antialiased">
      <NavbarCanvas identidad={global.identidad} onPatchNombre={(v) => onPatchGlobal({ nombre: v })} onAbrirEditor={abrirEditor} isMobilePreview={isMobilePreview} />
      {visibles.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-8 text-center">
          <p className="text-lg text-zinc-500">Sin secciones visibles</p>
          <p className="mt-2 text-sm text-zinc-600">Añade bloques desde el panel izquierdo</p>
        </div>
      ) : (
        visibles.map((section, i) => renderSeccion(section, i))
      )}
    </div>
  );
}

/* ─── Componente principal ─── */
function LandingPageDashboard() {
  const navigate = useNavigate();
  const [webConfig, setWebConfig] = useState(WEB_CONFIG_INICIAL);
  const [activeEditorTab, setActiveEditorTab] = useState('main');
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [modalPasarela, setModalPasarela] = useState(false);
  const [menuAnadir, setMenuAnadir] = useState(false);

  const abrirSeccion = useCallback((sectionId) => {
    setActiveSectionId(sectionId);
    setActiveEditorTab('section_edit');
  }, []);

  const volverAMain = useCallback(() => {
    setActiveEditorTab('main');
    setActiveSectionId(null);
  }, []);

  const patchGlobal = useCallback((patch) => {
    setWebConfig((prev) => ({
      ...prev,
      global: { ...prev.global, identidad: { ...prev.global.identidad, ...patch } },
    }));
  }, []);

  const patchFinanzas = useCallback((valor) => {
    setWebConfig((prev) => ({ ...prev, global: { ...prev.global, finanzas: { asumeUsuario: valor } } }));
  }, []);

  const patchSection = useCallback((id, dataPatch) => {
    setWebConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, data: { ...s.data, ...dataPatch } } : s)),
    }));
  }, []);

  const toggleVisible = useCallback((id) => {
    setWebConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }));
  }, []);

  const moveSection = useCallback((id, direction) => {
    setWebConfig((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = idx + direction;
      if (next < 0 || next >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      [sections[idx], sections[next]] = [sections[next], sections[idx]];
      return { ...prev, sections };
    });
  }, []);

  const deleteSection = useCallback((id) => {
    setWebConfig((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== id) }));
    if (activeSectionId === id) volverAMain();
  }, [activeSectionId, volverAMain]);

  const anadirSeccion = useCallback((type) => {
    const nueva = crearSeccion(type);
    setWebConfig((prev) => ({ ...prev, sections: [...prev.sections, nueva] }));
    setActiveSectionId(nueva.id);
    setActiveEditorTab('section_edit');
    setPanelAbierto(true);
  }, []);

  const selectedSectionId =
    activeEditorTab === 'section_edit' && activeSectionId && activeSectionId !== 'global'
      ? activeSectionId
      : null;

  const abrirSeccionConPanel = useCallback(
    (sectionId) => {
      abrirSeccion(sectionId);
      setPanelAbierto(true);
    },
    [abrirSeccion]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0a] animate-fade-in">
      <TopBarStudio
        nombreComplejo={webConfig.global.identidad.nombre}
        viewport={viewport}
        onViewportChange={setViewport}
        onVolverPanel={() => navigate('/dashboard')}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <PanelContextual
          abierto={panelAbierto}
          activeEditorTab={activeEditorTab}
          activeSectionId={activeSectionId}
          webConfig={webConfig}
          onVolver={volverAMain}
          onSelectSection={abrirSeccionConPanel}
          onSelectGlobal={() => abrirSeccionConPanel('global')}
          onPatchSection={patchSection}
          onPatchGlobal={patchGlobal}
          onToggleVisible={toggleVisible}
          onMoveSection={moveSection}
          onDeleteSection={deleteSection}
          onAnadirSeccion={anadirSeccion}
          onFinanzas={patchFinanzas}
          onVerDesglose={() => setModalPasarela(true)}
          menuAnadir={menuAnadir}
          setMenuAnadir={setMenuAnadir}
          onTogglePanel={() => setPanelAbierto((v) => !v)}
        />

        <main className={`flex min-h-0 min-w-0 w-full flex-1 justify-center overflow-y-auto bg-[#0a0a0a] ${SCROLL_HIDDEN}`}>
          <div
            className={`min-h-full w-full transition-[max-width] duration-300 ease-out ${
              viewport === 'mobile'
                ? 'max-w-[390px] shrink-0 border-x border-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]'
                : 'max-w-none'
            }`}
            style={viewport === 'mobile' ? { maxWidth: MOBILE_PREVIEW_WIDTH } : undefined}
          >
            <CanvasLanding
              webConfig={webConfig}
              selectedSectionId={selectedSectionId}
              onSelectSection={abrirSeccionConPanel}
              onPatchGlobal={patchGlobal}
              onPatchSection={patchSection}
              onMoveSection={moveSection}
              onDeleteSection={deleteSection}
              viewport={viewport}
            />
          </div>
        </main>
      </div>

      <ModalDesglosePasarela abierto={modalPasarela} onCerrar={() => setModalPasarela(false)} />
    </div>
  );
}

export default LandingPageDashboard;

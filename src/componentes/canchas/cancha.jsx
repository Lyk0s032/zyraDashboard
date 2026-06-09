import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Star,
  MoreHorizontal,
  Link2,
  PanelRight,
  Check,
  X,
  Sparkles,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { CANCHAS_POR_DEPORTE } from '../../navigation/canchasData';
import { FilterBar } from '../../navigation';
import SeccionPrecios from './precios';
import SeccionActividad from './actividad';
import { useRainMode } from '../../estados/RainModeContext';
import { useAccessibility } from '../../estados/AccessibilityContext';
import { useCourtBlock } from '../../estados/CourtBlockContext';
import { LUXURY_STORM_GLASS } from '../RainEffect';

const PESTANAS = ['General', 'Reservas', 'Precios', 'Actividad'];

const RUTAS_PESTANA = {
  General: '',
  Reservas: 'reservas',
  Precios: 'precios',
  Actividad: 'actividad',
};


const RANGOS_FECHA = [
  { id: 'semana', etiqueta: 'Esta semana' },
  { id: '30dias', etiqueta: 'Últimos 30 días' },
  { id: 'mes', etiqueta: 'Mes actual' },
];

function crearFechaRelativa(diasDesdeHoy) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasDesdeHoy);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

const RESERVAS_PAGOS_MOCK = [
  {
    id: 1,
    nombre: 'Juan Pablo Ortiz',
    telefono: '+57 300 123 4567',
    horario: 'Mañana, 6:00 PM - 2h',
    reservaWeb: true,
    valorTotal: 160000,
    valorReservado: 32000,
    pendientePagar: 128000,
    fecha: crearFechaRelativa(1),
  },
  {
    id: 2,
    nombre: 'Laura Gómez',
    telefono: '+57 301 778 3344',
    horario: 'Hoy, 8:00 PM - 1h',
    reservaWeb: true,
    valorTotal: 80000,
    valorReservado: 16000,
    pendientePagar: 64000,
    fecha: crearFechaRelativa(0),
  },
  {
    id: 3,
    nombre: 'Felipe Aristizábal',
    telefono: '+57 310 987 6543',
    horario: 'Hoy, 5:00 PM - 1h',
    reservaWeb: false,
    valorTotal: 80000,
    valorReservado: 0,
    pendientePagar: 80000,
    fecha: crearFechaRelativa(0),
  },
  {
    id: 4,
    nombre: 'Santiago Ruiz',
    telefono: '+57 318 220 9911',
    horario: 'Ayer, 7:00 PM - 2h',
    reservaWeb: true,
    valorTotal: 160000,
    valorReservado: 32000,
    pendientePagar: 128000,
    fecha: crearFechaRelativa(-1),
  },
  {
    id: 5,
    nombre: 'Camila Torres',
    telefono: '+57 322 441 6677',
    horario: 'Jueves, 9:00 PM - 1h',
    reservaWeb: true,
    valorTotal: 60000,
    valorReservado: 12000,
    pendientePagar: 48000,
    fecha: crearFechaRelativa(3),
  },
  {
    id: 6,
    nombre: 'Diego Moreno',
    telefono: '+57 305 889 2233',
    horario: 'Sábado, 6:00 PM - 2h',
    reservaWeb: false,
    valorTotal: 160000,
    valorReservado: 0,
    pendientePagar: 160000,
    fecha: crearFechaRelativa(5),
  },
];

const PERFILES_CLIENTES_MOCK = {
  '+57 300 123 4567': {
    nombre: 'Juan Pablo Ortiz',
    miembroDesde: 'Marzo 2024',
    calificacion: 4.2,
    etiquetas: [
      { texto: '🏆 Cumplido', estilo: 'bg-amber-500/10 text-amber-300/90 border-amber-500/20' },
      { texto: '⚡ Pago Anticipado Frecuente', estilo: 'bg-violet-500/10 text-violet-300/90 border-violet-500/20' },
    ],
    notaInterna: 'Siempre pide balones prestados y los devuelve tarde',
    historial: [
      { fecha: '28 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '14 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '2 May 2026', cancha: 'Cancha Fútbol 7', estado: 'Asistió' },
      { fecha: '18 Abr 2026', cancha: 'Cancha Fútbol 5 B', estado: 'Canceló' },
    ],
  },
  '+57 301 778 3344': {
    nombre: 'Laura Gómez',
    miembroDesde: 'Agosto 2025',
    calificacion: 4.8,
    etiquetas: [
      { texto: '🏆 Cumplido', estilo: 'bg-amber-500/10 text-amber-300/90 border-amber-500/20' },
      { texto: '⚡ Pago Anticipado Frecuente', estilo: 'bg-violet-500/10 text-violet-300/90 border-violet-500/20' },
    ],
    notaInterna: '',
    historial: [
      { fecha: '1 Jun 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '22 May 2026', cancha: 'Cancha Tenis 1', estado: 'Asistió' },
      { fecha: '10 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
    ],
  },
  '+57 303 200 3392': {
    nombre: 'Camila',
    miembroDesde: 'Mayo 2025',
    calificacion: 4.9,
    etiquetas: [
      { texto: '🏆 Cumplido', estilo: 'bg-amber-500/10 text-amber-300/90 border-amber-500/20' },
      { texto: '⚡ Pago Anticipado Frecuente', estilo: 'bg-violet-500/10 text-violet-300/90 border-violet-500/20' },
    ],
    notaInterna: '',
    historial: [
      { fecha: '2 Jun 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '19 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '5 May 2026', cancha: 'Cancha Fútbol 5 B', estado: 'Asistió' },
      { fecha: '22 Abr 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '8 Abr 2026', cancha: 'Cancha Fútbol 7', estado: 'Asistió' },
    ],
  },
  '+57 310 987 6543': {
    nombre: 'Felipe Aristizábal',
    miembroDesde: 'Enero 2026',
    calificacion: 3.5,
    etiquetas: [
      { texto: '⚠️ 1 Cancelación Tardía', estilo: 'bg-yellow-500/10 text-yellow-300/90 border-yellow-500/20' },
    ],
    notaInterna: 'Prefiere pagar todo en caja al llegar',
    historial: [
      { fecha: '30 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '12 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Canceló' },
      { fecha: '28 Abr 2026', cancha: 'Cancha Pádel 2', estado: 'Asistió' },
    ],
  },
  '+57 318 220 9911': {
    nombre: 'Santiago Ruiz',
    miembroDesde: 'Noviembre 2024',
    calificacion: 4.0,
    etiquetas: [
      { texto: '🏆 Cumplido', estilo: 'bg-amber-500/10 text-amber-300/90 border-amber-500/20' },
    ],
    notaInterna: '',
    historial: [
      { fecha: '29 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '15 May 2026', cancha: 'Cancha Fútbol 5 B', estado: 'Asistió' },
      { fecha: '1 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'No asistió / Fake' },
      { fecha: '20 Abr 2026', cancha: 'Cancha Fútbol 7', estado: 'Asistió' },
    ],
  },
  '+57 322 441 6677': {
    nombre: 'Camila Torres',
    miembroDesde: 'Febrero 2026',
    calificacion: 4.6,
    etiquetas: [
      { texto: '🏆 Cumplido', estilo: 'bg-amber-500/10 text-amber-300/90 border-amber-500/20' },
      { texto: '⚡ Pago Anticipado Frecuente', estilo: 'bg-violet-500/10 text-violet-300/90 border-violet-500/20' },
    ],
    notaInterna: 'Cliente recurrente los jueves en la noche',
    historial: [
      { fecha: '26 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '19 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
      { fecha: '12 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Asistió' },
    ],
  },
  '+57 305 889 2233': {
    nombre: 'Diego Moreno',
    miembroDesde: 'Abril 2026',
    calificacion: 2.8,
    etiquetas: [
      { texto: '⚠️ 1 Cancelación Tardía', estilo: 'bg-yellow-500/10 text-yellow-300/90 border-yellow-500/20' },
    ],
    notaInterna: 'Verificar identidad al llegar — reservas frecuentes sin anticipo',
    historial: [
      { fecha: '24 May 2026', cancha: 'Cancha Fútbol 5 B', estado: 'No asistió / Fake' },
      { fecha: '10 May 2026', cancha: 'Cancha Fútbol 5 A', estado: 'Canceló' },
      { fecha: '3 May 2026', cancha: 'Cancha Fútbol 7', estado: 'Asistió' },
    ],
  },
};

function normalizarTelefono(telefono) {
  return telefono.replace(/\D/g, '');
}

function buscarPerfilPorTelefono(telefono) {
  const digits = normalizarTelefono(telefono);
  if (digits.length < 7) return null;

  const entrada = digits.length >= 10 ? digits.slice(-10) : digits;

  for (const [clave, perfil] of Object.entries(PERFILES_CLIENTES_MOCK)) {
    const claveDigits = normalizarTelefono(clave);
    const claveFinal = claveDigits.slice(-10);
    if (claveFinal === entrada || claveDigits.endsWith(digits) || digits.endsWith(claveFinal)) {
      return { telefonoClave: clave, ...perfil };
    }
  }
  return null;
}

function buscarClienteRegistrado(telefono) {
  const digits = normalizarTelefono(telefono);
  if (digits.length < 10) return null;

  const perfil = buscarPerfilPorTelefono(telefono);
  if (!perfil?.nombre) return null;

  return {
    nombre: perfil.nombre,
    telefonoClave: perfil.telefonoClave,
    perfil,
  };
}

function analizarAntecedentes(telefono) {
  const digits = normalizarTelefono(telefono);
  if (digits.length < 10) return { tipo: 'vacio' };

  const perfil = buscarPerfilPorTelefono(telefono);
  if (!perfil) return { tipo: 'nuevo' };

  const faltas = perfil.historial.filter((h) => h.estado === 'No asistió / Fake').length;
  const reservas = perfil.historial.length;

  if (faltas > 0) {
    return { tipo: 'alerta', perfil, faltas, reservas };
  }

  return {
    tipo: 'confiable',
    perfil,
    reservas,
    faltas: 0,
    calificacion: perfil.calificacion,
  };
}

const CLASE_INPUT_ACORDEON =
  'w-full bg-zinc-950 border border-white/5 rounded px-2 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors';

const DURACION_ANALISIS_CLIENTE_MS = 900;

const PASOS_ANALISIS_CLIENTE = [
  '🔍 Buscando número en la base de datos...',
  '⚡ Escaneando historial de asistencia y alertas...',
  '✨ Renderizando perfil deportivo...',
];

const ESTILO_ESTADO_HISTORIAL = {
  'Asistió': 'text-[#00FF66]/90 bg-[#00FF66]/10 border-[#00FF66]/15',
  'Canceló': 'text-yellow-400/90 bg-yellow-400/10 border-yellow-400/15',
  'No asistió / Fake': 'text-red-400/90 bg-red-400/10 border-red-400/15',
};

function obtenerPerfilCliente(reserva) {
  const base = PERFILES_CLIENTES_MOCK[reserva.telefono] ?? {
    miembroDesde: 'Reciente',
    calificacion: 3.0,
    etiquetas: [],
    notaInterna: '',
    historial: [
      {
        fecha: reserva.fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
        cancha: 'Cancha actual',
        estado: 'Asistió',
      },
    ],
  };

  return {
    nombre: reserva.nombre,
    telefono: reserva.telefono,
    ...base,
  };
}

function telefonoWhatsApp(telefono) {
  return telefono.replace(/\D/g, '');
}

function IconoWhatsApp({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const OCUPACION_POR_RANGO = {
  semana: {
    totalHoras: 42,
    tendencia: [
      { etiqueta: 'Lun', ocupacion: 58 },
      { etiqueta: 'Mar', ocupacion: 72 },
      { etiqueta: 'Mié', ocupacion: 65 },
      { etiqueta: 'Jue', ocupacion: 81 },
      { etiqueta: 'Vie', ocupacion: 88 },
      { etiqueta: 'Sáb', ocupacion: 94 },
      { etiqueta: 'Dom', ocupacion: 76 },
    ],
    bloques: [
      { hora: '6 PM', reservas: 9 },
      { hora: '7 PM', reservas: 14 },
      { hora: '8 PM', reservas: 18 },
      { hora: '9 PM', reservas: 12 },
      { hora: '10 PM', reservas: 6 },
    ],
  },
  '30dias': {
    totalHoras: 168,
    tendencia: [
      { etiqueta: 'S1', ocupacion: 62 },
      { etiqueta: 'S2', ocupacion: 68 },
      { etiqueta: 'S3', ocupacion: 74 },
      { etiqueta: 'S4', ocupacion: 71 },
    ],
    bloques: [
      { hora: '6 PM', reservas: 32 },
      { hora: '7 PM', reservas: 48 },
      { hora: '8 PM', reservas: 55 },
      { hora: '9 PM', reservas: 38 },
      { hora: '10 PM', reservas: 19 },
    ],
  },
  mes: {
    totalHoras: 186,
    tendencia: [
      { etiqueta: 'Sem 1', ocupacion: 64 },
      { etiqueta: 'Sem 2', ocupacion: 70 },
      { etiqueta: 'Sem 3', ocupacion: 78 },
      { etiqueta: 'Sem 4', ocupacion: 83 },
      { etiqueta: 'Sem 5', ocupacion: 75 },
    ],
    bloques: [
      { hora: '6 PM', reservas: 38 },
      { hora: '7 PM', reservas: 52 },
      { hora: '8 PM', reservas: 61 },
      { hora: '9 PM', reservas: 44 },
      { hora: '10 PM', reservas: 22 },
    ],
  },
};

function formatearCOP(valor) {
  return `$${valor.toLocaleString('es-CO')} COP`;
}

function obtenerInicioSemana(fecha) {
  const inicio = new Date(fecha);
  const dia = inicio.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  inicio.setDate(inicio.getDate() + diff);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

function reservaEnRango(fechaReserva, rango) {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  const fecha = new Date(fechaReserva);
  fecha.setHours(12, 0, 0, 0);

  if (rango === 'semana') {
    const inicio = obtenerInicioSemana(hoy);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    return fecha >= inicio && fecha <= fin;
  }

  if (rango === '30dias') {
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 29);
    inicio.setHours(0, 0, 0, 0);
    return fecha >= inicio && fecha <= hoy;
  }

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
  return fecha >= inicioMes && fecha <= finMes;
}

const PESTANAS_PANEL = [
  { id: 'ajustes', etiqueta: 'Configuración' },
  { id: 'previa', etiqueta: 'Vista Previa Web' },
  { id: 'ai', etiqueta: 'Zyra AI' },
];

const SIN_DEFINIR = 'Sin definir';

const PROPIEDADES_CONFIG = [
  {
    id: 'superficie',
    etiqueta: 'Tipo de Superficie',
    opciones: [
      'Césped Sintético Premium',
      'Césped Sintético Estándar',
      'Césped Natural',
      'Cemento',
      SIN_DEFINIR,
    ],
  },
  {
    id: 'techada',
    etiqueta: 'Techada',
    opciones: [
      'Sí, completamente cubierta',
      'Parcialmente cubierta',
      'No',
      SIN_DEFINIR,
    ],
  },
  {
    id: 'iluminacion',
    etiqueta: 'Iluminación',
    opciones: [
      'LED de Alta Potencia',
      'Convencional',
      'Sin Iluminación',
      SIN_DEFINIR,
    ],
  },
  {
    id: 'dimensiones',
    etiqueta: 'Dimensiones',
    opciones: ['40m x 20m', '30m x 15m', '25m x 15m', SIN_DEFINIR],
  },
  {
    id: 'capacidadJugadores',
    etiqueta: 'Capacidad de Jugadores',
    opciones: ['10 jugadores', '14 jugadores', '22 jugadores', SIN_DEFINIR],
  },
  {
    id: 'capacidadEspectadores',
    etiqueta: 'Capacidad de Espectadores',
    opciones: ['30 espectadores', '50 espectadores', '100 espectadores', SIN_DEFINIR],
  },
  {
    id: 'vestuarios',
    etiqueta: 'Vestuarios',
    opciones: ['Sí, disponibles', 'No disponibles', 'Compartidos', SIN_DEFINIR],
  },
  {
    id: 'anticipo',
    etiqueta: 'Porcentaje de Anticipo',
    opciones: [
      '10% para reservar',
      '20% para reservar',
      '50% para reservar',
      'Pago Total (100%)',
      SIN_DEFINIR,
    ],
  },
];

const PROPIEDADES_INICIALES = {
  superficie: 'Césped Sintético Premium',
  techada: 'Sí, completamente cubierta',
  iluminacion: 'LED de Alta Potencia',
  dimensiones: '40m x 20m',
  capacidadJugadores: SIN_DEFINIR,
  capacidadEspectadores: SIN_DEFINIR,
  vestuarios: SIN_DEFINIR,
  anticipo: '20% para reservar',
};

const CARACTERISTICAS_PREVIA = [
  { etiqueta: 'Tipo de Superficie', valor: 'Césped Sintético Premium' },
  { etiqueta: 'Techada', valor: 'Sí' },
  { etiqueta: 'Iluminación', valor: 'LED de Alta Potencia' },
  { etiqueta: 'Dimensiones', valor: '40m x 20m' },
  { etiqueta: 'Capacidad de Jugadores', valor: '10 jugadores' },
  { etiqueta: 'Capacidad de Espectadores', valor: '50 espectadores' },
];

function obtenerNombreCancha(slug) {
  const cancha = CANCHAS_POR_DEPORTE
    .flatMap((d) => d.canchas)
    .find((c) => c.id === slug);
  if (cancha) return cancha.nombre;
  return slug
    .split('-')
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

function obtenerPestanaDesdeRuta(pathname, canchaSlug) {
  const base = `/canchas/${canchaSlug}`;
  const suffix = pathname
    .slice(base.length)
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  if (!suffix) return 'General';
  if (suffix === 'reservas') return 'Reservas';
  if (suffix === 'precios') return 'Precios';
  if (suffix === 'actividad') return 'Actividad';
  return 'General';
}

function obtenerFechaCali() {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

const VALOR_RESERVA_DEFAULT = 60000;
const ABONO_MINIMO_ALERTA_PORCENTAJE = 0.2;

function calcularAbonoMinimoAlerta(precioHora) {
  return Math.round(precioHora * ABONO_MINIMO_ALERTA_PORCENTAJE);
}

function calcularDesglosePago(precioHora, tipoPago, montoAbonado) {
  const valorTotal = precioHora;
  const valorPagado =
    tipoPago === 'abono'
      ? Math.min(Math.max(0, Number(montoAbonado) || 0), valorTotal)
      : 0;
  const valorPendiente = valorTotal - valorPagado;
  const pagoPendiente = valorPendiente > 0;

  let estadoPago = 'Pendiente por pagar';
  if (valorPagado >= valorTotal) estadoPago = 'Pago Confirmado';
  else if (valorPagado > 0) estadoPago = 'Anticipo recibido';

  return { valorTotal, valorPagado, valorPendiente, estadoPago, pagoPendiente };
}

const AGENDA_INICIAL = [
  {
    id: 'slot-5pm',
    hora: '5:00 PM',
    tipo: 'ocupada',
    nombre: 'Felipe Aristizábal',
    deporte: 'Fútbol 5',
    estadoPago: 'Pago Confirmado',
    pagoPendiente: false,
  },
  {
    id: 'slot-6pm',
    hora: '6:00 PM',
    tipo: 'ocupada',
    nombre: 'Clara Mendoza',
    deporte: null,
    estadoPago: null,
    pagoPendiente: false,
  },
  { id: 'slot-7pm', hora: '7:00 PM', tipo: 'disponible' },
  { id: 'slot-8pm', hora: '8:00 PM', tipo: 'disponible' },
];

function obtenerEtiquetaDeporte(canchaId) {
  for (const deporte of CANCHAS_POR_DEPORTE) {
    const cancha = deporte.canchas.find((c) => c.id === canchaId);
    if (cancha) {
      const base = deporte.nombre.charAt(0) + deporte.nombre.slice(1).toLowerCase();
      if (cancha.nombre.includes('F5') || cancha.nombre.includes('F7') || cancha.nombre.includes('F11')) {
        const formato = cancha.nombre.match(/F\d+/);
        return formato ? `${base} ${formato[0].replace('F', '')}` : base;
      }
      return base;
    }
  }
  return null;
}

function ValorPropiedad({ valor, onClick }) {
  const indefinido = valor === SIN_DEFINIR;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/valor relative inline-flex items-center justify-end gap-1 text-right transition-colors ${
        indefinido
          ? 'text-zinc-600 italic hover:text-zinc-500'
          : 'text-white hover:text-zinc-200'
      }`}
    >
      <span>{valor}</span>
      {!indefinido && (
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className="text-zinc-600 opacity-0 group-hover/valor:opacity-100 transition-opacity shrink-0"
        />
      )}
      {indefinido && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span className="pointer-events-none absolute right-0 bottom-full mb-2 w-52 px-2.5 py-1.5 text-[10px] leading-snug text-amber-200/90 bg-[#1a1a1a] border border-amber-500/20 rounded-md shadow-lg opacity-0 group-hover/valor:opacity-100 transition-opacity z-20 text-left font-normal not-italic">
            ⚠️ Si permanece &apos;Sin definir&apos;, esta característica NO se mostrará en tu
            página web pública
          </span>
        </>
      )}
    </button>
  );
}

function FilaPropiedad({ config, valor, dropdownAbierto, onToggleDropdown, onSeleccionar }) {
  return (
    <div className="relative grid grid-cols-2 py-2 items-center text-xs border-b border-transparent hover:bg-white/[0.02] px-2 rounded-md transition-colors">
      <span className="text-zinc-500">{config.etiqueta}</span>

      <div className="flex justify-end min-w-0">
        <ValorPropiedad
          valor={valor}
          onClick={() => onToggleDropdown(config.id)}
        />
      </div>

      {dropdownAbierto === config.id && (
        <div
          role="listbox"
          className="absolute right-2 top-full mt-1 z-50 w-52 py-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl"
        >
          {config.opciones.map((opcion) => (
            <button
              key={opcion}
              type="button"
              role="option"
              aria-selected={valor === opcion}
              onClick={() => onSeleccionar(config.id, opcion)}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                valor === opcion
                  ? 'text-white bg-white/5'
                  : opcion === SIN_DEFINIR
                    ? 'text-zinc-600 italic hover:bg-white/5 hover:text-zinc-400'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ImagenCanchaMock({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-zinc-950 via-emerald-950 to-emerald-900 ${className}`}
    >
      <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(0,255,102,0.03)_18px,rgba(0,255,102,0.03)_36px)]" />
      <div className="absolute top-3 left-6 w-10 h-10 bg-amber-200/25 blur-2xl rounded-full" />
      <div className="absolute top-3 right-8 w-10 h-10 bg-amber-200/25 blur-2xl rounded-full" />
      <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

function PanelAjustes() {
  const [propiedades, setPropiedades] = useState(PROPIEDADES_INICIALES);
  const [dropdownAbierto, setDropdownAbierto] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!dropdownAbierto) return;

    const handleClickFuera = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setDropdownAbierto(null);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [dropdownAbierto]);

  const handleSeleccionar = (id, valor) => {
    setPropiedades((prev) => ({ ...prev, [id]: valor }));
    setDropdownAbierto(null);
  };

  const handleToggleDropdown = (id) => {
    setDropdownAbierto((prev) => (prev === id ? null : id));
  };

  return (
    <div ref={panelRef} className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xs font-semibold text-zinc-400">Propiedades</h4>
        <button
          type="button"
          aria-label="Anexar propiedad personalizada"
          title="Anexar una propiedad personalizada que el complejo considere relevante"
          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="space-y-0.5">
        {PROPIEDADES_CONFIG.map((config) => (
          <FilaPropiedad
            key={config.id}
            config={config}
            valor={propiedades[config.id]}
            dropdownAbierto={dropdownAbierto}
            onToggleDropdown={handleToggleDropdown}
            onSeleccionar={handleSeleccionar}
          />
        ))}
      </div>
    </div>
  );
}

function PanelVistaPrevia({ nombreCancha }) {
  const [miniaturaActiva, setMiniaturaActiva] = useState(0);

  return (
    <div className="p-5">
      <div className="max-w-[320px] mx-auto bg-black rounded-3xl p-3 border border-zinc-800 shadow-2xl space-y-4 my-2 overflow-y-auto max-h-[70vh]">
        <div className="text-center pt-1">
          <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">
            Complejo Deportivo
          </p>
          <p className="text-lg font-bold text-white tracking-wide mt-0.5">
            {nombreCancha.toUpperCase()}
          </p>
        </div>

        <div>
          <ImagenCanchaMock className="w-full aspect-video rounded-xl" />
          <div className="flex gap-2 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMiniaturaActiva(i)}
                className={`flex-1 aspect-video rounded-md overflow-hidden transition-all ${
                  miniaturaActiva === i
                    ? 'ring-2 ring-[#00FF66] ring-offset-1 ring-offset-black'
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                <ImagenCanchaMock className="w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 px-1">
          <h3 className="text-sm font-semibold text-white">Cancha de Fútbol 5</h3>
          <p className="text-sm font-bold text-[#00FF66] whitespace-nowrap">
            $60.000 /hora
          </p>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-3 space-y-2.5">
          {CARACTERISTICAS_PREVIA.map((item) => (
            <div
              key={item.etiqueta}
              className="flex justify-between gap-3 text-xs border-b border-white/5 last:border-0 pb-2 last:pb-0"
            >
              <span className="text-zinc-500 shrink-0">{item.etiqueta}</span>
              <span className="text-zinc-300 text-right">{item.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelZyraAI() {
  return (
    <div className="p-5">
      <div className="border border-purple-500/30 bg-purple-500/[0.02] p-5 rounded-xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-fuchsia-900/10 pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles size={12} strokeWidth={1.5} />
            Zyra AI Engine
          </span>
          <p className="mt-3 text-lg font-semibold text-white">
            +$120,000 COP
            <span className="text-sm font-normal text-zinc-500"> / mes</span>
          </p>
          <p className="text-[11px] text-purple-300/80 mt-0.5">Módulo Opcional</p>
        </div>

        <p className="relative text-xs text-zinc-400 leading-relaxed text-left">
          💡 <span className="text-zinc-300 font-medium">Análisis Predictivo:</span>{' '}
          Detectamos baja ocupación estructural los Martes de 2:00 PM a 4:00 PM en esta
          cancha. Te sugerimos activar nuestra estrategia de &apos;Precio Dinámico
          Automático&apos; reduciendo la tarifa un 20% para captar reservas de última hora
          y recuperar hasta $140,000 COP semanales en horas muertas.
        </p>

        <button
          type="button"
          className="relative w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-900/30"
        >
          Activar Inteligencia Artificial
        </button>
      </div>
    </div>
  );
}

function PanelOpcionesRapidas({ abierto, onCerrar, nombreCancha }) {
  const [pestanaPanel, setPestanaPanel] = useState('ajustes');

  return (
    <>
      <div
        className={`absolute inset-0 bg-black/30 z-20 transition-opacity duration-300 ${
          abierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCerrar}
        aria-hidden={!abierto}
      />

      <aside
        className={`absolute top-0 right-0 bottom-0 w-[450px] bg-[#161618] border-l border-white/5 z-30 flex flex-col transition-transform duration-300 transform ${
          abierto ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!abierto}
      >
        <div className="relative shrink-0 bg-[#121212] border-b border-white/5 sticky top-0 z-10">
          <button
            type="button"
            aria-label="Cerrar panel"
            onClick={onCerrar}
            className="absolute top-2.5 right-3 p-1 rounded text-zinc-600 hover:text-white hover:bg-white/5 transition-colors z-10"
          >
            <X size={14} strokeWidth={1.5} />
          </button>

          <div className="flex justify-around py-3 px-4 pr-10">
            {PESTANAS_PANEL.map((tab) => {
              const activa = pestanaPanel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPestanaPanel(tab.id)}
                  className={`px-2 py-1 text-[11px] font-medium tracking-wide rounded-md transition-colors ${
                    activa
                      ? 'text-white bg-white/5'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.etiqueta}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {pestanaPanel === 'ajustes' && <PanelAjustes />}
          {pestanaPanel === 'previa' && <PanelVistaPrevia nombreCancha={nombreCancha} />}
          {pestanaPanel === 'ai' && <PanelZyraAI />}
        </div>
      </aside>
    </>
  );
}

function ToggleSwitch({ activo, onChange, etiquetaActiva, etiquetaInactiva }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onChange(!activo)}
      className="flex items-center gap-2 group"
    >
      <span
        className={`text-xs font-medium transition-colors ${
          activo ? 'text-[#00FF66]' : 'text-zinc-500'
        }`}
      >
        {activo ? etiquetaActiva : etiquetaInactiva}
      </span>
      <span
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          activo ? 'bg-[#00FF66]' : 'bg-zinc-600'
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            activo ? 'translate-x-[16px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

function TarjetaMetrica({ titulo, valor, progreso, tormentaActiva, isLight }) {
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 ${
        tormentaActiva
          ? LUXURY_STORM_GLASS
          : isLight
            ? 'bg-white border border-slate-100 shadow-sm'
            : 'bg-[#161618] border border-white/5'
      }`}
    >
      <p
        className={`text-xs mb-1 transition-colors duration-300 ${
          isLight ? 'text-slate-500' : 'text-zinc-500'
        }`}
      >
        {titulo}
      </p>
      <p
        className={`text-xl font-semibold transition-colors duration-300 ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {valor}
      </p>
      {progreso != null && (
        <div
          className={`mt-3 h-1 rounded-full overflow-hidden transition-colors duration-300 ${
            isLight ? 'bg-slate-100' : 'bg-white/5'
          }`}
        >
          <div
            className="h-full rounded-full bg-[#00FF66]"
            style={{ width: `${progreso}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FilaOcupada({ hora, nombre, deporte, estadoPago, pagoPendiente, afectadaPorLluvia, isLight }) {
  return (
    <div
      className={`flex items-stretch gap-4 rounded-lg px-1 transition-all duration-300 ${
        isLight && !afectadaPorLluvia ? 'bg-slate-50/80' : ''
      }`}
    >
      <span
        className={`w-16 shrink-0 pt-3 text-xs transition-colors duration-300 ${
          afectadaPorLluvia
            ? 'text-cyan-400/80'
            : isLight
              ? 'text-slate-500'
              : 'text-zinc-500'
        }`}
      >
        {hora}
      </span>
      <div
        className={`flex-1 flex items-center justify-between gap-3 rounded-r-lg px-4 py-2.5 border-l-[3px] transition-all duration-300 ${
          afectadaPorLluvia
            ? 'bg-cyan-500/[0.08] border-l-cyan-400 shadow-[0_0_14px_rgba(56,189,248,0.12)]'
            : isLight
              ? 'bg-white border border-slate-100 border-l-emerald-500 shadow-sm'
              : 'bg-white/5 border-l-[#00FF66]'
        }`}
      >
        <span
          className={`text-xs transition-colors duration-300 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {nombre}
          {deporte && (
            <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}> ({deporte})</span>
          )}
          {afectadaPorLluvia && (
            <span className="ml-2 text-[10px] text-cyan-300/80">🌧️ Modo Lluvia</span>
          )}
        </span>
        {estadoPago && (
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${
              afectadaPorLluvia
                ? 'text-cyan-200/90 bg-cyan-500/15'
                : pagoPendiente
                  ? 'text-amber-300/90 bg-amber-500/10'
                  : 'text-[#00FF66]/90 bg-[#00FF66]/10'
            }`}
          >
            {afectadaPorLluvia ? 'Reagendable' : estadoPago}
          </span>
        )}
      </div>
    </div>
  );
}

function EsqueletoAnalisisCliente() {
  const [pasoActivo, setPasoActivo] = useState(0);

  useEffect(() => {
    setPasoActivo(0);
    const paso1 = setTimeout(() => setPasoActivo(1), 300);
    const paso2 = setTimeout(() => setPasoActivo(2), 600);
    return () => {
      clearTimeout(paso1);
      clearTimeout(paso2);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#121212] p-3">
      <div
        className="pointer-events-none absolute inset-0 luxury-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
        aria-hidden
      />

      <div className="relative flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 shrink-0 rounded-full border border-purple-400/25 border-t-white/70 animate-spin"
          aria-hidden
        />
        <p className="text-[11px] font-medium tracking-wide text-zinc-400 transition-opacity duration-200">
          {PASOS_ANALISIS_CLIENTE[pasoActivo]}
        </p>
      </div>

      <div className="relative space-y-2.5 animate-pulse">
        <div className="h-6 w-3/4 bg-zinc-800/60 rounded" />
        <div className="flex gap-1.5">
          <div className="h-4 w-14 bg-zinc-800/60 rounded" />
          <div className="h-4 w-20 bg-zinc-800/60 rounded" />
        </div>
        <div className="h-8 w-full bg-zinc-800/60 rounded" />
        <div className="grid grid-cols-5 gap-1 items-end h-10">
          {[40, 65, 55, 80, 45].map((altura, i) => (
            <div
              key={i}
              className="bg-zinc-800/60 rounded-sm"
              style={{ height: `${altura}%` }}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="h-2.5 w-full bg-zinc-800/60 rounded" />
          <div className="h-2.5 w-5/6 bg-zinc-800/60 rounded" />
          <div className="h-2.5 w-2/3 bg-zinc-800/60 rounded" />
        </div>
      </div>
    </div>
  );
}

function ExpedienteClienteContenido({
  antecedentes,
  precioHora,
  tipoPago,
  montoAbonado,
  onRechazar,
  onForzarAgendar,
}) {
  const abonoMinimo = calcularAbonoMinimoAlerta(precioHora);
  const montoAbonoNum = Number(montoAbonado) || 0;
  const abonoCumpleMinimo = montoAbonoNum >= abonoMinimo;

  if (antecedentes.tipo === 'nuevo') {
    return (
      <span className="inline-flex text-blue-400 bg-blue-500/5 text-[11px] px-2 py-1 rounded border border-blue-500/10 leading-snug">
        🆕 Usuario nuevo: Se creará historial limpio para este número
      </span>
    );
  }

  const perfil = antecedentes.perfil;

  if (antecedentes.tipo === 'confiable') {
    return (
      <div className="space-y-3">
        <span className="inline-flex text-green-400 bg-green-500/5 text-[11px] px-2 py-1 rounded leading-snug">
          🏆 Cliente cumplido: {antecedentes.reservas} reservas / {antecedentes.faltas} faltas
        </span>

        <div className="flex items-center gap-2">
          <EstrellasCalificacion valor={antecedentes.calificacion} />
          <span className="text-[11px] text-zinc-400 tabular-nums">
            {antecedentes.calificacion.toFixed(1)} / 5.0
          </span>
        </div>

        {perfil.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {perfil.etiquetas.map((etiqueta) => (
              <span
                key={etiqueta.texto}
                className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium border ${etiqueta.estilo}`}
              >
                {etiqueta.texto}
              </span>
            ))}
          </div>
        )}

        {perfil.notaInterna && (
          <p className="text-[10px] text-zinc-500 leading-relaxed border-l border-white/10 pl-2">
            {perfil.notaInterna}
          </p>
        )}

        <div className="space-y-1 pt-0.5 border-t border-white/5">
          <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1.5">
            Reservas anteriores
          </p>
          {perfil.historial.slice(0, 3).map((item) => (
            <div
              key={`${item.fecha}-${item.cancha}`}
              className="flex items-center justify-between gap-2 text-[10px]"
            >
              <span className="text-zinc-500 truncate">{item.fecha}</span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded border text-[9px] ${ESTILO_ESTADO_HISTORIAL[item.estado] ?? 'text-zinc-400 bg-zinc-800/40 border-white/5'}`}
              >
                {item.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
        <p className="text-[11px] text-amber-200/90 leading-relaxed">
          ⚠️ ALERTA: Este usuario registra inasistencias. Se bloquea la opción &apos;Paga al
          llegar&apos;. Para confirmar esta reserva, es OBLIGATORIO registrar un abono mínimo del
          20% ({formatearCOP(abonoMinimo)}) en este momento.
        </p>
        {tipoPago === 'abono' && montoAbonoNum > 0 && (
          <p
            className={`text-[10px] mt-2 ${
              abonoCumpleMinimo ? 'text-green-400/80' : 'text-red-400/80'
            }`}
          >
            {abonoCumpleMinimo
              ? `Abono registrado cumple el mínimo requerido (${formatearCOP(abonoMinimo)}).`
              : `Faltan ${formatearCOP(abonoMinimo - montoAbonoNum)} para alcanzar el abono mínimo.`}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <EstrellasCalificacion valor={perfil.calificacion} />
        <span className="text-[11px] text-zinc-500 tabular-nums">
          {perfil.calificacion.toFixed(1)} / 5.0
        </span>
      </div>

      {perfil.notaInterna && (
        <p className="text-[10px] text-amber-400/70 leading-relaxed border-l border-amber-500/20 pl-2">
          {perfil.notaInterna}
        </p>
      )}

      <div className="space-y-1">
        <p className="text-[9px] uppercase tracking-wider text-zinc-600 mb-1.5">
          Historial reciente
        </p>
        {perfil.historial.slice(0, 4).map((item) => (
          <div
            key={`${item.fecha}-${item.cancha}`}
            className="flex items-center justify-between gap-2 text-[10px]"
          >
            <span className="text-zinc-500 truncate">{item.cancha}</span>
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded border text-[9px] ${ESTILO_ESTADO_HISTORIAL[item.estado] ?? 'text-zinc-400 bg-zinc-800/40 border-white/5'}`}
            >
              {item.estado}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={onRechazar}
          className="text-[11px] px-2.5 py-1.5 rounded border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          Rechazar Reserva / Cerrar
        </button>
        <button
          type="button"
          onClick={onForzarAgendar}
          disabled={!abonoCumpleMinimo}
          className="text-[11px] px-2.5 py-1.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Forzar Agendamiento Manual
        </button>
      </div>
    </div>
  );
}

function PanelAntecedentesReserva({
  telefono,
  cargandoHistorial,
  precioHora,
  tipoPago,
  montoAbonado,
  onRechazar,
  onForzarAgendar,
}) {
  const [contenidoVisible, setContenidoVisible] = useState(false);
  const digitosTelefono = normalizarTelefono(telefono).length;
  const antecedentes = analizarAntecedentes(telefono);

  useEffect(() => {
    if (cargandoHistorial || digitosTelefono < 10) {
      setContenidoVisible(false);
      return;
    }

    const timer = setTimeout(() => setContenidoVisible(true), 40);
    return () => clearTimeout(timer);
  }, [cargandoHistorial, digitosTelefono, telefono]);

  if (digitosTelefono < 10) {
    return (
      <p className="text-zinc-500 italic text-[11px] leading-relaxed">
        {digitosTelefono > 0
          ? 'Complete los 10 dígitos para escanear antecedentes...'
          : 'Esperando número de teléfono para escanear antecedentes...'}
      </p>
    );
  }

  if (cargandoHistorial) {
    return <EsqueletoAnalisisCliente key={telefono} />;
  }

  return (
    <div
      className={`transition-opacity duration-500 ease-out ${
        contenidoVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <ExpedienteClienteContenido
        antecedentes={antecedentes}
        precioHora={precioHora}
        tipoPago={tipoPago}
        montoAbonado={montoAbonado}
        onRechazar={onRechazar}
        onForzarAgendar={onForzarAgendar}
      />
    </div>
  );
}

function FilaBloqueoTemporal({ hora, isLight }) {
  return (
    <div
      className={`flex items-stretch gap-4 rounded-lg px-1 transition-all duration-300 ${
        isLight ? 'bg-slate-50/80' : ''
      }`}
    >
      <span
        className={`w-16 shrink-0 pt-2 text-xs transition-colors duration-300 ${
          isLight ? 'text-slate-400' : 'text-zinc-500'
        }`}
      >
        {hora}
      </span>
      <div className="flex-1 flex items-center justify-between gap-3 min-h-[36px] rounded-lg px-4 py-2.5 zyra-block-stripes border border-white/5 opacity-80 pointer-events-none select-none">
        <span
          className={`text-xs font-medium transition-colors duration-300 ${
            isLight ? 'text-slate-500' : 'text-zinc-400'
          }`}
        >
          🔒 Bloqueo Temporal
        </span>
      </div>
    </div>
  );
}

function FilaDisponibleAcordeon({
  hora,
  expandida,
  onExpandir,
  onColapsar,
  onAgendar,
  canchaSlug,
  isLight,
}) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoPago, setTipoPago] = useState('llegada');
  const [montoAbonado, setMontoAbonado] = useState('');
  const [nombreAutocompletado, setNombreAutocompletado] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const telefonoRef = useRef(null);

  const precioHora = VALOR_RESERVA_DEFAULT;
  const antecedentes = analizarAntecedentes(telefono);
  const esAlerta = antecedentes.tipo === 'alerta';
  const desglose = calcularDesglosePago(precioHora, tipoPago, montoAbonado);
  const abonoMinimo = calcularAbonoMinimoAlerta(precioHora);
  const montoAbonoNum = Number(montoAbonado) || 0;
  const digitosTelefono = normalizarTelefono(telefono).length;

  useEffect(() => {
    if (!expandida) return;
    setNombre('');
    setTelefono('');
    setTipoPago('llegada');
    setMontoAbonado('');
    setNombreAutocompletado(false);
    setCargandoHistorial(false);
    const timer = setTimeout(() => telefonoRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [expandida]);

  useEffect(() => {
    const digits = normalizarTelefono(telefono);
    if (digits.length < 10) {
      setNombreAutocompletado((prev) => {
        if (prev) setNombre('');
        return false;
      });
      setCargandoHistorial(false);
      return;
    }

    setCargandoHistorial(true);
    const timer = setTimeout(() => {
      const cliente = buscarClienteRegistrado(telefono);
      if (cliente) {
        setNombre(cliente.nombre);
        setNombreAutocompletado(true);
      } else {
        setNombre('');
        setNombreAutocompletado(false);
      }
      setCargandoHistorial(false);
    }, DURACION_ANALISIS_CLIENTE_MS);

    return () => clearTimeout(timer);
  }, [telefono]);

  useEffect(() => {
    if (esAlerta) setTipoPago('abono');
  }, [esAlerta]);

  const construirDatosReserva = () => {
    const pago = calcularDesglosePago(precioHora, tipoPago, montoAbonado);

    return {
      hora,
      canchaId: canchaSlug,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      tipoPago,
      valorTotal: pago.valorTotal,
      valorPagado: pago.valorPagado,
      valorPendiente: pago.valorPendiente,
      estadoPago: pago.estadoPago,
      pagoPendiente: pago.pagoPendiente,
    };
  };

  const pagoFormularioValido =
    tipoPago === 'llegada' ? !esAlerta : montoAbonoNum > 0 && montoAbonoNum <= precioHora;

  const ejecutarAgendamiento = () => {
    if (!nombre.trim() || !pagoFormularioValido) return;
    if (esAlerta && montoAbonoNum < abonoMinimo) return;
    onAgendar(construirDatosReserva());
  };

  const handleConfirmar = () => {
    if (!nombre.trim() || antecedentes.tipo === 'vacio' || !pagoFormularioValido) return;
    if (antecedentes.tipo === 'alerta') return;
    ejecutarAgendamiento();
  };

  const puedeConfirmar =
    nombre.trim().length > 0 &&
    antecedentes.tipo !== 'vacio' &&
    antecedentes.tipo !== 'alerta' &&
    pagoFormularioValido &&
    !cargandoHistorial;

  return (
    <div
      className={`flex items-start gap-4 rounded-lg px-1 transition-all duration-300 ${
        isLight && !expandida ? 'bg-slate-50/80' : ''
      }`}
    >
      <span
        className={`w-16 shrink-0 text-xs transition-colors duration-300 ${
          isLight ? 'text-slate-500' : 'text-zinc-500'
        } ${expandida ? 'pt-3' : 'pt-2'}`}
      >
        {hora}
      </span>

      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          expandida
            ? isLight
              ? 'bg-white border border-slate-100 shadow-sm rounded-lg'
              : 'bg-zinc-900/40 border border-white/10 rounded-lg'
            : isLight
              ? 'group rounded-lg px-1 py-1 -mx-1 hover:bg-slate-100/60'
              : 'group rounded-lg px-1 py-1 -mx-1 hover:bg-white/[0.02]'
        }`}
      >
        <div
          className={`flex items-center justify-between min-h-[36px] ${
            expandida ? 'px-4 pt-3 pb-1' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => (expandida ? onColapsar() : onExpandir(hora))}
            className={`text-xs transition-colors duration-300 text-left ${
              expandida
                ? isLight
                  ? 'text-slate-500'
                  : 'text-zinc-400'
                : isLight
                  ? 'text-slate-400 group-hover:text-slate-500'
                  : 'text-zinc-600 group-hover:text-zinc-500'
            }`}
          >
            {hora} - Disponible
          </button>

          {!expandida ? (
            <button
              type="button"
              onClick={() => onExpandir(hora)}
              className={`opacity-0 group-hover:opacity-100 text-xs transition-all duration-300 ${
                isLight
                  ? 'text-slate-400 hover:text-slate-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              + Reserva Rápida
            </button>
          ) : (
            <button
              type="button"
              onClick={onColapsar}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            expandida ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4 pt-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                  Precio de esta hora: {formatearCOP(precioHora)}
                </p>

                <input
                  ref={telefonoRef}
                  type="tel"
                  inputMode="numeric"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/[^\d+\s-]/g, ''))}
                  placeholder="Teléfono (10 dígitos)"
                  className={CLASE_INPUT_ACORDEON}
                />

                <div className="relative">
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => !nombreAutocompletado && setNombre(e.target.value)}
                    readOnly={nombreAutocompletado}
                    placeholder={
                      digitosTelefono >= 10 && !nombreAutocompletado && !cargandoHistorial
                        ? 'Nombre del jugador (nuevo)'
                        : 'Nombre del jugador'
                    }
                    className={`${CLASE_INPUT_ACORDEON} ${
                      nombreAutocompletado
                        ? 'bg-zinc-950/50 text-zinc-400 border-dashed cursor-default'
                        : ''
                    }`}
                  />
                  {nombreAutocompletado && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 uppercase tracking-wider">
                      Registrado
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-0.5">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                    Tipo de Pago
                  </span>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={esAlerta}
                      onClick={() => setTipoPago('llegada')}
                      className={`text-left px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                        tipoPago === 'llegada'
                          ? 'bg-white/10 border-white/15 text-white'
                          : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                      } ${esAlerta ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      Paga al llegar (Saldar 100% en caja)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPago('abono')}
                      className={`text-left px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                        tipoPago === 'abono'
                          ? 'bg-white/10 border-white/15 text-white'
                          : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Registrar Abono/Anticipo
                    </button>
                  </div>
                </div>

                {tipoPago === 'abono' && (
                  <label className="block space-y-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                      Monto a abonar hoy:
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      max={precioHora}
                      value={montoAbonado}
                      onChange={(e) => setMontoAbonado(e.target.value)}
                      placeholder={String(abonoMinimo)}
                      className={CLASE_INPUT_ACORDEON}
                    />
                  </label>
                )}

                <p className="text-[10px] text-zinc-400">
                  Abona hoy: {formatearCOP(desglose.valorPagado)} • Restante en complejo:{' '}
                  {formatearCOP(desglose.valorPendiente)}
                </p>

                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={!puedeConfirmar}
                  className="mt-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold px-3 py-1.5 rounded transition-colors"
                >
                  Confirmar y Verificar
                </button>
              </div>

              <PanelAntecedentesReserva
                telefono={telefono}
                cargandoHistorial={cargandoHistorial}
                precioHora={precioHora}
                tipoPago={tipoPago}
                montoAbonado={montoAbonado}
                onRechazar={onColapsar}
                onForzarAgendar={ejecutarAgendamiento}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectorRangoFecha({ valor, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-zinc-800/50 border border-white/5 rounded-lg p-1">
      {RANGOS_FECHA.map((rango) => (
        <button
          key={rango.id}
          type="button"
          onClick={() => onChange(rango.id)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
            valor === rango.id
              ? 'bg-white/10 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {rango.etiqueta}
        </button>
      ))}
    </div>
  );
}

function ToggleModoVista({ valor, onChange }) {
  const opciones = [
    { id: 'lista', etiqueta: 'Lista de Pagos' },
    { id: 'graficas', etiqueta: 'Análisis de Ocupación' },
  ];

  return (
    <div className="bg-zinc-800/50 border border-white/5 rounded-lg p-1 flex items-center gap-1">
      {opciones.map((opcion) => (
        <button
          key={opcion.id}
          type="button"
          onClick={() => onChange(opcion.id)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
            valor === opcion.id
              ? 'bg-white/10 text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}

function EstrellasCalificacion({ valor, editable, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((estrella) => {
        const activa = estrella <= Math.round(valor);
        const mitad = estrella - 0.5 <= valor && estrella > valor;

        return (
          <button
            key={estrella}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange?.(estrella)}
            className={`${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${estrella} estrellas`}
          >
            <Star
              size={16}
              strokeWidth={1.5}
              className={
                activa
                  ? 'text-violet-400 fill-violet-400'
                  : mitad
                    ? 'text-violet-400 fill-violet-400/50'
                    : 'text-zinc-700'
              }
            />
          </button>
        );
      })}
    </div>
  );
}

function PanelPerfilCliente({
  perfil,
  abierto,
  onCerrar,
  calificacion,
  notaInterna,
  bloqueado,
  onCambiarCalificacion,
  onCambiarNota,
  onToggleBloqueo,
}) {
  useEffect(() => {
    if (!abierto) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [abierto, onCerrar]);

  if (!perfil) return null;

  const urlWhatsApp = `https://wa.me/${telefonoWhatsApp(perfil.telefono)}`;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          abierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCerrar}
        aria-hidden={!abierto}
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-[#121212] border-l border-white/5 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          abierto ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!abierto}
        role="dialog"
        aria-labelledby="perfil-cliente-titulo"
      >
        <div className="shrink-0 px-5 py-4 border-b border-white/5 bg-[#161618]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Perfil del Cliente
              </p>
              <h2 id="perfil-cliente-titulo" className="text-base font-semibold text-white truncate">
                {perfil.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-xs text-zinc-400">{perfil.telefono}</p>
                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-[#25D366]/70 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                  aria-label="Abrir WhatsApp"
                >
                  <IconoWhatsApp className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-zinc-600 mt-1">
                Miembro desde {perfil.miembroDesde}
              </p>
            </div>
            <button
              type="button"
              aria-label="Cerrar perfil"
              onClick={onCerrar}
              className="p-1.5 rounded text-zinc-600 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-6">
          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Calificación y Comportamiento
            </h3>

            <div className="bg-[#161618] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <EstrellasCalificacion
                  valor={calificacion}
                  editable
                  onChange={onCambiarCalificacion}
                />
                <span className="text-sm font-semibold text-white tabular-nums">
                  {calificacion.toFixed(1)}
                  <span className="text-zinc-500 font-normal"> / 5.0</span>
                </span>
              </div>

              {perfil.etiquetas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {perfil.etiquetas.map((etiqueta) => (
                    <span
                      key={etiqueta.texto}
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${etiqueta.estilo}`}
                    >
                      {etiqueta.texto}
                    </span>
                  ))}
                </div>
              )}

              <label className="block">
                <span className="text-[10px] font-medium text-zinc-500 mb-1.5 block">
                  Nota interna del administrador
                </span>
                <textarea
                  value={notaInterna}
                  onChange={(e) => onCambiarNota(e.target.value)}
                  placeholder="Ej: Siempre pide balones prestados y los devuelve tarde"
                  rows={3}
                  className="w-full px-3 py-2 text-xs text-white placeholder:text-zinc-600 bg-[#121212] border border-white/5 rounded-lg outline-none focus:border-violet-500/30 resize-none transition-colors"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Historial de Reservas
            </h3>

            <div className="bg-[#161618] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {perfil.historial.map((registro, i) => (
                <div
                  key={`${registro.fecha}-${i}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-zinc-300 tabular-nums">{registro.fecha}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5 truncate">{registro.cancha}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      ESTILO_ESTADO_HISTORIAL[registro.estado] ?? 'text-zinc-400 bg-white/5 border-white/5'
                    }`}
                  >
                    {registro.estado}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-white/5 bg-[#161618] space-y-3">
          <button
            type="button"
            onClick={() => window.open(urlWhatsApp, '_blank', 'noopener,noreferrer')}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
          >
            Enviar WhatsApp Recordatorio
          </button>

          <div>
            <button
              type="button"
              onClick={onToggleBloqueo}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold border transition-colors ${
                bloqueado
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
              }`}
            >
              {bloqueado ? 'CLIENTE BLOQUEADO — DESBLOQUEAR' : 'BLOQUEAR CLIENTE'}
            </button>
            <p className="text-[10px] text-zinc-600 leading-relaxed mt-2">
              Si bloqueas a este cliente, el sistema rechazará automáticamente cualquier
              intento de reserva desde su número de teléfono tanto en la web pública como
              por la IA de Zyra.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function TablaPagosPendientes({ reservas, liquidadas, onLiquidar, onSeleccionarCliente }) {
  if (reservas.length === 0) {
    return (
      <p className="text-center text-zinc-500 text-sm py-12">
        No hay saldos pendientes en este periodo
      </p>
    );
  }

  const columnasTabla =
    'grid grid-cols-[minmax(140px,1.3fr)_minmax(120px,1.1fr)_minmax(100px,0.9fr)_minmax(90px,0.85fr)_minmax(90px,0.85fr)_minmax(90px,0.85fr)_minmax(80px,0.75fr)] gap-3';

  return (
    <div className="border border-white/5 rounded-xl overflow-x-auto">
      <div className={`${columnasTabla} min-w-[820px] px-4 py-2.5 border-b border-white/5 bg-white/[0.02]`}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Jugador
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Horario
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Estado Web
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Valor Total
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Pagado al Reservar
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Por Liquidar
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 text-right">
          Acción
        </span>
      </div>

      {reservas.map((reserva) => {
        const liquidada = liquidadas.has(reserva.id);

        return (
          <div
            key={reserva.id}
            className={`${columnasTabla} min-w-[820px] px-4 py-3 border-b border-white/5 last:border-b-0 text-xs hover:bg-white/[0.02] transition-colors items-center`}
          >
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onSeleccionarCliente(reserva)}
                className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer font-medium truncate text-left max-w-full"
              >
                {reserva.nombre}
              </button>
              <p className="text-[11px] text-zinc-600 mt-0.5">{reserva.telefono}</p>
            </div>

            <p className="text-zinc-400">{reserva.horario}</p>

            <div>
              {reserva.reservaWeb ? (
                <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium text-[#00FF66]/90 bg-[#00FF66]/10 border border-[#00FF66]/15">
                  Anticipo 20% Pagado
                </span>
              ) : (
                <span className="text-zinc-600 text-[11px]">Reserva en caja</span>
              )}
            </div>

            <p className="text-zinc-300 tabular-nums">{formatearCOP(reserva.valorTotal)}</p>

            <p className="text-zinc-400 tabular-nums">
              {reserva.valorReservado > 0
                ? formatearCOP(reserva.valorReservado)
                : '—'}
            </p>

            <p className="text-white font-semibold tabular-nums">
              {liquidada ? (
                <span className="text-[#00FF66]/80 font-medium">
                  {formatearCOP(0)}
                </span>
              ) : (
                formatearCOP(reserva.pendientePagar)
              )}
            </p>

            <div className="flex justify-end">
              {liquidada ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#00FF66]/80">
                  <Check size={12} strokeWidth={2} />
                  Liquidado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onLiquidar(reserva.id)}
                  className="text-[11px] font-medium px-2 py-1 rounded bg-white text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                  Liquidar en Caja
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GraficaTendenciaOcupacion({ datos, totalHoras }) {
  const ancho = 400;
  const alto = 160;
  const paddingX = 8;
  const paddingY = 12;
  const areaAncho = ancho - paddingX * 2;
  const areaAlto = alto - paddingY * 2;

  const puntos = datos.map((dato, i) => {
    const x = paddingX + (i / Math.max(datos.length - 1, 1)) * areaAncho;
    const y = paddingY + areaAlto - (dato.ocupacion / 100) * areaAlto;
    return { x, y, ...dato };
  });

  const lineaPath = puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = `${lineaPath} L ${puntos[puntos.length - 1].x} ${paddingY + areaAlto} L ${puntos[0].x} ${paddingY + areaAlto} Z`;

  return (
    <div className="bg-[#161618] border border-white/5 rounded-xl p-4">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h4 className="text-xs text-zinc-400 font-semibold">
          Evolución de Ocupación (%)
        </h4>
        <span className="text-[11px] text-zinc-600">
          Total: {totalHoras} horas reservadas
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${ancho} ${alto}`}
          className="w-full h-[180px]"
          preserveAspectRatio="none"
          role="img"
          aria-label="Gráfica de evolución de ocupación"
        >
          <defs>
            <linearGradient id="gradienteOcupacion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.35)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((nivel) => {
            const y = paddingY + areaAlto - (nivel / 100) * areaAlto;
            return (
              <line
                key={nivel}
                x1={paddingX}
                y1={y}
                x2={ancho - paddingX}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill="url(#gradienteOcupacion)" />
          <path
            d={lineaPath}
            fill="none"
            stroke="rgba(167, 139, 250, 0.9)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {puntos.map((punto) => (
            <circle
              key={punto.etiqueta}
              cx={punto.x}
              cy={punto.y}
              r="3"
              fill="#a78bfa"
              stroke="#161618"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div
          className="flex justify-between mt-2 px-1"
          style={{ paddingLeft: `${(paddingX / ancho) * 100}%`, paddingRight: `${(paddingX / ancho) * 100}%` }}
        >
          {datos.map((dato) => (
            <span key={dato.etiqueta} className="text-[10px] text-zinc-600">
              {dato.etiqueta}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GraficaBloquesHorario({ bloques }) {
  const maxReservas = Math.max(...bloques.map((b) => b.reservas), 1);

  return (
    <div className="bg-[#161618] border border-white/5 rounded-xl p-4">
      <h4 className="text-xs text-zinc-400 font-semibold mb-4">
        Ocupación por Bloque Horario
      </h4>

      <div className="flex items-end justify-between gap-3 h-[180px] px-2">
        {bloques.map((bloque) => {
          const altura = (bloque.reservas / maxReservas) * 100;
          const esPico = bloque.reservas === maxReservas;

          return (
            <div key={bloque.hora} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] text-zinc-500 tabular-nums">{bloque.reservas}</span>
              <div
                className="w-full max-w-[48px] rounded-t-md transition-all duration-300"
                style={{
                  height: `${Math.max(altura, 8)}%`,
                  background: esPico
                    ? 'linear-gradient(180deg, rgba(167, 139, 250, 0.95) 0%, rgba(109, 40, 217, 0.5) 100%)'
                    : 'linear-gradient(180deg, rgba(139, 92, 246, 0.45) 0%, rgba(139, 92, 246, 0.12) 100%)',
                  boxShadow: esPico ? '0 0 20px rgba(139, 92, 246, 0.25)' : 'none',
                }}
              />
              <span className={`text-[10px] ${esPico ? 'text-violet-300/80' : 'text-zinc-600'}`}>
                {bloque.hora}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeccionReservas() {
  const [rangoFecha, setRangoFecha] = useState('semana');
  const [modoVista, setModoVista] = useState('lista');
  const [liquidadas, setLiquidadas] = useState(() => new Set());
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [edicionesCliente, setEdicionesCliente] = useState({});

  const reservasVisibles = RESERVAS_PAGOS_MOCK.filter((r) =>
    reservaEnRango(r.fecha, rangoFecha)
  );

  const datosOcupacion = OCUPACION_POR_RANGO[rangoFecha];

  const perfilActivo = clienteSeleccionado
    ? obtenerPerfilCliente(clienteSeleccionado)
    : null;

  const edicionActiva = clienteSeleccionado
    ? edicionesCliente[clienteSeleccionado.telefono] ?? {}
    : {};

  const calificacionActiva = edicionActiva.calificacion ?? perfilActivo?.calificacion ?? 3;
  const notaActiva = edicionActiva.notaInterna ?? perfilActivo?.notaInterna ?? '';
  const bloqueadoActivo = edicionActiva.bloqueado ?? false;

  const liquidarEnCaja = useCallback((id) => {
    setLiquidadas((prev) => new Set([...prev, id]));
  }, []);

  const abrirPerfilCliente = useCallback((reserva) => {
    setClienteSeleccionado(reserva);
  }, []);

  const cerrarPerfilCliente = useCallback(() => {
    setClienteSeleccionado(null);
  }, []);

  const actualizarEdicionCliente = useCallback((telefono, cambios) => {
    setEdicionesCliente((prev) => ({
      ...prev,
      [telefono]: { ...prev[telefono], ...cambios },
    }));
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SelectorRangoFecha valor={rangoFecha} onChange={setRangoFecha} />
        <ToggleModoVista valor={modoVista} onChange={setModoVista} />
      </div>

      {modoVista === 'lista' ? (
        <TablaPagosPendientes
          reservas={reservasVisibles}
          liquidadas={liquidadas}
          onLiquidar={liquidarEnCaja}
          onSeleccionarCliente={abrirPerfilCliente}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <GraficaTendenciaOcupacion
            datos={datosOcupacion.tendencia}
            totalHoras={datosOcupacion.totalHoras}
          />
          <GraficaBloquesHorario bloques={datosOcupacion.bloques} />
        </div>
      )}

      <PanelPerfilCliente
        perfil={perfilActivo}
        abierto={clienteSeleccionado !== null}
        onCerrar={cerrarPerfilCliente}
        calificacion={calificacionActiva}
        notaInterna={notaActiva}
        bloqueado={bloqueadoActivo}
        onCambiarCalificacion={(valor) =>
          clienteSeleccionado &&
          actualizarEdicionCliente(clienteSeleccionado.telefono, { calificacion: valor })
        }
        onCambiarNota={(valor) =>
          clienteSeleccionado &&
          actualizarEdicionCliente(clienteSeleccionado.telefono, { notaInterna: valor })
        }
        onToggleBloqueo={() =>
          clienteSeleccionado &&
          actualizarEdicionCliente(clienteSeleccionado.telefono, {
            bloqueado: !bloqueadoActivo,
          })
        }
      />
    </>
  );
}

function SeccionGeneral({ canchaSlug }) {
  const fechaHoy = obtenerFechaCali();
  const [horaExpandida, setHoraExpandida] = useState(null);
  const [agenda, setAgenda] = useState(AGENDA_INICIAL);
  const { isRainModeActive, isReservaAfectada, descripcionActiva } = useRainMode();
  const { isLight } = useAccessibility();
  const { isCanchaBloqueada, obtenerExpiracion } = useCourtBlock();
  const canchaBloqueada = isCanchaBloqueada(canchaSlug);

  useEffect(() => {
    setAgenda(AGENDA_INICIAL);
    setHoraExpandida(null);
  }, [canchaSlug]);

  useEffect(() => {
    if (canchaBloqueada) setHoraExpandida(null);
  }, [canchaBloqueada]);

  const expandirFila = useCallback((hora) => {
    setHoraExpandida(hora);
  }, []);

  const colapsarFila = useCallback(() => {
    setHoraExpandida(null);
  }, []);

  const agendarReserva = useCallback(
    (datos) => {
      setAgenda((prev) =>
        prev.map((slot) =>
          slot.hora === datos.hora && slot.tipo === 'disponible'
            ? {
                id: `slot-${datos.hora.replace(/\s/g, '')}-${Date.now()}`,
                hora: datos.hora,
                tipo: 'ocupada',
                nombre: datos.nombre,
                deporte: obtenerEtiquetaDeporte(datos.canchaId),
                estadoPago: datos.estadoPago,
                pagoPendiente: datos.pagoPendiente,
                valorTotal: datos.valorTotal,
                valorPagado: datos.valorPagado,
                valorPendiente: datos.valorPendiente,
              }
            : slot
        )
      );
      setHoraExpandida(null);
    },
    []
  );

  const horasDisponibles = agenda.filter((s) => s.tipo === 'disponible').length;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <TarjetaMetrica titulo="Ocupación Hoy" valor="78%" progreso={78} tormentaActiva={isRainModeActive} isLight={isLight} />
        <TarjetaMetrica
          titulo="Horas Disponibles"
          valor={`${horasDisponibles} hora${horasDisponibles !== 1 ? 's' : ''}`}
          tormentaActiva={isRainModeActive}
          isLight={isLight}
        />
        <TarjetaMetrica titulo="Ingresos Estimados" valor="$320,000 COP" tormentaActiva={isRainModeActive} isLight={isLight} />
      </div>

      <div
        className={`rounded-xl p-4 transition-all duration-300 ${
          isRainModeActive
            ? LUXURY_STORM_GLASS
            : isLight
              ? 'bg-white border border-slate-100 shadow-sm'
              : ''
        }`}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h3
            className={`text-sm font-medium transition-colors duration-300 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Agenda del Día
          </h3>
          <span
            className={`text-xs capitalize transition-colors duration-300 ${
              isLight ? 'text-slate-500' : 'text-zinc-500'
            }`}
          >
            {fechaHoy}
          </span>
        </div>

        {isRainModeActive && (
          <div className="mb-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-cyan-400/20 bg-cyan-500/[0.06] shadow-[0_0_18px_rgba(56,189,248,0.1)]">
            <span className="text-sm">🌧️</span>
            <p className="text-[11px] text-cyan-200/90 leading-snug">
              Modo Lluvia activo · {descripcionActiva}. Las reservas del bloque quedan
              marcadas para reagendamiento.
            </p>
          </div>
        )}

        {canchaBloqueada && (
          <div
            className={`mb-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border transition-all duration-300 ${
              isLight
                ? 'border-amber-200/80 bg-amber-50 shadow-sm'
                : 'border-amber-500/20 bg-amber-500/[0.06]'
            }`}
          >
            <span className="text-sm">🔒</span>
            <p
              className={`text-[11px] leading-snug ${
                isLight ? 'text-amber-800/90' : 'text-amber-200/90'
              }`}
            >
              Bloqueo Express activo · Sin nuevas reservas hasta{' '}
              {new Date(obtenerExpiracion(canchaSlug)).toLocaleTimeString('es-CO', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {agenda.map((slot) =>
            slot.tipo === 'ocupada' ? (
              <FilaOcupada
                key={slot.id}
                hora={slot.hora}
                nombre={slot.nombre}
                deporte={slot.deporte}
                estadoPago={slot.estadoPago}
                pagoPendiente={slot.pagoPendiente}
                afectadaPorLluvia={isReservaAfectada(slot.hora)}
                isLight={isLight}
              />
            ) : canchaBloqueada ? (
              <FilaBloqueoTemporal key={slot.id} hora={slot.hora} isLight={isLight} />
            ) : (
              <FilaDisponibleAcordeon
                key={slot.id}
                hora={slot.hora}
                expandida={horaExpandida === slot.hora}
                onExpandir={expandirFila}
                onColapsar={colapsarFila}
                onAgendar={agendarReserva}
                canchaSlug={canchaSlug}
                isLight={isLight}
              />
            )
          )}
        </div>
      </div>

      <p
        className={`mt-8 pt-6 border-t text-xs transition-all duration-300 ${
          isLight
            ? 'border-slate-100 text-slate-500'
            : 'border-white/5 text-zinc-500'
        }`}
      >
        Estructura: Techada • Iluminación: LED • Último Mantenimiento: Hace 12 días
      </p>
    </>
  );
}

function EstadoVacio({ selectedFilter, onSelectFilter }) {
  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Panel General</h1>
        <FilterBar selectedFilter={selectedFilter} onSelectFilter={onSelectFilter} />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#00FF66]/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-[#00FF66] rounded-full" />
              </div>
            </div>
          </div>
          <p className="text-zinc-500 text-sm mb-2">
            No hay canchas programadas para {selectedFilter.toLowerCase()}
          </p>
          <p className="text-zinc-600 text-xs">
            La cuadrícula de canchas aparecerá aquí cuando haya reservas disponibles
          </p>
        </div>
      </div>
    </div>
  );
}

function CentroControl({ canchaSlug }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLight } = useAccessibility();

  const [nombreCancha, setNombreCancha] = useState(() => obtenerNombreCancha(canchaSlug));
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemporal, setNombreTemporal] = useState('');
  const [esFavorito, setEsFavorito] = useState(false);
  const [canchaActiva, setCanchaActiva] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuHaciaArriba, setMenuHaciaArriba] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const pestanaActiva = obtenerPestanaDesdeRuta(location.pathname, canchaSlug);

  useEffect(() => {
    setNombreCancha(obtenerNombreCancha(canchaSlug));
    setEditandoNombre(false);
    setPanelAbierto(false);
  }, [canchaSlug]);

  useEffect(() => {
    if (editandoNombre && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editandoNombre]);

  const cerrarMenu = useCallback(() => setMenuAbierto(false), []);

  useEffect(() => {
    if (!menuAbierto) return;

    const handleClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        cerrarMenu();
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [menuAbierto, cerrarMenu]);

  const navegarPestana = (pestana) => {
    const segmento = RUTAS_PESTANA[pestana];
    const ruta = segmento
      ? `/canchas/${canchaSlug}/${segmento}`
      : `/canchas/${canchaSlug}`;
    navigate(ruta);
  };

  const iniciarEdicion = () => {
    setNombreTemporal(nombreCancha);
    setEditandoNombre(true);
  };

  const guardarNombre = () => {
    const nombreFinal = nombreTemporal.trim() || nombreCancha;
    setNombreCancha(nombreFinal);
    setEditandoNombre(false);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    const haciaArriba = e.clientY > window.innerHeight * 0.6;
    setMenuHaciaArriba(haciaArriba);
    setMenuAbierto((prev) => !prev);
  };

  const copiarLink = async () => {
    const url = `${window.location.origin}${location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    } catch {
      setLinkCopiado(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <header
        className={`shrink-0 py-3 px-6 border-b flex justify-between items-center transition-all duration-300 ${
          isLight
            ? 'bg-white border-slate-100'
            : 'bg-[#121212] border-white/5'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-xs shrink-0 transition-colors duration-300 ${
              isLight ? 'text-slate-500' : 'text-zinc-500'
            }`}
          >
            Canchas &gt;
          </span>

          {editandoNombre ? (
            <input
              ref={inputRef}
              type="text"
              value={nombreTemporal}
              onChange={(e) => setNombreTemporal(e.target.value)}
              onBlur={guardarNombre}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  guardarNombre();
                } else if (e.key === 'Escape') {
                  setEditandoNombre(false);
                }
              }}
              className="text-sm font-semibold text-white bg-[#080808] border border-[#00FF66] rounded px-2 py-0.5 outline-none min-w-0 max-w-[200px]"
            />
          ) : (
            <span
              className={`text-sm font-semibold truncate cursor-default transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
              onDoubleClick={iniciarEdicion}
            >
              {nombreCancha}
            </span>
          )}

          <button
            type="button"
            aria-label={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            onClick={() => setEsFavorito((prev) => !prev)}
            className={`shrink-0 p-1 rounded transition-colors duration-300 ${
              isLight
                ? 'text-slate-400 hover:text-emerald-600'
                : 'text-zinc-600 hover:text-[#00FF66]'
            }`}
          >
            <Star
              size={14}
              strokeWidth={1.5}
              className={esFavorito ? 'fill-[#00FF66] text-[#00FF66]' : ''}
            />
          </button>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-label="Más opciones"
              aria-expanded={menuAbierto}
              onClick={handleMenuToggle}
              className={`p-1 rounded transition-all duration-300 ${
                menuAbierto
                  ? isLight
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-white bg-white/10'
                  : isLight
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-zinc-600 hover:text-white hover:bg-white/5'
              }`}
            >
              <MoreHorizontal size={14} strokeWidth={1.5} />
            </button>

            {menuAbierto && (
              <div
                role="menu"
                className={`absolute left-0 z-50 w-44 py-1 rounded-lg shadow-lg transition-all duration-300 ${
                  isLight
                    ? 'bg-white border border-slate-100'
                    : 'bg-[#1a1a1a] border border-white/10 shadow-2xl'
                } ${
                  menuHaciaArriba ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={cerrarMenu}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Editar precios
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={cerrarMenu}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Pausar por mantenimiento
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={cerrarMenu}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-red-400 transition-colors"
                >
                  Eliminar cancha
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            aria-label="Copiar enlace de reserva"
            onClick={copiarLink}
            className={`p-1.5 rounded transition-all duration-300 ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-600 hover:text-white hover:bg-white/5'
            }`}
          >
            {linkCopiado ? (
              <Check size={14} strokeWidth={1.5} className="text-[#00FF66]" />
            ) : (
              <Link2 size={14} strokeWidth={1.5} />
            )}
          </button>

          <ToggleSwitch
            activo={canchaActiva}
            onChange={setCanchaActiva}
            etiquetaActiva="Activa"
            etiquetaInactiva="Inactiva"
          />
        </div>
      </header>

      <nav
        className={`shrink-0 py-2 px-6 border-b flex justify-between items-center transition-all duration-300 ${
          isLight
            ? 'bg-white border-slate-100'
            : 'bg-[#121212] border-white/5'
        }`}
      >
        <div className="flex items-center gap-0.5">
          {PESTANAS.map((pestana) => {
            const activa = pestanaActiva === pestana;
            return (
              <button
                key={pestana}
                type="button"
                onClick={() => navegarPestana(pestana)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-300 ${
                  activa
                    ? isLight
                      ? 'bg-slate-200/60 text-emerald-600'
                      : 'bg-white/10 text-white'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {pestana}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-expanded={panelAbierto}
          onClick={() => setPanelAbierto((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all duration-300 ${
            panelAbierto
              ? isLight
                ? 'text-emerald-600 bg-slate-200/60'
                : 'text-white bg-white/10'
              : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <PanelRight size={14} strokeWidth={1.5} />
          <span>Opciones rápidas</span>
        </button>
      </nav>

      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 min-w-0">
          {pestanaActiva === 'General' && <SeccionGeneral canchaSlug={canchaSlug} />}
          {pestanaActiva === 'Reservas' && <SeccionReservas />}
          {pestanaActiva === 'Precios' && (
            <SeccionPrecios nombreCancha={nombreCancha} />
          )}
          {pestanaActiva === 'Actividad' && (
            <SeccionActividad nombreCancha={nombreCancha} />
          )}
        </div>

        <PanelOpcionesRapidas
          abierto={panelAbierto}
          onCerrar={() => setPanelAbierto(false)}
          nombreCancha={nombreCancha}
        />
      </div>
    </div>
  );
}

function Cancha({ selectedFilter, onSelectFilter }) {
  const { canchaSlug } = useParams();

  if (!canchaSlug) {
    return (
      <EstadoVacio
        selectedFilter={selectedFilter}
        onSelectFilter={onSelectFilter}
      />
    );
  }

  return <CentroControl canchaSlug={canchaSlug} />;
}

export default Cancha;

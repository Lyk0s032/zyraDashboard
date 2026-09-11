import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { FilterBar } from '../../navigation';
import SeccionPrecios from './precios';
import SeccionActividad from './actividad';
import SeccionReservas from './reservas';
import { useRainMode } from '../../estados/RainModeContext';
import { useAccessibility } from '../../estados/AccessibilityContext';
import { useCourtBlock } from '../../estados/CourtBlockContext';
import { LUXURY_STORM_GLASS } from '../RainEffect';
import { useAppContext } from '../../estados/AppContext';
import { updateCanchaNombre, updateCanchaEstado } from '../../estados/actions';
import axiosInstance from '../../api/axiosConfig';
import FormularioReservaManual from '../principal/FormularioReservaManual';
import HistorialCliente from '../principal/HistorialCliente';
import { Banknote, Smartphone, ArrowLeftRight, Clock } from 'lucide-react';

const PESTANAS = ['General', 'Reservas', 'Precios', 'Actividad'];

const RUTAS_PESTANA = {
  General: '',
  Reservas: 'reservas',
  Precios: 'precios',
  Actividad: 'actividad',
};

// Helper para extraer el ID numérico de canchaSlug (soporta "1" o "cancha-1")
const extraerCanchaId = (canchaSlug) => {
  if (!canchaSlug) return null;
  // Si es solo un número, retornarlo directamente
  if (/^\d+$/.test(canchaSlug)) return parseInt(canchaSlug);
  // Si tiene el prefijo "cancha-", quitarlo
  return parseInt(canchaSlug.replace('cancha-', ''));
};

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
    notaInterna: 'Verificar identidad al llegar � reservas frecuentes sin anticipo',
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

// Buscar cliente en el backend usando la API real
async function buscarClienteEnBackend(telefono, complejoId) {
  const digits = normalizarTelefono(telefono);
  if (digits.length < 10) return null;

  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(
      `/api/reservas/historial-cliente/${digits}`,
      {
        params: { complejo_id: complejoId },
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      const { cliente, estadisticas, historial } = response.data;
      return {
        cliente,
        estadisticas,
        historial,
        esRegistrado: cliente.es_cliente_registrado
      };
    }
  } catch (error) {
    console.error('Error al buscar cliente:', error);
  }
  
  return null;
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
  '�x� Buscando número en la base de datos...',
  '�a� Escaneando historial de asistencia y alertas...',
  '�S� Renderizando perfil deportivo...',
];

const ESTILO_ESTADO_HISTORIAL = {
  'Asistió': 'text-[#00FF66]/90 bg-[#00FF66]/10 border-[#00FF66]/15',
  'Canceló': 'text-yellow-400/90 bg-yellow-400/10 border-yellow-400/15',
  'No asistió / Fake': 'text-red-400/90 bg-red-400/10 border-red-400/15',
};

function formatearCOP(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CO')} COP`;
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

function obtenerNombreCancha(slug, canchasGlobales = []) {
  // Buscar en el estado global (canchas de la BD)
  if (canchasGlobales.length > 0) {
    const cancha = canchasGlobales.find((c) => String(c.id) === String(slug));
    if (cancha) return cancha.nombre;
  }
  // Fallback: capitalizar el slug (útil si las canchas aún no cargaron)
  return String(slug)
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

/** Retorna la fecha de hoy en Bogotá como "YYYY-MM-DD" */
function fechaHoyBogota() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
}

/** Formatea "YYYY-MM-DD" como texto largo en español (Colombia) */
function formatearFechaDisplay(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  // Crear la fecha sin desfase de zona horaria
  const fecha = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
}

/** Avanza o retrocede `delta` días sobre "YYYY-MM-DD" */
function navegarDia(fechaISO, delta) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const fecha = new Date(y, m - 1, d + delta);
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');
}

function obtenerFechaCali() {
  return formatearFechaDisplay(fechaHoyBogota());
}

/**
 * Convierte los horarios de operación + reservas de la API
 * al formato de slots que usa la agenda visual.
 * @param {Array} horarios  � [{ clave: "08:00", etiqueta: "8:00 AM" }]
 * @param {Array} reservas  � array de reservas formateadas del backend
 * @param {Object|null} cancha � info de la cancha (para el tipo de deporte)
 */
function buildAgendaFromAPI(horarios, reservas, cancha) {
  return horarios.map((slot, idx) => {
    const [hSlot, mSlot] = slot.clave.split(':').map(Number);
    const minSlot = hSlot * 60 + mSlot;

    // Buscar si alguna reserva cubre este bloque horario
    const reserva = reservas.find((r) => {
      const [hi, mi] = r.hora_inicio.split(':').map(Number);
      const [hf, mf] = r.hora_fin.split(':').map(Number);
      const minInicio = hi * 60 + mi;
      const minFin = hf * 60 + mf;
      return minSlot >= minInicio && minSlot < minFin;
    });

    if (reserva) {
      return {
        id: `slot-api-${reserva.id}-${idx}`,
        hora: slot.etiqueta,
        tipo: 'ocupada',
        nombre: reserva.cliente?.nombre || 'Sin nombre',
        deporte: obtenerEtiquetaDeporte(cancha?.tipo_deporte),
        estadoPago: reserva.estado_pago_legible,
        pagoPendiente: reserva.estado_pago !== 'PAGADA_TOTAL',
        valorTotal: reserva.monto_total,
        valorPagado: reserva.monto_abono,
        valorPendiente: reserva.monto_total - reserva.monto_abono,
      };
    }

    return {
      id: `slot-libre-${idx}`,
      hora: slot.etiqueta,
      tipo: 'disponible',
    };
  });
}

const VALOR_RESERVA_DEFAULT = 60000;

// ============================================
// FUNCIONES PARA CARGA DE PRECIOS REALES
// ============================================

/**
 * Obtiene el precio real de una franja horaria específica según día y hora
 * @param {string} canchaSlug - ID de la cancha
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} hora - Hora en formato "8:00 AM"
 * @param {number} duracion - Duración en minutos
 * @returns {Promise<number>} - Precio calculado
 */
async function obtenerPrecioRealFranja(canchaSlug, fecha, hora, duracion = 60) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return VALOR_RESERVA_DEFAULT;

    const canchaIdNumerico = extraerCanchaId(canchaSlug);
    
    const response = await axiosInstance.get(`/api/canchas/${canchaIdNumerico}/precios`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const bloques = response.data.data?.bloques || response.data.bloques || [];
    if (!response.data.success || !bloques.length) return VALOR_RESERVA_DEFAULT;

    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);
    const diaSemana = fechaObj.getDay();
    const horaMinutos = convertirHoraAMinutos(hora);
    
    const precioEncontrado = buscarPrecioEnBloques(bloques, diaSemana, horaMinutos, duracion);
    return precioEncontrado || VALOR_RESERVA_DEFAULT;
    
  } catch (error) {
    console.error('Error al obtener precio real:', error);
    return VALOR_RESERVA_DEFAULT;
  }
}

/**
 * Convierte hora en formato "8:00 AM" a minutos desde medianoche
 */
function convertirHoraAMinutos(horaTexto) {
  const match = horaTexto.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  
  const [, h, m, periodo] = match;
  let horas = parseInt(h);
  const minutos = parseInt(m);
  
  if (periodo.toUpperCase() === 'PM' && horas !== 12) {
    horas += 12;
  } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
    horas = 0;
  }
  
  return horas * 60 + minutos;
}

/**
 * Busca el precio correspondiente en los bloques de precios
 */
function buscarPrecioEnBloques(bloques, diaSemana, horaMinutos, duracion) {
  for (const bloque of bloques) {
    const diasBloque = bloque.dias || bloque.dias_semana || [];
    const horariosBloque = bloque.horarios || bloque.franjas_horarias || [];
    
    const aplicaEsteBloque = diasBloque.some(dia => {
      if (dia === 'Fes') return false;
      return convertirDiaANumero(dia) === diaSemana;
    });

    if (!aplicaEsteBloque) continue;

    for (const franja of horariosBloque) {
      const inicioMinutos = convertirHoraStringAMinutos(franja.hora_inicio);
      const finMinutos = convertirHoraStringAMinutos(franja.hora_fin);
      
      if (horaMinutos >= inicioMinutos && horaMinutos < finMinutos) {
        const precioHora = franja.precio_hora || franja.precio_por_hora || 0;
        return Math.round((precioHora * duracion) / 60);
      }
    }
  }
  
  return null;
}

/**
 * Convierte día de string a número (Lu=1, Ma=2, etc.)
 */
function convertirDiaANumero(diaString) {
  const mapaDias = { 'Do': 0, 'Lu': 1, 'Ma': 2, 'Mi': 3, 'Ju': 4, 'Vi': 5, 'Sá': 6 };
  return mapaDias[diaString] ?? 0;
}

/**
 * Convierte hora en formato "HH:MM" a minutos desde medianoche
 */
function convertirHoraStringAMinutos(horaString) {
  const [horas, minutos] = horaString.split(':').map(Number);
  return horas * 60 + minutos;
}

// Constantes para el formulario mejorado
const DURACIONES = [
  { id: 60, label: '1 hora (60 min)', icon: Clock },
  { id: 120, label: '2 horas (120 min)', icon: Clock },
];

const METODOS_PAGO = [
  { id: 'NEQUI', label: 'Nequi', icon: Smartphone },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: ArrowLeftRight },
  { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
];

const ABONO_MINIMO_ALERTA_PORCENTAJE = 0.2;

function calcularAbonoMinimoAlerta(precioHora) {
  return Math.round(precioHora * ABONO_MINIMO_ALERTA_PORCENTAJE);
}

function calcularDesglosePago(precioHora, tipoPago, montoAbonado) {
  const valorTotal = precioHora;
  const valorPagado =
    tipoPago === 'total'
      ? valorTotal
      : tipoPago === 'abono'
        ? Math.min(Math.max(0, Number(montoAbonado) || 0), valorTotal)
        : 0;
  const valorPendiente = valorTotal - valorPagado;
  const pagoPendiente = valorPendiente > 0;

  let estadoPago = 'Pendiente por pagar';
  if (valorPagado >= valorTotal) estadoPago = 'Pago Confirmado';
  else if (valorPagado > 0) estadoPago = 'Anticipo recibido';

  return { valorTotal, valorPagado, valorPendiente, estadoPago, pagoPendiente };
}


function obtenerEtiquetaDeporte(tipoDeporte) {
  if (!tipoDeporte) return null;
  const base = tipoDeporte.charAt(0).toUpperCase() + tipoDeporte.slice(1).toLowerCase();
  return base;
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
            �a�️ Si permanece &apos;Sin definir&apos;, esta característica NO se mostrará en tu
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
          �x� <span className="text-zinc-300 font-medium">Análisis Predictivo:</span>{' '}
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
            <span className="ml-2 text-[10px] text-cyan-300/80">�xR�️ Modo Lluvia</span>
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
        🆕 {antecedentes.cliente ? 'Cliente registrado sin reservas previas' : 'Usuario nuevo: Se creará historial limpio para este número'}
      </span>
    );
  }

  const perfil = antecedentes.perfil;

  if (antecedentes.tipo === 'confiable') {
    return (
      <div className="space-y-3">
        <span className="inline-flex text-green-400 bg-green-500/5 text-[11px] px-2 py-1 rounded leading-snug">
          �x�  Cliente cumplido: {antecedentes.reservas} reservas / {antecedentes.faltas} faltas
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
          �a�️ ALERTA: Este usuario registra inasistencias. Se bloquea la opción &apos;Paga al
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
          �x Bloqueo Temporal
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
  fechaSeleccionada,
  isLight,
  complejoId,
}) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoPago, setTipoPago] = useState('llegada');
  const [montoAbonado, setMontoAbonado] = useState('');
  const [nombreAutocompletado, setNombreAutocompletado] = useState(false);
  
  // Nuevos campos para sincronizar con FormularioReservaManual
  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [precioRealCargando, setPrecioRealCargando] = useState(false);
  const [precioReal, setPrecioReal] = useState(VALOR_RESERVA_DEFAULT);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [datosClienteReal, setDatosClienteReal] = useState(null);
  const [historialCliente, setHistorialCliente] = useState(null);
  const [estadisticasCliente, setEstadisticasCliente] = useState(null);
  const [muestraHistorial, setMuestraHistorial] = useState(false);
  const telefonoRef = useRef(null);

  const precioHora = precioReal;
  
  // Usar datos reales del backend si están disponibles, sino usar mock
  let antecedentes;
  if (datosClienteReal) {
    // Analizar basado en datos reales del backend
    const totalReservas = estadisticasCliente?.total_reservas || 0;
    const reservasCanceladas = estadisticasCliente?.reservas_canceladas || 0;
    const reservasNoShow = estadisticasCliente?.reservas_no_show || 0;
    
    const problemas = reservasCanceladas + reservasNoShow;
    
    if (totalReservas === 0) {
      antecedentes = { tipo: 'nuevo', cliente: datosClienteReal };
    } else if (problemas > 0) {
      antecedentes = { 
        tipo: 'alerta', 
        cliente: datosClienteReal, 
        faltas: problemas, 
        reservas: totalReservas,
        estadisticas: estadisticasCliente 
      };
    } else {
      antecedentes = { 
        tipo: 'confiable', 
        cliente: datosClienteReal, 
        reservas: totalReservas, 
        faltas: 0,
        calificacion: 4.5, // Por defecto si es confiable
        estadisticas: estadisticasCliente 
      };
    }
  } else {
    // Fallback al sistema mock
    antecedentes = analizarAntecedentes(telefono);
  }
  
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
    setDatosClienteReal(null);
    setHistorialCliente(null);
    setEstadisticasCliente(null);
    setMuestraHistorial(false);
    
    // Resetear valores de duración y método de pago
    setDuracionMinutos(60);
    setMetodoPago('EFECTIVO');
    
    // Cargar precio real para esta franja horaria
    cargarPrecioReal();
    
    const timer = setTimeout(() => telefonoRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [expandida]);

  // Cargar precio real cuando cambia la duración
  useEffect(() => {
    if (expandida) {
      cargarPrecioReal();
    }
  }, [duracionMinutos, expandida]);

  const cargarPrecioReal = async () => {
    if (!expandida) return;
    if (!fechaSeleccionada) {
      setPrecioReal(VALOR_RESERVA_DEFAULT);
      return;
    }
    
    setPrecioRealCargando(true);
    try {
      const precio = await obtenerPrecioRealFranja(canchaSlug, fechaSeleccionada, hora, duracionMinutos);
      setPrecioReal(precio);
    } catch (error) {
      console.error('Error al cargar precio real:', error);
      setPrecioReal(VALOR_RESERVA_DEFAULT);
    } finally {
      setPrecioRealCargando(false);
    }
  };

  // Búsqueda real de clientes en el backend
  useEffect(() => {
    const digits = normalizarTelefono(telefono);
    if (digits.length < 10) {
      setMuestraHistorial(false);
      setHistorialCliente(null);
      setEstadisticasCliente(null);
      setDatosClienteReal(null);
      setNombreAutocompletado(false);
      if (digits > 0) setNombre('');
      setCargandoHistorial(false);
      return;
    }

    setCargandoHistorial(true);
    setMuestraHistorial(false);

    const buscarCliente = async () => {
      try {
        const resultado = await buscarClienteEnBackend(telefono, complejoId);
        if (resultado && resultado.cliente) {
          setDatosClienteReal(resultado.cliente);
          setEstadisticasCliente(resultado.estadisticas);
          setHistorialCliente(resultado.historial);
          setNombre(resultado.cliente.nombre);
          setNombreAutocompletado(true);
          setMuestraHistorial(true);
        } else {
          // Fallback al sistema mock si no encuentra en el backend
          const cliente = buscarClienteRegistrado(telefono);
          if (cliente) {
            setNombre(cliente.nombre);
            setNombreAutocompletado(true);
          } else {
            setNombre('');
            setNombreAutocompletado(false);
          }
          setMuestraHistorial(false);
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error);
        // Fallback al sistema mock en caso de error
        const cliente = buscarClienteRegistrado(telefono);
        if (cliente) {
          setNombre(cliente.nombre);
          setNombreAutocompletado(true);
        } else {
          setNombre('');
          setNombreAutocompletado(false);
        }
        setMuestraHistorial(false);
      } finally {
        setCargandoHistorial(false);
      }
    };

    const timer = setTimeout(buscarCliente, 800);
    return () => clearTimeout(timer);
  }, [telefono, complejoId]);

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
      clienteData: datosClienteReal,
    };
  };

  const pagoFormularioValido =
    tipoPago === 'llegada' ? !esAlerta :
    tipoPago === 'total'   ? true :
    montoAbonoNum > 0 && montoAbonoNum <= precioHora;

  const ejecutarAgendamiento = async () => {
    if (!nombre.trim() || !pagoFormularioValido) return;
    if (esAlerta && montoAbonoNum < abonoMinimo) return;

    try {
      setCargandoHistorial(true);
      const token = localStorage.getItem('token');
      
      // Extraer el ID numérico de la cancha
      const canchaIdNumerico = extraerCanchaId(canchaSlug);
      
      // Usar la fecha real seleccionada en el calendario
      const fechaReserva = fechaSeleccionada ?? new Date().toISOString().split('T')[0];

      // Convertir "8:00 PM" → "20:00"
      const convertirHora24 = (horaTexto) => {
        const match = horaTexto.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return horaTexto;
        const [, h, m, periodo] = match;
        let hour24 = parseInt(h);
        if (periodo.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
        else if (periodo.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;
        return `${String(hour24).padStart(2, '0')}:${m}`;
      };

      const estadoPagoPayload =
        tipoPago === 'total'   ? 'PAGADA_TOTAL' :
        tipoPago === 'llegada' ? 'ABONADA' :
        montoAbonoNum >= precioHora ? 'PAGADA_TOTAL' : 'ABONADA';

      const payload = {
        cancha_id: parseInt(canchaIdNumerico),
        fecha: fechaReserva,
        hora_inicio: convertirHora24(hora),
        duracion_minutos: duracionMinutos,
        metodo_pago: tipoPago !== 'llegada' ? metodoPago : null,
        estado_pago: estadoPagoPayload,
        origen_reserva: 'MANUAL',
        telefono_contacto: telefono,
        nombre_contacto: nombre
      };

      const response = await axiosInstance.post('/api/reservas', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const datosReserva = construirDatosReserva();
        onAgendar(datosReserva);
        console.log('✅ Reserva creada exitosamente desde cancha específica');
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
      const mensaje = error.response?.data?.message || 'Error al crear la reserva';
      alert(mensaje);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const handleConfirmar = () => {
    if (!nombre.trim() || antecedentes.tipo === 'vacio' || !pagoFormularioValido) return;
    if (antecedentes.tipo === 'alerta') return;
    ejecutarAgendamiento();
  };

  const puedeConfirmar =
    nombre.trim().length > 0 &&
    antecedentes.tipo !== 'vacio' &&
    (antecedentes.tipo !== 'alerta' || (esAlerta && montoAbonoNum >= abonoMinimo)) &&
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
            <div className="p-4 pt-2">
              <div className="flex gap-6 items-start">
                {/* Formulario principal */}
                <div className="flex-1 min-w-0 space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                    Precio total ({duracionMinutos} min): {precioRealCargando ? '...' : formatearCOP(precioHora)}
                  </p>
                  {precioRealCargando && (
                    <div className="w-3 h-3 border border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
                  )}
                </div>

                <div className="relative">
                  <input
                    ref={telefonoRef}
                    type="tel"
                    inputMode="numeric"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/[^\d+\s-]/g, ''))}
                    placeholder="+57 300 123 4567"
                    className={`${CLASE_INPUT_ACORDEON} ${cargandoHistorial ? 'pr-8' : ''}`}
                  />
                  {cargandoHistorial && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className={`transition-all duration-300 overflow-hidden ${
                  cargandoHistorial || (muestraHistorial && datosClienteReal)
                    ? 'max-h-6 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}>
                  {cargandoHistorial && (
                    <p className="text-[11px] text-emerald-400/80 flex items-center gap-1.5 animate-pulse">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Verificando información del cliente...
                    </p>
                  )}
                  {!cargandoHistorial && muestraHistorial && datosClienteReal && (
                    <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {datosClienteReal.es_cliente_registrado ? 'Cliente registrado' : 'Cliente encontrado'} • {estadisticasCliente?.total_reservas || 0} reservas
                    </p>
                  )}
                </div>

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

                {/* Selector de duración */}
                <div className="space-y-1.5">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                    Duración del partido
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DURACIONES.map(({ id, label, icon: Icono }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDuracionMinutos(id)}
                        className={`flex items-center gap-1.5 rounded-lg border p-2 text-[11px] font-medium transition-all duration-150 ${
                          duracionMinutos === id
                            ? 'border-emerald-500 bg-emerald-500/[0.06] text-emerald-300'
                            : 'border-slate-700/80 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        <Icono className="h-3 w-3" strokeWidth={1.5} />
                        {label}
                      </button>
                    ))}
                  </div>
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
                      onClick={() => setTipoPago('total')}
                      className={`text-left px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                        tipoPago === 'total'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Pago Total ({formatearCOP(precioHora)})
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
                      Registrar Anticipo (30%)
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

                {/* Método de pago (para pago inmediato: total o anticipo) */}
                {(tipoPago === 'total' || tipoPago === 'abono') && (
                  <div className="space-y-1.5">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
                      Método de pago
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {METODOS_PAGO.map(({ id, label, icon: Icono }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setMetodoPago(id)}
                          className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] font-medium transition-all duration-150 ${
                            metodoPago === id
                              ? 'border-emerald-500 bg-emerald-500/[0.06] text-emerald-300'
                              : 'border-slate-700/80 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                          }`}
                        >
                          <Icono className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-zinc-400">
                  {tipoPago === 'total'
                    ? `Pago completo: ${formatearCOP(precioHora)} · Pendiente: $0`
                    : tipoPago === 'abono'
                      ? `Abona hoy: ${formatearCOP(desglose.valorPagado)} · Restante en complejo: ${formatearCOP(desglose.valorPendiente)}`
                      : `Paga al llegar: ${formatearCOP(precioHora)}`
                  }
                </p>

                  <button
                    type="button"
                    onClick={handleConfirmar}
                    disabled={!puedeConfirmar}
                    className="mt-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold px-3 py-1.5 rounded transition-colors"
                  >
                    Confirmar y Verificar
                  </button>

                  {/* Panel de antecedentes integrado en la columna izquierda cuando no hay historial */}
                  {(!muestraHistorial || esAlerta) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
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
                  )}
                </div>

                {/* Panel lateral del historial del cliente con animación */}
                <div className={`transition-all duration-700 ease-out ${
                  (muestraHistorial && datosClienteReal) || cargandoHistorial
                    ? 'opacity-100 w-80 max-w-sm'
                    : 'opacity-0 w-0 max-w-0 overflow-hidden pointer-events-none'
                }`}>
                  <div className={`pl-6 border-l border-white/10 transition-all duration-500 ${
                    (muestraHistorial && datosClienteReal) || cargandoHistorial
                      ? 'translate-x-0 opacity-100'
                      : 'translate-x-6 opacity-0'
                  }`}
                  style={{
                    boxShadow: (muestraHistorial && datosClienteReal) 
                      ? '-4px 0 20px rgba(0, 0, 0, 0.1)' 
                      : 'none'
                  }}>
                    {cargandoHistorial && (
                      <div className="animate-pulse">
                        {/* Header skeleton */}
                        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 mb-4 border border-white/5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-white/15 rounded mb-2 w-3/4"></div>
                              <div className="h-3 bg-white/10 rounded w-1/2"></div>
                            </div>
                          </div>
                          
                          {/* Stats skeleton */}
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center">
                              <div className="h-6 bg-white/15 rounded mb-1 mx-auto w-8"></div>
                              <div className="h-2 bg-white/10 rounded w-full"></div>
                            </div>
                            <div className="text-center">
                              <div className="h-6 bg-white/15 rounded mb-1 mx-auto w-6"></div>
                              <div className="h-2 bg-white/10 rounded w-full"></div>
                            </div>
                            <div className="text-center">
                              <div className="h-6 bg-white/15 rounded mb-1 mx-auto w-10"></div>
                              <div className="h-2 bg-white/10 rounded w-full"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* History skeleton */}
                        <div className="space-y-2">
                          <div className="h-3 bg-white/10 rounded w-24 mb-3"></div>
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                              <div className="h-3 bg-white/10 rounded w-24"></div>
                              <div className="h-5 bg-white/10 rounded w-16"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {muestraHistorial && !cargandoHistorial && datosClienteReal && (
                      <div 
                        className="transition-all duration-500 ease-out"
                        style={{
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <HistorialCliente
                          cliente={datosClienteReal}
                          estadisticas={estadisticasCliente}
                          historial={historialCliente}
                          cargando={cargandoHistorial}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
function SeccionGeneral({ canchaSlug, canchaDetalle, loadingDetalle, fechaSeleccionada, onFechaCambio, complejoId, onRecargarDatos }) {
  const [horaExpandida, setHoraExpandida] = useState(null);
  const { isRainModeActive, isReservaAfectada, descripcionActiva } = useRainMode();
  const { isLight } = useAccessibility();
  const { isCanchaBloqueada, obtenerExpiracion } = useCourtBlock();
  const canchaBloqueada = isCanchaBloqueada(canchaSlug);

  // Construir agenda desde datos de la API (memorizado)
  const agendaBase = useMemo(() => {
    if (!canchaDetalle?.horarios?.length) return [];
    return buildAgendaFromAPI(
      canchaDetalle.horarios,
      canchaDetalle.reservas ?? [],
      canchaDetalle.cancha
    );
  }, [canchaDetalle]);

  // Estado local para actualizaciones optimistas (reservas manuales)
  const [agendaLocal, setAgendaLocal] = useState(agendaBase);

  // Sincronizar cuando lleguen datos frescos de la API
  useEffect(() => {
    setAgendaLocal(agendaBase);
    setHoraExpandida(null);
  }, [agendaBase]);

  useEffect(() => {
    if (canchaBloqueada) setHoraExpandida(null);
  }, [canchaBloqueada]);

  const expandirFila = useCallback((hora) => setHoraExpandida(hora), []);
  const colapsarFila = useCallback(() => setHoraExpandida(null), []);

  const agendarReserva = useCallback(
    (datos) => {
      const tipoDeporte = canchaDetalle?.cancha?.tipo_deporte ?? null;
      setAgendaLocal((prev) =>
        prev.map((slot) =>
          slot.hora === datos.hora && slot.tipo === 'disponible'
            ? {
                id: `slot-manual-${datos.hora.replace(/\s/g, '')}-${Date.now()}`,
                hora: datos.hora,
                tipo: 'ocupada',
                nombre: datos.nombre,
                deporte: obtenerEtiquetaDeporte(tipoDeporte),
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
      
      // Recargar datos desde el servidor después de crear la reserva
      if (onRecargarDatos) {
        setTimeout(() => {
          onRecargarDatos();
        }, 500);
      }
    },
    [canchaDetalle, onRecargarDatos]
  );

  // Métricas: usar datos del backend o calcular desde la agenda local como fallback
  const ocupacion = canchaDetalle?.summary?.ocupacion_porcentaje ?? null;
  const horasDisp = canchaDetalle?.summary?.horas_disponibles
    ?? agendaLocal.filter((s) => s.tipo === 'disponible').length;
  const ingresos = canchaDetalle?.summary?.ingresos_estimados_cop ?? 0;

  const fechaDisplay = fechaSeleccionada
    ? formatearFechaDisplay(fechaSeleccionada)
    : obtenerFechaCali();

  const esHoy = fechaSeleccionada === fechaHoyBogota();

  // ���� Skeleton mientras carga ����
  if (loadingDetalle && !canchaDetalle) {
    return (
      <>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-xl p-4 animate-pulse ${
                isLight ? 'bg-slate-100' : 'bg-[#161618]'
              }`}
            >
              <div className={`h-3 w-20 rounded mb-3 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
              <div className={`h-6 w-16 rounded ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
            </div>
          ))}
        </div>
        <div className={`rounded-xl p-4 ${isLight ? 'bg-white border border-slate-100' : ''}`}>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-10 rounded-lg animate-pulse ${
                  isLight ? 'bg-slate-100' : 'bg-white/[0.04]'
                }`}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ���� Métricas ���� */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <TarjetaMetrica
          titulo={esHoy ? 'Ocupación Hoy' : 'Ocupación del Día'}
          valor={ocupacion !== null ? `${ocupacion}%` : '�'}
          progreso={ocupacion ?? undefined}
          tormentaActiva={isRainModeActive}
          isLight={isLight}
        />
        <TarjetaMetrica
          titulo="Horas Disponibles"
          valor={`${horasDisp} hora${horasDisp !== 1 ? 's' : ''}`}
          tormentaActiva={isRainModeActive}
          isLight={isLight}
        />
        <TarjetaMetrica
          titulo="Ingresos Estimados"
          valor={
            ingresos > 0
              ? `$${ingresos.toLocaleString('es-CO')} COP`
              : '$0 COP'
          }
          tormentaActiva={isRainModeActive}
          isLight={isLight}
        />
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
        {/* ���� Cabecera agenda + navegador de fecha ���� */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3
            className={`text-sm font-medium shrink-0 transition-colors duration-300 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Agenda del Día
          </h3>

          {/* Navegador de fecha */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onFechaCambio(navegarDia(fechaSeleccionada, -1))}
              className={`p-1 rounded transition-colors ${
                isLight
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-label="Día anterior"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span
              className={`text-xs capitalize select-none transition-colors duration-300 ${
                esHoy
                  ? isLight ? 'text-emerald-600 font-medium' : 'text-[#00FF66] font-medium'
                  : isLight ? 'text-slate-500' : 'text-zinc-500'
              }`}
            >
              {esHoy ? 'Hoy · ' : ''}{fechaDisplay}
            </span>

            <button
              type="button"
              onClick={() => onFechaCambio(navegarDia(fechaSeleccionada, 1))}
              className={`p-1 rounded transition-colors ${
                isLight
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
              }`}
              aria-label="Día siguiente"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {!esHoy && (
              <button
                type="button"
                onClick={() => onFechaCambio(fechaHoyBogota())}
                className={`ml-1 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  isLight
                    ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                    : 'border-[#00FF66]/30 text-[#00FF66] hover:bg-[#00FF66]/10'
                }`}
              >
                Hoy
              </button>
            )}

            {loadingDetalle && (
              <span className={`ml-1 text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
                � �
              </span>
            )}
          </div>
        </div>

        {isRainModeActive && (
          <div className="mb-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-cyan-400/20 bg-cyan-500/[0.06] shadow-[0_0_18px_rgba(56,189,248,0.1)]">
            <span className="text-sm">�xR�️</span>
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
            <span className="text-sm">�x</span>
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

        {/* Sin horario configurado */}
        {!loadingDetalle && agendaLocal.length === 0 && (
          <div className={`py-10 text-center ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
            <p className="text-sm mb-1">Sin horario configurado para este día</p>
            <p className="text-xs">El complejo no tiene horario registrado para la fecha seleccionada.</p>
          </div>
        )}

        <div className="space-y-2">
          {agendaLocal.map((slot) =>
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
                fechaSeleccionada={fechaSeleccionada}
                isLight={isLight}
                complejoId={complejoId}
              />
            )
          )}
        </div>
      </div>
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
  const { state, dispatch } = useAppContext();

  // Detalle de cancha cargado desde la API
  const [canchaDetalle, setCanchaDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Fecha seleccionada para el filtro (YYYY-MM-DD, por defecto hoy en Bogotá)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaHoyBogota);

  const [nombreCancha, setNombreCancha] = useState(() =>
    obtenerNombreCancha(canchaSlug, state.canchas)
  );
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemporal, setNombreTemporal] = useState('');
  const [esFavorito, setEsFavorito] = useState(false);
  const [idConfiguracionFavorita, setIdConfiguracionFavorita] = useState(null);
  const [guardandoFavorito, setGuardandoFavorito] = useState(false);
  const [canchaActiva, setCanchaActiva] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuHaciaArriba, setMenuHaciaArriba] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const pestanaActiva = obtenerPestanaDesdeRuta(location.pathname, canchaSlug);

  // Mantener pestañas visitadas montadas para evitar recargas al cambiar de tab
  const [pestanasMontadas, setPestanasMontadas] = useState(
    () => new Set([pestanaActiva])
  );

  useEffect(() => {
    setPestanasMontadas((prev) => {
      if (prev.has(pestanaActiva)) return prev;
      return new Set([...prev, pestanaActiva]);
    });
  }, [pestanaActiva]);

  // complejoId estable como primitivo (número)
  const complejoId = state.user?.complejos?.[0]?.id ?? null;

  // Al cambiar de cancha: resetear panel y volver a hoy (sin depender de state.canchas)
  useEffect(() => {
    setNombreCancha(obtenerNombreCancha(canchaSlug, state.canchas));
    setEditandoNombre(false);
    setPanelAbierto(false);
    setCanchaDetalle(null);
    setFechaSeleccionada(fechaHoyBogota());
    setPestanasMontadas(new Set([pestanaActiva]));
    
    // Verificar si esta cancha tiene configuración favorita en el backend
    const verificarFavorito = async () => {
      const canchaId = extraerCanchaId(canchaSlug);
      if (!canchaId || Number.isNaN(canchaId)) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(
          `/api/precios/favoritos/cancha/${canchaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const favorito = response.data?.data;
        if (response.data.success && favorito && Number(favorito.cancha_id) === canchaId) {
          setEsFavorito(true);
          setIdConfiguracionFavorita(favorito.id);
        } else {
          setEsFavorito(false);
          setIdConfiguracionFavorita(null);
        }
      } catch (error) {
        console.error('Error al verificar favorito:', error);
        setEsFavorito(false);
        setIdConfiguracionFavorita(null);
      }
    };
    
    verificarFavorito();
  }, [canchaSlug]);

  // Actualizar nombre cuando el listado global de canchas termine de cargar
  useEffect(() => {
    if (state.canchas.length === 0) return;
    setNombreCancha(obtenerNombreCancha(canchaSlug, state.canchas));
  }, [canchaSlug, state.canchas]);

  // Mismo patrón que principalDashboard: useCallback + axiosInstance + localStorage
  const cargarDetalleCancha = useCallback(async () => {
    if (!canchaSlug || !complejoId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setLoadingDetalle(true);
    try {
      const response = await axiosInstance.get(
        `/api/dashboard/${complejoId}/${canchaSlug}`,
        {
          params: { fecha: fechaSeleccionada },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCanchaDetalle(response.data);
        if (response.data.cancha?.nombre) {
          setNombreCancha(response.data.cancha.nombre);
        }
        if (response.data.cancha?.state) {
          setCanchaActiva(
            ['DISPONIBLE', 'OCUPADA'].includes(response.data.cancha.state)
          );
        }
      }
    } catch (err) {
      console.error('[CentroControl] Error cargando detalle cancha:', err);
    } finally {
      setLoadingDetalle(false);
    }
  }, [canchaSlug, complejoId, fechaSeleccionada]);

  // Dispara la carga cada vez que cambia la función (cancha, complejo o fecha)
  useEffect(() => {
    cargarDetalleCancha();
  }, [cargarDetalleCancha]);

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

  const handleEditarPrecios = () => {
    cerrarMenu();
    navegarPestana('Precios');
  };

  const handleVerActividad = () => {
    cerrarMenu();
    navegarPestana('Actividad');
  };

  const handlePausarMantenimiento = async () => {
    cerrarMenu();
    try {
      const canchaId = extraerCanchaId(canchaSlug);
      const token = localStorage.getItem('token');
      const nuevoEstado = canchaActiva ? 'MANTENIMIENTO' : 'DISPONIBLE';
      
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCanchaActiva(!canchaActiva);
        // Actualizar el estado global
        dispatch(updateCanchaEstado(canchaId, nuevoEstado));
        console.log(`Cancha cambiada a estado: ${nuevoEstado}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado de cancha:', error);
    }
  };

  const handleEliminarCancha = async () => {
    cerrarMenu();
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta cancha? Esta acción no se puede deshacer.');
    
    if (!confirmar) return;

    try {
      const canchaId = extraerCanchaId(canchaSlug);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/estado`,
        { estado: 'ELIMINADA' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Actualizar el estado global
        dispatch(updateCanchaEstado(canchaId, 'ELIMINADA'));
        console.log('Cancha eliminada (soft delete)');
        // Navegar al listado de canchas o al dashboard
        navigate('/canchas');
      }
    } catch (error) {
      console.error('Error al eliminar cancha:', error);
    }
  };

  const handleGuardarEnFavoritos = async () => {
    if (guardandoFavorito) return;
    
    setGuardandoFavorito(true);
    cerrarMenu();
    
    try {
      const canchaId = extraerCanchaId(canchaSlug);
      const token = localStorage.getItem('token');
      
      if (esFavorito && idConfiguracionFavorita) {
        // Eliminar de favoritos
        const response = await axiosInstance.delete(
          `/api/precios/favoritos/${idConfiguracionFavorita}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setEsFavorito(false);
          setIdConfiguracionFavorita(null);
          console.log('Configuración eliminada de favoritos');
        }
      } else {
        // Obtener la configuración actual de precios de la cancha
        const preciosResponse = await axiosInstance.get(
          `/api/canchas/${canchaId}/precios`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!preciosResponse.data.success || !preciosResponse.data.data.bloques) {
          alert('No hay configuración de precios para guardar en favoritos');
          setGuardandoFavorito(false);
          return;
        }
        
        const bloques = preciosResponse.data.data.bloques;
        
        // Obtener el nombre de la cancha
        const nombreCancha = canchaDetalle?.nombre || `Cancha ${canchaId}`;
        
        // Crear configuración favorita
        const response = await axiosInstance.post(
          '/api/precios/favoritos',
          {
            complejo_id: complejoId,
            cancha_id: canchaId,
            nombre_plantilla: `Config. ${nombreCancha}`,
            configuracion: { bloques }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setEsFavorito(true);
          setIdConfiguracionFavorita(response.data.data.id);
          console.log('Configuración guardada en favoritos');
        }
      }
    } catch (error) {
      console.error('Error al manejar favoritos:', error);
      alert('Error al guardar/eliminar de favoritos. Por favor, intenta nuevamente.');
    } finally {
      setGuardandoFavorito(false);
    }
  };

  const handleClonarCancha = async () => {
    cerrarMenu();

    try {
      const canchaId = extraerCanchaId(canchaSlug);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        `/api/courts/${canchaId}/clonar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        console.log('Cancha clonada exitosamente:', response.data.data);
        
        // Recargar la lista de canchas del complejo sin refrescar la página
        if (complejoId) {
          const canchasResponse = await axiosInstance.get(`/api/courts/complex/${complejoId}`);
          if (canchasResponse.data.success) {
            // Actualizar el estado global con la nueva lista de canchas
            dispatch({ type: 'SET_CANCHAS', payload: canchasResponse.data.data });
          }
        }
      }
    } catch (error) {
      console.error('Error al clonar cancha:', error);
    }
  };

  const iniciarEdicion = () => {
    setNombreTemporal(nombreCancha);
    setEditandoNombre(true);
  };

  const handleCambiarEstadoCancha = async (nuevoEstado) => {
    try {
      const canchaId = extraerCanchaId(canchaSlug);
      const token = localStorage.getItem('token');
      const estadoAPI = nuevoEstado ? 'DISPONIBLE' : 'NO DISPONIBLE';
      
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/estado`,
        { estado: estadoAPI },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCanchaActiva(nuevoEstado);
        // Actualizar el estado global para que se refleje en todos los componentes
        dispatch(updateCanchaEstado(canchaId, estadoAPI));
        console.log(`Cancha cambiada a estado: ${estadoAPI}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado de cancha:', error);
    }
  };

  const guardarNombre = async () => {
    const nombreFinal = nombreTemporal.trim() || nombreCancha;
    
    // Actualizar estado local inmediatamente para mejor UX
    setNombreCancha(nombreFinal);
    setEditandoNombre(false);

    // Llamar a la API para actualizar en el backend
    try {
      const canchaId = extraerCanchaId(canchaSlug);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.patch(
        `/api/courts/${canchaId}/nombre`,
        { nombre: nombreFinal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Actualizar el contexto global para reflejar el cambio en toda la app
        dispatch(updateCanchaNombre(canchaId, nombreFinal));
        console.log('Nombre de cancha actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error al actualizar nombre de cancha:', error);
      // Revertir el cambio local si falla
      const canchaOriginal = state.canchas?.find(c => `cancha-${c.id}` === canchaSlug);
      if (canchaOriginal) {
        setNombreCancha(canchaOriginal.nombre);
      }
    }
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
            onClick={handleGuardarEnFavoritos}
            disabled={guardandoFavorito}
            className={`shrink-0 p-1 rounded transition-colors duration-300 ${
              guardandoFavorito 
                ? 'opacity-50 cursor-not-allowed' 
                : isLight
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
                  onClick={() => {
                    cerrarMenu();
                    iniciarEdicion();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Editar nombre
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEditarPrecios}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Editar horarios y precios
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleGuardarEnFavoritos}
                  disabled={guardandoFavorito}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${
                    guardandoFavorito
                      ? 'opacity-50 cursor-not-allowed text-zinc-500'
                      : esFavorito
                        ? 'text-[#00FF66] hover:bg-white/5 hover:text-emerald-400'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Star 
                    size={12} 
                    strokeWidth={1.5}
                    className={esFavorito ? 'fill-[#00FF66]' : ''}
                  />
                  {esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleVerActividad}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Análisis y estadísticas
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleClonarCancha}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Copiar / Clonar cancha
                </button>
                <div className="my-1 mx-2 border-t border-white/10" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handlePausarMantenimiento}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {canchaActiva ? 'Pausar por mantenimiento' : 'Activar cancha'}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleEliminarCancha}
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
            onChange={handleCambiarEstadoCancha}
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
          {pestanasMontadas.has('General') && (
            <div hidden={pestanaActiva !== 'General'}>
              <SeccionGeneral
                canchaSlug={canchaSlug}
                canchaDetalle={canchaDetalle}
                loadingDetalle={loadingDetalle}
                fechaSeleccionada={fechaSeleccionada}
                onFechaCambio={setFechaSeleccionada}
                complejoId={complejoId}
                onRecargarDatos={cargarDetalleCancha}
              />
            </div>
          )}
          {pestanasMontadas.has('Reservas') && (
            <div hidden={pestanaActiva !== 'Reservas'}>
              <SeccionReservas
                canchaSlug={canchaSlug}
                complejoId={complejoId}
                reservasSemana={canchaDetalle?.reservas_semana ?? null}
                loadingDetalle={loadingDetalle}
              />
            </div>
          )}
          {pestanasMontadas.has('Precios') && (
            <div hidden={pestanaActiva !== 'Precios'}>
              <SeccionPrecios nombreCancha={nombreCancha} />
            </div>
          )}
          {pestanasMontadas.has('Actividad') && (
            <div hidden={pestanaActiva !== 'Actividad'}>
              <SeccionActividad nombreCancha={nombreCancha} />
            </div>
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

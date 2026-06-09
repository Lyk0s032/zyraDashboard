export const TARIFAS_DEMO = {
  'maracana-f5': 120000,
  'centenario-f7': 160000,
  'bombonera-f11': 280000,
  'pista-norte': 200000,
  'pista-norteSur': 180000,
  'pista-norteEste': 180000,
};

export function formatearCOP(monto) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto);
}

export function obtenerTarifaCancha(canchaId) {
  return TARIFAS_DEMO[canchaId] ?? 120000;
}

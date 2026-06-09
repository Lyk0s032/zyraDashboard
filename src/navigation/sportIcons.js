import { Grid, Target, CircleDot, Grid2x2 } from 'lucide-react';

export const ICON_PROPS = {
  size: 14,
  strokeWidth: 1.5,
};

export const SPORT_ICON_MAP = {
  'FÚTBOL': Grid,
  'PÁDEL': Target,
  'TENIS': CircleDot,
  'VOLEYBAL': Grid2x2,
};

export const SPORT_BORDER_COLORS = {
  'FÚTBOL': '#71717a',
  'PÁDEL': '#60a5fa',
  'TENIS': '#fbbf24',
  'VOLEYBAL': '#fb923c',
};

export const ZYRA_NEON = '#00FF66';

export function getSportIcon(deporte) {
  return SPORT_ICON_MAP[deporte] ?? Grid;
}

export function getSportBorderColor(deporte) {
  return SPORT_BORDER_COLORS[deporte] ?? '#71717a';
}

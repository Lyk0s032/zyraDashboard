import { ZYRA_NEON } from './sportIcons';

function CourtStatusIcon({ active, sportColor, hovered }) {
  const stroke = active ? ZYRA_NEON : hovered ? '#ffffff' : sportColor;

  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 transition-colors duration-150"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="4.5"
        width="11"
        height="7"
        rx="2"
        stroke={stroke}
        strokeWidth={1.5}
        fill={active ? `${ZYRA_NEON}20` : 'none'}
      />
    </svg>
  );
}

export default CourtStatusIcon;

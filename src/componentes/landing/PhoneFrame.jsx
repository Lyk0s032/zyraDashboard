/**
 * Marco de teléfono. Si existe `imageSrc` (PNG/WebP en /public/landing/),
 * lo usa; si no, renderiza el mockup hijo.
 */
export function PhoneFrame({
  children,
  className = '',
  glow = 'rgba(0,255,102,0.18)',
  imageSrc,
  imageAlt = 'Captura de Zyra',
}) {
  return (
    <div
      className={`relative mx-auto w-[min(100%,280px)] sm:w-[300px] ${className}`}
      style={{ filter: `drop-shadow(0 28px 60px ${glow})` }}
    >
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/15 bg-[#0a0a0a] p-[10px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="absolute left-1/2 top-[12px] z-20 h-[22px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
        <div className="relative aspect-[9/19.2] overflow-hidden rounded-[1.7rem] bg-[#050505]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

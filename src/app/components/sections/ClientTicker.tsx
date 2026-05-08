// Vite's BASE_URL is "/" in dev, "/Puron/" on the GitHub Pages build.
const ASSET_BASE = import.meta.env.BASE_URL;

// Each entry expects a real logo PNG/SVG at public/partners/<filename>.
// Logos render on a white card so light- and dark-on-light marks stay
// readable against the dark page background (some of the source logos
// — Eddys, Akdemir — have white backgrounds; without the white card
// they'd vanish into the page).
const partners = [
  { name: "KFZ-Gutachter Akdemir", logo: `${ASSET_BASE}partners/kfz-akdemir.png` },
  { name: "Sauerland Terrassen", logo: `${ASSET_BASE}partners/sauerland-terrassen.png` },
  { name: "AutoWelt Sauerland", logo: `${ASSET_BASE}partners/autowelt-sauerland.png` },
  { name: "Eddys Kfz-Meisterbetrieb", logo: `${ASSET_BASE}partners/eddys.png` },
];

const marqueeKeyframes = `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;

function ClientBlock({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex items-center justify-around w-max gap-10 sm:gap-14 md:gap-20 px-6 sm:px-10 flex-shrink-0"
      aria-hidden={ariaHidden || undefined}
    >
      {partners.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-center bg-white/95 rounded-xl px-4 py-2 h-12 sm:h-14 md:h-16 shrink-0 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
        >
          <img
            src={p.logo}
            alt={p.name}
            className="h-full w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

export function ClientTicker() {
  return (
    <section className="py-12 border-t border-white/5 bg-[#0A0A0D]/50 relative z-20 overflow-hidden backdrop-blur-[2px]">
      <style>{marqueeKeyframes}</style>
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#B3B3C2] font-medium">Partner, die uns vertrauen</p>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className="flex w-max" style={{ animation: "marquee 28s linear infinite" }}>
          <ClientBlock />
          <ClientBlock ariaHidden />
        </div>
      </div>
    </section>
  );
}

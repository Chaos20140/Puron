// Vite's BASE_URL is "/" in dev, "/Puron/" on the GitHub Pages build.
const ASSET_BASE = import.meta.env.BASE_URL;

// Each entry expects a real logo PNG/SVG at public/partners/<filename>.
// Logos render directly on the dark page in their natural colors —
// no card frame, no grayscale, no opacity tint — so the brand colors
// stay vivid. Logos with white/light source backgrounds will show as
// such; export them with transparent backgrounds (e.g. via remove.bg)
// if they need to blend with the page.
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
          className="flex items-center justify-center h-10 sm:h-12 md:h-14 shrink-0 transition-transform duration-300 hover:scale-105"
        >
          <img
            src={p.logo}
            alt={p.name}
            className="h-full w-auto max-w-[140px] sm:max-w-[160px] md:max-w-[180px] object-contain"
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

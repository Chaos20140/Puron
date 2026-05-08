import { useEffect, useRef, useState } from "react";

// Vite's BASE_URL is "/" in dev, "/Puron/" on the GitHub Pages build.
const ASSET_BASE = import.meta.env.BASE_URL;

// Each entry expects a real logo PNG/SVG at public/partners/<filename>.
// Logos render directly on the dark page in their natural colors —
// no card frame, no grayscale, no opacity tint — so the brand colors
// stay vivid. Logos with white/light source backgrounds will show as
// such; export them with transparent backgrounds (e.g. via remove.bg)
// if they need to blend with the page.
// Per-logo overrides:
// - `scale`: visual size multiplier for logos that would otherwise look
//   small inside the fixed container (e.g. AutoWelt's 1:1 mark).
// - `whiten`: paint every visible pixel pure white via CSS filter
//   (brightness(0) crushes to black, invert(1) flips to white;
//   transparency is preserved). Use for dark-on-transparent logos
//   that would vanish on the dark page background.
const partners: { name: string; logo: string; scale?: number; whiten?: boolean }[] = [
  { name: "KFZ-Gutachter Akdemir", logo: `${ASSET_BASE}partners/kfz-akdemir.png`, whiten: true },
  { name: "Sauerland Terrassen", logo: `${ASSET_BASE}partners/sauerland-terrassen.png`, whiten: true },
  { name: "AutoWelt Sauerland", logo: `${ASSET_BASE}partners/autowelt-sauerland.png`, scale: 1.4 },
  { name: "Eddys Kfz-Meisterbetrieb", logo: `${ASSET_BASE}partners/eddys.png` },
];

// Continuous auto-flow. Native touch on mobile is the only thing that
// pauses (otherwise the user's swipe would fight the rAF tick).
const tickerStyles = `
.partner-ticker-wrap::-webkit-scrollbar { display: none; }
.partner-ticker-wrap { scrollbar-width: none; -ms-overflow-style: none; }
`;

const AUTO_FLOW_PX_PER_FRAME = 1.0; // ~60 px/s

export function ClientTicker() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [touchPaused, setTouchPaused] = useState(false);

  // rAF auto-flow with seamless wrap. The track is rendered twice;
  // when scrollLeft passes half the total width, we wrap by half so
  // the user keeps seeing identical content.
  useEffect(() => {
    if (touchPaused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const tick = () => {
      const el = wrapRef.current;
      if (el) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          let next = el.scrollLeft + AUTO_FLOW_PX_PER_FRAME;
          if (next >= half) next -= half;
          el.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [touchPaused]);

  const renderedPartners = [...partners, ...partners];

  return (
    <section className="py-12 border-t border-white/5 bg-[#0A0A0D]/50 relative z-20 overflow-hidden backdrop-blur-[2px]">
      <style>{tickerStyles}</style>
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#B3B3C2] font-medium">Partner, die uns vertrauen</p>
      </div>

      <div
        ref={wrapRef}
        className="partner-ticker-wrap relative w-full overflow-x-auto overflow-y-hidden touch-pan-x"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={() => setTouchPaused(true)}
        onTouchEnd={() => setTouchPaused(false)}
      >
        <div className="flex items-center w-max gap-10 sm:gap-14 md:gap-20 px-6 sm:px-10">
          {renderedPartners.map((p, i) => (
            <div
              key={i}
              aria-hidden={i >= partners.length || undefined}
              className="flex items-center justify-center w-32 h-14 sm:w-36 sm:h-16 md:w-44 md:h-20 shrink-0"
            >
              <img
                src={p.logo}
                alt={p.name}
                className="max-w-full max-h-full object-contain"
                style={{
                  ...(p.scale ? { transform: `scale(${p.scale})` } : {}),
                  ...(p.whiten ? { filter: "brightness(0) invert(1)" } : {}),
                }}
                // Eager + async — load all logos up front so the auto-flow
                // doesn't trigger lazy decode + layout shift mid-scroll.
                loading="eager"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

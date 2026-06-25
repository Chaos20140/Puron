import { useEffect, useRef, useState } from "react";

// Vite's BASE_URL ("/" on the puron-media.de apex domain; would be a
// subpath like "/Puron/" if ever built for a GitHub Pages project page).
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
  { name: "Autozentrum Bestwig", logo: `${ASSET_BASE}partners/autozentrum-bestwig.png` },
  { name: "Putzfee Sauerland", logo: `${ASSET_BASE}partners/putzfee-sauerland.png`, whiten: true },
];

// GPU-composited transform marquee (same approach as the reviews carousel):
// a translateX keyframe runs on the compositor thread, so it stays smooth and
// never fights scrolling — unlike the old per-frame scrollLeft writes, which
// ran on the main thread and stuttered. The track holds two identical copies;
// animating to translateX(-50%) loops seamlessly (trailing padding == the gap
// keeps the two halves symmetric).
const tickerStyles = `
.partner-ticker-wrap::-webkit-scrollbar { display: none; }
.partner-ticker-wrap { scrollbar-width: none; -ms-overflow-style: none; }
@keyframes partner-marquee {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
.partner-marquee-track {
  animation: partner-marquee var(--partner-marquee-duration, 40s) linear infinite;
}
/* will-change only while on-screen + animating (toggled via data-active). */
.partner-ticker-wrap[data-active="true"] .partner-marquee-track { will-change: transform; }
.partner-ticker-wrap:not([data-active="true"]) .partner-marquee-track { animation-play-state: paused; }
@media (hover: hover) {
  .partner-ticker-wrap:hover .partner-marquee-track { animation-play-state: paused; }
}
@media (prefers-reduced-motion: reduce) {
  .partner-marquee-track { animation: none; transform: none; }
}
`;

const MARQUEE_PX_PER_SEC = 60;

export function ClientTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Pause the marquee + release its will-change layer when the ticker is
  // off-screen, so a second always-animating compositor layer doesn't compete
  // with scroll while the user reads further down (mirrors Hero3DVisual).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Derive the duration from the rendered width so the speed stays constant
  // across breakpoints. translateX(-50%) travels exactly one copy.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;
    const setDuration = () => {
      const half = track.scrollWidth / 2;
      if (half > 0) track.style.setProperty("--partner-marquee-duration", `${half / MARQUEE_PX_PER_SEC}s`);
    };
    setDuration();
    const ro = new ResizeObserver(setDuration);
    ro.observe(track);
    return () => ro.disconnect();
  }, [reduced]);

  const renderedPartners = [...partners, ...partners];

  return (
    <section className="py-12 border-t border-white/5 bg-[#0A0A0D]/50 relative z-20 overflow-hidden md:backdrop-blur-[2px]">
      <style>{tickerStyles}</style>
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#B3B3C2] font-medium">Partner, die uns vertrauen</p>
      </div>

      <div
        ref={wrapRef}
        data-active={!reduced && inView ? "true" : undefined}
        className={`partner-ticker-wrap relative w-full ${reduced ? "overflow-x-auto" : "overflow-hidden"}`}
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Trailing pr-* equals the gap so the two copies stay symmetric and
            translateX(-50%) wraps seamlessly. Second copy is aria-hidden. */}
        <div
          ref={trackRef}
          className="partner-marquee-track flex items-center w-max gap-10 sm:gap-14 md:gap-20 pr-10 sm:pr-14 md:pr-20"
        >
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
                // Eager + high priority — logos are above-the-fold on most
                // phones, so we want them decoded before the user scrolls.
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

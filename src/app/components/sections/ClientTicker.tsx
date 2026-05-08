import { useCallback, useEffect, useRef, useState } from "react";

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
// - `framed`: render the logo on a white card. Needed when the logo's
//   own elements are dark and would vanish against the dark page —
//   KFZ-Akdemir is dark text on a transparent background.
const partners: { name: string; logo: string; scale?: number; framed?: boolean }[] = [
  { name: "KFZ-Gutachter Akdemir", logo: `${ASSET_BASE}partners/kfz-akdemir.png`, framed: true },
  { name: "Sauerland Terrassen", logo: `${ASSET_BASE}partners/sauerland-terrassen.png` },
  { name: "AutoWelt Sauerland", logo: `${ASSET_BASE}partners/autowelt-sauerland.png`, scale: 1.4 },
  { name: "Eddys Kfz-Meisterbetrieb", logo: `${ASSET_BASE}partners/eddys.png` },
];

// Same architecture as the SocialProof carousel:
// rAF-driven auto-flow, hover/touch pause, arrow nav (md+) with a
// 5-second resume timer. The partner list is rendered twice so the
// rAF loop can wrap by jumping back half the scrollWidth — looks
// seamless because the two halves are visually identical.
const tickerStyles = `
.partner-ticker-wrap::-webkit-scrollbar { display: none; }
.partner-ticker-wrap { scrollbar-width: none; -ms-overflow-style: none; }
`;

const AUTO_FLOW_PX_PER_FRAME = 0.6; // ~36 px/s — matches the review carousel
const ARROW_RESUME_MS = 5000;

export function ClientTicker() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<number | null>(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const advance = useCallback(
    (dir: 1 | -1) => {
      const el = wrapRef.current;
      if (!el) return;
      const trackEl = el.firstElementChild as HTMLElement | null;
      const firstLogo = trackEl?.firstElementChild as HTMLElement | null;
      // Move two logo widths per click — feels right for a row of small
      // brand marks (one logo at a time would feel sluggish).
      const step = firstLogo ? (firstLogo.offsetWidth + 32) * 2 : 360;
      el.scrollBy({ left: step * dir, behavior: "smooth" });

      setPaused(true);
      clearResumeTimer();
      resumeTimerRef.current = window.setTimeout(() => {
        setPaused(false);
        resumeTimerRef.current = null;
      }, ARROW_RESUME_MS);
    },
    [clearResumeTimer],
  );

  // rAF auto-flow with seamless wrap. The track is rendered twice;
  // when scrollLeft passes half the total width, we instantly subtract
  // that half so the user keeps seeing identical content.
  useEffect(() => {
    if (paused) return;
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
  }, [paused]);

  useEffect(() => clearResumeTimer, [clearResumeTimer]);

  // Render the partner list twice for the seamless wrap-around.
  const renderedPartners = [...partners, ...partners];

  return (
    <section className="py-12 border-t border-white/5 bg-[#0A0A0D]/50 relative z-20 overflow-hidden backdrop-blur-[2px]">
      <style>{tickerStyles}</style>
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#B3B3C2] font-medium">Partner, die uns vertrauen</p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          clearResumeTimer();
          setPaused(false);
        }}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => {
          clearResumeTimer();
          setPaused(false);
        }}
      >
        {/* Left arrow — md+ only; touch users swipe */}
        <button
          type="button"
          onClick={() => advance(-1)}
          aria-label="Vorherige Partner"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0D]/85 backdrop-blur border border-white/15 text-white shadow-xl hover:bg-[#7C3AED]/40 hover:border-[#7C3AED]/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div
          ref={wrapRef}
          className="partner-ticker-wrap relative w-full overflow-x-auto overflow-y-hidden touch-pan-x"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex items-center w-max gap-10 sm:gap-14 md:gap-20 px-6 sm:px-10">
            {renderedPartners.map((p, i) => (
              <div
                key={i}
                aria-hidden={i >= partners.length || undefined}
                className={
                  "flex items-center justify-center w-32 h-14 sm:w-36 sm:h-16 md:w-44 md:h-20 shrink-0 transition-transform duration-300 hover:scale-105"
                  + (p.framed ? " bg-white rounded-lg p-2 shadow-md" : "")
                }
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  className="max-w-full max-h-full object-contain"
                  style={p.scale ? { transform: `scale(${p.scale})` } : undefined}
                  // Eager + async — load all logos up front so the auto-flow
                  // doesn't trigger lazy decode + layout shift mid-scroll.
                  loading="eager"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow — md+ only */}
        <button
          type="button"
          onClick={() => advance(1)}
          aria-label="Nächste Partner"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0D]/85 backdrop-blur border border-white/15 text-white shadow-xl hover:bg-[#7C3AED]/40 hover:border-[#7C3AED]/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

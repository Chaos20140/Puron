import { useEffect, useRef, useState } from "react";
import { PARTNER_LOGO_METRICS } from "./partnerLogoMetrics.generated";

// Vite's BASE_URL ("/" on the puron-media.de apex domain; would be a
// subpath like "/Puron/" if ever built for a GitHub Pages project page).
const ASSET_BASE = import.meta.env.BASE_URL;

// Every logo is a flat WHITE silhouette on transparency, so the differing brand
// colours don't clash on the dark page. The colour work happens at build time:
// scripts/optimize-images.mjs (`pnpm images`) turns the PNG in
// public/partners/ into a white, ink-cropped WebP and measures it into
// partnerLogoMetrics.generated.ts. To add a partner: drop a transparent PNG in
// public/partners/, run `pnpm images`, add a line below.
const partners: { name: string; file: string }[] = [
  { name: "KFZ-Gutachter Cem Akdemir", file: "kfz-akdemir.webp" },
  { name: "Sauerland Terrassen", file: "sauerland-terrassen.webp" },
  { name: "AutoWelt Sauerland", file: "autowelt-sauerland.webp" },
  { name: "Eddys Kfz-Meisterbetrieb", file: "eddys.webp" },
  { name: "Autozentrum Bestwig", file: "autozentrum-bestwig.webp" },
  { name: "Putzfee Sauerland", file: "putzfee-sauerland.webp" },
  { name: "Leitungsverlegung Özdemir", file: "leitungsverlegung-oezdemir.webp" },
  { name: "Partnerlogo: Buchstabe B mit Phönix", file: "phoenix-b.webp" },
];

// Optical size normalisation. Putting every logo in the same fixed box (the old
// approach) made a wide wordmark read tiny and a compact mark read huge, and a
// padded source file shrank for no visible reason. Instead each logo gets a
// height in "logo units" chosen so that painted AREA is about equal:
//  - height ∝ ratio^-0.4: a softened version of ratio^-½ (which would give
//    every bounding box exactly the same area). Pure area-equality makes long
//    wordmarks read too small next to compact marks — 0.4 is the usual
//    compromise for logo walls;
//  - × (typical ink density / this logo's density)^0.3 enlarges thin line art
//    (Autozentrum, Putzfee) a little, because a sparse mark reads lighter than
//    a solid one of the same box size;
//  - clamps keep extreme shapes (a tall monogram, a very long wordmark) from
//    dominating the strip.
const TYPICAL_INK_DENSITY = 0.29;
function logoHeightUnits(file: string): { units: number; width: number; height: number } {
  const m = PARTNER_LOGO_METRICS[file] as (typeof PARTNER_LOGO_METRICS)[string] | undefined;
  // A logo added to the list without re-running `pnpm images` must not take
  // the home page down with it — render it at a neutral size instead.
  if (!m) return { units: 1, width: 3, height: 1 };
  const ratio = m.width / m.height;
  let units = ratio ** -0.4 * (TYPICAL_INK_DENSITY / m.density) ** 0.3;
  units = Math.min(1.2, Math.max(0.55, units));
  if (units * ratio > 2.4) units = 2.4 / ratio;
  return { units, width: m.width, height: m.height };
}
const sized = partners.map((p) => ({ ...p, ...logoHeightUnits(p.file) }));

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

  // How many times the partner list is repeated PER HALF of the track. The
  // track always renders 2 halves and animates to translateX(-50%), i.e. it
  // scrolls exactly one half per cycle. That only looks seamless while one half
  // is at least as wide as the visible window — otherwise the window runs past
  // the end of the track near the end of the cycle and the logos "disappear"
  // into an empty strip. With six logos one half is ~1536px, so every viewport
  // wider than that (any normal desktop) hit it. Repeat until it covers.
  const [halfRepeat, setHalfRepeat] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || reduced) return;
    const measure = () => {
      const copyWidth = track.scrollWidth / (2 * halfRepeat);
      if (copyWidth <= 0) return;
      const needed = Math.max(1, Math.ceil(wrap.clientWidth / copyWidth));
      if (needed !== halfRepeat) setHalfRepeat(needed);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [reduced, halfRepeat]);

  // Derive the duration from the rendered width so the speed stays constant
  // across breakpoints AND across halfRepeat values. translateX(-50%) travels
  // exactly one half, so the duration has to scale with the half width.
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
  }, [reduced, halfRepeat]);

  const renderedPartners = Array.from({ length: 2 * halfRepeat }, () => sized).flat();

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
        {/* --logo-unit is the height of a "typical" logo per breakpoint; each
            logo multiplies it by its own factor. The tallest logo sets the
            strip height, the rest centre on it. Equal gaps between the actual
            logos (not between fixed boxes) is what makes the row read evenly. */}
        <div
          ref={trackRef}
          className="partner-marquee-track flex items-center w-max gap-10 sm:gap-14 md:gap-16 pr-10 sm:pr-14 md:pr-16 [--logo-unit:2.5rem] sm:[--logo-unit:2.875rem] md:[--logo-unit:3.5rem] lg:[--logo-unit:3.875rem]"
        >
          {renderedPartners.map((p, i) => (
            <img
              key={i}
              src={`${ASSET_BASE}partners/${p.file}`}
              alt={i >= partners.length ? "" : p.name}
              aria-hidden={i >= partners.length || undefined}
              // Intrinsic size = aspect-ratio hint, so nothing shifts while the
              // images load; the rendered height comes from the style below.
              width={p.width}
              height={p.height}
              style={{ height: `calc(var(--logo-unit) * ${p.units.toFixed(3)})` }}
              className="w-auto max-w-none shrink-0 select-none"
              draggable={false}
              // Eager, but deliberately NOT fetchPriority="high": the strip
              // sits just inside the fold on a tall phone and must not compete
              // with the hero (the LCP element) for bandwidth.
              loading="eager"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

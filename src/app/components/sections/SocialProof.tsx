import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGoogleReviews } from "../useGoogleReviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

// Reviews carousel:
// - Native horizontal scroll (overflow-x-auto + scroll-snap) so the
//   same DOM works for desktop arrows + mobile swipe with no special
//   touch handling.
// - Auto-advance every 6 seconds. Pauses on hover (desktop) or while
//   the user is touching (mobile). Wraps at the ends so it loops.
// - Arrow buttons (md+) trigger the same advance(); they're hidden on
//   mobile because swipe is the natural UX there.
// - prefers-reduced-motion stops the auto-advance entirely.
const carouselStyles = `
.review-carousel-wrap::-webkit-scrollbar { display: none; }
.review-carousel-wrap { scrollbar-width: none; -ms-overflow-style: none; }
`;

const AUTO_ADVANCE_MS = 6000;

export function SocialProof() {
  const { data: reviewsData, error: reviewsError, loading: reviewsLoading } = useGoogleReviews();
  const realReviews = reviewsData?.reviews ?? [];
  const aggregateRating = reviewsData?.rating ?? null;
  const aggregateCount = reviewsData?.userRatingCount ?? null;
  const googleMapsUri = reviewsData?.googleMapsUri ?? null;

  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const advance = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 24 : 320;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (dir === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (dir === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step * dir, behavior: "smooth" });
    }
  }, []);

  // Auto-advance loop — paused on hover, on touch, and when
  // prefers-reduced-motion is set.
  useEffect(() => {
    if (paused || realReviews.length === 0) return;
    if (typeof window !== "undefined") {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;
    }
    const id = window.setInterval(() => advance(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, advance, realReviews.length]);

  const showCarousel = !reviewsLoading && realReviews.length > 0;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A0A0D]/50 to-[#111116]/80 backdrop-blur-sm border-t border-white/5" style={{ isolation: "isolate" }}>
      <style>{carouselStyles}</style>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-xs uppercase text-[#B3B3C2] tracking-widest mb-2">Von ambitionierten Marken vertraut</p>
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-semibold tracking-tight">Echte Google-Rezensionen</h2>
          {aggregateRating != null && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#B3B3C2]">
              <span className="text-[#FBBC05] font-semibold">{aggregateRating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(aggregateRating) ? "#FBBC05" : "#3a3a44"}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              {aggregateCount != null && (
                <span>({aggregateCount} Bewertungen{googleMapsUri ? " · " : ""}
                  {googleMapsUri && (
                    <a href={googleMapsUri} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#A855F7]">
                      auf Google ansehen
                    </a>
                  )})
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Loading + empty states */}
        {reviewsLoading && (
          <div className="text-center text-[#B3B3C2] text-sm py-12">Rezensionen werden geladen…</div>
        )}
        {!reviewsLoading && realReviews.length === 0 && (
          <div className="text-center text-[#B3B3C2] text-sm max-w-md mx-auto py-12">
            {reviewsError
              ? "Die Google-Rezensionen können momentan nicht geladen werden. Bitte versuche es später erneut."
              : "Aktuell sind keine Google-Rezensionen verfügbar."}
          </div>
        )}

        {showCarousel && (
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {/* Left arrow — desktop only; touch users swipe */}
            <button
              type="button"
              onClick={() => advance(-1)}
              aria-label="Vorherige Rezension"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-[#0A0A0D]/80 backdrop-blur border border-white/10 text-white hover:bg-[#7C3AED]/30 hover:border-[#7C3AED]/40 hover:scale-110 transition-all duration-300 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div
              className="review-carousel-wrap relative w-full overflow-x-auto overflow-y-hidden touch-pan-x snap-x snap-mandatory py-12 md:py-16"
              style={{
                maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                scrollPaddingLeft: "1.5rem",
                scrollPaddingRight: "1.5rem",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div ref={trackRef} className="flex gap-6 md:gap-8 w-max px-6 md:px-12">
                {realReviews.map((r, i) => (
                  <div key={i} className="snap-center">
                    <GoogleReviewCard review={r} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right arrow — desktop only */}
            <button
              type="button"
              onClick={() => advance(1)}
              aria-label="Nächste Rezension"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-[#0A0A0D]/80 backdrop-blur border border-white/10 text-white hover:bg-[#7C3AED]/30 hover:border-[#7C3AED]/40 hover:scale-110 transition-all duration-300 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 md:mt-16"
        >
          <div className="text-center">
            <div className="text-xl font-medium text-white mb-1">Mehr Sichtbarkeit</div>
            <div className="text-sm text-[#B3B3C2]">Über alle Plattformen hinweg</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-xl font-medium text-white mb-1">Stärkere Präsenz</div>
            <div className="text-sm text-[#B3B3C2]">Professionelles Branding</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-xl font-medium text-white mb-1">Zielgerichteter Content</div>
            <div className="text-sm text-[#B3B3C2]">Datengestützte Strategien</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

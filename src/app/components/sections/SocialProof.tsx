import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGoogleReviews } from "../useGoogleReviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

// Reviews carousel:
// - Continuous right-to-left rAF flow at the same pace as the partner
//   ticker (~60 px/s).
// - Hover (desktop): pauses the flow so the user can read a card —
//   the GoogleReviewCard's own whileHover scales the focused card up.
// - Touch (mobile): native scroll. Touch pauses the flow so the
//   user's swipe doesn't fight the rAF tick.
// - prefers-reduced-motion stops the auto-flow entirely.
const carouselStyles = `
.review-carousel-wrap::-webkit-scrollbar { display: none; }
.review-carousel-wrap { scrollbar-width: none; -ms-overflow-style: none; }
`;

const AUTO_FLOW_PX_PER_FRAME = 1.0; // ~60 px/s — matches the partner ticker

export function SocialProof() {
  const { data: reviewsData, error: reviewsError, loading: reviewsLoading } = useGoogleReviews();
  const realReviews = reviewsData?.reviews ?? [];
  const aggregateRating = reviewsData?.rating ?? null;
  const aggregateCount = reviewsData?.userRatingCount ?? null;
  const googleMapsUri = reviewsData?.googleMapsUri ?? null;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // rAF auto-flow with seamless wrap. The reviews are rendered twice;
  // when scrollLeft passes half the total width, we wrap by half so
  // the user keeps seeing identical content with no visible jump.
  useEffect(() => {
    if (paused || realReviews.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
  }, [paused, realReviews.length]);

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
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-semibold tracking-tight">Echte Google-Rezensionen</h2>
          {aggregateRating != null && (() => {
            const stars = (
              <>
                <span className="text-[#FBBC05] font-semibold">{aggregateRating.toFixed(1)}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(aggregateRating) ? "#FBBC05" : "#3a3a44"}>
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                {aggregateCount != null && (
                  <span>({aggregateCount} Bewertungen{googleMapsUri ? " · auf Google ansehen" : ""})</span>
                )}
              </>
            );
            return googleMapsUri ? (
              <a
                href={googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-[#B3B3C2] hover:text-white transition-colors underline decoration-[#A855F7]/40 hover:decoration-[#A855F7] underline-offset-4"
              >
                {stars}
              </a>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#B3B3C2]">{stars}</div>
            );
          })()}
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
            ref={wrapRef}
            className="review-carousel-wrap relative w-full overflow-x-auto overflow-y-hidden touch-pan-x snap-x snap-mandatory md:snap-none py-12 md:py-16"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              scrollPaddingLeft: "1.5rem",
              scrollPaddingRight: "1.5rem",
              WebkitOverflowScrolling: "touch",
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <div className="flex gap-6 md:gap-8 w-max px-6 md:px-16">
              {/* Render the reviews twice for seamless looping — the
                  second set is aria-hidden so screen readers don't
                  announce duplicates. */}
              {[...realReviews, ...realReviews].map((r, i) => (
                <div
                  key={i}
                  aria-hidden={i >= realReviews.length || undefined}
                  className="snap-center"
                >
                  <GoogleReviewCard review={r} href={googleMapsUri} />
                </div>
              ))}
            </div>
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

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGoogleReviews } from "../useGoogleReviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

// Reviews carousel:
// - Idle behavior: a continuous right-to-left flow driven by rAF
//   (~35 px/sec) — same vibe as the old CSS marquee but in JS so we
//   can interleave it with manual nav.
// - Hover (desktop): the auto-flow pauses while the cursor is over
//   the carousel, so the user can read freely.
// - Arrow buttons (md+): pause the auto-flow, scroll one card, then
//   start a 5-second idle timer that resumes the flow if the user
//   doesn't keep interacting.
// - Touch/swipe (mobile): native scroll. While the user is touching,
//   auto-flow pauses; on touch end it resumes.
// - prefers-reduced-motion stops the auto-flow entirely.
const carouselStyles = `
.review-carousel-wrap::-webkit-scrollbar { display: none; }
.review-carousel-wrap { scrollbar-width: none; -ms-overflow-style: none; }
`;

// Matches the partner-ticker pace (CSS marquee 28s × ~1024px ≈ 36 px/s).
// Same vibe across both rows.
const AUTO_FLOW_PX_PER_FRAME = 0.6; // ~36 px/s at 60 fps
const ARROW_RESUME_MS = 5000;

export function SocialProof() {
  const { data: reviewsData, error: reviewsError, loading: reviewsLoading } = useGoogleReviews();
  const realReviews = reviewsData?.reviews ?? [];
  const aggregateRating = reviewsData?.rating ?? null;
  const aggregateCount = reviewsData?.userRatingCount ?? null;
  const googleMapsUri = reviewsData?.googleMapsUri ?? null;

  // The ref goes on the SCROLLABLE wrap (overflow-x-auto), NOT on the
  // inner flex track — the track has w-max which means it isn't
  // scrollable itself; only its overflow-y-auto parent is.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<number | null>(null);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  // Manually advance one card. After the move, resume the auto-flow
  // if the user goes idle for ARROW_RESUME_MS.
  const advance = useCallback(
    (dir: 1 | -1) => {
      const el = wrapRef.current;
      if (!el) return;
      // First card wrapper lives at: wrap → track → snap-center wrapper
      const trackEl = el.firstElementChild as HTMLElement | null;
      const firstCard = trackEl?.firstElementChild as HTMLElement | null;
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

      setPaused(true);
      clearResumeTimer();
      resumeTimerRef.current = window.setTimeout(() => {
        setPaused(false);
        resumeTimerRef.current = null;
      }, ARROW_RESUME_MS);
    },
    [clearResumeTimer],
  );

  // rAF auto-flow with seamless wrap. The reviews are rendered twice;
  // when scrollLeft passes half the total width, we instantly subtract
  // that half so the user keeps seeing identical content — no visible
  // jump-back at the end of the loop.
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

  // Cleanup the resume timer on unmount.
  useEffect(() => clearResumeTimer, [clearResumeTimer]);

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
            {/* Left arrow — desktop only; touch users swipe */}
            <button
              type="button"
              onClick={() => advance(-1)}
              aria-label="Vorherige Rezension"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-[#0A0A0D]/85 backdrop-blur border border-white/15 text-white shadow-xl hover:bg-[#7C3AED]/40 hover:border-[#7C3AED]/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

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
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-[#0A0A0D]/85 backdrop-blur border border-white/15 text-white shadow-xl hover:bg-[#7C3AED]/40 hover:border-[#7C3AED]/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

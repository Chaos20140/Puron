import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGoogleReviews } from "../useGoogleReviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

// Reviews carousel — a GPU-composited CSS transform marquee (right→left).
// The previous version animated scrollLeft on every rAF tick, which runs on
// the main thread and stutters on phones, and fought the user's inertial
// swipe ("hektisch"). A `translateX` keyframe animation runs on the
// compositor instead → buttery smooth, and the user's touch simply pauses it.
// - The track holds two identical copies; animating to translateX(-50%) loops
//   seamlessly (a trailing padding equal to the gap keeps the two halves
//   symmetric so the wrap point is invisible).
// - Duration is derived from the rendered width for a constant px/s pace
//   regardless of review count or breakpoint.
// - Hover (mouse only) and active touch pause the animation so a card can be
//   read / tapped; touch resumes a beat after the finger lifts.
// - prefers-reduced-motion: no animation, fall back to a manual scroll strip.
const carouselStyles = `
.review-carousel-wrap::-webkit-scrollbar { display: none; }
.review-carousel-wrap { scrollbar-width: none; -ms-overflow-style: none; }
@keyframes review-marquee {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
.review-marquee-track {
  animation: review-marquee var(--review-marquee-duration, 60s) linear infinite;
}
/* will-change only while on-screen + animating, so the GPU layer is created
   just-in-time and released when scrolled away (toggled via data-active). */
.review-carousel-wrap[data-active="true"] .review-marquee-track { will-change: transform; }
.review-carousel-wrap:not([data-active="true"]) .review-marquee-track { animation-play-state: paused; }
@media (hover: hover) {
  .review-carousel-wrap:hover .review-marquee-track { animation-play-state: paused; }
}
.review-carousel-wrap[data-paused="true"] .review-marquee-track { animation-play-state: paused; }
/* Pause while actively scrolling on mobile (toggled imperatively, no re-render):
   a second continuously-compositing animation stacked on the now-continuous
   full-screen background canvas is what makes THIS section janky to scroll past.
   Resumes a beat after the scroll stops. */
.review-carousel-wrap[data-scrolling="true"] .review-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .review-marquee-track { animation: none; transform: none; }
}
`;

const MARQUEE_PX_PER_SEC = 50; // readable, steady flow

export function SocialProof() {
  const { data: reviewsData, error: reviewsError, loading: reviewsLoading } = useGoogleReviews();
  const realReviews = reviewsData?.reviews ?? [];
  const aggregateRating = reviewsData?.rating ?? null;
  const aggregateCount = reviewsData?.userRatingCount ?? null;
  const googleMapsUri = reviewsData?.googleMapsUri ?? null;

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<number>(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Derive the animation duration from the rendered track width so the flow
  // keeps a constant px/s pace across breakpoints and review counts. The
  // track is two copies wide; translateX(-50%) travels exactly one copy.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || realReviews.length === 0 || reduced) return;

    const setDuration = () => {
      const half = track.scrollWidth / 2;
      if (half > 0) {
        track.style.setProperty("--review-marquee-duration", `${half / MARQUEE_PX_PER_SEC}s`);
      }
    };
    setDuration();

    const ro = new ResizeObserver(setDuration);
    ro.observe(track);
    return () => ro.disconnect();
  }, [realReviews.length, reduced]);

  // Touch pauses the marquee so a card can be read/tapped; it resumes a beat
  // after the finger lifts. Desktop hover-pause is pure CSS (hover: hover).
  const handleTouchStart = () => {
    window.clearTimeout(resumeTimer.current);
    setPaused(true);
  };
  const handleTouchEnd = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 1200);
  };
  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const showCarousel = !reviewsLoading && realReviews.length > 0;

  // Pause the marquee + release its will-change layer when the section scrolls
  // off-screen — a permanently-promoted, always-animating compositor layer
  // competes with scroll for the mobile GPU (mirrors the IntersectionObserver
  // pattern in Hero3DVisual). rootMargin promotes it just before it enters view
  // so there's no scroll-in pop. Desktop hover-pause + reduced-motion stay CSS.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showCarousel]);

  // Pause the marquee while the user is actively scrolling on mobile. The
  // marquee is a second continuously-compositing animation; stacked on the
  // (now continuous) full-screen background canvas during a scroll it blows the
  // mobile frame budget, so the page hangs while scrolling past this section.
  // Toggle a data-attr imperatively (NO React re-render on scroll) → CSS pauses
  // the animation; it resumes 180ms after scrolling stops. Mobile + motion only.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || window.innerWidth >= 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let scrolling = false;
    let t = 0;
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        el.setAttribute("data-scrolling", "true");
      }
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        scrolling = false;
        el.removeAttribute("data-scrolling");
      }, 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, [showCarousel]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A0A0D] to-[#111116] md:from-[#0A0A0D]/50 md:to-[#111116]/80 md:backdrop-blur-sm border-t border-white/5" style={{ isolation: "isolate" }}>
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

        {/* All three states (skeleton, empty/error, carousel) render into one
            fixed-height box so a mid-scroll data arrival can't reflow the page
            below it. min-h = card height + the py-12/md:py-16 vertical padding. */}
        <div className="relative min-h-[416px] sm:min-h-[436px] md:min-h-[488px]">
        {/* Loading skeleton — three shimmer cards matching the real card
            dimensions so the section holds its height while the API fetch
            settles. This eliminates the blank-area flash on mobile. */}
        {reviewsLoading && (
          <div className="flex gap-6 overflow-hidden py-12 md:py-16 px-6 md:px-16" aria-hidden="true">
            {[0, 1, 2].map((k) => (
              <div
                key={k}
                className="shrink-0 w-[260px] sm:w-[300px] md:w-[340px] h-[320px] sm:h-[340px] md:h-[360px] rounded-2xl bg-white/5 border border-white/5 animate-pulse"
              />
            ))}
          </div>
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
            data-paused={paused || undefined}
            data-active={!reduced && inView && !paused ? "true" : undefined}
            className={`review-carousel-wrap relative w-full py-12 md:py-16 ${reduced ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}`}
            style={{
              maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitOverflowScrolling: "touch",
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Trailing pr-* equals the gap so the two copies stay symmetric
                and translateX(-50%) wraps seamlessly. The reviews are rendered
                twice; the second set is aria-hidden so screen readers don't
                announce duplicates. */}
            <div
              ref={trackRef}
              className="review-marquee-track flex gap-6 md:gap-8 w-max pr-6 md:pr-8"
            >
              {[...realReviews, ...realReviews].map((r, i) => (
                <div key={i} aria-hidden={i >= realReviews.length || undefined} className="shrink-0">
                  <GoogleReviewCard review={r} href={googleMapsUri} />
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

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

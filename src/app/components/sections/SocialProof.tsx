import { motion } from "motion/react";
import { useGoogleReviews } from "../useGoogleReviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

// Desktop: continuous right-to-left marquee. Hover anywhere in the track
// pauses the scroll (CSS) and the hovered card scales up via motion's
// whileHover. prefers-reduced-motion stops the loop entirely.
//
// Mobile (<md): no auto-animation; the track becomes a touch-pan-x
// scrollable container with snap points so users swipe through cards
// manually. Hover-to-pause + hover-to-zoom are useless without a
// pointer device anyway.
const marqueeStyles = `
@keyframes review-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (min-width: 768px) {
  .review-marquee-track { animation: review-marquee 60s linear infinite; }
  .review-marquee-wrap:hover .review-marquee-track { animation-play-state: paused; }
}
@media (prefers-reduced-motion: reduce) {
  .review-marquee-track { animation: none !important; }
}
.review-marquee-wrap::-webkit-scrollbar { display: none; }
.review-marquee-wrap { scrollbar-width: none; -ms-overflow-style: none; }
`;

export function SocialProof() {
  const { data: reviewsData, error: reviewsError, loading: reviewsLoading } = useGoogleReviews();
  const realReviews = reviewsData?.reviews ?? [];
  const aggregateRating = reviewsData?.rating ?? null;
  const aggregateCount = reviewsData?.userRatingCount ?? null;
  const googleMapsUri = reviewsData?.googleMapsUri ?? null;

  // Need at least 2 reviews for a believable infinite-loop marquee
  // (otherwise duplicating the same card looks weird).
  const showMarquee = !reviewsLoading && realReviews.length > 0;
  // The track is duplicated to make the loop seamless. With <=2 reviews,
  // duplicate further so the row looks populated.
  const repeats = realReviews.length >= 4 ? 2 : realReviews.length >= 2 ? 3 : 4;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A0A0D]/50 to-[#111116]/80 backdrop-blur-sm border-t border-white/5" style={{ isolation: "isolate" }}>
      <style>{marqueeStyles}</style>
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

        {/* Status: loading or empty/error */}
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

        {/* Marquee on desktop, swipe-scroll carousel on mobile */}
        {showMarquee && (
          <div
            className="review-marquee-wrap relative w-full overflow-x-auto md:overflow-x-hidden overflow-y-hidden touch-pan-x snap-x snap-mandatory md:snap-none py-12 md:py-16"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              scrollPaddingLeft: "1.5rem",
              scrollPaddingRight: "1.5rem",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="review-marquee-track flex gap-6 md:gap-8 w-max px-6 md:px-0">
              {Array.from({ length: repeats }).flatMap((_, repeatIdx) =>
                realReviews.map((r, i) => (
                  <div key={`${repeatIdx}-${i}`} className="snap-center">
                    <GoogleReviewCard review={r} />
                  </div>
                )),
              )}
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

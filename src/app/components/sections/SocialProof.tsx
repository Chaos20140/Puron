import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { AGGREGATE, GOOGLE_REVIEWS_URL, REVIEWS } from "../../reviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

// Reviews carousel — a NATIVE horizontal scroll rail with snap points, plus a
// timer that advances it one card at a time.
//
// It used to be a CSS `translateX` keyframe marquee. That was smooth, but a
// CSS-animated element cannot be dragged: there was no way to swipe from one
// review to the next, a touch merely PAUSED the animation, and because a
// permanently-compositing marquee stacked on the full-screen background canvas
// blew the mobile frame budget, the whole thing was additionally frozen for the
// duration of every page scroll. The result is what the user described: the
// reviews stand still while you scroll past them and you cannot swipe through
// them. All three symptoms come from the same root — the wrong animation model.
//
// A real scroll container fixes it at the source:
// - Swiping is the browser's own scrolling: inertia, rubber-banding and snap
//   all come for free, and it never fights the finger.
// - `scroll-snap-type: x mandatory` + `scroll-snap-align: center` is what makes
//   it land "von Kommentar zu Kommentar".
// - Nothing composites continuously any more, so the page-scroll freeze hack is
//   gone — the rail keeps moving while the page scrolls, which is the point.
// - The auto-advance pauses while the user interacts (and on hover / offscreen /
//   hidden tab) and RESUMES ~2.5s after they let go, so a swipe never leaves the
//   carousel standing still.
// - `overscroll-behavior-x: contain` keeps a horizontal swipe from chaining into
//   the browser's back gesture.
//
// The list is rendered THREE times (see `repeat`); the rail rests in the middle
// copy and jumps a whole copy back/forward when it crosses a boundary. One copy
// is always at least as wide as the rail, so the jump is invisible — and unlike
// a 2-copy setup it leaves a full copy of runway in BOTH directions, so the user
// can also swipe backwards from the resting position.
const carouselStyles = `
.review-rail::-webkit-scrollbar { display: none; }
.review-rail {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}
/* While a programmatic loop jump runs, snapping has to be off or the browser
   fights the assignment and lands somewhere in between. */
.review-rail[data-jumping="true"] { scroll-snap-type: none; }
.review-rail-item { scroll-snap-align: center; }
@media (prefers-reduced-motion: reduce) {
  /* Manual swiping stays available — only the automatic advance stops. */
  .review-rail { scroll-behavior: auto; }
}
`;

const AUTOPLAY_MS = 3800; // one card at a reading pace
const RESUME_AFTER_MS = 2500; // grace period after the user lets go
const COPIES = 3; // middle copy is home; one copy of runway either way

export function SocialProof() {
  // Static content now (src/app/reviews.ts) — no fetch, no loading state, no
  // error state, and nothing that can reflow the page after first paint.
  const realReviews = REVIEWS;
  const aggregateRating = AGGREGATE.rating;
  const aggregateCount = AGGREGATE.count;
  // The href is still validated rather than trusted: it is rendered on the
  // aggregate line AND on every card, and an href is a script-execution surface
  // (`javascript:`). Cheap to keep, and it now also guards against a typo in the
  // hand-edited constant.
  const googleMapsUri = /^https:\/\//i.test(GOOGLE_REVIEWS_URL) ? GOOGLE_REVIEWS_URL : null;

  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const showCarousel = realReviews.length > 0;

  // How often the review list is repeated per copy. One copy has to be at least
  // as wide as the rail, otherwise the loop jump would be visible.
  const [repeat, setRepeat] = useState(1);

  // One repeat period, measured from the ITEM POSITIONS. Deriving it from
  // scrollWidth / COPIES is wrong: the track carries horizontal padding, so the
  // thirds don't line up with the repeat boundaries, and every loop jump lands a
  // few pixels off — which then fights scroll snapping.
  const periodOf = (track: HTMLElement, itemsPerCopy: number) => {
    const first = track.children[0] as HTMLElement | undefined;
    const next = track.children[itemsPerCopy] as HTMLElement | undefined;
    return first && next ? next.offsetLeft - first.offsetLeft : 0;
  };

  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track || !showCarousel) return;
    const measure = () => {
      const listWidth = periodOf(track, realReviews.length) / repeat;
      if (listWidth <= 0) return;
      const needed = Math.max(1, Math.ceil(rail.clientWidth / listWidth));
      if (needed !== repeat) setRepeat(needed);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [showCarousel, repeat, realReviews.length]);

  // Park the rail in the middle copy and keep it there. Everything else — the
  // autoplay timer, the user's swipe, the arrow buttons — just scrolls; this
  // effect owns the wrap-around so none of them have to think about it.
  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track || !showCarousel) return;

    const itemsPerCopy = realReviews.length * repeat;
    const period = () => periodOf(track, itemsPerCopy);

    const jumpBy = (delta: number) => {
      // Snapping must be off for the assignment, or the browser "corrects" it
      // mid-jump and we land between two cards.
      rail.setAttribute("data-jumping", "true");
      rail.scrollLeft += delta;
      rail.removeAttribute("data-jumping");
    };

    const home = () => {
      const p = period();
      if (p > 0) jumpBy(p - rail.scrollLeft);
    };
    home();

    // Normalise only once the rail has come to REST. Reacting on every scroll
    // event meant reacting to scroll-snap's own correction, which lands a few
    // pixels short of the boundary — the handler read that as "left the band",
    // jumped a whole period, snap corrected again, and the rail oscillated
    // between two positions instead of settling.
    let settle = 0;
    const onScroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const p = period();
        if (p <= 0) return;
        const w = rail.clientWidth;
        // Wide hysteresis band, NOT a tight one at the copy boundary. Scroll
        // snapping settles a few dozen pixels off the boundary, so a band that
        // starts exactly at `p` fires a full-period jump on a rail that is
        // sitting perfectly still. With COPIES = 3 the content is valid for any
        // position in [0, 3p - w], so jumping only near those extremes leaves
        // roughly a full period of slack on both sides.
        if (rail.scrollLeft > 2.5 * p - w) jumpBy(-p);
        else if (rail.scrollLeft < p * 0.5) jumpBy(p);
      }, 140);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(home);
    ro.observe(rail);

    return () => {
      window.clearTimeout(settle);
      rail.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [showCarousel, repeat, realReviews.length]);

  // Autoplay: advance one card, pause while the visitor is busy with it, resume
  // shortly after. Deliberately NOT paused by page scrolling — that was the
  // "reviews stand still while I scroll" complaint, and with a scroll rail there
  // is no continuously compositing layer left to justify it.
  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track || !showCarousel || reduced) return;

    let tick = 0;
    let resume = 0;
    let held = false; // finger down / pointer inside
    let visible = true;

    const step = () => {
      if (held || document.hidden || !visible) return;
      const first = track.children[0] as HTMLElement | undefined;
      const second = track.children[1] as HTMLElement | undefined;
      if (!first || !second) return;
      const pitch = second.offsetLeft - first.offsetLeft;
      rail.scrollBy({ left: pitch, behavior: "smooth" });
    };

    const start = () => {
      window.clearInterval(tick);
      tick = window.setInterval(step, AUTOPLAY_MS);
    };
    const hold = () => {
      held = true;
      window.clearTimeout(resume);
      window.clearInterval(tick);
    };
    const release = () => {
      window.clearTimeout(resume);
      // The grace period is what keeps a swipe from leaving the rail frozen.
      resume = window.setTimeout(() => {
        held = false;
        start();
      }, RESUME_AFTER_MS);
    };

    start();

    rail.addEventListener("pointerdown", hold);
    rail.addEventListener("pointerup", release);
    rail.addEventListener("pointercancel", release);
    rail.addEventListener("touchstart", hold, { passive: true });
    rail.addEventListener("touchend", release, { passive: true });
    rail.addEventListener("touchcancel", release, { passive: true });
    // Only a HORIZONTAL wheel is someone driving the rail. A vertical wheel with
    // the cursor happening to sit over the carousel is the visitor scrolling the
    // page — pausing on that is the exact "reviews stand still while I scroll"
    // behaviour we are removing.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      hold();
      release();
    };
    rail.addEventListener("wheel", onWheel, { passive: true });

    // Hover only counts on real pointers — on touch every tap reports hover.
    const finePointer = window.matchMedia("(hover: hover)").matches;
    if (finePointer) {
      rail.addEventListener("mouseenter", hold);
      rail.addEventListener("mouseleave", release);
      rail.addEventListener("focusin", hold);
      rail.addEventListener("focusout", release);
    }

    const onVisibility = () => {
      if (document.hidden) window.clearInterval(tick);
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Don't advance a carousel nobody is looking at.
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { rootMargin: "100px 0px" },
      );
      io.observe(rail);
    }

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(resume);
      rail.removeEventListener("pointerdown", hold);
      rail.removeEventListener("pointerup", release);
      rail.removeEventListener("pointercancel", release);
      rail.removeEventListener("touchstart", hold);
      rail.removeEventListener("touchend", release);
      rail.removeEventListener("touchcancel", release);
      rail.removeEventListener("wheel", onWheel);
      if (finePointer) {
        rail.removeEventListener("mouseenter", hold);
        rail.removeEventListener("mouseleave", release);
        rail.removeEventListener("focusin", hold);
        rail.removeEventListener("focusout", release);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [showCarousel, reduced, repeat]);

  // Arrow buttons: on a desktop without a trackpad there is no way to "swipe" a
  // horizontal rail at all, and they give keyboard users an explicit control.
  const nudge = (direction: 1 | -1) => () => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    const pitch = first && second ? second.offsetLeft - first.offsetLeft : rail.clientWidth * 0.8;
    rail.scrollBy({ left: pitch * direction, behavior: reduced ? "auto" : "smooth" });
  };

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

        {/* No loading skeleton and no min-height reservation any more: the
            reviews are part of the bundle, so they are on screen in the first
            paint and there is no late data arrival that could reflow the page.
            The empty branch only guards a hand-emptied REVIEWS array. */}
        <div className="relative">
        {realReviews.length === 0 && (
          <div className="text-center max-w-md mx-auto py-8">
            <p className="text-[#B3B3C2] text-sm">Aktuell sind keine Rezensionen hinterlegt.</p>
            <a
              href={googleMapsUri ?? "https://www.google.com/search?q=Puron+Media+Meschede"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-[#A855F7] underline decoration-[#A855F7]/40 underline-offset-4 hover:decoration-[#A855F7]"
            >
              Bewertungen direkt bei Google ansehen
            </a>
          </div>
        )}

        {showCarousel && (
          <div className="relative">
            <div
              ref={railRef}
              // A labelled group, so a screen reader announces what this strip
              // is before walking into a row of review links.
              role="group"
              aria-roledescription="Karussell"
              aria-label="Google-Rezensionen"
              className="review-rail relative w-full py-12 md:py-16"
              style={{
                maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              }}
            >
              {/* The list is rendered COPIES times; everything past the first
                  pass is aria-hidden + untabbable so screen readers and the tab
                  order see each review exactly once. */}
              <div ref={trackRef} className="flex gap-6 md:gap-8 w-max px-6 md:px-8">
                {Array.from({ length: COPIES * repeat }, () => realReviews)
                  .flat()
                  .map((r, i) => {
                    const duplicate = i >= realReviews.length;
                    return (
                      <div
                        key={i}
                        aria-hidden={duplicate || undefined}
                        className="review-rail-item shrink-0"
                      >
                        <GoogleReviewCard review={r} href={googleMapsUri} duplicate={duplicate} />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Pointer devices can't swipe a horizontal rail; these are also the
                keyboard affordance. Hidden on touch, where swiping is natural. */}
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={nudge(dir === "next" ? 1 : -1)}
                aria-label={dir === "next" ? "Nächste Rezension" : "Vorherige Rezension"}
                className={`absolute top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0D]/80 p-3 text-white/70 backdrop-blur transition-colors hover:border-white/30 hover:text-white md:flex ${
                  dir === "next" ? "right-0" : "left-0"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={dir === "next" ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
                </svg>
              </button>
            ))}
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

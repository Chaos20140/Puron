import { useEffect, useRef } from "react";
import { PuronLogo } from "./PuronLogo";

// Replaces the OS cursor with the Puron hex logo. The element is fixed-
// positioned and translated to (mouse x, mouse y) on every pointermove —
// rAF keeps the writes synced with the next repaint so it stays smooth
// even when other JS is busy.
//
// Disabled on coarse pointers (touch) because there is no hover cursor
// to replace, and `cursor: none` on body would also hide tap highlights.
// Honors prefers-reduced-motion: the cursor still appears but skips the
// subtle scale-up on interactive elements.
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.add("custom-cursor-active");

    const el = dotRef.current;
    if (!el) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let raf = 0;
    let scale = 1;
    let targetScale = 1;

    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest('a, button, [role="button"], input, textarea, select, label, summary, [data-cursor-hover]'));
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetScale = isInteractive(e.target) ? (reduced ? 1 : 1.6) : 1;
      if (el.style.opacity !== "1") el.style.opacity = "1";
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    const onDown = () => {
      targetScale = reduced ? 1 : 0.8;
    };
    const onUp = (e: PointerEvent) => {
      targetScale = isInteractive(e.target) ? (reduced ? 1 : 1.6) : 1;
    };

    const tick = () => {
      const lerp = 0.22;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;
      scale += (targetScale - scale) * 0.2;
      el.style.transform = `translate3d(${currentX - 16}px, ${currentY - 16}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
      style={{
        width: 32,
        height: 32,
        opacity: 0,
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 4px 12px rgba(168,85,247,0.55))",
        transition: "opacity 120ms ease-out",
      }}
    >
      <PuronLogo className="w-8 h-8" />
    </div>
  );
}

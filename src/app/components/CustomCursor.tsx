import { useEffect, useRef, useState } from "react";
import { PuronLogo } from "./PuronLogo";

// Replaces the OS cursor with the Puron hex logo on fine-pointer devices.
// rAF lerp keeps the writes synced with the next repaint so the cursor
// stays smooth even when other JS is busy.
//
// We use `(any-pointer: fine)` (not `(pointer: fine)`) so hybrid devices
// — touchscreen laptops with a mouse attached — still get the custom
// cursor when there's at least one fine pointer available.
//
// `enabled` is resolved synchronously on first render via useState
// initialiser, so the <div> exists by the time useEffect runs and the
// ref is non-null. Earlier versions used setEnabled inside the effect,
// which meant the listener-setup branch ran before the DOM node was
// rendered — rAF never started and the cursor stayed parked off-screen.
function isFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(any-pointer: fine)").matches;
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled] = useState(isFinePointer);

  useEffect(() => {
    if (!enabled) return;
    const el = dotRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.add("custom-cursor-active");

    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor-hover]',
        ),
      );
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      targetScale = isInteractive(e.target) ? (reduced ? 1 : 1.55) : 1;
    };

    const onDown = () => {
      targetScale = reduced ? 1 : 0.85;
    };
    const onUp = (e: PointerEvent) => {
      targetScale = isInteractive(e.target) ? (reduced ? 1 : 1.55) : 1;
    };
    const onWindowLeave = () => {
      // Park off-screen instead of toggling opacity so the fade-in
      // transition can't desync with rAF.
      targetX = -200;
      targetY = -200;
    };

    const tick = () => {
      const lerp = 0.25;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;
      scale += (targetScale - scale) * 0.22;
      el.style.transform = `translate3d(${currentX - 18}px, ${currentY - 18}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onWindowLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onWindowLeave);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 36,
        height: 36,
        zIndex: 99999,
        pointerEvents: "none",
        transform: "translate3d(-200px, -200px, 0)",
        willChange: "transform",
        filter: "drop-shadow(0 6px 14px rgba(168,85,247,0.65))",
      }}
    >
      <PuronLogo className="w-9 h-9" />
    </div>
  );
}

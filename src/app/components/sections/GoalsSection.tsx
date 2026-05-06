import { motion } from "motion/react";
import { PuronLogo } from "../PuronLogo";

// Vertical goal stream: large purple-gradient keywords flow continuously
// upward behind a static center logo. Two duplicated columns make the
// loop seamless. prefers-reduced-motion users get a static stack.
const goalKeywords = [
  "Mehr Kunden",
  "Höherer Umsatz",
  "Mehr Bewerber",
  "Mehr Sichtbarkeit",
  "Stärkere Marke",
  "Echte Reichweite",
  "Messbares Wachstum",
  "Premium Content",
];

const streamKeyframes = `
@keyframes goal-stream { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .goal-stream-anim { animation: none !important; }
}
`;

export function GoalsSection() {
  return (
    <section className="py-16 md:py-32 relative bg-[#0A0A0D]/40 backdrop-blur-sm" style={{ isolation: "isolate" }}>
      <style>{streamKeyframes}</style>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED]/10 px-3 py-1.5 text-xs text-[#A855F7] ring-1 ring-[#7C3AED]/20 uppercase tracking-widest font-medium mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
            Unser Erfolg
          </span>
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-semibold tracking-tight mb-4">Wir beherrschen Content, der konvertiert</h2>
          <p className="text-lg text-[#B3B3C2] max-w-2xl mx-auto mb-16">
            Wir sind nicht einfach nur eine weitere Agentur, die schöne Bilder macht. Wir sind Experten darin, Unternehmen durch strategischen Social Content zu skalieren. Wir wissen genau, wie man Algorithmen bedient, Zuschauer bindet und direkten ROI generiert.
          </p>
        </motion.div>

        {/* Stream — fixed-height window, gradient masks top + bottom for fade. */}
        <div
          className="relative mx-auto max-w-3xl h-[420px] md:h-[520px] overflow-hidden"
          aria-hidden="true"
        >
          {/* Static logo anchor in the middle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
            <div className="absolute w-32 h-32 md:w-44 md:h-44 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 shadow-[0_0_60px_rgba(124,58,237,0.35),0_0_120px_rgba(124,58,237,0.18)]" />
            <div className="relative w-20 h-20 md:w-28 md:h-28 bg-[#0A0A0D] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)]">
              <PuronLogo className="w-9 h-9 md:w-12 md:h-12" />
            </div>
          </div>

          {/* Top + bottom fade gradients */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 z-10 bg-gradient-to-b from-[#0A0A0D] via-[#0A0A0D]/80 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 z-10 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/80 to-transparent" />

          {/* Two duplicate stacks for seamless loop. The animated container
              is taller than the viewport — translating it -50% loops back. */}
          <div
            className="goal-stream-anim absolute left-0 right-0 flex flex-col items-center gap-10 md:gap-14 will-change-transform"
            style={{ animation: "goal-stream 28s linear infinite" }}
          >
            {[...goalKeywords, ...goalKeywords].map((label, i) => (
              <span
                key={i}
                className="font-['Space_Grotesk'] text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED] whitespace-nowrap"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

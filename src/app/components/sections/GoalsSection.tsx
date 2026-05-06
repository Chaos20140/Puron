import { motion } from "motion/react";

// 5-step collaboration process. Each card slides in from alternating
// sides as the user scrolls — `whileInView` with `viewport.once` so the
// reveal only happens the first time each card crosses ~30% in view.
// MotionConfig reducedMotion="user" in App.tsx makes this a snap-to-
// final-state for users with prefers-reduced-motion.
const steps = [
  { title: "Erstgespräch", desc: "Wir lernen Dein Unternehmen kennen." },
  { title: "Konzept", desc: "Wir entwickeln eine individuelle Social Media Strategie." },
  { title: "Regelmäßige Drehtage", desc: "Wir erstellen hochwertigen Content vor Ort." },
  { title: "Bespielung und Betreuung", desc: "Wir kümmern uns um Deine Kanäle." },
  { title: "Werbekampagnen", desc: "Wir schalten gezielte Ads für maximale Reichweite." },
];

// Purple gradient progression: lightest → deepest, mirrors the warm
// yellow→pink palette of the reference but stays on-brand.
const gradients = [
  "from-[#C084FC] to-[#A855F7]",
  "from-[#A855F7] to-[#9333EA]",
  "from-[#9333EA] to-[#7C3AED]",
  "from-[#7C3AED] to-[#6D28D9]",
  "from-[#6D28D9] to-[#4C1D95]",
];

export function GoalsSection() {
  return (
    <section
      className="py-16 md:py-32 relative bg-[#0A0A0D]/40 backdrop-blur-sm"
      style={{ isolation: "isolate" }}
    >
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED]/10 px-3 py-1.5 text-xs text-[#A855F7] ring-1 ring-[#7C3AED]/20 uppercase tracking-widest font-medium mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Unser Prozess
          </span>
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-semibold tracking-tight">
            So läuft unsere Zusammenarbeit ab
          </h2>
        </motion.div>

        <div className="space-y-6 md:space-y-8">
          {steps.map((step, i) => {
            const fromLeft = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: fromLeft ? -80 : 80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`bg-gradient-to-br ${gradients[i]} rounded-3xl px-5 py-8 sm:px-6 sm:py-10 md:px-12 md:py-14 shadow-[0_15px_40px_rgba(124,58,237,0.25)] ring-1 ring-white/10 hover:ring-white/30 transition-shadow text-center`}
              >
                <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-[#0A0A0D] mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base md:text-lg italic text-[#0A0A0D]/75 max-w-md mx-auto leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

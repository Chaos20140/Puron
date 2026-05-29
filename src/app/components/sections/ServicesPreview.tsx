import { Link } from "react-router";
import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";

// No pictographic icons per client request — each card leads with a large
// gradient index number (01–04) instead. Keyword + tagline carry the meaning.
const services = [
  { keyword: "Reels", desc: "die nicht überscrollt werden" },
  { keyword: "Beiträge", desc: "die nach deiner Marke aussehen" },
  { keyword: "Ads", desc: "die nicht nur laufen, sondern liefern" },
  { keyword: "Content Strategie", desc: "die wirklich Sinn macht" },
];

export function ServicesPreview() {
  return (
    <section className="py-16 md:py-24 relative border-t border-white/5 bg-gradient-to-b from-transparent to-[#111116]/40 backdrop-blur-sm" style={{ isolation: "isolate" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16 max-w-2xl"
        >
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">Was wir zaubern</span>
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 md:mb-8 leading-[1.15]">
            Viele quatschen über Trends – doch wir überzeugen mit{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">visueller Qualität</span>.
          </h2>
          <AnimatedButton to="/services" variant="outline">
            Unsere Dienstleistungen
          </AnimatedButton>
        </motion.div>

        {/* Cards: cascade slide-in. Even-index cards slide from the left,
            odd-index from the right, so the 2-column grid feels like the
            tiles converge from outside the viewport. */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => {
            const fromX = i % 2 === 0 ? -40 : 40;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: fromX }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              >
                <Link
                  to="/services"
                  className="group block p-8 rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-[#7C3AED]/40 hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED] rounded-full blur-[80px] opacity-0 group-hover:opacity-25 transition-opacity" />
                  <span
                    aria-hidden="true"
                    className="block font-['Space_Grotesk'] font-bold leading-none mb-6 text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-[#A855F7] to-[#7C3AED] opacity-90 select-none transition-transform duration-500 group-hover:-translate-y-0.5"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* flex-col on every breakpoint keeps all four cards
                      visually identical: bold purple keyword on its own
                      line, muted tagline below. The previous flex-wrap
                      let the tagline sit inline next to short keywords
                      ("Reels", "Ads") but wrap under long ones
                      ("Content Strategie") — inconsistent. */}
                  <h3 className="font-['Space_Grotesk'] tracking-tight leading-tight flex flex-col gap-y-1.5">
                    <span className="text-2xl sm:text-3xl md:text-[2rem] lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">
                      {s.keyword}
                    </span>
                    <span className="text-sm sm:text-base md:text-lg font-light text-[#B3B3C2] leading-snug">
                      {s.desc}
                    </span>
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

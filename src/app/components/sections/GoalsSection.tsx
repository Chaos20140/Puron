import { motion } from "motion/react";
import { PuronLogo } from "../PuronLogo";

const floatKeyframes = `@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }`;

const goals = [
  { label: "Mehr Kunden", cls: "top-[15%] left-[0%] md:top-[17%] md:left-[5%]" },
  { label: "Höherer Umsatz", cls: "top-[2%] left-1/2 -translate-x-1/2 md:top-[5%]" },
  { label: "Mehr Bewerber", cls: "top-[15%] right-[0%] md:top-[17%] md:right-[5%]" },
  { label: "Mehr Sichtbarkeit", cls: "bottom-[10%] left-[2%] md:bottom-[12%] md:left-[5%]" },
  { label: "Stärkere Marke", cls: "bottom-[10%] right-[2%] md:bottom-[12%] md:right-[5%]" },
];

export function GoalsSection() {
  return (
    <section className="py-16 md:py-32 relative bg-[#0A0A0D]/40 backdrop-blur-sm" style={{ isolation: "isolate" }}>
      <style>{floatKeyframes}</style>
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-3xl aspect-square max-h-[550px] flex items-center justify-center"
        >
          {/* Radial dotted lines from center */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" fill="none">
            <line x1="300" y1="300" x2="120" y2="130" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
            <line x1="300" y1="300" x2="300" y2="60" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
            <line x1="300" y1="300" x2="480" y2="130" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
            <line x1="300" y1="300" x2="100" y2="480" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
            <line x1="300" y1="300" x2="490" y2="480" stroke="#7C3AED" strokeWidth="1" strokeDasharray="3 6" opacity="0.3" />
            <line x1="300" y1="300" x2="50" y2="300" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.15" />
            <line x1="300" y1="300" x2="550" y2="300" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.15" />
            <line x1="300" y1="300" x2="300" y2="550" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.15" />
            <line x1="300" y1="300" x2="150" y2="450" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.1" />
            <line x1="300" y1="300" x2="450" y2="450" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.1" />
            <line x1="300" y1="300" x2="150" y2="150" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.1" />
            <line x1="300" y1="300" x2="450" y2="150" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.1" />
          </svg>

          <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/20 shadow-[0_0_60px_rgba(124,58,237,0.2),0_0_120px_rgba(124,58,237,0.1)]" />
          <div className="absolute w-20 h-20 md:w-28 md:h-28 bg-[#0A0A0D] border border-white/10 rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <PuronLogo className="w-8 h-8 md:w-12 md:h-12" />
          </div>

          {goals.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className={`absolute ${n.cls} bg-[#121217]/80 border border-white/10 hover:border-[#7C3AED]/40 px-4 py-2 md:px-6 md:py-3 rounded-full text-[11px] md:text-sm font-medium backdrop-blur-md whitespace-nowrap transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] cursor-default`}
              style={{ animation: `float ${5 + i * 0.8}s ease-in-out infinite ${i * 0.4}s` }}
            >
              {n.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

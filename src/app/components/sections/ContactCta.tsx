import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";

export function ContactCta() {
  return (
    <section className="py-20 md:py-32 relative border-t border-white/5" style={{ isolation: "isolate" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto px-6 text-center relative z-10"
      >
        <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">Lassen Sie uns über Ihre Marke sprechen</h2>
        <p className="text-lg text-[#B3B3C2] mb-10">Sagen Sie uns, was Sie brauchen, und hinterlassen Sie Ihre E-Mail. Wir melden uns bei Ihnen, um eine mögliche Zusammenarbeit zu besprechen.</p>
        <AnimatedButton to="/contact" variant="primary">
          Kontakt aufnehmen
        </AnimatedButton>
      </motion.div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#7C3AED]/10 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
}

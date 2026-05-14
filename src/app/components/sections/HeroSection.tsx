import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";
import { Hero3DVisual } from "../Hero3DVisual";
import { ErrorBoundary } from "../ErrorBoundary";

export function HeroSection() {
  return (
    <header className="relative pt-28 pb-16 md:pt-48 md:pb-24">
      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <h1 className="font-['Space_Grotesk'] text-[1.6rem] sm:text-[2rem] md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] md:leading-[1.05] mb-5 md:mb-6 max-w-[300px] sm:max-w-md md:max-w-3xl">
            Social Media Content,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">der funktioniert</span>
            {" – Sichtbarkeit ist "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">kein Zufall</span>
            .
          </h1>
          <p className="text-sm sm:text-[15px] md:text-xl text-[#B3B3C2] mb-8 md:mb-10 max-w-[280px] sm:max-w-md md:max-w-xl leading-relaxed">
            Wir schaffen Inhalte nach dem Motto: Aus dem Auge, in den Sinn – für Unternehmen, die messbares Wachstum anstreben.
          </p>
          <AnimatedButton to="/contact" variant="primary" className="w-full max-w-[260px] sm:w-auto">
            Zusammenarbeit anfragen
          </AnimatedButton>
        </motion.div>

        {/* Silent ErrorBoundary keeps the rest of the hero usable if the
            canvas script throws. */}
        <ErrorBoundary>
          <Hero3DVisual />
        </ErrorBoundary>
      </div>
    </header>
  );
}

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
          <h1 className="font-['Space_Grotesk'] text-[2.5rem] md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] md:leading-[1.05] mb-5 md:mb-6 max-w-[340px] md:max-w-3xl">
            Social Media Content, das <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">Unternehmen sichtbar</span> macht
          </h1>
          <p className="text-[15px] md:text-xl text-[#B3B3C2] mb-8 md:mb-10 max-w-[280px] sm:max-w-md md:max-w-xl leading-relaxed">
            Wir produzieren Reels, Posts, Ads und Content-Strategien, die Unternehmen dabei helfen, Kunden, Bewerber und langfristige Aufmerksamkeit zu gewinnen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-center lg:justify-start w-full sm:w-auto">
            <AnimatedButton to="/contact" variant="primary" className="w-full max-w-[240px] sm:w-auto">
              Zusammenarbeit anfragen
            </AnimatedButton>
            <AnimatedButton to="/services" variant="outline" className="w-full max-w-[240px] sm:w-auto">
              Unsere Dienstleistungen
            </AnimatedButton>
          </div>
          <div className="mt-10 md:mt-12 flex items-center justify-center lg:justify-start gap-2.5 md:gap-3 text-[10px] md:text-xs uppercase tracking-widest text-[#B3B3C2] font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
            <span>Für Marken, die messbares Wachstum anstreben</span>
          </div>
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

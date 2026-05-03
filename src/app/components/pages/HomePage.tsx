import { Link } from "react-router";
import { PuronLogo } from "../PuronLogo";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AnimatedButton } from "../AnimatedButton";
import { Hero3DVisual } from "../Hero3DVisual";
import { motion } from "motion/react";
import { useGoogleReviews } from "../useGoogleReviews";
import { GoogleReviewCard } from "../GoogleReviewCard";

const styles = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
`;

const clients = [
  { name: "APEX", icon: <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" /></svg> },
  { name: "GLOBAL", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg> },
  { name: "METRICS", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current"><path d="M4 4h4v16H4V4zm6 6h4v10h-4V10zm6-6h4v16h-4V4z" /></svg> },
  { name: "NEXUS", icon: <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="2" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg> },
  { name: "STRIPE", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { name: "VERTEX", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8M5 15l7-7 7 7" /></svg> },
];

const ClientBlock = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
  <div className="flex items-center justify-around w-max gap-12 sm:gap-16 md:gap-24 px-8 sm:px-12 flex-shrink-0" aria-hidden={ariaHidden || undefined}>
    {clients.map((c, i) => (
      <div key={i} className="group flex items-center gap-3 text-[#71717A] hover:text-[#A855F7] transition-all duration-300 opacity-50 hover:opacity-100 cursor-pointer">
        {c.icon}
        <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight hidden sm:block">{c.name}</span>
      </div>
    ))}
  </div>
);

export function HomePage() {
  const { data: reviewsData, error: reviewsError, loading: reviewsLoading } = useGoogleReviews();
  const realReviews = reviewsData?.reviews ?? [];
  const aggregateRating = reviewsData?.rating ?? null;
  const aggregateCount = reviewsData?.userRatingCount ?? null;
  const googleMapsUri = reviewsData?.googleMapsUri ?? null;

  return (
    <>
      <style>{styles}</style>

      {/* Hero Section */}
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

          {/* Abstract Visual */}
          <Hero3DVisual />
        </div>
      </header>

      {/* Ticker */}
      <section className="py-12 border-t border-white/5 bg-[#0A0A0D]/50 relative z-20 overflow-hidden backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#B3B3C2] font-medium">Ausgewählte Kooperationen</p>
        </div>
        <div className="relative w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
          <div className="flex w-max" style={{ animation: "marquee 30s linear infinite" }}>
            <ClientBlock />
            <ClientBlock ariaHidden />
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 md:py-24 relative border-t border-white/5 bg-gradient-to-b from-transparent to-[#111116]/40 backdrop-blur-sm" style={{ isolation: "isolate" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 max-w-2xl"
          >
            <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">Was wir tun</span>
            <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-semibold tracking-tight mb-6">Fähigkeiten für moderne Plattformen.</h2>
            <p className="text-lg text-[#B3B3C2] leading-relaxed">
              Wir folgen keinen Trends - wir setzen sie. Unser Team besteht aus branchenführenden Experten, die die Kunst der Social Media Produktion und Strategie beherrschen. Wir zeichnen uns dadurch aus, gewöhnliche Marken mit unübertroffener visueller Qualität, datengesteuerter Präzision und Content, der die Konkurrenz konstant übertrifft, in Marktführer zu verwandeln.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Reels Produktion", desc: "Kurzvideo-Content für Reichweite, Relevanz und um die Aufmerksamkeit im schnellen Scroll-Feed zu halten.", icon: <><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></> },
              { title: "Social Media Posts", desc: "Gebrandeter statischer und Karussell-Content, der Ihr Unternehmen aktiv, modern und hochprofessionell aussehen lässt.", icon: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></> },
              { title: "Bezahlte Werbung", desc: "Werbemittel und Kampagnen-Assets, strategisch gestaltet, um direkte Sichtbarkeit und messbare Ergebnisse zu generieren.", icon: <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
              { title: "Content Strategie", desc: "Eine maßgeschneiderte, datengestützte Content-Ausrichtung, die ausschließlich auf Ihre spezifischen Geschäftsziele und Zielgruppe abgestimmt ist.", icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link to="/services" className="group block p-8 rounded-3xl bg-[#121217] border border-white/5 hover:border-[#7C3AED]/40 transition-all duration-500 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED] rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#7C3AED]/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#A855F7] transition-colors">{s.icon}</svg>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-2xl font-medium mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-lg text-[#B3B3C2] leading-relaxed">{s.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Works */}
      <section className="py-16 md:py-24 relative border-t border-white/5 bg-[#0A0A0D]/50 backdrop-blur-md" style={{ isolation: "isolate" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-4 block">Unser Portfolio</span>
              <h2 className="font-['Space_Grotesk'] text-4xl lg:text-6xl font-semibold tracking-tight text-[#F5F5F7]">
                Ausgewählte <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">Arbeiten</span>
              </h2>
            </div>
            <p className="text-lg text-[#B3B3C2] max-w-md leading-relaxed border-l-2 border-[#7C3AED]/30 pl-6">
              Premium Content mit hoher Bindung, der in den überfülltesten Feeds heraussticht. Wir liefern atemberaubende Ästhetik und klare Botschaften, die auf Aufmerksamkeit ausgelegt sind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-8 group cursor-pointer"
            >
              <Link to="/projects" className="block relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#121217] aspect-[16/9]">
                <ImageWithFallback src="https://images.unsplash.com/photo-1726066012749-f81bf4422d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnQlMjBjcmVhdGlvbnxlbnwxfHx8fDE3NzUxOTQzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Aura Cosmetics" className="transition-transform duration-[2s] group-hover:scale-105 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0" />
                <div className="bg-gradient-to-t from-[#0A0A0D]/90 via-[#0A0A0D]/20 to-transparent absolute inset-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex items-end justify-between">
                  <div>
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/10 backdrop-blur-md mb-4 inline-block">Markenkampagne</span>
                    <h3 className="font-['Space_Grotesk'] text-2xl md:text-4xl text-[#F5F5F7] mb-2 font-medium tracking-tight">Aura Cosmetics</h3>
                    <p className="text-[#B3B3C2] text-sm md:text-base">Komplette Social Media Neugestaltung und tägliche Content Produktion.</p>
                  </div>
                  <div className="hidden sm:flex h-12 w-12 bg-white/10 backdrop-blur-md text-white rounded-full items-center justify-center group-hover:bg-[#A855F7] transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-4 group cursor-pointer"
            >
              <Link to="/projects" className="block relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#121217] aspect-square md:aspect-auto md:h-full">
                <ImageWithFallback src="https://images.unsplash.com/photo-1661343586831-d7fd573de66c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHByb2R1Y3Rpb24lMjByZWVsc3xlbnwxfHx8fDE3NzUyMzkxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="TechNova Evolution" className="transition-transform duration-[2s] group-hover:scale-105 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0" />
                <div className="bg-gradient-to-t from-[#0A0A0D]/90 via-[#0A0A0D]/20 to-transparent absolute inset-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/10 backdrop-blur-md mb-4 inline-block">Reels Produktion</span>
                  <h3 className="font-['Space_Grotesk'] text-xl md:text-2xl text-[#F5F5F7] mb-2 font-medium tracking-tight">TechNova Evolution</h3>
                  <p className="text-[#B3B3C2] text-sm">Hochkonvertierende Reels für B2B.</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5 group cursor-pointer"
            >
              <Link to="/projects" className="block relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#121217] aspect-square md:aspect-auto md:h-full">
                <ImageWithFallback src="https://images.unsplash.com/photo-1611926653458-09294b3142bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3NTIyMzkzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Vanguard Fitness" className="transition-transform duration-[2s] group-hover:scale-105 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0" />
                <div className="bg-gradient-to-t from-[#0A0A0D]/90 via-[#0A0A0D]/20 to-transparent absolute inset-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/10 backdrop-blur-md mb-4 inline-block">Bezahlte Werbung</span>
                  <h3 className="font-['Space_Grotesk'] text-xl md:text-2xl text-[#F5F5F7] mb-2 font-medium tracking-tight">Vanguard Fitness</h3>
                  <p className="text-[#B3B3C2] text-sm">Direct-Response Werbemittel.</p>
                </div>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-7 group cursor-pointer"
            >
              <Link to="/projects" className="block relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#121217] aspect-[16/9]">
                <ImageWithFallback src="https://images.unsplash.com/photo-1648662199460-34b7597ba771?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkaW8lMjBsaWdodCUyMGNhbWVyYXxlbnwxfHx8fDE3NzUyMzkxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Studio Light" className="transition-transform duration-[2s] group-hover:scale-105 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0" />
                <div className="bg-gradient-to-t from-[#0A0A0D]/90 via-[#0A0A0D]/20 to-transparent absolute inset-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex items-end justify-between">
                  <div>
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/10 backdrop-blur-md mb-4 inline-block">Employer Branding</span>
                    <h3 className="font-['Space_Grotesk'] text-2xl md:text-4xl text-[#F5F5F7] mb-2 font-medium tracking-tight">Nexus Studio</h3>
                    <p className="text-[#B3B3C2] text-sm md:text-base">Hochwertige Studioproduktion für mehr Markenbekanntheit.</p>
                  </div>
                  <div className="hidden sm:flex h-12 w-12 bg-white/10 backdrop-blur-md text-white rounded-full items-center justify-center group-hover:bg-[#A855F7] transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-16 md:py-32 relative bg-[#0A0A0D]/40 backdrop-blur-sm" style={{ isolation: "isolate" }}>
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

            {/* Center glow ring */}
            <div className="absolute w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#7C3AED]/5 border border-[#7C3AED]/20 shadow-[0_0_60px_rgba(124,58,237,0.2),0_0_120px_rgba(124,58,237,0.1)]" />
            
            {/* Center circle with logo */}
            <div className="absolute w-20 h-20 md:w-28 md:h-28 bg-[#0A0A0D] border border-white/10 rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
              <PuronLogo className="w-8 h-8 md:w-12 md:h-12" />
            </div>

            {/* Goal pills */}
            {[
              { label: "Mehr Kunden", cls: "top-[15%] left-[0%] md:top-[17%] md:left-[5%]" },
              { label: "Höherer Umsatz", cls: "top-[2%] left-1/2 -translate-x-1/2 md:top-[5%]" },
              { label: "Mehr Bewerber", cls: "top-[15%] right-[0%] md:top-[17%] md:right-[5%]" },
              { label: "Mehr Sichtbarkeit", cls: "bottom-[10%] left-[2%] md:bottom-[12%] md:left-[5%]" },
              { label: "Stärkere Marke", cls: "bottom-[10%] right-[2%] md:bottom-[12%] md:right-[5%]" },
            ].map((n, i) => (
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

      {/* Why Puron */}
      <section className="py-16 md:py-24 border-y border-white/5 bg-[#050508]/60 backdrop-blur-md" style={{ isolation: "isolate" }}>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Branchenexperten in Sachen <span className="text-[#A855F7]">Content Performance</span>.
            </h2>
            <p className="text-lg text-[#B3B3C2] mb-8 leading-relaxed">
              Wir sind besessen von Perfektion und Ergebnissen. Unsere unvergleichliche Expertise schlägt die Brücke zwischen kreativer Ästhetik und erstklassigem Unternehmenswachstum. Wir sind einfach die Besten in dem was wir tun – weil wir uns unerbittlich auf Qualität, Strategie und die Produktion von Arbeit konzentrieren, die unbestreitbaren Einfluss hat.
            </p>
            <AnimatedButton to="/contact" variant="outline" className="!border-b !border-[#7C3AED] !rounded-none !px-0 !py-1 !bg-transparent hover:!text-[#A855F7] gap-2 inline-flex items-center">
              Starten Sie Ihr Projekt
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </AnimatedButton>
          </motion.div>
          <div className="flex flex-col gap-4 md:gap-6">
            {[
              { title: "Individuelle Strategie", desc: "Keine Einheitslösungen. Jede Marke erhält einen maßgeschneiderten Ansatz." },
              { title: "Sichtbarkeit & Wiedererkennung", desc: "Content, der minutiös darauf ausgelegt ist, Aufmerksamkeit zu erregen und Markenbekanntheit aufzubauen." },
              { title: "Klarer Business-Fokus", desc: "Wir optimieren auf Ergebnisse - Leads, Sales und Talente - nicht nur auf Likes." },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex gap-4 p-6 rounded-2xl bg-[#0A0A0D] border border-white/5 hover:bg-[#121217] hover:border-white/10 transition-colors"
              >
                <div className="mt-1 w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2 text-[#F5F5F7]">{item.title}</h4>
                  <p className="text-[#B3B3C2] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#0A0A0D]/50 to-[#111116]/80 backdrop-blur-sm border-t border-white/5" style={{ isolation: "isolate" }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="text-xs uppercase text-[#B3B3C2] tracking-widest mb-2">Von ambitionierten Marken vertraut</p>
            <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-semibold tracking-tight">Echte Google-Rezensionen</h2>
            {aggregateRating != null && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#B3B3C2]">
                <span className="text-[#FBBC05] font-semibold">{aggregateRating.toFixed(1)}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(aggregateRating) ? "#FBBC05" : "#3a3a44"}>
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                {aggregateCount != null && (
                  <span>({aggregateCount} Bewertungen{googleMapsUri ? " · " : ""}
                    {googleMapsUri && (
                      <a href={googleMapsUri} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#A855F7]">
                        auf Google ansehen
                      </a>
                    )})
                  </span>
                )}
              </div>
            )}
          </motion.div>
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 py-8 md:py-20 md:min-h-[450px]">
            {reviewsLoading && (
              <div className="text-[#B3B3C2] text-sm">Rezensionen werden geladen…</div>
            )}
            {!reviewsLoading && realReviews.length === 0 && (
              <div className="text-center text-[#B3B3C2] text-sm max-w-md">
                {reviewsError
                  ? "Die Google-Rezensionen können momentan nicht geladen werden. Bitte versuche es später erneut."
                  : "Aktuell sind keine Google-Rezensionen verfügbar."}
              </div>
            )}
            {!reviewsLoading && realReviews.length > 0 && (
              <div className="max-w-full flex flex-col md:flex-row justify-center items-center h-full relative gap-6 md:gap-0 w-full">
                {realReviews.length >= 3 ? (
                  <>
                    <GoogleReviewCard review={realReviews[0]} variant="left" />
                    <GoogleReviewCard review={realReviews[1]} variant="center" delay={0.2} />
                    <GoogleReviewCard review={realReviews[2]} variant="right" delay={0.4} />
                  </>
                ) : realReviews.length === 2 ? (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full">
                    <GoogleReviewCard review={realReviews[0]} variant="center" />
                    <GoogleReviewCard review={realReviews[1]} variant="center" delay={0.2} />
                  </div>
                ) : (
                  <GoogleReviewCard review={realReviews[0]} variant="center" />
                )}
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

      {/* Contact CTA */}
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
    </>
  );
}

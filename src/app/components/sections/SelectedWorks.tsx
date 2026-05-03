import { Link } from "react-router";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

const works = [
  {
    title: "Aura Cosmetics",
    category: "Markenkampagne",
    desc: "Komplette Social Media Neugestaltung und tägliche Content Produktion.",
    img: "https://images.unsplash.com/photo-1726066012749-f81bf4422d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnQlMjBjcmVhdGlvbnxlbnwxfHx8fDE3NzUxOTQzODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    layout: "wide" as const,
    span: "md:col-span-8",
    delay: 0,
  },
  {
    title: "TechNova Evolution",
    category: "Reels Produktion",
    desc: "Hochkonvertierende Reels für B2B.",
    img: "https://images.unsplash.com/photo-1661343586831-d7fd573de66c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHByb2R1Y3Rpb24lMjByZWVsc3xlbnwxfHx8fDE3NzUyMzkxMzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    layout: "tall" as const,
    span: "md:col-span-4",
    delay: 0.2,
  },
  {
    title: "Vanguard Fitness",
    category: "Bezahlte Werbung",
    desc: "Direct-Response Werbemittel.",
    img: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3NTIyMzkzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    layout: "tall" as const,
    span: "md:col-span-5",
    delay: 0,
  },
  {
    title: "Nexus Studio",
    category: "Employer Branding",
    desc: "Hochwertige Studioproduktion für mehr Markenbekanntheit.",
    img: "https://images.unsplash.com/photo-1648662199460-34b7597ba771?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkaW8lMjBsaWdodCUyMGNhbWVyYXxlbnwxfHx8fDE3NzUyMzkxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    layout: "wide" as const,
    span: "md:col-span-7",
    delay: 0.2,
  },
];

export function SelectedWorks() {
  return (
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
          {works.map((w, i) => {
            const aspect = w.layout === "wide" ? "aspect-[16/9]" : "aspect-square md:aspect-auto md:h-full";
            const padding = w.layout === "wide" ? "p-6 md:p-10" : "p-6 md:p-8";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: w.delay }}
                className={`${w.span} group cursor-pointer`}
              >
                <Link to="/projects" className={`block relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#121217] ${aspect}`}>
                  <ImageWithFallback
                    src={w.img}
                    alt={w.title}
                    className="transition-transform duration-[2s] group-hover:scale-105 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0"
                  />
                  <div className="bg-gradient-to-t from-[#0A0A0D]/90 via-[#0A0A0D]/20 to-transparent absolute inset-0 pointer-events-none" />
                  <div className={`absolute bottom-0 left-0 ${padding} w-full ${w.layout === "wide" ? "flex items-end justify-between" : ""}`}>
                    <div>
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/10 backdrop-blur-md mb-4 inline-block">{w.category}</span>
                      <h3 className={`font-['Space_Grotesk'] ${w.layout === "wide" ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"} text-[#F5F5F7] mb-2 font-medium tracking-tight`}>{w.title}</h3>
                      <p className={`text-[#B3B3C2] ${w.layout === "wide" ? "text-sm md:text-base" : "text-sm"}`}>{w.desc}</p>
                    </div>
                    {w.layout === "wide" && (
                      <div className="hidden sm:flex h-12 w-12 bg-white/10 backdrop-blur-md text-white rounded-full items-center justify-center group-hover:bg-[#A855F7] transition-all">
                        <ArrowIcon />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AnimatedButton } from "../AnimatedButton";
import { motion } from "motion/react";

const team = [
  {
    name: "Elena Rostova",
    role: "Kreative Leitung",
    desc: "Mit über 10 Jahren Erfahrung im Marken-Design leitet Elena die visuelle Richtung jedes Projekts. Sie stellt sicher, dass jedes Content-Element mit der Markenidentität des Kunden übereinstimmt und gleichzeitig kreative Grenzen verschiebt.",
    img: "https://images.unsplash.com/photo-1772987292949-4b1bdc01a612?q=80&w=800&auto=format&fit=crop",
    socials: ["Instagram", "LinkedIn"],
    portfolio: [
      { title: "Aura Skincare", type: "Markenidentität", img: "https://images.unsplash.com/photo-1774812809773-dc04ca8afe92?q=80&w=800&auto=format&fit=crop" },
      { title: "Lumina Tech", type: "Visuelles System", img: "https://images.unsplash.com/photo-1603651397449-eaa6fcfc3e28?q=80&w=800&auto=format&fit=crop" }
    ]
  },
  {
    name: "Marcus Thorne",
    role: "Content Strategie",
    desc: "Marcus schließt die Lücke zwischen Kreativität und Geschäft. Er entwickelt datengestützte Content-Strategien, die auf die Wachstumsziele jedes Kunden und das Verhalten der Zielgruppe abgestimmt sind.",
    img: "https://images.unsplash.com/photo-1629507208649-70919ca33793?q=80&w=800&auto=format&fit=crop",
    socials: ["LinkedIn", "Twitter"],
    portfolio: [
      { title: "FinTech Scale", type: "Wachstumsstrategie", img: "https://images.unsplash.com/photo-1727343501640-0537740f515d?q=80&w=800&auto=format&fit=crop" },
      { title: "Urban Wear", type: "Marktdurchdringung", img: "https://images.unsplash.com/photo-1651390216709-1efea22814ad?q=80&w=800&auto=format&fit=crop" }
    ]
  },
  {
    name: "Sarah Jenkins",
    role: "Videoproduktion",
    desc: "Sarah ist die treibende Kraft hinter unseren reichweitenstarken Videoinhalten. Vom Skript bis zum finalen Schnitt strukturiert sie jedes Reel und Video für maximales Engagement und Watchtime.",
    img: "https://images.unsplash.com/photo-1683203438693-6f96bd2236ec?q=80&w=800&auto=format&fit=crop",
    socials: ["Instagram", "YouTube"],
    portfolio: [
      { title: "Velocity Auto", type: "Werbe-Reel", img: "https://images.unsplash.com/photo-1758310222569-a40a2bed3119?q=80&w=800&auto=format&fit=crop" },
      { title: "Crave Dining", type: "Social Shorts", img: "https://images.unsplash.com/photo-1764664035163-f8f29058e557?q=80&w=800&auto=format&fit=crop" }
    ]
  }
];

export function TeamPage() {
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24" style={{ isolation: "isolate" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 md:mb-20 max-w-3xl"
        >
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">Unser Team</span>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            Die Menschen hinter den <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">Ideen</span>.
          </h1>
          <p className="text-lg text-[#B3B3C2] leading-relaxed">
            Eine fokussierte Gruppe von Kreativen, Strategen und Produzenten, die zusammenarbeiten, um messbares Markenwachstum zu liefern.
          </p>
        </motion.div>

        <div className="flex flex-col gap-24 md:gap-32">
          {team.map((m, i) => (
            <div key={i} className="flex flex-col gap-10">
              {/* Section Header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-px bg-[#A855F7]" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#A855F7] font-semibold">{m.role}</span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-semibold tracking-tight text-[#F5F5F7] mb-5">
                  Branchenführende <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">{m.role}</span>
                </h2>
                <p className="text-lg text-[#B3B3C2] leading-relaxed">
                  Wir sind ungemein stolz darauf, den Goldstandard für {m.role} zu setzen. Unser Team kombiniert unvergleichliche Expertise, preisgekrönte Kreativität und eine rigorose, datengesteuerte Methodik, um kontinuierlich Arbeit zu liefern, die die Konkurrenz in den Schatten stellt. Wir nehmen nicht nur am Markt teil – wir definieren Exzellenz neu.
                </p>
              </motion.div>

              {/* Team Member Card & Portfolio */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-[#0A0A0D]/50 border border-white/5 rounded-[2rem] p-6 md:p-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start shadow-xl backdrop-blur-sm"
              >
              {/* Left Column: Team Member Info */}
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
                <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#121217] shrink-0 border border-white/5 relative">
                  <ImageWithFallback 
                    src={m.img} 
                    alt={m.name} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 grayscale hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0D]/80 via-transparent to-transparent pointer-events-none" />
                </div>
                <div>
                  <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-medium tracking-tight text-[#F5F5F7] mb-1">{m.name}</h2>
                  <p className="text-xs md:text-sm text-[#A855F7] mb-4 font-semibold tracking-wider uppercase">{m.role}</p>
                  <p className="text-[#B3B3C2] text-sm md:text-base leading-relaxed mb-6">{m.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {m.socials.map((s, j) => (
                      <span key={j} className="text-[11px] font-medium tracking-wider uppercase text-[#E0E0E5] px-3 py-1.5 bg-white/5 border border-white/5 rounded-full hover:border-[#7C3AED]/40 hover:text-white hover:bg-white/10 cursor-pointer transition-all">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Portfolio Showcase */}
              <div className="flex-1 w-full mt-4 lg:mt-0">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#71717A] font-semibold">AUSGEWÄHLTE ARBEITEN</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
                  {m.portfolio.map((p, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.2 + (j * 0.15), 
                        ease: [0.21, 0.47, 0.32, 0.98] 
                      }}
                      className="group relative flex flex-col gap-4"
                    >
                      <div className="aspect-[1.4/1] rounded-[20px] overflow-hidden bg-[#121217] relative border border-white/5 shadow-2xl">
                        <ImageWithFallback 
                          src={p.img} 
                          alt={p.title} 
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                      </div>
                      <div className="px-1 mt-2">
                        <h3 className="text-lg lg:text-xl font-semibold text-[#F5F5F7] tracking-tight mb-1">{p.title}</h3>
                        <p className="text-[10px] lg:text-[11px] text-[#A1A1AA] uppercase tracking-[0.2em] font-semibold">{p.type}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}

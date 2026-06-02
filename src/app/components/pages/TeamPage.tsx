import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import { usePageTitle } from "../../hooks/usePageTitle";

// Vite's BASE_URL ("/" on the puron-media.de apex domain; would be a
// subpath like "/Puron/" for a GitHub Pages project page). Using it lets
// the image resolve correctly regardless of where the site is served.
const ASSET_BASE = import.meta.env.BASE_URL;

const team = [
  {
    name: "Mahsuni Akdemir",
    role: "Gründer & Creative",
    desc: "Nach meinem medienbasierten Studium und fünf Jahren paralleler Berufserfahrung habe ich 2026 den Schritt in die Selbstständigkeit gewagt. Mit Puron habe ich einen Raum geschaffen, in dem Kreativität frei entfaltet und in visuellen Konzepten zum Ausdruck gebracht werden kann. Gemeinsam mit unseren Kunden entwickeln wir nicht nur Visionen, sondern verwandeln sie in Inhalte mit nachhaltigem Mehrwert – messbar & wirkungsvoll.",
    img: `${ASSET_BASE}team/mahsuni.png`,
    socials: [
      { label: "Instagram", href: "https://www.instagram.com/puronmedia?igsh=MXhqM2VnOGRxOWkzag==" },
    ],
  },
  // Hidden until additional team members are real:
  // {
  //   name: "Marcus Thorne",
  //   role: "Content Strategie",
  //   desc: "...",
  //   img: "...",
  //   socials: ["LinkedIn", "Twitter"],
  // },
  // {
  //   name: "Sarah Jenkins",
  //   role: "Videoproduktion",
  //   desc: "...",
  //   img: "...",
  //   socials: ["Instagram", "YouTube"],
  // },
];

export function TeamPage() {
  usePageTitle("Unser Team");
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
            Die Köpfe hinter den <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">Ideen</span>.
          </h1>
        </motion.div>

        <div className="flex flex-col gap-24 md:gap-32">
          {team.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#0A0A0D]/50 border border-white/5 rounded-[2rem] p-6 md:p-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start shadow-xl backdrop-blur-sm"
            >
              <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
                {/* Stage for the cut-out portrait. No card frame around the
                    image — the figure floats on the dark page with an
                    ambient purple glow behind it. The drop-shadow gives
                    the cut-out a subtle lift so it doesn't look pasted. */}
                <div className="w-full aspect-[4/5] relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 blur-3xl"
                    style={{
                      background:
                        "radial-gradient(60% 55% at 50% 45%, rgba(124,58,237,0.35), rgba(124,58,237,0.1) 55%, transparent 80%)",
                    }}
                  />
                  <ImageWithFallback
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-contain object-bottom transition-transform duration-700 hover:scale-[1.03]"
                    style={{ filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.55))" }}
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-px bg-[#A855F7]" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#A855F7] font-semibold">{m.role}</span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-semibold tracking-tight text-[#F5F5F7] mb-2">{m.name}</h2>
                <p className="text-sm text-[#A855F7] mb-6 font-semibold tracking-wider uppercase">{m.role}</p>
                <p className="text-[#B3B3C2] text-base md:text-lg leading-relaxed mb-6">{m.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {m.socials.map((s, j) => (
                    <a
                      key={j}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium tracking-wider uppercase text-[#E0E0E5] px-3 py-1.5 bg-white/5 border border-white/5 rounded-full hover:border-[#7C3AED]/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

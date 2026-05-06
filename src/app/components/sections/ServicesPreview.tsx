import { Link } from "react-router";
import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";

const services = [
  {
    keyword: "Reels",
    desc: "– die nicht überscrollt werden",
    icon: (
      <>
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
      </>
    ),
  },
  {
    keyword: "Beiträge",
    desc: "– die nach deiner Marke aussehen",
    icon: (
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </>
    ),
  },
  {
    keyword: "Ads",
    desc: "– die nicht nur laufen, sondern liefern",
    icon: (
      <>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    keyword: "Content Strategie",
    desc: "– die wirklich Sinn macht",
    icon: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
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
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 leading-[1.15]">
            Viele quatschen über Trends – doch wir überzeugen mit{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">visueller Qualität</span>.
          </h2>
          <p className="text-lg text-[#B3B3C2] leading-relaxed mb-8">
            Wir folgen keinen Trends - wir setzen sie. Unser Team besteht aus branchenführenden Experten, die die Kunst der Social Media Produktion und Strategie beherrschen. Wir zeichnen uns dadurch aus, gewöhnliche Marken mit unübertroffener visueller Qualität, datengesteuerter Präzision und Content, der die Konkurrenz konstant übertrifft, in Marktführer zu verwandeln.
          </p>
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
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              >
                <Link
                  to="/services"
                  className="group block p-8 rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-[#7C3AED]/40 hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED] rounded-full blur-[80px] opacity-0 group-hover:opacity-25 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/15 group-hover:border-[#7C3AED]/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-[#A855F7] transition-colors">
                      {s.icon}
                    </svg>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold mb-2 tracking-tight text-[#A855F7]">
                    {s.keyword}
                  </h3>
                  <p className="text-base md:text-lg text-[#B3B3C2] leading-relaxed">
                    {s.desc}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";

const points = [
  { title: "Individuelle Strategie", desc: "Keine Einheitslösungen. Jede Marke erhält einen maßgeschneiderten Ansatz." },
  { title: "Sichtbarkeit & Wiedererkennung", desc: "Content, der minutiös darauf ausgelegt ist, Aufmerksamkeit zu erregen und Markenbekanntheit aufzubauen." },
  { title: "Klarer Business-Fokus", desc: "Wir optimieren auf Ergebnisse - Leads, Sales und Talente - nicht nur auf Likes." },
];

export function WhyPuronSection() {
  return (
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
          {points.map((item, i) => (
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
  );
}

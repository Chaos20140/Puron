import { Link } from "react-router";
import { motion } from "motion/react";

const services = [
  { title: "Reels Produktion", desc: "Kurzvideo-Content für Reichweite, Relevanz und um die Aufmerksamkeit im schnellen Scroll-Feed zu halten.", icon: <><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></> },
  { title: "Social Media Posts", desc: "Gebrandeter statischer und Karussell-Content, der Ihr Unternehmen aktiv, modern und hochprofessionell aussehen lässt.", icon: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></> },
  { title: "Bezahlte Werbung", desc: "Werbemittel und Kampagnen-Assets, strategisch gestaltet, um direkte Sichtbarkeit und messbare Ergebnisse zu generieren.", icon: <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
  { title: "Content Strategie", desc: "Eine maßgeschneiderte, datengestützte Content-Ausrichtung, die ausschließlich auf Ihre spezifischen Geschäftsziele und Zielgruppe abgestimmt ist.", icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></> },
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
          className="mb-16 max-w-2xl"
        >
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">Was wir tun</span>
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl font-semibold tracking-tight mb-6">Fähigkeiten für moderne Plattformen.</h2>
          <p className="text-lg text-[#B3B3C2] leading-relaxed">
            Wir folgen keinen Trends - wir setzen sie. Unser Team besteht aus branchenführenden Experten, die die Kunst der Social Media Produktion und Strategie beherrschen. Wir zeichnen uns dadurch aus, gewöhnliche Marken mit unübertroffener visueller Qualität, datengesteuerter Präzision und Content, der die Konkurrenz konstant übertrifft, in Marktführer zu verwandeln.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
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
  );
}

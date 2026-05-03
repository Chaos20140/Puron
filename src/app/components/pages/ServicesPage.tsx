import { AnimatedButton } from "../AnimatedButton";
import { usePageTitle } from "../../hooks/usePageTitle";

const services = [
  {
    title: "Reels Produktion",
    desc: "Kurzvideo-Content, der für Reichweite, Relevanz und Aufmerksamkeit in einem schnelllebigen Feed entwickelt wurde.",
    details: "Wir konzipieren, filmen und schneiden hochbindende vertikale Videos, optimiert für Instagram Reels, TikTok und YouTube Shorts. Jedes Reel ist darauf ausgelegt, das Scrollen zu stoppen und Engagement zu fördern.",
    icon: <><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></>,
    features: ["Skripting & Storyboarding", "Professioneller Dreh", "Postproduktion & Effekte", "Plattformspezifische Optimierung"],
  },
  {
    title: "Social Media Posts",
    desc: "Gebrandeter statischer und Karussell-Content, der Ihr Unternehmen aktiv, modern und hochprofessionell wirken lässt.",
    details: "Von Einzelbild-Posts bis zu Multi-Slide-Karussells – wir erstellen Inhalte, die Ihre Markengeschichte an jedem Berührungspunkt einheitlich erzählen.",
    icon: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
    features: ["Markenkonformes Design", "Karussell-Storytelling", "Caption- & Hashtag-Strategie", "Content-Kalender-Planung"],
  },
  {
    title: "Bezahlte Werbung",
    desc: "Werbemittel und Kampagnen-Assets, strategisch entwickelt, um direkte Sichtbarkeit und messbare Ergebnisse zu erzielen.",
    details: "Wir entwerfen und produzieren Werbemittel für Meta, Google und LinkedIn, die auf Konversion und ROI getestet und optimiert werden.",
    icon: <><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    features: ["Kreatives Ad-Design", "A/B-Testing von Assets", "Retargeting-Visuals", "Performance-Reporting"],
  },
  {
    title: "Content Strategie",
    desc: "Eine maßgeschneiderte, datengestützte inhaltliche Ausrichtung, basierend ausschließlich auf Ihren spezifischen Geschäftszielen und Ihrer Zielgruppe.",
    details: "Wir entwickeln umfassende Content-Strategien, die mit Ihren Geschäftszielen übereinstimmen und Zielgruppenanalyse, Wettbewerbsforschung sowie Content-Säulen umfassen.",
    icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
    features: ["Zielgruppenforschung", "Content-Säulen-Framework", "Monatliche Content-Pläne", "Performance-Analyse"],
  },
];

export function ServicesPage() {
  usePageTitle("Dienstleistungen");
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:mb-20 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">Unsere Dienstleistungen</span>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            Alles, was Ihre Marke braucht, um <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">herauszustechen</span>.
          </h1>
          <p className="text-lg text-[#B3B3C2] leading-relaxed">Wir bieten eine komplette Palette von Social Media Dienstleistungen, von der Produktion bis zur Strategie. Jede Dienstleistung ist darauf ausgelegt, echte Geschäftsergebnisse zu liefern.</p>
        </div>

        <div className="space-y-8">
          {services.map((s, i) => (
            <div key={i} className="group p-8 md:p-12 rounded-3xl bg-[#121217] border border-white/5 hover:border-[#7C3AED]/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C3AED] rounded-full blur-[100px] opacity-0 group-hover:opacity-15 transition-opacity" />
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-[#7C3AED]/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                  </div>
                  <h2 className="font-['Space_Grotesk'] text-3xl font-medium mb-4 tracking-tight">{s.title}</h2>
                  <p className="text-lg text-[#B3B3C2] leading-relaxed mb-4">{s.desc}</p>
                  <p className="text-sm text-[#B3B3C2]/80 leading-relaxed">{s.details}</p>
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-[#7C3AED] font-medium mb-6">Was beinhaltet ist</h4>
                  <ul className="space-y-4">
                    {s.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </div>
                        <span className="text-[#F5F5F7]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold tracking-tight mb-4">Bereit loszulegen?</h2>
          <p className="text-lg text-[#B3B3C2] mb-8">Lassen Sie uns besprechen, welche Dienstleistungen für Ihre Marke am besten geeignet sind.</p>
          <AnimatedButton to="/contact" variant="primary">
            Zusammenarbeit anfragen
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

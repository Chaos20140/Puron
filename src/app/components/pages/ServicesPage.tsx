import { AnimatedButton } from "../AnimatedButton";
import { usePageTitle } from "../../hooks/usePageTitle";

// No pictographic icons — gradient index numbers (01–04) instead, consistent
// with the homepage ServicesPreview treatment.
const services = [
  {
    title: "Reels",
    desc: "Wir konzipieren, filmen und schneiden hochbindende vertikale Videos, optimiert für Instagram Reels, TikTok und YouTube Shorts. Jedes Reel ist darauf ausgelegt, das Scrollen zu stoppen und Engagement zu fördern.",
    features: ["Skripting & Storyboarding", "Professioneller Dreh", "Postproduktion & Effekte", "Plattformspezifische Optimierung"],
  },
  {
    title: "Beiträge",
    desc: "Von Einzelbild-Posts bis zu Multi-Slide-Karussells – wir erstellen Inhalte, die deine Markengeschichte an jedem Berührungspunkt einheitlich erzählen.",
    features: ["Markenkonformes Design", "Karussell-Storytelling", "Caption- & Hashtag-Strategie", "Content-Kalender-Planung"],
  },
  {
    title: "Ads",
    desc: "Wir entwerfen und produzieren Werbemittel für Meta, Google und LinkedIn, die auf Konversion und ROI getestet und optimiert werden.",
    features: ["Kreatives Ad-Design", "A/B-Testing von Assets", "Retargeting-Visuals", "Performance-Reporting"],
  },
  {
    title: "Content Strategie",
    desc: "Wir entwickeln umfassende Content-Strategien, die mit deinen Geschäftszielen übereinstimmen und Zielgruppenanalyse, Wettbewerbsforschung sowie Content-Säulen umfassen.",
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
          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] md:leading-[1.05] mb-6">
            Was wir{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">zaubern</span>
            <br />
            und wie wir's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">angehen</span>
          </h1>
          <p className="text-base md:text-lg text-[#B3B3C2] leading-relaxed">
            Wir bieten eine komplette Palette von Social Media Dienstleistungen,
            <br />
            von der Produktion bis zur Strategie.
          </p>
        </div>

        <div className="space-y-8">
          {services.map((s, i) => (
            <div key={i} className="group p-8 md:p-12 rounded-3xl bg-[#121217] border border-white/5 hover:border-[#7C3AED]/40 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C3AED] rounded-full blur-[100px] opacity-0 group-hover:opacity-15 transition-opacity" />
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <span
                    aria-hidden="true"
                    className="block font-['Space_Grotesk'] font-bold leading-none mb-6 text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-[#A855F7] to-[#7C3AED] opacity-90 select-none"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-['Space_Grotesk'] text-3xl font-medium mb-4 tracking-tight">{s.title}</h2>
                  <p className="text-base md:text-lg text-[#B3B3C2] leading-relaxed">{s.desc}</p>
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
          <h2 className="font-['Space_Grotesk'] text-3xl font-semibold tracking-tight mb-4">Bereit durchzustarten?</h2>
          <p className="text-lg text-[#B3B3C2] mb-8">Lass uns besprechen, welche Dienstleistungen für deine Marke am besten geeignet ist.</p>
          <AnimatedButton to="/contact" variant="primary">
            Kontakt aufnehmen
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

import { ImageWithFallback } from "../figma/ImageWithFallback";
import { AnimatedButton } from "../AnimatedButton";
import { usePageTitle } from "../../hooks/usePageTitle";

const projects = [
  {
    title: "TechNova Evolution",
    category: "B2B Software",
    type: "Reels & Bezahlte Werbung",
    desc: "Hochkonvertierende Reels und zielgerichtete Werbemittel für B2B-Skalierung. Führte zu 140% ROI-Steigerung innerhalb von 3 Monaten.",
    img: "https://images.unsplash.com/photo-1590649681928-4b179f773bd5?q=80&w=1200&auto=format&fit=crop",
    featured: true,
  },
  {
    title: "Velocity Brand Revamp",
    category: "E-Commerce",
    type: "Komplette Content-Strategie",
    desc: "Umfassende Social-Media-Überarbeitung einschließlich täglichem Content, wöchentlichen Reels und monatlichen Kampagnen-Visuals.",
    img: "https://images.unsplash.com/photo-1622988766425-8ecbae9cef6c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Nova Health Kampagne",
    category: "Gesundheitswesen",
    type: "Markenbekanntheit",
    desc: "Strategische Content-Kampagne zum Aufbau von Vertrauen und Autorität im Gesundheitsbereich auf Instagram und LinkedIn.",
    img: "https://images.unsplash.com/photo-1683089884249-a6c5f364edaf?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Urban Fitness Launch",
    category: "Fitness & Lifestyle",
    type: "Launch-Kampagne",
    desc: "Vollständige Launch-Kampagne einschließlich Teaser-Reels, Countdown-Content und Werbemitteln für die Studioeröffnung.",
    img: "https://images.unsplash.com/photo-1669633971142-99954984ca8a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "FinEdge Recruitment",
    category: "Finanzen",
    type: "Employer Branding",
    desc: "Employer-Branding-Inhalte, um Top-Talente anzuziehen – Behind-the-Scenes-Reels, Team-Spotlights und Kultur-Posts.",
    img: "https://images.unsplash.com/photo-1764664035163-f8f29058e557?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "GreenLeaf Organic",
    category: "Food & Beverage",
    type: "Social Media Posts",
    desc: "Wunderschöne Produktfotografie und Karussell-Posts, die organische Produkte mit einer Premium-Ästhetik präsentieren.",
    img: "https://images.unsplash.com/photo-1758310222569-a40a2bed3119?q=80&w=1200&auto=format&fit=crop",
  },
];

export function ProjectsPage() {
  usePageTitle("Projekte");
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:mb-20 max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">Unsere Arbeit</span>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
            Ausgewählte <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">Projekte</span>
          </h1>
          <p className="text-lg text-[#B3B3C2] leading-relaxed">Eine kuratierte Auswahl von Projekten, die unseren Ansatz bei der Produktion und Strategie von Social Media Inhalten zeigen.</p>
        </div>

        {/* Featured Project */}
        <div className="mb-12">
          <div className="relative h-[400px] md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
            <ImageWithFallback src={projects[0].img} alt={projects[0].title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 grayscale-[0.3] group-hover:grayscale-0" />
            <div className="bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/40 to-transparent absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <span className="px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-white/10 text-white border border-white/10 backdrop-blur-md mb-4 inline-block">Hervorgehobenes Projekt</span>
              <h2 className="font-['Space_Grotesk'] text-3xl md:text-5xl text-[#F5F5F7] mb-3 font-medium tracking-tight">{projects[0].title}</h2>
              <p className="text-[#B3B3C2] max-w-lg leading-relaxed mb-2">{projects[0].desc}</p>
              <div className="flex gap-3 mt-4">
                <span className="text-xs text-[#A855F7] font-medium px-3 py-1 bg-[#7C3AED]/10 rounded-full">{projects[0].category}</span>
                <span className="text-xs text-[#B3B3C2] font-medium px-3 py-1 bg-white/5 rounded-full">{projects[0].type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(1).map((p, i) => (
            <div key={i} className="group rounded-3xl bg-[#121217] border border-white/5 hover:border-[#7C3AED]/40 transition-all duration-500 overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                <ImageWithFallback src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[0.5] group-hover:grayscale-0" />
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="text-[10px] text-[#A855F7] font-medium px-2 py-1 bg-[#7C3AED]/10 rounded-full">{p.category}</span>
                  <span className="text-[10px] text-[#B3B3C2] font-medium px-2 py-1 bg-white/5 rounded-full">{p.type}</span>
                </div>
                <h3 className="font-['Space_Grotesk'] text-xl font-medium tracking-tight mb-2">{p.title}</h3>
                <p className="text-sm text-[#B3B3C2] leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-lg text-[#B3B3C2] mb-6">Möchten Sie Ihre Marke hier sehen?</p>
          <AnimatedButton to="/contact" variant="primary">
            Starten Sie Ihr Projekt
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

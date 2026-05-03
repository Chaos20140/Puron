const clients = [
  { name: "APEX", icon: <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" /></svg> },
  { name: "GLOBAL", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg> },
  { name: "METRICS", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current"><path d="M4 4h4v16H4V4zm6 6h4v10h-4V10zm6-6h4v16h-4V4z" /></svg> },
  { name: "NEXUS", icon: <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="2" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg> },
  { name: "STRIPE", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  { name: "VERTEX", icon: <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V8M5 15l7-7 7 7" /></svg> },
];

const marqueeKeyframes = `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;

function ClientBlock({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center justify-around w-max gap-12 sm:gap-16 md:gap-24 px-8 sm:px-12 flex-shrink-0" aria-hidden={ariaHidden || undefined}>
      {clients.map((c, i) => (
        <div key={i} className="group flex items-center gap-3 text-[#71717A] hover:text-[#A855F7] transition-all duration-300 opacity-50 hover:opacity-100 cursor-pointer">
          {c.icon}
          <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight hidden sm:block">{c.name}</span>
        </div>
      ))}
    </div>
  );
}

export function ClientTicker() {
  return (
    <section className="py-12 border-t border-white/5 bg-[#0A0A0D]/50 relative z-20 overflow-hidden backdrop-blur-[2px]">
      <style>{marqueeKeyframes}</style>
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
  );
}

const clients = [
  {
    name: "KFZ-Gutachter Akdemir",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 14l1.5-4.5A2 2 0 0 1 8.4 8h7.2a2 2 0 0 1 1.9 1.5L19 14" />
        <path d="M3 18v-3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3" />
        <path d="M5 18v2H3v-2" />
        <path d="M21 18v2h-2v-2" />
        <circle cx="7.5" cy="16" r="1" />
        <circle cx="16.5" cy="16" r="1" />
      </svg>
    ),
  },
  {
    name: "Eddys Kfz-Meisterbetrieb",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a4.5 4.5 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4.5 4.5 0 0 0 5.4-5.4l-2.6 2.6a1.5 1.5 0 0 1-2.1 0l-1-1a1.5 1.5 0 0 1 0-2.1z" />
      </svg>
    ),
  },
];

const marqueeKeyframes = `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;

function ClientBlock({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center justify-around w-max gap-12 sm:gap-16 md:gap-24 px-8 sm:px-12 flex-shrink-0" aria-hidden={ariaHidden || undefined}>
      {clients.map((c, i) => (
        <div key={i} className="group flex items-center gap-3 text-[#71717A] hover:text-[#A855F7] transition-all duration-300 opacity-60 hover:opacity-100 cursor-default">
          {c.icon}
          <span className="font-['Space_Grotesk'] font-semibold text-base md:text-lg tracking-tight whitespace-nowrap">{c.name}</span>
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
        <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#B3B3C2] font-medium">Partner, die uns vertrauen</p>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className="flex w-max" style={{ animation: "marquee 22s linear infinite" }}>
          <ClientBlock />
          <ClientBlock ariaHidden />
        </div>
      </div>
    </section>
  );
}

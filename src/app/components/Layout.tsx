import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { PuronLogo } from "./PuronLogo";
import { AnimatedBackground } from "./AnimatedBackground";
import { AnimatedButton } from "./AnimatedButton";
import { ErrorBoundary } from "./ErrorBoundary";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/services", label: "Dienstleistungen" },
    { to: "/projects", label: "Projekte" },
    { to: "/team", label: "Unser Team" },
    { to: "/contact", label: "Kontakt" },
  ];

  return (
    <div className="bg-transparent text-[#F5F5F7] font-['Inter'] antialiased overflow-x-hidden selection:bg-[#7C3AED]/30 selection:text-white min-h-screen">
      {/* Animated 3D Background — already paints purple auroras + nebula glow,
          so we don't add extra blurred radial divs here.
          Wrapped in a silent ErrorBoundary: a canvas crash should not
          take the whole site down — the page just loses the backdrop. */}
      <ErrorBoundary>
        <AnimatedBackground />
      </ErrorBoundary>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0D]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 md:gap-3 group">
            <PuronLogo className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-['Space_Grotesk'] text-lg md:text-xl font-semibold tracking-tight text-[#F5F5F7]">Puron</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors ${location.pathname === l.to ? "text-white" : "text-[#B3B3C2] hover:text-white"}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <AnimatedButton to="/contact" variant="nav" className="!px-3 !py-1.5 sm:!px-4 sm:!py-2 md:!px-5 md:!py-2.5 !text-[10px] sm:!text-[12px] md:!text-sm">
              <span className="sm:hidden">Projekt starten</span>
              <span className="hidden sm:inline">Zusammenarbeit anfragen</span>
            </AnimatedButton>
            <button className="md:hidden p-2 -mr-2 text-[#B3B3C2] hover:text-white transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {mobileOpen ? (
                  <>
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0A0A0D]/95 backdrop-blur-xl border-t border-white/5 px-6 py-8 flex flex-col gap-6 shadow-2xl h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-5">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-[#B3B3C2] hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 pb-8">
              <AnimatedButton to="/contact" fullWidth onClick={() => setMobileOpen(false)}>
                Zusammenarbeit anfragen
              </AnimatedButton>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Footer / Bottom Bar */}
      <footer className="border-t border-white/5 bg-[#050508]/80 backdrop-blur-md mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <PuronLogo className="w-6 h-6 md:w-8 md:h-8" />
              <span className="font-['Space_Grotesk'] text-lg font-semibold tracking-tight text-[#F5F5F7]">Puron Agency</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 md:gap-8 text-sm font-medium">
              <Link to="/services" className="text-[#B3B3C2] hover:text-white transition-colors">Dienstleistungen</Link>
              <Link to="/privacy" className="text-[#B3B3C2] hover:text-white transition-colors">Datenschutz</Link>
              <Link to="/imprint" className="text-[#B3B3C2] hover:text-white transition-colors">Impressum</Link>
            </div>
          </div>
          
          <div className="h-px w-full bg-white/5 mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-xs text-[#71717A] leading-relaxed">
            <div className="max-w-sm">
              <p className="text-[#F5F5F7] font-medium mb-1 uppercase tracking-widest text-[10px]">Büroadresse</p>
              <p>Puron Agency GmbH</p>
              <p>Creative Boulevard 42</p>
              <p>10115 Berlin, Deutschland</p>
            </div>
            
            <div className="text-left md:text-right">
              <p>Website aktiv seit 2024</p>
              <p>Erstellt / Gehostet von <span className="text-[#A855F7] font-medium">Tolunay Usul</span></p>
              <p className="mt-2">&copy; {new Date().getFullYear()} Puron Agency. Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
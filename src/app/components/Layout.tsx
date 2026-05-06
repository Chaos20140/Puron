import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { motion } from "motion/react";
import { PuronLogo } from "./PuronLogo";
import { AnimatedBackground } from "./AnimatedBackground";
import { AnimatedButton } from "./AnimatedButton";
import { ErrorBoundary } from "./ErrorBoundary";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/services", label: "Dienstleistungen" },
    // { to: "/projects", label: "Projekte" }, // hidden until we have a real portfolio
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
          <Link
            to="/"
            aria-label="Puron Media — zur Startseite"
            className="flex items-center gap-2.5 md:gap-3 group"
          >
            {/* Cascade reveal on app mount: icon → wordmark → tagline.
                Layout is mounted once at app start, so this only plays
                once per session — not on route changes. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="shrink-0"
            >
              <PuronLogo className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105" />
            </motion.div>
            <div className="flex flex-col leading-tight">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
                className="font-['Space_Grotesk'] text-base md:text-xl font-bold tracking-tight text-[#A855F7] whitespace-nowrap"
              >
                PURON MEDIA
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
                className="hidden sm:block font-['Space_Grotesk'] text-[9px] md:text-[10px] italic tracking-[0.18em] text-[#B3B3C2] uppercase whitespace-nowrap"
              >
                Social Media &amp; Creative Agency
              </motion.span>
            </div>
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
            <Link
              to="/"
              aria-label="Puron Media — zur Startseite"
              className="flex items-center gap-2.5 md:gap-3 group"
            >
              <PuronLogo className="w-7 h-7 md:w-9 md:h-9 transition-transform duration-300 group-hover:scale-105 shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="font-['Space_Grotesk'] text-base md:text-lg font-bold tracking-tight text-[#A855F7] whitespace-nowrap">
                  PURON MEDIA
                </span>
                <span className="font-['Space_Grotesk'] text-[9px] italic tracking-[0.18em] text-[#B3B3C2] uppercase whitespace-nowrap">
                  Social Media &amp; Creative Agency
                </span>
              </div>
            </Link>
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
              <p>Puron Media</p>
              <p>Meschede, Deutschland</p>
            </div>

            <div className="text-left md:text-right">
              <p>Erstellt / Gehostet von <span className="text-[#A855F7] font-medium">Tolunay Usul</span></p>
              <p className="mt-2">&copy; {new Date().getFullYear()} Puron Media. Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
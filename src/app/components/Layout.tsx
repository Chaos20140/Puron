import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { motion } from "motion/react";
import { PuronLogo } from "./PuronLogo";
import { AnimatedBackground } from "./AnimatedBackground";
import { AnimatedButton } from "./AnimatedButton";
import { ErrorBoundary } from "./ErrorBoundary";
import { WhatsAppButton } from "./WhatsAppButton";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/services", label: "Dienstleistungen" },
    // { to: "/projects", label: "Projekte" }, // hidden until we have a real portfolio
    { to: "/team", label: "Unser Team" },
    { to: "/contact", label: "Kontakt" },
  ];

  // The overlay covers the viewport, so it must not survive a navigation the
  // user triggered some other way (browser back/forward, the WhatsApp FAB, a
  // link inside the panel that points at the current route).
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Escape closes it, and the page behind it must not scroll while it's open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    // `flex flex-col` is load-bearing, not decoration: the footer carries
    // `mt-auto`, which does nothing in a block container. On any viewport taller
    // than the page content — short routes like /team on a large desktop screen
    // — the footer therefore ended in the middle of the window with dead space
    // below it. With the column flex box + `flex-1` on <main>, main absorbs the
    // slack and the footer sits at the bottom.
    <div className="bg-transparent text-[#F5F5F7] font-['Space_Grotesk'] antialiased overflow-x-hidden selection:bg-[#7C3AED]/30 selection:text-white min-h-screen flex flex-col">
      {/* Animated 3D Background — already paints purple auroras + nebula glow,
          so we don't add extra blurred radial divs here.
          Wrapped in a silent ErrorBoundary: a canvas crash should not
          take the whole site down — the page just loses the backdrop. */}
      {/* Keyboard users land here first and can jump past the nav. Visually
          hidden until focused. */}
      <a
        href="#hauptinhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#7C3AED] focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Zum Hauptinhalt springen
      </a>

      <ErrorBoundary>
        <AnimatedBackground />
      </ErrorBoundary>

      {/* Navigation */}
      <nav aria-label="Hauptnavigation" className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0D]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Puron Media — zur Startseite"
            className="flex items-center gap-2.5 md:gap-3 group"
          >
            {/* Cascade reveal on app mount: icon → wordmark image.
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
            {/* Wordmark — the exact brand image (transparent PNG) instead of
                a CSS rebuild, per client request. The hex symbol stays its own
                element to the left; this is only the "PURON MEDIA" lettering. */}
            <motion.img
              src={`${import.meta.env.BASE_URL}wordmark.webp`}
              alt="Puron Media — Social Media & Creative Agency"
              width={420}
              height={116}
              fetchPriority="high"
              decoding="async"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
              className="h-10 md:h-14 w-auto select-none"
              draggable={false}
            />
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
            {/* The only permanently visible CTA on the site. It used to shrink
                to text-[10px] / py-1.5 on phones — about a 25px touch target,
                far below the 44px guideline — on exactly the devices most
                visitors use. The nav is h-16 (64px), so a 44px button fits. */}
            <AnimatedButton to="/contact" variant="nav" className="!px-3.5 !py-2.5 sm:!px-4 sm:!py-2.5 md:!px-5 md:!py-3 !text-[13px] md:!text-sm">
              <span className="sm:hidden">Kontakt</span>
              <span className="hidden sm:inline">Kontakt aufnehmen</span>
            </AnimatedButton>
            <button
              type="button"
              // Without an accessible name this was an unlabelled <button> to a
              // screen reader (Lighthouse: "buttons do not have an accessible
              // name"). aria-expanded/-controls also announce the menu state.
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="md:hidden p-2 -mr-2 text-[#B3B3C2] hover:text-white transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          <div id="mobile-menu" className="md:hidden bg-[#0A0A0D]/95 backdrop-blur-xl border-t border-white/5 px-6 py-8 flex flex-col gap-6 shadow-2xl h-[calc(100vh-4rem)] overflow-y-auto">
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
                Kontakt aufnehmen
              </AnimatedButton>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main id="hauptinhalt" className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Footer / Bottom Bar */}
      <footer className="border-t border-white/5 bg-[#050508]/80 backdrop-blur-md mt-auto shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <Link
              to="/"
              aria-label="Puron Media — zur Startseite"
              className="flex items-center gap-2.5 md:gap-3 group"
            >
              <PuronLogo className="w-7 h-7 md:w-9 md:h-9 transition-transform duration-300 group-hover:scale-105 shrink-0" />
              <img
                src={`${import.meta.env.BASE_URL}wordmark.webp`}
                alt=""
                width={420}
                height={116}
                loading="lazy"
                decoding="async"
                className="h-10 md:h-12 w-auto select-none"
                draggable={false}
              />
            </Link>
            <div className="flex flex-wrap items-center gap-6 md:gap-8 text-sm font-medium">
              <Link to="/services" className="text-[#B3B3C2] hover:text-white transition-colors">Dienstleistungen</Link>
              <Link to="/privacy" className="text-[#B3B3C2] hover:text-white transition-colors">Datenschutz</Link>
              <Link to="/imprint" className="text-[#B3B3C2] hover:text-white transition-colors">Impressum</Link>
            </div>
          </div>

          <div className="h-px w-full bg-white/5 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-xs text-[#8A8A94] leading-relaxed">
            {/* Full NAP (name / address / phone) in the exact spelling of the
                Impressum and the JSON-LD in index.html. A consistent NAP block
                on every page is the standard local-SEO trust anchor; the footer
                previously said only "Meschede, Deutschland" and the site had no
                visible phone number or e-mail outside the contact page. */}
            <div className="max-w-sm">
              <p className="text-[#F5F5F7] font-medium mb-1 uppercase tracking-widest text-[10px]">Büroadresse</p>
              <p>Puron Media</p>
              <p>Birmecker Weg 20</p>
              <p>59872 Meschede</p>
              <p className="mt-2">
                <a href="tel:+491638843453" className="hover:text-white transition-colors">+49 163 8843453</a>
              </p>
              <p>
                <a href="mailto:info@puron-media.de" className="hover:text-white transition-colors">info@puron-media.de</a>
              </p>
            </div>

            <div className="text-left md:text-right">
              <p>Erstellt / Gehostet von <a href="https://axion-studio.de/index.html" target="_blank" rel="noopener noreferrer" className="text-[#A855F7] font-medium hover:underline">Axion Studio</a></p>
              <p className="mt-2">&copy; {new Date().getFullYear()} Puron Media. Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Persistent WhatsApp contact button on every page. */}
      <WhatsAppButton />
    </div>
  );
}
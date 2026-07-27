import { usePageTitle } from "../../hooks/usePageTitle";
import { AnimatedButton } from "../AnimatedButton";

// GitHub Pages serves dist/404.html for EVERY unknown path, so this page also
// catches stale external links and typo'd URLs — not just internal mistakes.
// It used to be two lines of text with no way onward, which meant every one of
// those visitors bounced.
export function NotFoundPage() {
  usePageTitle("Seite nicht gefunden");
  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="font-['Space_Grotesk'] text-6xl font-semibold tracking-tight mb-4">404</h1>
        <p className="text-lg text-[#B3B3C2] mb-8">
          Diese Seite gibt es nicht (mehr). Vielleicht hilft dir einer dieser Wege weiter:
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <AnimatedButton to="/" variant="primary">
            Zur Startseite
          </AnimatedButton>
          <AnimatedButton to="/services" variant="outline">
            Dienstleistungen
          </AnimatedButton>
          <AnimatedButton to="/contact" variant="outline">
            Kontakt
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}

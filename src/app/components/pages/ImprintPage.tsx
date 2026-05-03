import { usePageTitle } from "../../hooks/usePageTitle";

export function ImprintPage() {
  usePageTitle("Impressum");
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-12">Impressum</h1>

        <div className="space-y-8 text-[#B3B3C2] leading-relaxed">
          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Unternehmensangaben</h2>
            <p>Puron Agency GmbH</p>
            <p>Creative Boulevard 42</p>
            <p>10115 Berlin, Deutschland</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Kontakt</h2>
            <p>E-Mail: hello@puron.agency</p>
            <p>Telefon: +49 30 123 456 78</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Geschäftsführung</h2>
            <p>Elena Rostova</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Registereintrag</h2>
            <p>Eingetragen beim: Amtsgericht Berlin-Charlottenburg</p>
            <p>Registernummer: HRB 123456</p>
            <p>Umsatzsteuer-ID: DE123456789</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Verantwortlich für den Inhalt</h2>
            <p>Elena Rostova (Adresse wie oben)</p>
            <p className="mt-4 text-sm">Gemäß &sect; 55 Abs. 2 RStV</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Streitschlichtung</h2>
            <p className="text-sm">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" className="text-[#A855F7] hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></p>
            <p className="text-sm mt-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

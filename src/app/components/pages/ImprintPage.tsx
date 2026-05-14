import { usePageTitle } from "../../hooks/usePageTitle";

// Fill in the placeholders marked [bitte ergänzen] with real values
// before going to a wider audience. As an Einzelunternehmen no
// Handelsregister entry is required, but the §5 TMG details (address,
// contact) and §18 MStV "Verantwortlich für den Inhalt" line are
// legally mandatory for a commercial website in Germany.
export function ImprintPage() {
  usePageTitle("Impressum");
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">Impressum</h1>
        <p className="text-sm text-[#71717A] mb-12">Anbieterkennzeichnung gemäß § 5 TMG</p>

        <div className="space-y-8 text-[#B3B3C2] leading-relaxed">
          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Anbieter</h2>
            <p className="text-[#F5F5F7] font-medium">Mahsuni Akdemir</p>
            <p>Puron Media (Einzelunternehmen)</p>
            <p className="mt-3">[Straße und Hausnummer — bitte ergänzen]</p>
            <p>[PLZ und Ort — bitte ergänzen]</p>
            <p>Deutschland</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Kontakt</h2>
            <p>E-Mail: <a href="mailto:info@puron-media.de" className="text-[#A855F7] hover:underline">info@puron-media.de</a></p>
            <p>Telefon: [bitte ergänzen]</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Umsatzsteuer</h2>
            <p>
              [Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: <span className="font-mono">DEXXXXXXXXX</span> — bitte ergänzen,
              oder ersetzen durch: <em>„Kleinunternehmer gemäß § 19 UStG, daher kein Ausweis der Umsatzsteuer."</em>]
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Verantwortlich für den Inhalt</h2>
            <p>Mahsuni Akdemir (Anschrift wie oben)</p>
            <p className="mt-4 text-sm">Gemäß § 18 Abs. 2 MStV</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Hosting &amp; Bildquellen</h2>
            <p className="text-sm">Diese Website wird gehostet auf <strong className="text-[#F5F5F7]">GitHub Pages</strong> (GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA). Edge-Funktionen (Kontaktformular, Google-Reviews) werden bereitgestellt über <strong className="text-[#F5F5F7]">Supabase</strong> (Supabase Inc., 970 Toa Payoh North, #07-04, Singapore 318992). Verwendete Stockfotos stammen von <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-[#A855F7] hover:underline">Unsplash</a>.</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Streitschlichtung</h2>
            <p className="text-sm">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" className="text-[#A855F7] hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a></p>
            <p className="text-sm mt-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Haftungsausschluss</h2>
            <p className="text-sm">Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität wird jedoch keine Gewähr übernommen. Verlinkungen auf externe Websites erfolgen ohne Einfluss auf deren aktuelle und zukünftige Gestaltung; eine Haftung für deren Inhalte wird ausgeschlossen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

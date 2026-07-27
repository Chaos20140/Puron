import { usePageMeta } from "../../hooks/usePageTitle";
import { ROUTE_META } from "../../seo";

// As an Einzelunternehmen no Handelsregister entry is required, but the
// § 5 DDG details (address, contact) and the § 18 Abs. 2 MStV "Verantwortlich
// für den Inhalt" line are legally mandatory for a commercial website in
// Germany. NOTE: the TMG was superseded by the DDG (Digitale-Dienste-Gesetz)
// on 14 May 2024 — cite § 5 DDG, not § 5 TMG.
export function ImprintPage() {
  usePageMeta(ROUTE_META.imprint.title, ROUTE_META.imprint.description, "/imprint/");
  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">Impressum</h1>
        <p className="text-sm text-[#8A8A94] mb-12">Anbieterkennzeichnung gemäß § 5 DDG</p>

        <div className="space-y-8 text-[#B3B3C2] leading-relaxed">
          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Anbieter</h2>
            <p className="text-[#F5F5F7] font-medium">Mahsuni Akdemir</p>
            <p>Puron Media (Einzelunternehmen)</p>
            <p className="mt-3">Birmecker Weg 20</p>
            <p>59872 Meschede</p>
            <p>Deutschland</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Kontakt</h2>
            <p>E-Mail: <a href="mailto:info@puron-media.de" className="text-[#A855F7] hover:underline">info@puron-media.de</a></p>
            <p>Telefon: <a href="tel:+491638843453" className="text-[#A855F7] hover:underline">+49 163 8843453</a></p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Steuerangaben</h2>
            <p><span className="text-[#F5F5F7] font-medium">Steuernummer:</span> <span className="font-mono">334/5000/5604</span></p>
            <p className="mt-3"><span className="text-[#F5F5F7] font-medium">USt-IdNr. (gemäß § 27a UStG):</span> <span className="font-mono">DE461784730</span></p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Verantwortlich für den Inhalt</h2>
            <p>Mahsuni Akdemir (Anschrift wie oben)</p>
            <p className="mt-4 text-sm">Gemäß § 18 Abs. 2 MStV</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Hosting</h2>
            {/* The Unsplash credit was removed: the only Unsplash images in the
                codebase are in ProjectsPage, whose route is commented out, so
                no reachable page loads one. */}
            <p className="text-sm">Diese Website wird gehostet auf <strong className="text-[#F5F5F7]">GitHub Pages</strong> (GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA). Der Versand des Kontaktformulars läuft über <strong className="text-[#F5F5F7]">Web3Forms</strong>.</p>
          </div>

          <div className="p-8 rounded-3xl bg-[#121217] border border-white/5">
            <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">Streitschlichtung</h2>
            {/* The EU "Online-Streitbeilegung" (OS) platform was SHUT DOWN on
                20 July 2025 — linking to it is now a dead, incorrect reference.
                Only the § 36 VSBG declaration remains required. */}
            <p className="text-sm">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).</p>
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

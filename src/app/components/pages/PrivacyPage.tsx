import { usePageTitle } from "../../hooks/usePageTitle";

export function PrivacyPage() {
  usePageTitle("Datenschutz");
  const sections = [
    {
      title: "1. Verantwortliche Stelle",
      content:
        "Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:\n\nMahsuni Akdemir\nPuron Media (Einzelunternehmen)\nBirmecker Weg 20\n59872 Meschede\nDeutschland\n\nE-Mail: info@puron-media.de\nTelefon: +49 163 8843453",
    },
    {
      title: "2. Zugriffsdaten (Hosting)",
      content:
        "Diese Website wird auf GitHub Pages (GitHub, Inc., USA) gehostet. Beim Aufruf erfasst GitHub automatisch Zugriffsdaten in Server-Logs: anonymisierte IP-Adresse, Datum und Uhrzeit des Zugriffs, übertragene Datenmenge, Quelle/Verweis, Browsertyp und Betriebssystem. Diese Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer technisch fehlerfreien und sicheren Auslieferung der Website (Art. 6 Abs. 1 lit. f DSGVO). Weitere Informationen findest du in der Datenschutzerklärung von GitHub: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
    },
    {
      title: "3. Kontaktaufnahme",
      content:
        "Hinweis: Das Online-Kontaktformular ist derzeit deaktiviert. Du erreichst uns aktuell direkt per E-Mail (info@puron-media.de), telefonisch oder über unser Instagram-Profil. Bei einer Kontaktaufnahme per E-Mail oder Telefon werden die von dir übermittelten Angaben ausschließlich zur Bearbeitung deines Anliegens verwendet (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Wenn du uns über Instagram kontaktierst, gelten zusätzlich die Datenschutzbestimmungen von Meta.\n\nSobald das Kontaktformular wieder verfügbar ist, gilt: Wenn du eine Anfrage über das Kontaktformular sendest, werden die von dir angegebenen Pflichtfelder (Name, E-Mail-Adresse, Nachricht) sowie optionale Angaben (Unternehmen, primäres Ziel) verarbeitet, um dein Anliegen zu bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahme) bzw. lit. f (berechtigtes Interesse an der Beantwortung).\n\nTechnischer Ablauf: Die Daten werden über eine Edge-Funktion auf der Supabase-Plattform (Supabase Inc., Singapore) entgegengenommen und sofort als E-Mail an unsere Postfach-Adresse weitergeleitet — sie werden NICHT in einer Datenbank gespeichert. Der E-Mail-Versand erfolgt über den Drittanbieter Resend (Resend, Inc., USA). Eine pro IP-Adresse vorgehaltene Rate-Limit-Zählung (max. 3 Anfragen pro Stunde) wird kurzfristig in einem Schlüssel-Wert-Speicher bei Supabase gehalten und nach Ablauf des Zeitfensters automatisch gelöscht. Im Honeypot-Feld erkannte Bot-Submissions werden verworfen, ohne dass eine E-Mail versendet wird.",
    },
    {
      title: "4. Google-Rezensionen",
      content:
        "Auf der Startseite zeigen wir öffentliche Google-Rezensionen unseres Unternehmens an. Die Rezensionen werden serverseitig über unsere Edge-Funktion bei Supabase aus der Google Places API (New) abgerufen und für maximal eine Stunde in einem Schlüssel-Wert-Speicher zwischengespeichert. Direkt vom Browser des Besuchers gehen keine Anfragen an Google. Profilbilder der Rezensent:innen werden von Google-Servern (lh3.googleusercontent.com) geladen — dabei wird die IP-Adresse des Besuchers an Google übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Außendarstellung).",
    },
    {
      title: "5. Schriftarten (Google Fonts)",
      content:
        "Diese Website lädt die Schriftarten Inter und Space Grotesk vom Google-Fonts-Dienst (Google Ireland Limited / Google LLC). Beim Laden der Schriftdateien wird deine IP-Adresse an Google übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer ansprechenden und schnell ladenden Darstellung). Weitere Informationen: https://policies.google.com/privacy",
    },
    {
      title: "6. Stockfotos (Unsplash)",
      content:
        "Einzelne Bilder werden über das Content-Delivery-Network von Unsplash (Unsplash Inc., Kanada) eingebunden. Beim Laden eines Bildes wird die IP-Adresse deines Geräts an Unsplash übertragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.",
    },
    {
      title: "7. Google Maps (Standortkarte)",
      content:
        "Auf unserer Kontaktseite binden wir eine interaktive Karte des Dienstes Google Maps ein (Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Beim Laden der Karte wird deine IP-Adresse an Google übertragen, und Google kann Cookies setzen; eine Verarbeitung in den USA ist möglich. Wir nutzen die Karte ausschließlich, um dir unseren Standort anschaulich darzustellen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer leicht auffindbaren Standortdarstellung). Weitere Informationen: https://policies.google.com/privacy",
    },
    {
      title: "8. Cookies",
      content:
        "Diese Website selbst setzt keine Cookies — weder eigene noch von Drittanbietern. Eine Ausnahme bildet die auf der Kontaktseite eingebundene Google-Maps-Karte (siehe Ziffer 7): Beim Laden der Karte kann Google Cookies setzen. Darüber hinaus kommt ausschließlich technisch notwendige lokale Browser-Funktionalität (z.B. localStorage / sessionStorage) zum Einsatz, sofern überhaupt vom Browser angefragt.",
    },
    {
      title: "9. Deine Rechte",
      content:
        "Du hast jederzeit das Recht auf:\n\n- Auskunft über deine bei uns gespeicherten personenbezogenen Daten (Art. 15 DSGVO)\n- Berichtigung unrichtiger Daten (Art. 16 DSGVO)\n- Löschung deiner Daten (Art. 17 DSGVO)\n- Einschränkung der Verarbeitung (Art. 18 DSGVO)\n- Datenübertragbarkeit (Art. 20 DSGVO)\n- Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)\n- Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)\n\nUm diese Rechte auszuüben, kontaktiere uns bitte unter info@puron-media.de.",
    },
    {
      title: "10. Datenaufbewahrung",
      content:
        "Personenbezogene Daten werden nur so lange aufbewahrt, wie es für die Zwecke ihrer Erhebung erforderlich ist oder das Gesetz es vorschreibt. Über das Kontaktformular eingegangene E-Mails werden in unserem Postfach abgelegt und nach Abschluss der Korrespondenz spätestens nach 12 Monaten gelöscht, sofern keine laufende Geschäftsbeziehung besteht oder gesetzliche Aufbewahrungsfristen entgegenstehen.",
    },
    {
      title: "11. Änderungen dieser Datenschutzerklärung",
      content:
        "Diese Datenschutzerklärung kann von Zeit zu Zeit aktualisiert werden, um Änderungen in unseren Diensten oder der Rechtslage abzubilden. Die jeweils aktuelle Version findest du immer auf dieser Seite.\n\nStand: Juni 2026.",
    },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Soft hyphen so this long compound wraps cleanly as
            "Datenschutz-/erklärung" on narrow phones instead of overflowing.
            More reliable than hyphens-auto, which needs a browser hyphenation
            dictionary that isn't always present. */}
        <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-12">{"Datenschutz­erklärung"}</h1>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#121217] border border-white/5">
              <h2 className="font-['Space_Grotesk'] text-xl font-medium text-[#F5F5F7] mb-4">{s.title}</h2>
              <p className="text-sm text-[#B3B3C2] leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

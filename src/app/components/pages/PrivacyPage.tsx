import { usePageMeta } from "../../hooks/usePageTitle";
import { ROUTE_META } from "../../seo";

export function PrivacyPage() {
  usePageMeta(ROUTE_META.privacy.title, ROUTE_META.privacy.description, "/privacy/");
  const sections = [
    {
      title: "1. Verantwortliche Stelle",
      content:
        "Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:\n\nMahsuni Akdemir\nPuron Media (Einzelunternehmen)\nBirmecker Weg 20\n59872 Meschede\nDeutschland\n\nE-Mail: info@puron-media.de\nTelefon: +49 163 8843453",
    },
    {
      title: "2. Zugriffsdaten (Hosting)",
      content:
        "Diese Website wird auf GitHub Pages (GitHub, Inc., USA) gehostet. Beim Aufruf erfasst GitHub automatisch Zugriffsdaten in Server-Logs: die IP-Adresse des anfragenden Geräts, Datum und Uhrzeit des Zugriffs, übertragene Datenmenge, Quelle/Verweis, Browsertyp und Betriebssystem. Auf Inhalt, Umfang und Speicherdauer dieser Protokolle haben wir keinen Einfluss; sie werden von GitHub als Hoster in eigener Verantwortung erhoben. Da GitHub, Inc. seinen Sitz in den USA hat, findet dabei eine Übermittlung in ein Drittland statt (siehe Abschnitt 7). Diese Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer technisch fehlerfreien und sicheren Auslieferung der Website (Art. 6 Abs. 1 lit. f DSGVO). Weitere Informationen findest du in der Datenschutzerklärung von GitHub: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement",
    },
    {
      title: "3. Kontaktformular",
      content:
        "Wenn du eine Anfrage über das Kontaktformular sendest, werden die von dir angegebenen Pflichtfelder (Name, E-Mail-Adresse, Nachricht) sowie optionale Angaben (Unternehmen, primäres Ziel) verarbeitet, um dein Anliegen zu bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahme) bzw. lit. f (berechtigtes Interesse an der Beantwortung). Alternativ kannst du uns direkt per E-Mail (info@puron-media.de), telefonisch, per WhatsApp oder über Instagram erreichen; dabei gelten zusätzlich die Datenschutzbestimmungen des jeweiligen Anbieters (z.B. Meta Platforms für WhatsApp/Instagram).\n\nTechnischer Ablauf: Das Formular übermittelt deine Angaben direkt aus deinem Browser an den Formular-Dienst Web3Forms (web3forms.com), der sie als E-Mail an unser Postfach (info@puron-media.de) weiterleitet. Wir speichern die Anfrage nicht in einer eigenen Datenbank. Web3Forms verarbeitet die übermittelten Daten ausschließlich zur Zustellung der E-Mail und setzt zur Spam-Abwehr technische Prüfungen ein (dabei kann u.a. deine IP-Adresse verarbeitet werden). Einzelheiten findest du in der Datenschutzerklärung von Web3Forms: https://web3forms.com/privacy. Im Honeypot-Feld erkannte Bot-Eingaben werden clientseitig verworfen, ohne dass eine Nachricht gesendet wird.",
    },
    {
      title: "4. Google-Rezensionen",
      content:
        "Auf der Startseite zeigen wir öffentliche Google-Rezensionen unseres Unternehmens an. Diese Texte sind fester Bestandteil der Website und werden nicht live abgerufen: Beim Aufruf der Seite findet keinerlei Verbindung zu Google oder einem anderen Dienst statt — weder aus deinem Browser noch von unserem Server. Auch die Profilbilder der Rezensent:innen binden wir nicht ein, stattdessen zeigen wir einen Platzhalter mit dem Anfangsbuchstaben. Erst wenn du eine Rezension anklickst, öffnet sich das Google-Profil in einem neuen Tab; ab dann gilt die Datenschutzerklärung von Google. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Außendarstellung).",
    },
    {
      title: "5. Schriftarten",
      content:
        "Die verwendete Schriftart (Space Grotesk) wird von unserem eigenen Server ausgeliefert und nicht von Google Fonts nachgeladen. Beim Aufruf der Website wird deshalb keine Verbindung zu Servern von Google aufgebaut und keine IP-Adresse an Google übertragen.",
    },
    {
      title: "6. Cookies und lokale Speicherung",
      content:
        "Diese Website setzt keine Cookies — weder eigene noch von Drittanbietern. Es werden auch keine Daten in localStorage oder sessionStorage deines Browsers abgelegt. Ein Cookie-Banner ist deshalb nicht erforderlich.",
    },
    {
      title: "7. Übermittlung in Drittländer & Auftragsverarbeitung",
      content:
        "Ein Teil der eingesetzten Dienstleister verarbeitet Daten außerhalb der EU bzw. des EWR:\n\n- GitHub, Inc. (USA) — Hosting dieser Website\n- Web3Forms — technische Zustellung des Kontaktformulars, ausschließlich beim Absenden\n\nSoweit die Anbieter unter dem EU-US Data Privacy Framework zertifiziert sind, erfolgt die Übermittlung auf dieser Grundlage (Art. 45 DSGVO); im Übrigen auf Basis der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Mit Dienstleistern, die personenbezogene Daten in unserem Auftrag verarbeiten, bestehen Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO. Trotz dieser Garantien lässt sich ein Zugriff durch US-Behörden nicht vollständig ausschließen.",
    },
    {
      title: "8. Deine Rechte",
      content:
        "Du hast jederzeit das Recht auf:\n\n- Auskunft über deine bei uns gespeicherten personenbezogenen Daten (Art. 15 DSGVO)\n- Berichtigung unrichtiger Daten (Art. 16 DSGVO)\n- Löschung deiner Daten (Art. 17 DSGVO)\n- Einschränkung der Verarbeitung (Art. 18 DSGVO)\n- Datenübertragbarkeit (Art. 20 DSGVO)\n- Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)\n- Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)\n\nUm diese Rechte auszuüben, kontaktiere uns bitte unter info@puron-media.de.",
    },
    {
      title: "9. Datenaufbewahrung",
      content:
        "Personenbezogene Daten werden nur so lange aufbewahrt, wie es für die Zwecke ihrer Erhebung erforderlich ist oder das Gesetz es vorschreibt. Über das Kontaktformular eingegangene E-Mails werden in unserem Postfach abgelegt und nach Abschluss der Korrespondenz spätestens nach 12 Monaten gelöscht, sofern keine laufende Geschäftsbeziehung besteht oder gesetzliche Aufbewahrungsfristen entgegenstehen.",
    },
    {
      title: "10. Änderungen dieser Datenschutzerklärung",
      content:
        "Diese Datenschutzerklärung kann von Zeit zu Zeit aktualisiert werden, um Änderungen in unseren Diensten oder der Rechtslage abzubilden. Die jeweils aktuelle Version findest du immer auf dieser Seite.\n\nStand: Juli 2026.",
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

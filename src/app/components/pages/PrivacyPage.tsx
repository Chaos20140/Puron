export function PrivacyPage() {
  const sections = [
    { title: "1. Verantwortliche Stelle", content: "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:\n\nPuron Agency GmbH\nCreative Boulevard 42\n10115 Berlin, Deutschland\nE-Mail: hello@puron.agency" },
    { title: "2. Datenerfassung auf unserer Website", content: "Wenn Sie unsere Website besuchen, erfasst unser Webserver automatisch technische Daten wie Ihre IP-Adresse, den Browsertyp, das Betriebssystem, die verweisende URL, Datum und Uhrzeit des Zugriffs sowie die besuchten Seiten. Diese Daten werden auf Grundlage unseres berechtigten Interesses verarbeitet, um die technische Funktionalität und Sicherheit unserer Website zu gewährleisten." },
    { title: "3. Kontaktformular", content: "Wenn Sie eine Anfrage über unser Kontaktformular senden, werden die von Ihnen angegebenen Daten (Name, Unternehmen, E-Mail, Nachricht und ausgewähltes Ziel) zum Zwecke der Bearbeitung Ihrer Anfrage verarbeitet. Wir verwenden diese Daten ausschließlich zur Beantwortung Ihrer Anfrage und geben sie ohne Ihre Zustimmung nicht an Dritte weiter." },
    { title: "4. Cookies", content: "Unsere Website verwendet Cookies, um die bestmögliche Benutzererfahrung zu gewährleisten. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Sie können Ihren Browser so konfigurieren, dass er Cookies ablehnt, was jedoch die Funktionalität der Website einschränken kann." },
    { title: "5. Dienste von Drittanbietern", content: "Wir nutzen folgende Dienste von Drittanbietern:\n\n- Google Fonts: Zur Darstellung von Web-Schriftarten. Google kann dabei Ihre IP-Adresse erfassen.\n- Unsplash: Für die auf unserer Website verwendeten Stockfotos.\n\nDiese Dienste können Daten gemäß ihren eigenen Datenschutzrichtlinien erfassen." },
    { title: "6. Ihre Rechte", content: "Sie haben das Recht auf:\n\n- Auskunft über die von uns über Sie gespeicherten personenbezogenen Daten\n- Berichtigung unrichtiger Daten\n- Löschung Ihrer Daten\n- Einschränkung der Verarbeitung Ihrer Daten\n- Datenübertragbarkeit\n- Widerspruch gegen die Verarbeitung\n\nUm diese Rechte auszuüben, kontaktieren Sie uns bitte unter hello@puron.agency." },
    { title: "7. Datenaufbewahrung", content: "Wir bewahren personenbezogene Daten nur so lange auf, wie es für die Zwecke, für die sie erhoben wurden, erforderlich ist, oder wie es das Gesetz vorschreibt. Über das Kontaktformular gesendete Daten werden in der Regel nach 12 Monaten gelöscht, sofern keine laufende Geschäftsbeziehung besteht." },
    { title: "8. Änderungen dieser Richtlinie", content: "Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Die neueste Version wird immer auf dieser Seite verfügbar sein. Zuletzt aktualisiert: Januar 2024." },
  ];

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-12">Datenschutzrichtlinien</h1>

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

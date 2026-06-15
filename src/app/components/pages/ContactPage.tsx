import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";
import { usePageTitle } from "../../hooks/usePageTitle";
import { whatsappUrl } from "../../whatsapp";

// The email contact form is temporarily removed while the Resend mail
// pipeline is being fixed (the /contact edge endpoint still exists for when
// it returns). Until then the page offers direct channels + a location map.
const EMAIL = "info@puron-media.de";
const INSTAGRAM_URL =
  "https://www.instagram.com/puronmedia?igsh=MXhqM2VnOGRxOWkzag==";
const PHONE_DISPLAY = "+49 163 8843453";
const PHONE_HREF = "tel:+491638843453";

const ADDRESS_LINE1 = "Birmecker Weg 20";
const ADDRESS_LINE2 = "59872 Meschede";
const MAPS_QUERY = "Birmecker Weg 20, 59872 Meschede";
// Keyless embed (no Google Maps API key needed). The dark CSS filter blends
// it into the theme; hovering reveals the true colours. frame-src for
// google.com/maps.google.com is whitelisted in the CSP (vite.config.ts + _headers).
const MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&z=15&output=embed`;
const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`;

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" {...iconProps}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.744-.927zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const PinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

type Method = {
  label: string;
  value: string;
  hint: string;
  href: string;
  external: boolean;
  icon: React.ReactNode;
};

const methods: Method[] = [
  {
    label: "E-Mail",
    value: EMAIL,
    hint: "Schreib uns deine Anfrage — wir antworten schnell.",
    href: `mailto:${EMAIL}`,
    external: false,
    icon: <MailIcon />,
  },
  {
    label: "WhatsApp",
    value: "Direkt chatten",
    hint: "Schreib uns – wir antworten meist in Minuten.",
    href: whatsappUrl(),
    external: true,
    icon: <WhatsAppIcon />,
  },
  {
    label: "Instagram",
    value: "@puronmedia",
    hint: "Folge uns & schick uns einfach eine DM.",
    href: INSTAGRAM_URL,
    external: true,
    icon: <InstagramIcon />,
  },
  {
    label: "Telefon",
    value: PHONE_DISPLAY,
    hint: "Lieber direkt? Ruf uns kurz an.",
    href: PHONE_HREF,
    external: false,
    icon: <PhoneIcon />,
  },
];

export function ContactPage() {
  usePageTitle("Kontakt");

  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24 relative" style={{ isolation: "isolate" }}>
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Bereit durchzustarten?
          </h1>
          <p className="text-lg text-[#B3B3C2] max-w-xl mx-auto">
            Erreich uns direkt — per E-Mail, WhatsApp oder Instagram. Oder schau,
            wo du uns in Meschede findest. Wir freuen uns auf deine Nachricht.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Direct contact channels */}
          <div className="space-y-4">
            {methods.map((m, i) => (
              <motion.a
                key={m.label}
                href={m.href}
                {...(m.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex items-center gap-4 p-5 md:p-6 rounded-2xl bg-[#121217] border border-white/5 hover:border-[#7C3AED]/40 hover:bg-[#15151b] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-12px_rgba(124,58,237,0.5)]"
              >
                <span className="shrink-0 w-12 h-12 rounded-xl bg-[#7C3AED]/15 ring-1 ring-[#7C3AED]/20 flex items-center justify-center text-[#A855F7] transition-colors duration-300 group-hover:bg-[#7C3AED]/25">
                  {m.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] uppercase tracking-[0.14em] text-[#71717A]">
                    {m.label}
                  </span>
                  <span className="block text-[#F5F5F7] font-medium truncate">{m.value}</span>
                  <span className="block text-xs text-[#B3B3C2] mt-0.5">{m.hint}</span>
                </span>
                <span className="shrink-0 text-[#71717A] transition-all duration-300 group-hover:text-[#A855F7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowIcon />
                </span>
              </motion.a>
            ))}

            <p className="flex items-center gap-2 pt-2 text-sm text-[#71717A]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_2px_rgba(168,85,247,0.6)]" />
              Antwort in der Regel innerhalb von 24 Stunden.
            </p>
          </div>

          {/* Location map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl bg-[#121217] border border-white/5 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="relative flex-1 min-h-[260px] md:min-h-[360px]">
              <iframe
                title="Standort von Puron Media — Birmecker Weg 20, 59872 Meschede"
                src={MAPS_EMBED}
                loading="lazy"
                className="absolute inset-0 w-full h-full border-0"
                // Inline (not a Tailwind arbitrary class): the CSS minifier strips
                // the spaces between filter functions in arbitrary values, which
                // makes the whole filter invalid. Inline style is left untouched.
                style={{ filter: "invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(0.85) saturate(0.85)" }}
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
            </div>
            <div className="flex items-center justify-between gap-4 p-5 md:p-6 border-t border-white/5">
              <div className="flex items-start gap-3 min-w-0">
                <span className="shrink-0 mt-0.5 text-[#A855F7]">
                  <PinIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-[#F5F5F7] font-medium leading-tight truncate">{ADDRESS_LINE1}</p>
                  <p className="text-sm text-[#B3B3C2]">{ADDRESS_LINE2}</p>
                </div>
              </div>
              <AnimatedButton
                href={MAPS_DIRECTIONS}
                variant="outline"
                className="shrink-0 whitespace-nowrap !px-4 !py-2.5 !text-[13px]"
              >
                Route planen
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#7C3AED]/10 blur-[110px] rounded-full pointer-events-none" />
    </section>
  );
}

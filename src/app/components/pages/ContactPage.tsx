import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";
import { usePageTitle } from "../../hooks/usePageTitle";

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
            Erreich uns direkt — per E-Mail oder auf Instagram. Oder schau, wo
            du uns in Meschede findest. Wir freuen uns auf deine Nachricht.
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

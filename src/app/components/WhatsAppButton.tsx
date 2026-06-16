import { motion } from "motion/react";
import { whatsappUrl } from "../whatsapp";

// Floating WhatsApp contact button — fixed bottom-right on every page (mounted
// in Layout). WhatsApp brand green (#25D366) is intentional: it's the
// instantly-recognised "message us" affordance, so we keep the convention even
// on the dark/purple site, and integrate it with a soft glow + a hover label
// that matches the rest of the UI. Touch target is 56px (> the 44px minimum).
export function WhatsAppButton() {
  return (
    <motion.a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Per WhatsApp kontaktieren"
      title="Schreib uns auf WhatsApp"
      initial={{ opacity: 0, scale: 0.5, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      className="group fixed bottom-5 right-5 md:bottom-6 md:right-6 z-40"
    >
      {/* Hover label (pointer devices only) — slides out to the left of the FAB. */}
      <span className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-[#0A0A0D]/95 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-all duration-300 md:block group-hover:translate-x-0 group-hover:opacity-100">
        Schreib uns auf WhatsApp
      </span>

      {/* Attention pulse — a green ring radiating out from behind the button.
          motion-safe only: prefers-reduced-motion users get a static button.
          Sits behind the solid circle (DOM order), so only the expanding edge
          shows as a ring. Cheap (a single 56px transform+opacity animation). */}
      <span
        aria-hidden="true"
        style={{ animationDuration: "2.2s" }}
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping"
      />

      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.45)] ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.744-.927zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
        </svg>
      </span>
    </motion.a>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";
import { usePageTitle } from "../../hooks/usePageTitle";
import { whatsappUrl } from "../../whatsapp";

// Web3Forms access key. It's a PUBLIC client-side key on purpose: Web3Forms'
// free plan only accepts browser submissions, so the form posts straight to
// their API. The key only ever delivers to the recipient configured in the
// Web3Forms dashboard (info@puron-media.de) — so worst case is spam to that
// inbox, which Web3Forms' own spam filter + the honeypot below mitigate.
const WEB3FORMS_ACCESS_KEY = "6a3ac9fb-3c95-4113-976e-cc97d287f139";

const goals = [
  "Mehr Kunden",
  "Mehr Bewerber",
  "Mehr Sichtbarkeit",
  "Stärkeres Markenimage",
  "Noch nicht sicher",
];

const INSTAGRAM_URL =
  "https://www.instagram.com/puronmedia?igsh=MXhqM2VnOGRxOWkzag==";

type ValidatedField = "name" | "email" | "company" | "message";

type FormFields = {
  name: string;
  company: string;
  email: string;
  message: string;
  website: string; // honeypot — must stay empty
};

const emptyForm: FormFields = {
  name: "",
  company: "",
  email: "",
  message: "",
  website: "",
};

const MAX = { name: 100, company: 100, email: 200, message: 2000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = Partial<Record<ValidatedField, string>>;

function validate(form: FormFields): FormErrors {
  const errors: FormErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (!name) errors.name = "Bitte gib deinen Namen an.";
  else if (form.name.length > MAX.name) errors.name = `Maximal ${MAX.name} Zeichen.`;

  if (!email) errors.email = "Bitte gib deine E-Mail-Adresse an.";
  else if (form.email.length > MAX.email) errors.email = `Maximal ${MAX.email} Zeichen.`;
  else if (!EMAIL_RE.test(email)) errors.email = "Das sieht nicht wie eine gültige E-Mail aus.";

  if (form.company.length > MAX.company) errors.company = `Maximal ${MAX.company} Zeichen.`;

  if (!message) errors.message = "Bitte beschreibe kurz dein Anliegen.";
  else if (form.message.length > MAX.message) errors.message = `Maximal ${MAX.message} Zeichen.`;

  return errors;
}

const inputBase =
  "w-full bg-[#0A0A0D] border rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all disabled:opacity-60";
const inputOk = "border-white/10 focus:border-[#7C3AED] focus:ring-[#7C3AED]";
const inputErr = "border-red-500/60 focus:border-red-500 focus:ring-red-500";

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.744-.927zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
  </svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

type Channel = { label: string; value: string; href: string; external: boolean; icon: React.ReactNode };
const channels: Channel[] = [
  { label: "E-Mail", value: "info@puron-media.de", href: "mailto:info@puron-media.de", external: false, icon: <MailIcon /> },
  { label: "WhatsApp", value: "Chat starten", href: whatsappUrl(), external: true, icon: <WhatsAppIcon /> },
  { label: "Instagram", value: "@puronmedia", href: INSTAGRAM_URL, external: true, icon: <InstagramIcon /> },
  { label: "Telefon", value: "+49 163 8843453", href: "tel:+491638843453", external: false, icon: <PhoneIcon /> },
];

export function ContactPage() {
  usePageTitle("Kontakt");
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<ValidatedField, boolean>>>({});

  const errors = validate(form);
  const showErr = (f: ValidatedField) => Boolean(touched[f] && errors[f]);

  const update =
    (field: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [field]: e.target.value }));

  const blur = (f: ValidatedField) => () => setTouched((t) => ({ ...t, [f]: true }));

  const inputClass = (f: ValidatedField) => `${inputBase} ${showErr(f) ? inputErr : inputOk}`;

  const fieldA11y = (f: ValidatedField) =>
    showErr(f)
      ? { "aria-invalid": true as const, "aria-describedby": `${f}-error` }
      : {};

  const FieldError = ({ field }: { field: ValidatedField }) =>
    showErr(field) ? (
      <p id={`${field}-error`} role="alert" className="text-xs text-red-400 mt-1.5">
        {errors[field]}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Mark every validated field as touched so any error becomes visible.
    setTouched({ name: true, email: true, company: true, message: true });
    if (Object.keys(errors).length > 0) return;

    // Honeypot: if the hidden field got filled, a bot did it — pretend success
    // without sending anything.
    if (form.website.trim() !== "") {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Neue Anfrage von ${form.name.trim() || "Website-Besucher"}`,
          from_name: "Puron Kontaktformular",
          replyto: form.email.trim(),
          botcheck: "",
          Name: form.name.trim(),
          "E-Mail": form.email.trim(),
          Unternehmen: form.company.trim() || "—",
          "Primäres Ziel": selectedGoal || "—",
          Nachricht: form.message.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { success?: boolean }
        | null;
      if (!res.ok || data?.success !== true) {
        setError(
          "Anfrage konnte gerade nicht gesendet werden. Bitte versuch es später erneut – oder erreich uns direkt per WhatsApp, E-Mail oder Telefon (siehe unten).",
        );
        return;
      }
      setForm(emptyForm);
      setSelectedGoal("");
      setTouched({});
      setSubmitted(true);
    } catch {
      setError(
        "Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-24 md:pt-32 pb-16 md:pb-24 min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#7C3AED]/20 flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">Vielen Dank!</h1>
          <p className="text-lg text-[#B3B3C2] mb-8">Ihre Anfrage ist eingegangen. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden, um eine mögliche Zusammenarbeit zu besprechen.</p>
          <AnimatedButton variant="outline" onClick={() => setSubmitted(false)}>
            Weitere Anfrage senden
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">Bereit durchzustarten?</h1>
          <p className="text-lg text-[#B3B3C2]">Schreib uns ein paar Zeilen &amp; wir melden uns bei dir — oder erreich uns direkt per WhatsApp, E-Mail oder Telefon.</p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 bg-[#121217] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl"
        >
          {/* Honeypot — hidden from users, attractive to dumb bots. Do NOT
              add aria-hidden because some bots skip those; rely on layout. */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
          >
            <label htmlFor="website">Website (bitte leer lassen)</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={update("website")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#B3B3C2] mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={update("name")}
                onBlur={blur("name")}
                placeholder="Max Mustermann"
                required
                maxLength={MAX.name}
                autoComplete="name"
                disabled={submitting}
                className={inputClass("name")}
                {...fieldA11y("name")}
              />
              <FieldError field="name" />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#B3B3C2] mb-2">Unternehmen</label>
              <input
                type="text"
                id="company"
                name="company"
                value={form.company}
                onChange={update("company")}
                onBlur={blur("company")}
                placeholder="Muster GmbH"
                maxLength={MAX.company}
                autoComplete="organization"
                disabled={submitting}
                className={inputClass("company")}
                {...fieldA11y("company")}
              />
              <FieldError field="company" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#B3B3C2] mb-2">E-Mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={update("email")}
              onBlur={blur("email")}
              placeholder="max@beispiel.de"
              required
              maxLength={MAX.email}
              autoComplete="email"
              disabled={submitting}
              className={inputClass("email")}
              {...fieldA11y("email")}
            />
            <FieldError field="email" />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label htmlFor="message" className="block text-sm font-medium text-[#B3B3C2]">Worum geht's genau?</label>
              <span className={`text-xs tabular-nums ${form.message.length > MAX.message ? "text-red-400" : "text-[#71717A]"}`}>
                {form.message.length}/{MAX.message}
              </span>
            </div>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={update("message")}
              onBlur={blur("message")}
              placeholder="Erzählen Sie uns von Ihren aktuellen Herausforderungen..."
              required
              maxLength={MAX.message}
              disabled={submitting}
              className={`${inputClass("message")} resize-none`}
              {...fieldA11y("message")}
            />
            <FieldError field="message" />
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-[#B3B3C2]">Primäres Ziel (Optional)</label>
            <div className="flex flex-wrap gap-3">
              {goals.map((g) => (
                <button
                  key={g}
                  type="button"
                  disabled={submitting}
                  onClick={() => setSelectedGoal(g === selectedGoal ? "" : g)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${selectedGoal === g ? "bg-[#7C3AED]/10 border-[#7C3AED] text-white" : "border-white/10 bg-[#0A0A0D] text-[#B3B3C2] hover:border-white/30"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <div className="pt-4">
            <AnimatedButton
              type="submit"
              variant="primary"
              fullWidth
              className="!rounded-xl !py-4 !text-base"
            >
              {submitting ? "Wird gesendet…" : "Anfrage senden"}
            </AnimatedButton>
          </div>
        </form>

        {/* Direct channels — always available, even while a submission settles. */}
        <div className="mt-12">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-[#71717A] mb-5">Oder direkt erreichen</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#121217] border border-white/5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7C3AED]/40 hover:bg-[#15151b]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C3AED]/15 text-[#A855F7] ring-1 ring-[#7C3AED]/20 transition-colors duration-300 group-hover:bg-[#7C3AED]/25">
                  {c.icon}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#71717A]">{c.label}</span>
                <span className="max-w-full truncate text-xs text-[#B3B3C2]">{c.value}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

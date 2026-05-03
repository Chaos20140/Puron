import { useState } from "react";
import { AnimatedButton } from "../AnimatedButton";

export function ContactPage() {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const goals = ["Mehr Kunden", "Mehr Bewerber", "Mehr Sichtbarkeit", "Stärkeres Markenimage", "Noch nicht sicher"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-semibold tracking-tight mb-4">Lassen Sie uns über Ihre Marke sprechen</h1>
          <p className="text-lg text-[#B3B3C2]">Sagen Sie uns, was Sie brauchen, und hinterlassen Sie Ihre E-Mail. Wir melden uns bei Ihnen, um eine mögliche Zusammenarbeit zu besprechen.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#121217] p-8 md:p-12 rounded-3xl border border-white/5 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-[#B3B3C2]">Name</label>
              <input type="text" id="name" placeholder="Max Mustermann" required className="w-full bg-[#0A0A0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium text-[#B3B3C2]">Unternehmen</label>
              <input type="text" id="company" placeholder="Muster GmbH" className="w-full bg-[#0A0A0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[#B3B3C2]">E-Mail</label>
            <input type="email" id="email" placeholder="max@beispiel.de" required className="w-full bg-[#0A0A0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all" />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-[#B3B3C2]">Wobei benötigen Sie Hilfe?</label>
            <textarea id="message" rows={4} placeholder="Erzählen Sie uns von Ihren aktuellen Herausforderungen..." required className="w-full bg-[#0A0A0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all resize-none" />
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-[#B3B3C2]">Primäres Ziel (Optional)</label>
            <div className="flex flex-wrap gap-3">
              {goals.map((g) => (
                <button key={g} type="button" onClick={() => setSelectedGoal(g === selectedGoal ? "" : g)} className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 hover:scale-[1.05] active:scale-95 ${selectedGoal === g ? "bg-[#7C3AED]/10 border-[#7C3AED] text-white" : "border-white/10 bg-[#0A0A0D] text-[#B3B3C2] hover:border-white/30"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <AnimatedButton type="submit" variant="primary" fullWidth className="!rounded-xl !py-4 !text-base">
              Anfrage senden
            </AnimatedButton>
          </div>
        </form>

        <div className="mt-16 grid sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-[#121217] border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <p className="text-sm text-[#F5F5F7] font-medium mb-1">E-Mail</p>
            <p className="text-xs text-[#B3B3C2]">hello@puron.agency</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#121217] border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </div>
            <p className="text-sm text-[#F5F5F7] font-medium mb-1">Instagram</p>
            <p className="text-xs text-[#B3B3C2]">@puron.agency</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#121217] border border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
            </div>
            <p className="text-sm text-[#F5F5F7] font-medium mb-1">LinkedIn</p>
            <p className="text-xs text-[#B3B3C2]">Puron Agency</p>
          </div>
        </div>
      </div>
    </div>
  );
}

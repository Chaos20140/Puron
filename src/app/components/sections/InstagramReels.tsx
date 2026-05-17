import { motion } from "motion/react";
import { AnimatedButton } from "../AnimatedButton";

const PROFILE_URL = "https://www.instagram.com/puronmedia?igsh=MXhqM2VnOGRxOWkzag==";

// Curated reels: each entry links out to the actual Instagram post. We
// don't auto-pull from Instagram because (1) the embed JS injects a 200 KB
// script + tracking, (2) the unofficial APIs break weekly. To add a reel:
// open the post on instagram.com → copy the URL → take a screenshot of
// the cover frame → drop it in public/reels/ and add an entry below.
//
// Tip: shortcodes (the bit after /reel/) are stable, so the URL won't rot
// even if the post is edited.
//
// Until the user provides real reels, this section shows the four most
// recent posts as placeholders so the layout is reviewable. Replace
// `placeholder: true` entries with real ones as content drops.
const ASSET_BASE = import.meta.env.BASE_URL;

type Reel = {
  href: string;
  caption: string;
  cover: string;
  placeholder?: boolean;
};

const reels: Reel[] = [
  {
    href: "https://www.instagram.com/reel/DWv9gjODUsQ/?igsh=MTRzNDV6cjYwMnZmbw==",
    caption: "Was wir tun bei Puron",
    cover: `${ASSET_BASE}reels/reel-1.jpg`,
  },
  {
    href: "https://www.instagram.com/p/DX6rcYXDbwv/?igsh=am55MTltbHZ2emZn",
    caption: "Der erste Eindruck zählt",
    cover: `${ASSET_BASE}reels/reel-2.jpg`,
  },
  {
    href: "https://www.instagram.com/reel/DV6e3FBjXKV/?igsh=bWdjNXIwYXA2cXBi",
    caption: "3 Gründe – keine 0815-Starter",
    cover: `${ASSET_BASE}reels/reel-3.jpg`,
  },
];

export function InstagramReels() {
  return (
    <section
      className="py-16 md:py-24 relative border-t border-white/5"
      style={{ isolation: "isolate" }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-14 max-w-2xl"
        >
          <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium mb-3 block">
            Aus unserem Feed
          </span>
          <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 leading-[1.15]">
            Neueste{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-[#7C3AED]">
              Reels
            </span>
            {" "}auf Instagram
          </h2>
          <p className="text-base md:text-lg text-[#B3B3C2] leading-relaxed">
            Ein kleiner Auszug aus unserem aktuellen Output. Klick rein — der
            Reel öffnet direkt auf Instagram.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {reels.map((r, i) => (
            <motion.a
              key={i}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram-Reel: ${r.caption}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group relative block aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 hover:border-[#7C3AED]/50 bg-[#0A0A0D] shadow-[0_15px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_25px_50px_rgba(124,58,237,0.35)] transition-all duration-500"
            >
              {/* Fall back to the lila SVG placeholder if the real cover
                  isn't dropped into public/reels/ yet. The on-error swap
                  runs once and replaces the broken-image icon. */}
              <img
                src={r.cover}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const img = e.currentTarget;
                  const fallback = `${ASSET_BASE}reels/placeholder-${(i % 4) + 1}.svg`;
                  if (img.src.endsWith(fallback)) return;
                  img.src = fallback;
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              {/* Gradient + glow overlays so the cover always reads against
                  white captions / play button. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

              {/* Reel pill (top-left) */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 text-[10px] uppercase tracking-widest text-white font-semibold">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reel
              </div>

              {/* Center play affordance (revealed on hover) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-white font-medium line-clamp-2 leading-snug">
                  {r.caption}
                </p>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-[#A855F7] font-semibold flex items-center gap-1">
                  @puronmedia
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </div>
              </div>

              {r.placeholder && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#7C3AED]/30 border border-[#A855F7]/40 text-[9px] uppercase tracking-widest text-white font-semibold">
                  Bald
                </div>
              )}
            </motion.a>
          ))}
        </div>

        <div className="mt-10 md:mt-14 flex justify-center">
          <AnimatedButton href={PROFILE_URL} variant="outline">
            Auf Instagram folgen
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}

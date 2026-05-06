import { motion } from "motion/react";
import type { GoogleReview } from "./useGoogleReviews";

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Stars = ({ rating }: { rating: number }) => {
  const count = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex gap-1 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < count ? "#FBBC05" : "#3a3a44"}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
};

type Variant = "left" | "center" | "right";

type Props = {
  review: GoogleReview;
  variant: Variant;
  delay?: number;
};

export function GoogleReviewCard({ review, variant, delay = 0 }: Props) {
  const initials = (review.author || "?").trim().charAt(0).toUpperCase();

  if (variant === "center") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.06, y: -8, zIndex: 30 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className="relative w-full max-w-[340px] md:w-[360px] h-auto min-h-[340px] md:h-[360px] rounded-2xl flex items-center justify-center bg-gradient-to-b from-[#7C3AED]/10 to-transparent border border-white/10 shadow-[0_25px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10 shrink-0 cursor-pointer"
      >
        <div className="absolute inset-4 rounded-xl bg-[#0A0A0D]/95 text-[#F5F5F7] shadow-xl ring-1 ring-white/15 backdrop-blur overflow-hidden">
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {review.authorPhoto ? (
                  <img
                    src={review.authorPhoto}
                    alt={review.author}
                    className="h-10 w-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[#A855F7] text-sm font-medium">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-white">{review.author}</div>
                  <div className="text-xs text-[#B3B3C2]">{review.relativeTime}</div>
                </div>
              </div>
              <GoogleLogo />
            </div>
            <Stars rating={review.rating} />
            <p className="text-[15px] leading-relaxed text-[#E0E0E5] mb-auto font-medium line-clamp-[8]">
              "{review.text}"
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const isLeft = variant === "left";
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50, rotate: isLeft ? -15 : 15 }}
      whileInView={{ opacity: 1, x: 0, rotate: isLeft ? -6 : 6 }}
      whileHover={{
        scale: 1.08,
        rotate: 0,
        y: -8,
        zIndex: 40,
        x: isLeft ? "-15%" : "15%",
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`md:absolute w-full max-w-[320px] md:w-[340px] h-auto min-h-[320px] md:h-[340px] rounded-2xl flex items-center justify-center ${
        isLeft ? "md:-translate-x-[15%]" : "md:translate-x-[15%]"
      } bg-gradient-to-b from-[#7C3AED]/5 to-transparent border border-white/5 shadow-2xl backdrop-blur-md z-[1] shrink-0 cursor-pointer hover:border-white/20`}
    >
      <div className="absolute inset-4 rounded-xl bg-[#121217]/90 text-[#F5F5F7] shadow-2xl ring-1 ring-white/10 overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {review.authorPhoto ? (
                <img
                  src={review.authorPhoto}
                  alt={review.author}
                  className="h-10 w-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-white">{review.author}</div>
                <div className="text-xs text-[#B3B3C2]">{review.relativeTime}</div>
              </div>
            </div>
            <GoogleLogo />
          </div>
          <Stars rating={review.rating} />
          <p className="text-sm leading-relaxed text-[#B3B3C2] mb-auto line-clamp-[8]">"{review.text}"</p>
        </div>
      </div>
    </motion.div>
  );
}

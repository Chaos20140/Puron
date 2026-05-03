import { Link } from "react-router";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "nav" | "ghost";

interface AnimatedButtonProps {
  to?: string;
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 ease-out cursor-pointer select-none active:scale-95";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-[#0A0A0D] px-6 py-3 md:px-8 md:py-3.5 text-[13px] md:text-sm font-semibold hover:scale-[1.06] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.97]",
  secondary:
    "bg-[#7C3AED] hover:bg-[#A855F7] text-white px-6 py-3 md:px-6 md:py-3 text-[13px] md:text-sm font-medium hover:scale-[1.06] shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_35px_rgba(124,58,237,0.45)] active:scale-[0.97]",
  outline:
    "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-6 py-3 md:px-8 md:py-3.5 text-[13px] md:text-sm font-medium hover:scale-[1.06] active:scale-[0.97]",
  nav: "bg-[#7C3AED] hover:bg-[#A855F7] text-white px-4 py-2 md:px-5 md:py-2.5 text-[12px] md:text-sm font-medium hover:scale-[1.06] shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_35px_rgba(124,58,237,0.45)] active:scale-[0.97]",
  ghost:
    "bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 md:px-8 md:py-3.5 text-[13px] md:text-sm font-medium hover:scale-[1.06] active:scale-[0.97]",
};

export function AnimatedButton({
  to,
  href,
  type,
  variant = "primary",
  children,
  onClick,
  className = "",
  fullWidth = false,
}: AnimatedButtonProps) {
  const cls = `${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type || "button"} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

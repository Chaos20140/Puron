import { usePageTitle } from "../../hooks/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Seite nicht gefunden");
  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-['Space_Grotesk'] text-6xl font-semibold tracking-tight mb-4">404</h1>
        <p className="text-lg text-[#B3B3C2]">Seite nicht gefunden.</p>
      </div>
    </div>
  );
}

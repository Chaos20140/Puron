import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Always surface to the console — there's no telemetry pipeline yet.
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export function PageErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0D] text-[#F5F5F7] px-6">
      <div className="max-w-md text-center">
        <h1 className="font-['Space_Grotesk'] text-5xl font-semibold tracking-tight mb-4">
          Etwas ist schiefgegangen.
        </h1>
        {/* Was the developer's private Outlook address — a visitor-facing page
            must show the business contact that is also in the Impressum. */}
        <p className="text-[#B3B3C2] mb-8">
          Die Seite ist auf einen Fehler gestoßen. Lade sie bitte neu — falls das Problem bestehen bleibt, melde dich gerne unter{" "}
          <a href="mailto:info@puron-media.de" className="text-[#A855F7] hover:underline">
            info@puron-media.de
          </a>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-white text-[#0A0A0D] px-6 py-3 text-sm font-semibold hover:scale-[1.04] transition-transform"
          >
            Seite neu laden
          </button>
          {/* Deliberately a plain <a>, not <Link>: this fallback also renders
              when the router itself is the thing that blew up. */}
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}

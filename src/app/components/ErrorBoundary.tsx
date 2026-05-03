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
        <p className="text-[#B3B3C2] mb-8">
          Die Seite ist auf einen Fehler gestoßen. Lade sie bitte neu — falls das Problem bestehen bleibt, melde dich gerne unter{" "}
          <a href="mailto:Tolunay.u@outlook.de" className="text-[#A855F7] hover:underline">
            Tolunay.u@outlook.de
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-full bg-white text-[#0A0A0D] px-6 py-3 text-sm font-semibold hover:scale-[1.04] transition-transform"
        >
          Seite neu laden
        </button>
      </div>
    </div>
  );
}

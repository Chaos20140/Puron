import { RouterProvider } from "react-router";
import { MotionConfig } from "motion/react";
import { router } from "./routes";
import { ErrorBoundary, PageErrorFallback } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary fallback={<PageErrorFallback />}>
      {/* `reducedMotion="user"` honors prefers-reduced-motion automatically
          for every motion/react animation in the tree. */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </ErrorBoundary>
  );
}

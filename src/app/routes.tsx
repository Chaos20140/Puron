import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/pages/HomePage";
// import { ProjectsPage } from "./components/pages/ProjectsPage"; // hidden until we have a real portfolio

// HomePage is imported eagerly — it is the landing route for ~every visit and
// lazy-loading it would only add a round trip in front of the LCP element.
// Every OTHER page is code-split via react-router's `lazy`, so the initial
// bundle no longer carries the imprint, privacy, team, services and contact
// pages that a first-time visitor doesn't render. `lazy` returns the route
// module, and the router waits on it during navigation — no <Suspense>
// boundary or loading flash needed.
export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: HomePage },
        {
          path: "services",
          lazy: async () => ({ Component: (await import("./components/pages/ServicesPage")).ServicesPage }),
        },
        // { path: "projects", lazy: … },
        {
          path: "team",
          lazy: async () => ({ Component: (await import("./components/pages/TeamPage")).TeamPage }),
        },
        {
          path: "contact",
          lazy: async () => ({ Component: (await import("./components/pages/ContactPage")).ContactPage }),
        },
        {
          path: "imprint",
          lazy: async () => ({ Component: (await import("./components/pages/ImprintPage")).ImprintPage }),
        },
        {
          path: "privacy",
          lazy: async () => ({ Component: (await import("./components/pages/PrivacyPage")).PrivacyPage }),
        },
        {
          path: "*",
          lazy: async () => ({ Component: (await import("./components/pages/NotFoundPage")).NotFoundPage }),
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

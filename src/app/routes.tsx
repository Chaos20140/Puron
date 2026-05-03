import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/pages/HomePage";
import { ServicesPage } from "./components/pages/ServicesPage";
import { ProjectsPage } from "./components/pages/ProjectsPage";
import { TeamPage } from "./components/pages/TeamPage";
import { ContactPage } from "./components/pages/ContactPage";
import { ImprintPage } from "./components/pages/ImprintPage";
import { PrivacyPage } from "./components/pages/PrivacyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "services", Component: ServicesPage },
      { path: "projects", Component: ProjectsPage },
      { path: "team", Component: TeamPage },
      { path: "contact", Component: ContactPage },
      { path: "imprint", Component: ImprintPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "*", Component: () => (
        <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-['Space_Grotesk'] text-6xl font-semibold tracking-tight mb-4">404</h1>
            <p className="text-lg text-[#B3B3C2]">Seite nicht gefunden.</p>
          </div>
        </div>
      )},
    ],
  },
]);

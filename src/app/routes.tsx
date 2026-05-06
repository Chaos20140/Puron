import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/pages/HomePage";
import { ServicesPage } from "./components/pages/ServicesPage";
// import { ProjectsPage } from "./components/pages/ProjectsPage"; // hidden until we have a real portfolio
import { TeamPage } from "./components/pages/TeamPage";
import { ContactPage } from "./components/pages/ContactPage";
import { ImprintPage } from "./components/pages/ImprintPage";
import { PrivacyPage } from "./components/pages/PrivacyPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "services", Component: ServicesPage },
      // { path: "projects", Component: ProjectsPage },
      { path: "team", Component: TeamPage },
      { path: "contact", Component: ContactPage },
      { path: "imprint", Component: ImprintPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

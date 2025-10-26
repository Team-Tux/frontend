import React from "react";

import TwoD from "./views/2d/twoD";
import helper from "./views/helper/Helper";

const ThreeDMap = React.lazy(() => import('./views/3d/ThreeDMap'))
const incidents = React.lazy(() => import('./views/incidents/Incidents'))
const CreateIncident = React.lazy(() => import('./views/incidents/CreateIncident'))
const IncidentDetails = React.lazy(() => import('./views/incidents/IncidentDetails'))

const Colors = React.lazy(() => import("./views/theme/colors/Colors"));
const Typography = React.lazy(
  () => import("./views/theme/typography/Typography"),
);

const routes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/incidents", name: "Incidents", element: incidents },
  { path: "/2d", name: "2D", element: TwoD },
  { path: "/3d", name: "3D", element: ThreeDMap },
  { path: '/incidents/create', name: 'Create Incident', element: CreateIncident },
  { path: '/incidents/:id', name: 'Incident Details', element: IncidentDetails },
  { path: '/helper', name: 'Helper', element: helper },
  { path: "/theme", name: "Theme", element: Colors, exact: true },
  { path: "/theme/colors", name: "Colors", element: Colors },
  { path: "/theme/typography", name: "Typography", element: Typography },
  { path: "/base", name: "Base", element: Cards, exact: true },
  { path: "/base/accordion", name: "Accordion", element: Accordion },
  { path: "/base/breadcrumbs", name: "Breadcrumbs", element: Breadcrumbs },
  { path: "/base/cards", name: "Cards", element: Cards },
  { path: "/base/carousels", name: "Carousel", element: Carousels },
  { path: "/base/collapses", name: "Collapse", element: Collapses },
  { path: "/base/list-groups", name: "List Groups", element: ListGroups },
  { path: "/base/navs", name: "Navs", element: Navs },
  { path: "/base/paginations", name: "Paginations", element: Paginations },
  { path: "/base/placeholders", name: "Placeholders", element: Placeholders },
  { path: "/base/popovers", name: "Popovers", element: Popovers },
  { path: "/base/progress", name: "Progress", element: Progress },
  { path: "/base/spinners", name: "Spinners", element: Spinners },
  { path: "/base/tabs", name: "Tabs", element: Tabs },
  { path: "/base/tables", name: "Tables", element: Tables },
  { path: "/base/tooltips", name: "Tooltips", element: Tooltips },
  { path: "/buttons", name: "Buttons", element: Buttons, exact: true },
  { path: "/buttons/buttons", name: "Buttons", element: Buttons },
  { path: "/buttons/dropdowns", name: "Dropdowns", element: Dropdowns },
  {
    path: "/incidents/create",
    name: "Create Incident",
    element: CreateIncident,
  },
  { path: "/helper", name: "Helper", element: helper },
];

export default routes;

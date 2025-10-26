import React from "react";

import TwoD from "./views/2d/twoD";
import helper from "./views/helper/Helper";
const ThreeDMap = React.lazy(() => import("./views/3d/ThreeDMap"));
const incidents = React.lazy(() => import("./views/incidents/Incidents"));
const CreateIncident = React.lazy(
  () => import("./views/incidents/CreateIncident"),
);

const routes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/incidents", name: "Incidents", element: incidents },
  { path: "/2d", name: "2D", element: TwoD },
  { path: "/3d", name: "3D", element: ThreeDMap },
  {
    path: "/incidents/create",
    name: "Create Incident",
    element: CreateIncident,
  },
  { path: "/helper", name: "Helper", element: helper },
];

export default routes;

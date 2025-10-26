import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cilNotes,
  cilMap,
  cilViewModule,
  cilLifeRing,
} from "@coreui/icons";
import { CNavItem } from "@coreui/react";

const _nav = [
  {
    component: CNavItem,
    name: "Incidents",
    to: "/incidents",
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "2D Map",
    to: "/2d",
    icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "3D Map",
    to: "/3d",
    icon: <CIcon icon={cilViewModule} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Helper",
    to: "/helper",
    icon: <CIcon icon={cilLifeRing} customClassName="nav-icon" />,
  },
];

export default _nav;
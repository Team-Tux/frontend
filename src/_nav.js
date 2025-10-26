import React from "react";
import CIcon from "@coreui/icons-react";
import {
  cil3d,
  cilLifeRing,
  cilList,
  cilMap,
} from '@coreui/icons'
import {  CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Incidents',
    to: '/incidents',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '2D Map',
    to: '/2d',
    icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '3D Map',
    to: '/3d',
    icon: <CIcon icon={cil3d} customClassName="nav-icon" />,
  },
  
  {
    component: CNavItem,
    name: 'Helper',
    to: '/helper',
    icon: <CIcon icon={cilLifeRing} customClassName="nav-icon" />,
  },
 
]

export default _nav;
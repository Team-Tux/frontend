# Guardian-Frontend

Out tool receives and visualizes classified RF signal data (Wi-Fi / Bluetooth) from drones and ground scanners to locate victims in rubble.
Built for **incident command teams** to monitor, analyze, and dispatch search tasks to field units.

---

## Tech Stack

- **Frontend:** React
- **Mapping:** Maplibre.org

---

## Local Setup

```bash
npm install
npm start
```

Build for production:

```bash
npm run build
```

App runs at <http://localhost:3000>

---

## Structure

```
rf-sar-hq-dashboard
├── public/          # static assets
├── src/
│   ├── assets/      # images, icons
│   ├── components/  # reusable UI
│   ├── layouts/     # main layouts
│   ├── scss/        # styles
│   ├── views/       # pages (Map, Dashboard, POI Viewer)
│   ├── _nav.js      # sidebar config
│   ├── routes.js    # route setup
│   └── store.js     # state management
├── package.json
└── vite.config.mjs
```

---

## Purpose

This dashboard:

- Aggregates and classifies incoming RF signals
- Displays 2D/3D maps with POIs and heat layers
- Manages and dispatches tasks to Field Teams
- Syncs data via Firestore

import React, { useRef, useEffect, useState } from "react";
import { Map } from "@vis.gl/react-maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map3D = () => {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    longitude: 10.8859,
    latitude: 47.64851,
    zoom: 13.3,
    pitch: 54,
    bearing: 0,
  });

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = mapRef.current._map; // get the internal MapLibre map

    if (!mapInstance) return;

    mapInstance.on("load", () => {
      // 1. Add terrain source
      if (!mapInstance.getSource("terrainSource")) {
        mapInstance.addSource("terrainSource", {
          type: "raster-dem",
          url: "https://sgx.geodatenzentrum.de/gdz_basemapde_3d_gelaende/dgm5_3857_rgb.json",
          tileSize: 256,
        });
      }

      // 2. Set terrain on the map
      mapInstance.setTerrain({ source: "terrainSource", exaggeration: 1 });

      // 3. Optional hillshade layer
      if (!mapInstance.getSource("hillshadeSource")) {
        mapInstance.addSource("hillshadeSource", {
          type: "raster-dem",
          url: "https://sgx.geodatenzentrum.de/gdz_basemapde_3d_gelaende/dgm5_3857_rgb.json",
          tileSize: 256,
        });
      }

      if (!mapInstance.getLayer("hills")) {
        mapInstance.addLayer({
          id: "hills",
          type: "hillshade",
          source: "hillshadeSource",
          layout: { visibility: "visible" },
          paint: { "hillshade-shadow-color": "#473B24" },
        });
      }

      // 4. Add navigation controls
      mapInstance.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        }),
      );
    });
  }, []);
  const terrain = {
    source: "terrainSource", // the ID of the raster-dem source
    exaggeration: 1.5, // vertical exaggeration
  };

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <Map
        terrain={terrain}
      
        ref={mapRef}
        {...viewState}
        onMove={({ viewState }) => setViewState(viewState)}
        mapStyle="https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json"
        maxZoom={18}
        maxPitch={85}
      />
    </div>
  );
};

export default Map3D;

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { CContainer } from "@coreui/react";

const TwoD = () => {
  const fencePoint = [9.6861753, 50.5652165];
  const GEOFENCE = turf.circle(fencePoint, 15, { units: "miles" });
  const [selectedId, setSelectedId] = useState(-1);
  const points = [
    { id: 0, cord: [9.6861753, 50.5652165], radius: 30 },
    { id: 1, cord: [9.704481903105375, 50.561469999275005], radius: 60 },
  ];
  const pointCoords = [9.6861753, 50.5652165];

  // Create a 500 meter radius circle around that point
  const circles = useMemo(() => {
    const circleFeatures = points.map((point) =>
      turf.circle(point.cord, point.radius, { units: "meters" })
    );
    return turf.featureCollection(circleFeatures);
  }, [points]);

  const circle = useMemo(
    () => turf.circle(pointCoords, 20, { units: "meters" }),
    [pointCoords]
  );
  const [viewState, setViewState] = useState({
    latitude: pointCoords[1],
    longitude: pointCoords[0],
    zoom: 18,
  });
  const geojson = {
    type: "FeatureCollection",
    features: points.map((item) => {
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: item.cord },
      };
    }),
  };

  // console.log("geojson", geojson);
  const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  };
  const handleClick = (e) => {
    let distToPoint = -1;
    points.forEach((item) => {
      distToPoint = getDistanceInMeters(
        e.lngLat.lat,
        e.lngLat.lng,
        item.cord[1],
        item.cord[0]
      );
      if (distToPoint < item.radius) {
        if (selectedId != item.id) {
          setViewState({
            latitude: item.cord[1],
            longitude: item.cord[0],
            zoom: 18,
          });
          setSelectedId(item.id);
        }
      }
      console.log("DISTANCE", distToPoint);
      console.log("DISTANCE", e.lngLat);
    });
  };
  const layerStyle = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": 13,
      "circle-color": "#f33c11",
    },
  };
  const pointLayer = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": 8,
      "circle-color": "#f33c11",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  };

  // Transparent circle (fill)
  const circleFillLayer = {
    id: "circle-fill",
    type: "fill",
    paint: {
      "fill-color": "#f33c11",
      "fill-opacity": 0.15, // transparent
    },
  };

  // Circle border (outline)
  const circleOutlineLayer = {
    id: "circle-outline",
    type: "line",
    paint: {
      "line-color": "#f33c11",
      "line-width": 2,
    },
  };
  const onMove = useCallback(
    ({ viewState }) => {
      const newCenter = [viewState.longitude, viewState.latitude];
      if (turf.booleanPointInPolygon(newCenter, GEOFENCE)) {
        // console.log("Inside geofence");
        setViewState({
          ...viewState,
          longitude: newCenter[0],
          latitude: newCenter[1],
        });
      }
    },
    [GEOFENCE]
  );

  return (
    <CContainer style={{ width: "100%", height: "80vh" }}>
      <Map
        {...viewState}
        onMove={onMove}
        onClick={(e) => handleClick(e)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json"
      >
        {/* Circle polygon source */}
        <Source id="circles" type="geojson" data={circles}>
          <Layer {...circleFillLayer} />
          <Layer {...circleOutlineLayer} />
        </Source>
        <Source id="my-data" type="geojson" data={geojson}>
          <Layer {...layerStyle} />
        </Source>
      </Map>
    </CContainer>
  );
};

export default TwoD;

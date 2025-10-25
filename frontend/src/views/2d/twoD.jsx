import { useCallback, useEffect, useMemo, useState } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { CContainer } from "@coreui/react";

const TwoD = ({}) => {
  const initialCoords = [9.6861753, 50.5652165];
  const [points, setPoints] = useState([
    { id: 0, cord: [9.6861753, 50.5652165], radius: 30 },
    { id: 1, cord: [9.704481903105375, 50.561469999275005], radius: 60 },
  ]);
  const [sensors, setSensors] = useState([
    { type: "TEST", cord: [9.685875926986967, 50.56519975931357] },
    { type: "TEST", cord: [9.686164571163602, 50.56560835807784] },
    { type: "TEST", cord: [9.686414016601816, 50.56518753644707] },
  ]);
  const [helper, setHelper] = useState([
    { id: 1, cord: [9.686156524537353, 50.56509212697179] },
    { id: 2, cord: [9.686261130688592, 50.56505123713765] },
    { id: 3, cord: [9.686304046032888, 50.5650324959515] },
  ]);
  const GEOFENCE = turf.circle(initialCoords, 15, { units: "miles" });
  const [selectedId, setSelectedId] = useState();
  const [helpersJson, setHelpersJson] = useState();
  const [sensorsJson, setSensorsJson] = useState();
  const [incidentsJson, setIncidentsJson] = useState();

  const [viewState, setViewState] = useState({
    latitude: initialCoords[1],
    longitude: initialCoords[0],
    zoom: 18,
  });

  const circles = useMemo(() => {
    const circleFeatures = points
      .filter((item) => item.id != selectedId)
      .map((point) =>
        turf.circle(point.cord, point.radius, { units: "meters" }),
      );
    return turf.featureCollection(circleFeatures);
  }, [points, selectedId]);

  const onZoom = (e) => {
    console.log(e.viewState);
    if (selectedId != undefined) {
      if (e.viewState.zoom < 17) {
        setSelectedId();
      }
    }
  };

  useEffect(() => {
    setIncidentsJson({
      type: "FeatureCollection",
      features: points.map((item) => {
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: item.cord },
        };
      }),
    });
  }, [points]);

  useEffect(() => {
    setSensorsJson({
      type: "FeatureCollection",
      features: sensors.map((item) => {
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: item.cord },
        };
      }),
    });
  }, [sensors]);

  useEffect(() => {
    setHelpersJson({
      type: "FeatureCollection",
      features: helper.map((item) => {
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: item.cord },
        };
      }),
    });
  }, [helper]);

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
        item.cord[0],
      );
      let radiusToCompare = item.radius;
      if (viewState.zoom < 14) {
        radiusToCompare = 500;
      }
      if (viewState.zoom < 11) {
        radiusToCompare = 1000;
      }
      if (distToPoint < radiusToCompare) {
        if (selectedId != item.id) {
          setViewState({
            latitude: item.cord[1],
            longitude: item.cord[0],
            zoom: 18,
          });
          setSelectedId(item.id);
        }
      }
    });
  };
  const layerStylePoints = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": 13,
      "circle-color": "#f33c11",
    },
  };
  const layerStyleSensors = {
    id: "sensor",
    type: "circle",
    paint: {
      "circle-radius": 8,
      "circle-color": "#007cf1",
    },
  };
  const layerStyleHelper = {
    id: "helper",
    type: "circle",
    paint: {
      "circle-radius": 5,
      "circle-color": "#007c41",
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
    [GEOFENCE],
  );
  const [layerVisibility, setLayerVisibility] = useState({
    points: true,
    sensors: true,
    helpers: true,
    circles: true,
  });

  return (
    <CContainer style={{ width: "100%", height: "80vh" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, points: !prev.points }))
          }
        >
          {layerVisibility.points ? "Hide Points" : "Show Points"}
        </button>
        <button
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, sensors: !prev.sensors }))
          }
        >
          {layerVisibility.sensors ? "Hide Sensors" : "Show Sensors"}
        </button>
        <button
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, helpers: !prev.helpers }))
          }
        >
          {layerVisibility.helpers ? "Hide Helpers" : "Show Helpers"}
        </button>
        <button
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, circles: !prev.circles }))
          }
        >
          {layerVisibility.circles ? "Hide Circles" : "Show Circles"}
        </button>
      </div>
      <Map
        {...viewState}
        onMove={onMove}
        onZoom={(e) => onZoom(e)}
        onClick={(e) => handleClick(e)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json"
      >
        {layerVisibility.circles && (
          <Source id="circles" type="geojson" data={circles}>
            <Layer {...circleFillLayer} />
            <Layer {...circleOutlineLayer} />
          </Source>
        )}

        {layerVisibility.points && (
          <Source id="points" type="geojson" data={incidentsJson}>
            <Layer {...layerStylePoints} />
          </Source>
        )}

        {layerVisibility.sensors && (
          <Source id="sensors" type="geojson" data={sensorsJson}>
            <Layer {...layerStyleSensors} />
          </Source>
        )}

        {layerVisibility.helpers && (
          <Source id="helpers" type="geojson" data={helpersJson}>
            <Layer {...layerStyleHelper} />
          </Source>
        )}
      </Map>
    </CContainer>
  );
};

export default TwoD;

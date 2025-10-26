import { useCallback, useEffect, useMemo, useState } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { CContainer, CButton } from "@coreui/react";

const TwoD = ({ initialCoords = [9.6861753, 50.5652165] }) => {
  // const initialCoords = [9.6861753, 50.5652165];
  const [points, setPoints] = useState();
  const [sensors, setSensors] = useState();
  const [helper, setHelper] = useState();
  const [victims, setVictims] = useState();
  const GEOFENCE = turf.circle(initialCoords, 50, { units: "kilometers" });
  const [selectedId, setSelectedId] = useState();
  const [helpersJson, setHelpersJson] = useState();
  const [sensorsJson, setSensorsJson] = useState();
  const [incidentsJson, setIncidentsJson] = useState();
  const [victimsJson, setVictimsJson] = useState();

  const [viewState, setViewState] = useState({
    latitude: initialCoords[1],
    longitude: initialCoords[0],
    zoom: 16,
  });

  const backendURL = "http://192.168.188.23:8000";

  useEffect(() => {
    try {
      fetch(`${backendURL}/api/v1/map/sensors`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setSensors(data);
        })
        .catch((error) => {});
    } catch {}
    try {
      fetch(`${backendURL}/api/v1/map/helpers`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setHelper(data);
        })
        .catch((error) => {});
    } catch {}
    try {
      fetch(`${backendURL}/api/v1/map/victims`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setVictims(data);
        })
        .catch((error) => {});
    } catch {}
    try {
      fetch(`${backendURL}/api/v1/incidents`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setSensors(data);
        })
        .catch((error) => {});
    } catch {}
  }, []);

  const circles = useMemo(() => {
    const circleFeatures = points
      .filter((item) => item.id != selectedId)
      .map((point) =>
        turf.circle(point.cord, point.radius, { units: "meters" }),
      );
    return turf.featureCollection(circleFeatures);
  }, [points, selectedId]);

  useEffect(() => {
    if (points) {
      setIncidentsJson({
        type: "FeatureCollection",
        features: points.map((item) => {
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [item.lon, item.lat] },
          };
        }),
      });
    }
  }, [points]);

  useEffect(() => {
    if (sensors) {
      setSensorsJson({
        type: "FeatureCollection",
        features: sensors.map((item) => {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [item.lon, item.lat],
            },
          };
        }),
      });
    }
  }, [sensors]);

  useEffect(() => {
    if (helper) {
      setHelpersJson({
        type: "FeatureCollection",
        features: helper.map((item) => {
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [item.lon, item.lat] },
          };
        }),
      });
    }
  }, [helper]);

  useEffect(() => {
    if (victims) {
      setVictimsJson({
        type: "FeatureCollection",
        features: victims.map((item) => {
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [item.lon, item.lat] },
          };
        }),
      });
    }
  }, [victims]);

  const onZoom = (e) => {
    console.log(e.viewState);
    if (selectedId != undefined) {
      if (e.viewState.zoom < 17) {
        setSelectedId();
      }
    }
  };

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
      "circle-color": "#fafa20ff",
    },
  };
  const layerStyleVictims = {
    id: "victim",
    type: "circle",
    paint: {
      "circle-radius": 13,
      "circle-color": "#ff0000ff",
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

  const circleFillLayer = {
    id: "circle-fill",
    type: "fill",
    paint: {
      "fill-color": "#fafa20ff",
      "fill-opacity": 0.15,
    },
  };

  const circleOutlineLayer = {
    id: "circle-outline",
    type: "line",
    paint: {
      "line-color": "#fafa20ff",
      "line-width": 2,
    },
  };
  const onMove = useCallback(
    ({ viewState }) => {
      const newCenter = [viewState.longitude, viewState.latitude];
      if (turf.booleanPointInPolygon(newCenter, GEOFENCE)) {
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
    destruction: true,
    victims: true,
  });

  return (
    <CContainer style={{ width: "100%", height: "75vh" }}>
      <div
        className="d-flex justify-content-between"
        style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
      >
        <CButton
          size="lg"
          style={{
            background: layerStylePoints.paint["circle-color"],
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, points: !prev.points }))
          }
        >
          {layerVisibility.points ? "Hide Points" : "Show Points"}
        </CButton>
        <CButton
          size="lg"
          style={{
            background: layerStylePoints.paint["circle-color"],
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, circles: !prev.circles }))
          }
        >
          {layerVisibility.circles ? "Hide Circles" : "Show Circles"}
        </CButton>
        <CButton
          size="lg"
          style={{
            background: layerStyleSensors.paint["circle-color"],
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, sensors: !prev.sensors }))
          }
        >
          {layerVisibility.sensors ? "Hide Sensors" : "Show Sensors"}
        </CButton>
        <CButton
          size="lg"
          style={{
            background: layerStyleHelper.paint["circle-color"],
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({ ...prev, helpers: !prev.helpers }))
          }
        >
          {layerVisibility.helpers ? "Hide Helpers" : "Show Helpers"}
        </CButton>

        <CButton
          size="lg"
          color="secondary"
          style={{
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({
              ...prev,
              destruction: !prev.destruction,
            }))
          }
        >
          {layerVisibility.destruction
            ? "Hide Destruction"
            : "Show Destruction"}
        </CButton>
        <CButton
          size="lg"
          style={{
            background: layerStyleVictims.paint["circle-color"],
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({
              ...prev,
              victims: !prev.victims,
            }))
          }
        >
          {layerVisibility.victims ? "Hide Victims" : "Show Victims"}
        </CButton>
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
        {layerVisibility.victims && (
          <Source id="victims" type="geojson" data={victimsJson}>
            <Layer {...layerStyleVictims} />
          </Source>
        )}

        {layerVisibility.helpers && (
          <Source id="helpers" type="geojson" data={helpersJson}>
            <Layer {...layerStyleHelper} />
          </Source>
        )}
        {layerVisibility.destruction && (
          <Source
            id="tiff-source"
            type="raster"
            tiles={["tiles/{z}/{x}/{y}.png"]}
            tileSize={256}
            minzoom={0}
            maxzoom={20}
          >
            <Layer
              id="tiff-layer"
              type="raster"
              paint={{ "raster-opacity": 0.55 }}
            />
          </Source>
        )}
      </Map>
    </CContainer>
  );
};

export default TwoD;

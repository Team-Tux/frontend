import { useCallback, useEffect, useMemo, useState } from "react";
import { Layer, Map, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import { CContainer, CButton } from "@coreui/react";
import { useHelpers, useSensors, useVictims } from "../../api/map_api";
import { useIncidents } from "../../api/incidents_api";
const TwoD = ({
  containerHeight = "75vh",
  canShowButtons = true,
  initialCoords = [9.6861753, 50.5652165],
  destructionOpacity = 0.55,
  circleOpacity = 0.15,
  victimSize = 10,
  helperSize = 10,
  sensorSize = 10,
  incidentSize = 10,
  victimsColor = "#ff0000ff",
  sensorsColor = "#007cf1",
  incidentsColor = "#fafa20ff",
  helpersColor = "#007c41",
  route = { distance: 0, route: [] },
}) => {
  const GEOFENCE = turf.circle(initialCoords, 50, { units: "kilometers" });
  const [selectedId, setSelectedId] = useState();
  const [helpersJson, setHelpersJson] = useState();
  const [sensorsJson, setSensorsJson] = useState();
  const [incidentsJson, setIncidentsJson] = useState();
  const [victimsJson, setVictimsJson] = useState();
  const [wsVictims, setWsVictims] = useState();
  const [wsSensors, setWsSensors] = useState();
  const { data: helpersData } = useHelpers();
  const { data: sensorsData } = useSensors();
  const { data: victimsData } = useVictims();
  const { data: incidentsData } = useIncidents();
  const [viewState, setViewState] = useState({
    latitude: initialCoords[1],
    longitude: initialCoords[0],
    zoom: 16,
  });
  const routeJson = useMemo(() => {
    if (route && route.route && route.route.length > 1) {
      const coords = route.route.map((p) => [p.lon, p.lat]);
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        ],
      };
    }
    return null;
  }, [route]);

  const routeLayer = {
    id: "route-line",
    type: "line",
    paint: {
      "line-color": "#0000ff",
      "line-width": 6,
    },
  };

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket(`ws://${window.SENSOR_API}/api/trilaterations/ws`);

    // When the connection is open
    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    // When a message is received
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setWsVictims(data);
    };

    // When there is an error
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // When the connection is closed
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup function to close the WebSocket when the component unmounts
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket(`ws://${window.SENSOR_API}/api/sensor/ws`);

    // When the connection is open
    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    // When a message is received
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setWsSensors(data);
    };

    // When there is an error
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // When the connection is closed
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup function to close the WebSocket when the component unmounts
    return () => {
      ws.close();
    };
  }, []);

  const circles = useMemo(() => {
    if (incidentsData) {
      if (incidentsData.length > 0) {
        const circleFeatures = incidentsData
          .filter((item) => item.id != selectedId)
          .map((point) =>
            turf.circle([point.lon, point.lat], point.radius, {
              units: "meters",
            }),
          );
        return turf.featureCollection(circleFeatures);
      }
    }
  }, [incidentsData, selectedId]);

  useEffect(() => {
    if (incidentsData) {
      setIncidentsJson({
        type: "FeatureCollection",
        features: incidentsData.map((item) => {
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [item.lon, item.lat] },
          };
        }),
      });
    }
  }, [incidentsData]);

  useEffect(() => {
    let data = [];
    if (sensorsData) {
      data = sensorsData;
    }
    if (wsSensors) {
      data = [...data, wsSensors];
    }
    setSensorsJson({
      type: "FeatureCollection",
      features: data.map((item) => {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [item.lon, item.lat],
          },
        };
      }),
    });
  }, [sensorsData, wsSensors]);

  useEffect(() => {
    if (helpersData) {
      setHelpersJson({
        type: "FeatureCollection",
        features: helpersData.map((item) => {
          return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [item.lon, item.lat] },
          };
        }),
      });
    }
  }, [helpersData]);

  useEffect(() => {
    let data = [];
    if (victimsData) {
      data = victimsData;
    }
    if (wsVictims) {
      data = [...data, wsVictims];
    }

    setVictimsJson({
      type: "FeatureCollection",
      features: data.map((item) => {
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [item.lon, item.lat] },
        };
      }),
    });
  }, [victimsData, wsVictims]);

  const onZoom = (e) => {
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
    incidentsData.forEach((item) => {
      distToPoint = getDistanceInMeters(
        e.lngLat.lat,
        e.lngLat.lng,
        item.lat,
        item.lon,
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
            latitude: item.lat,
            longitude: item.lon,
            zoom: 18,
          });
          setSelectedId(item.id);
        }
      }
    });
  };

  const layerStyleIncidents = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": incidentSize,
      "circle-color": incidentsColor,
    },
  };
  const layerStyleVictims = {
    id: "victim",
    type: "circle",
    paint: {
      "circle-radius": victimSize,
      "circle-color": victimsColor,
    },
  };
  const layerStyleSensors = {
    id: "sensor",
    type: "circle",
    paint: {
      "circle-radius": sensorSize,
      "circle-color": sensorsColor,
    },
  };
  const layerStyleHelper = {
    id: "helper",
    type: "circle",
    paint: {
      "circle-radius": helperSize,
      "circle-color": helpersColor,
    },
  };

  const circleFillLayer = {
    id: "circle-fill",
    type: "fill",
    paint: {
      "fill-color": incidentsColor,
      "fill-opacity": circleOpacity,
    },
  };

  const circleOutlineLayer = {
    id: "circle-outline",
    type: "line",
    paint: {
      "line-color": incidentsColor,
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
    incidents: true,
    sensors: true,
    helpers: true,
    circles: true,
    destruction: true,
    victims: true,
  });

  const renderButtons = () => {
    return (
      <div
        className="d-flex justify-content-between"
        style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
      >
        <CButton
          size="lg"
          style={{
            background: incidentsColor,
            color: "black",
          }}
          onClick={() =>
            setLayerVisibility((prev) => ({
              ...prev,
              incidents: !prev.incidents,
              circles: !prev.circles,
            }))
          }
        >
          {layerVisibility.incidents ? "Hide Incidents" : "Show Incidents"}
        </CButton>

        <CButton
          size="lg"
          style={{
            background: sensorsColor,
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
            background: helpersColor,
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
            background: victimsColor,
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
    );
  };

  return (
    <CContainer style={{ width: "100%", height: containerHeight }}>
      {canShowButtons && renderButtons()}
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

        {layerVisibility.incidents && incidentsJson && (
          <Source id="incidents" type="geojson" data={incidentsJson}>
            <Layer {...layerStyleIncidents} />
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
        {routeJson && (
          <Source id="route" type="geojson" data={routeJson}>
            <Layer {...routeLayer} />
          </Source>
        )}

        {layerVisibility.destruction && (
          <Source
            id="tiff-source"
            type="raster"
            tiles={[window.DIFF_API]}
            tileSize={256}
            minzoom={0}
            maxzoom={20}
          >
            <Layer
              id="tiff-layer"
              type="raster"
              paint={{ "raster-opacity": destructionOpacity }}
            />
          </Source>
        )}
      </Map>
    </CContainer>
  );
};

export default TwoD;

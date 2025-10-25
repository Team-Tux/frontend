import "maplibre-gl/dist/maplibre-gl.css";
import Map from "react-map-gl/maplibre";
import { Canvas } from "react-three-map/maplibre";
import { CContainer } from "@coreui/react";
import { Model } from "./Model";

const FourDMap = () => {
  const initialCoords = [9.6861753, 50.5652165];
  const initialMeshCoords = [9.6872, 50.5651];

  return (
    <CContainer style={{ width: "100%", height: "80vh" }}>
      <Map
        canvasContextAttributes={{
          antialias: true,
        }}
        initialViewState={{
          latitude: initialCoords[1],
          longitude: initialCoords[0],
          zoom: 13,
          pitch: 30,
        }}
        mapStyle="https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json"
      >
        <Canvas
          latitude={initialMeshCoords[1]}
          longitude={initialMeshCoords[0]}
        >
          <hemisphereLight
            args={["#ffffff", "#60666C"]}
            position={[1, 4.5, 10]}
          />
          <object3D scale={1}>
            <Model url="./HSFDCampus.glb" position={[1, 1, 1]} />
          </object3D>
        </Canvas>
      </Map>
    </CContainer>
  );
};

export default FourDMap;

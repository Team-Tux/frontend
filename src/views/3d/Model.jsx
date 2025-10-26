import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader, useThree } from "@react-three/fiber";

export const Model = ({ url, position }) => {
  const gltf = useLoader(GLTFLoader, url);
  const ref = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (ref.current) {
      camera.lookAt(ref.current.position);
    }
  }, [camera]);

  return (
    <>
      <group ref={ref} position={position}>
        <primitive object={gltf.scene} />
      </group>
      <ambientLight />
      <pointLight position={position} />
    </>
  );
};

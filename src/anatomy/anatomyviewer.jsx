
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ANATOMY_BY_KEY, modelUrl } from "./anatomydata";

export default function AnatomyViewer({
  sex,
  selectedKey,
  activeSystems,
  onSelect,
}) {
  const mountRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const originalMaterials = useRef(new Map());

  // Create the 3D scene and load the human model.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let animationFrame;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07111d");

    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.01,
      100
    );

    camera.position.set(0, 0.35, 3.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x5eead4, 1.5);
    fillLight.position.set(-4, 1, -3);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.minDistance = 0.8;
    controls.maxDistance = 7;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      modelUrl(sex),
      (gltf) => {
        if (disposed) return;

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        modelRef.current = model;

        scene.add(model);

        const maxDimension = Math.max(size.x, size.y, size.z);
        camera.position.set(0, maxDimension * 0.15, maxDimension * 2.5);
        camera.near = maxDimension / 100;
        camera.far = maxDimension * 20;
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();

        model.traverse((object) => {
          if (object.isMesh) {
            object.userData.originalMaterial = object.material;
            object.material = object.material.clone();
            originalMaterials.current.set(
              object,
              object.material.clone()
            );
          }
        });
      },
      undefined,
      (error) => {
        console.error("Could not load anatomy model:", error);
      }
    );

    // Clicking a structure selects it.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event) => {
      if (!modelRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObject(modelRef.current, true);

      for (const hit of hits) {
        let object = hit.object;

        while (object && object !== modelRef.current) {
          if (ANATOMY_BY_KEY[object.name]) {
            onSelect(object.name);
            return;
          }
          object = object.parent;
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    const resizeObserver = new ResizeObserver(() => {
      if (!mount.clientWidth || !mount.clientHeight) return;

      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    });

    resizeObserver.observe(mount);

    const animate = () => {
      if (disposed) return;

      animationFrame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("click", handleClick);
      controls.dispose();

      modelRef.current?.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      modelRef.current = null;
      originalMaterials.current.clear();
    };
  }, [sex, onSelect]);

  // Show or hide entire body systems.
  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((object) => {
      if (
        object.parent === modelRef.current &&
        ["skin", "skeleton", "muscles", "organs", "vessels", "nerves"].includes(object.name)
      ) {
        object.visible = activeSystems.includes(object.name);
      }
    });
  }, [activeSystems, sex]);

  // Highlight the selected structure.
  useEffect(() => {
    if (!modelRef.current) return;

    modelRef.current.traverse((object) => {
      if (!object.isMesh) return;

      const original = originalMaterials.current.get(object);
      if (!original) return;

      const material = object.material;

      if (object.name === selectedKey) {
        if (material.emissive) {
          material.emissive.set("#24d9c0");
          material.emissiveIntensity = 0.9;
        }
      } else if (material.emissive) {
        material.emissive.set("#000000");
        material.emissiveIntensity = 0;
      }
    });
  }, [selectedKey]);

  return <div className="anatomy-canvas" ref={mountRef} />;
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fffbc4");

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10);
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.55;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.001);
    scene.environment = envRT.texture;

    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load("/logo-square.png", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;
    });

    const innerSize = 0.98;
    const innerGeo = new RoundedBoxGeometry(innerSize, innerSize, innerSize, 7, 0.1);
    const innerMat = new THREE.MeshBasicMaterial({
      map: logoTexture,
    });
    const innerCube = new THREE.Mesh(
      innerGeo,
      new Array(6).fill(innerMat) as THREE.MeshBasicMaterial[]
    );

    const outerSize = 1.04;
    const outerGeo = new RoundedBoxGeometry(outerSize, outerSize, outerSize, 7, 0.12);
    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.99,
      thickness: 0.12,
      ior: 1.45,
      roughness: 0.02,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.00,
      transparent: true,
      opacity: 1.0,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const outerCube = new THREE.Mesh(outerGeo, glassMat);

    // Group both cubes so they rotate together
    const cubeGroup = new THREE.Group();
    cubeGroup.add(innerCube);
    cubeGroup.add(outerCube);
    cubeGroup.rotation.set(-Math.PI * 0.12, Math.PI * 0.35, 0);
    scene.add(cubeGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0xffffff, 0.9, 8);
    keyLight.position.set(1.5, 1.2, 2.5);
    scene.add(keyLight);

    // ── PARTICLES ──
    const maxParticles = 2000;
    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);
    const ages = new Float32Array(maxParticles);
    const lifetimes = new Float32Array(maxParticles);
    const sizes = new Float32Array(maxParticles);
    const baseSizes = new Float32Array(maxParticles);

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes, 1)
    );

    const particleTexture = textureLoader.load("/particle-soft.png");

    const particlesMaterial = new THREE.PointsMaterial({
      size: 10,
      map: particleTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x93bbff,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    let particleIndex = 0;

    const emitParticles = (worldPosition: THREE.Vector3) => {
      const toSpawn = 30;
      for (let i = 0; i < toSpawn; i++) {
        const index = (particleIndex + i) % maxParticles;
        const pxIndex = index * 3;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.12;

        positions[pxIndex] = worldPosition.x + Math.cos(angle) * radius;
        positions[pxIndex + 1] = worldPosition.y + Math.sin(angle) * radius;
        positions[pxIndex + 2] = worldPosition.z;

        const speed = 0.8 + Math.random() * 0.7;
        velocities[pxIndex] = (Math.random() - 0.5) * speed;
        velocities[pxIndex + 1] = (Math.random() - 0.5) * speed;
        velocities[pxIndex + 2] = (Math.random() - 0.5) * speed * 0.4;

        ages[index] = 0;
        lifetimes[index] = 0.5 + Math.random() * 0.5;
        const size = 0.06 + Math.random() * 0.06;
        baseSizes[index] = size;
        sizes[index] = size;
      }

      particleIndex = (particleIndex + toSpawn) % maxParticles;
      (particlesGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (particlesGeometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectionPoint = new THREE.Vector3();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.ray.intersectPlane(plane, intersectionPoint);
      if (hit) emitParticles(intersectionPoint.clone());
    };

    window.addEventListener("pointermove", handlePointerMove);

    // ── ORBIT CONTROLS ──
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0, 0);
    controls.minDistance = 1.8;
    controls.maxDistance = 3.0;

    const clock = new THREE.Clock();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    const animate = () => {
      const delta = clock.getDelta();

      for (let i = 0; i < maxParticles; i++) {
        const life = lifetimes[i];
        if (life <= 0) continue;

        const age = ages[i] + delta;
        ages[i] = age;

        const t = age / life;
        if (t >= 1) {
          lifetimes[i] = 0;
          sizes[i] = 0;
          continue;
        }

        const px = i * 3;
        positions[px] += velocities[px] * delta;
        positions[px + 1] += velocities[px + 1] * delta;
        positions[px + 2] += velocities[px + 2] * delta;

        velocities[px] *= 0.88;
        velocities[px + 1] *= 0.88;
        velocities[px + 2] *= 0.88;

        sizes[i] = baseSizes[i] * (1 - t);
      }

      (particlesGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (particlesGeometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      pmrem.dispose();
      envRT.texture.dispose();
      innerGeo.dispose();
      outerGeo.dispose();
      logoTexture.dispose();
      innerMat.dispose();
      glassMat.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0" />
  );
}

"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  FrontSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
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

    const scene = new Scene();
    scene.background = new Color("#fffbc4");

    const camera = new PerspectiveCamera(50, width / height, 0.1, 10);
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.55;
    container.appendChild(renderer.domElement);

    const pmrem = new PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.001);
    scene.environment = envRT.texture;

    const textureLoader = new TextureLoader();
    const logoTexture = textureLoader.load("/logo-square.png", (tex: Texture) => {
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.needsUpdate = true;
      }
    );

    const innerSize = 0.98;
    const innerGeo = new RoundedBoxGeometry(innerSize, innerSize, innerSize, 7, 0.1);
    const innerMat = new MeshBasicMaterial({
      map: logoTexture,
    });
    const innerCube = new Mesh(
      innerGeo,
      new Array(6).fill(innerMat) as MeshBasicMaterial[]
    );

    const outerSize = 1.04;
    const outerGeo = new RoundedBoxGeometry(outerSize, outerSize, outerSize, 7, 0.12);
    const glassMat = new MeshPhysicalMaterial({
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
      side: FrontSide,
      depthWrite: false,
    });
    const outerCube = new Mesh(outerGeo, glassMat);

    // Group both cubes so they rotate together
    const cubeGroup = new Group();
    cubeGroup.add(innerCube);
    cubeGroup.add(outerCube);
    cubeGroup.rotation.set(-Math.PI * 0.12, Math.PI * 0.35, 0);
    scene.add(cubeGroup);

    const ambientLight = new AmbientLight(0xffffff, 0.08);
    scene.add(ambientLight);

    const keyLight = new PointLight(0xffffff, 0.9, 8);
    // Moved off the front face so its reflection doesn't read as a circle on the front.
    keyLight.position.set(2.8, 1.4, -1.2);
    scene.add(keyLight);

    // Intense off-axis kickers to increase glass sparkle without reflecting as a front-face blob.
    const kickerLightA = new PointLight(0xffffff, 1.25, 9);
    kickerLightA.position.set(-2.9, 1.1, -1.35);
    scene.add(kickerLightA);

    const kickerLightB = new PointLight(0xffffff, 0.95, 9);
    kickerLightB.position.set(2.2, -2.2, -1.5);
    scene.add(kickerLightB);

    // ── CHOICE SPHERES (BRANCHING NARRATIVE) ──
    // Small pool, but large enough for natural motion as spheres exit the scene.
    const maxSpheres = 32;
    const sphereGeometry = new SphereGeometry(0.03, 32, 32);
    const sphereMaterial = new MeshPhysicalMaterial({
      transmission: 1.0,
      thickness: 0.08,
      ior: 1.45,
      roughness: 0.02,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.9,
      transparent: true,
      opacity: 0.9,
      color: new Color(0xffffff),
      emissive: new Color(0xffffff),
      emissiveIntensity: 0.04,
    });

    const sphereMeshes: Mesh[] = [];
    const sphereVelocities: Vector3[] = [];
    const sphereAges: number[] = [];
    const sphereLifetimes: number[] = [];
    let nextSphereIndex = 0;

    for (let i = 0; i < maxSpheres; i++) {
      const mesh = new Mesh(sphereGeometry, sphereMaterial);
      mesh.visible = false;
      sphereMeshes.push(mesh);
      sphereVelocities.push(new Vector3());
      sphereAges.push(0);
      sphereLifetimes.push(0);
      scene.add(mesh);
    }

    const spawnSphere = (
      position: Vector3,
      velocity: Vector3,
      lifetime: number
    ) => {
      const index = nextSphereIndex;
      nextSphereIndex = (nextSphereIndex + 1) % maxSpheres;

      const mesh = sphereMeshes[index];
      mesh.position.copy(position);
      mesh.visible = true;

      sphereVelocities[index].copy(velocity);
      sphereAges[index] = 0;
      sphereLifetimes[index] = lifetime;
    };

    const spawnRootSphere = (point: Vector3) => {
      // Single sphere that marks the cursor position along the path.
      const rootLifetime = 0.95 + Math.random() * 0.35;
      const rootVelocity = new Vector3(
        (Math.random() - 0.5) * 0.016,
        (Math.random() - 0.5) * 0.016,
        (Math.random() - 0.5) * 0.008
      );
      spawnSphere(point, rootVelocity, rootLifetime);
    };

    const spawnForkFrom = (
      point: Vector3,
      travelDir: Vector3 | null
    ) => {
      // Two children: fork from the previous end and fly out of the scene quickly.
      const dir =
        travelDir && travelDir.lengthSq() > 1e-6
          ? travelDir.clone().normalize()
          : new Vector3(1, 0, 0);

      const lateral = new Vector3(-dir.y, dir.x, 0).normalize();
      const branchSpeed = 2.2 + Math.random() * 0.6;
      const childLifetime = 2.8 + Math.random() * 0.9;

      const childVelA = lateral.clone().multiplyScalar(branchSpeed);
      const childVelB = lateral.clone().multiplyScalar(-branchSpeed);

      spawnSphere(point, childVelA, childLifetime);
      spawnSphere(point, childVelB, childLifetime);
    };

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const intersectionPoint = new Vector3();

    // Reduce lag: pointermove only updates a target; emission happens in RAF loop.
    const targetPoint = new Vector3();
    let hasTarget = false;

    const lastEmit = new Vector3();
    let hasLastEmit = false;
    const lastTravelDir = new Vector3();

    // Conceptual trail of recent cursor positions (for up to N bubbles in a line).
    const maxTrailPoints = 6;
    const trailPoints: Vector3[] = [];
    const trailForkState: number[] = []; // 0 = not split yet, 2 = already split

    const tmpPoint = new Vector3();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      // If cursor is over the cube, "spill" particles onto its surface.
      const cubeHits = raycaster.intersectObject(cubeGroup, true);
      const basePoint =
        cubeHits[0]?.point ??
        raycaster.ray.intersectPlane(plane, intersectionPoint) ??
        null;
      if (!basePoint) return;
      targetPoint.copy(basePoint);
      hasTarget = true;
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

    const clock = new Clock();
    let forkCooldown = 0;

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
      forkCooldown += delta;

      // Emit a dotted line of single spheres along the cursor path.
      // Up to maxTrailPoints bubbles form a history line along the cursor motion.
      if (hasTarget) {
        if (!hasLastEmit) {
          lastEmit.copy(targetPoint);
          hasLastEmit = true;
          lastTravelDir.set(1, 0, 0);
          spawnRootSphere(lastEmit);

          trailPoints.push(lastEmit.clone());
          trailForkState.push(0);
        } else {
          const dx = targetPoint.x - lastEmit.x;
          const dy = targetPoint.y - lastEmit.y;
          const dz = targetPoint.z - lastEmit.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Only emit when we've moved enough, to create separated dots
          // but still feel very responsive to cursor motion.
          const minStep = 0.055;
          if (dist > minStep) {
            tmpPoint.copy(targetPoint);
            lastTravelDir.set(dx, dy, dz);

            // New end of the trail is a single sphere at the latest cursor position.
            spawnRootSphere(tmpPoint);
            lastEmit.copy(targetPoint);

            // Record this new trail point.
            trailPoints.push(tmpPoint.clone());
            trailForkState.push(0);

            // Keep only a short history.
            if (trailPoints.length > maxTrailPoints) {
              trailPoints.shift();
              trailForkState.shift();
            }
          }
        }
      }

      // Handle splitting along the history: always split the oldest unsplit bubble
      // at a calm cadence (one fork pair per bubble, not a constant burst).
      if (trailPoints.length > 0 && forkCooldown >= 0.35) {
        forkCooldown = 0;
        // Find the oldest trail point that hasn't split yet.
        let splitIndex = -1;
        for (let i = 0; i < trailPoints.length; i++) {
          if (trailForkState[i] === 0) {
            splitIndex = i;
            break;
          }
        }
        if (splitIndex !== -1) {
          const point = trailPoints[splitIndex];
          spawnForkFrom(point, lastTravelDir);
          trailForkState[splitIndex] = 2;
        }
      }

      // Update sphere motion and fade them out; forked children travel far
      // but the overall motion feels smooth and slightly slower.
      for (let i = 0; i < maxSpheres; i++) {
        const life = sphereLifetimes[i];
        if (life <= 0) continue;

        const age = sphereAges[i] + delta;
        sphereAges[i] = age;

        const t = age / life;
        if (t >= 1) {
          sphereLifetimes[i] = 0;
          sphereMeshes[i].visible = false;
          continue;
        }

        const velocity = sphereVelocities[i];
        const mesh = sphereMeshes[i];
        mesh.position.addScaledVector(velocity, delta);

        // Very light damping so forked bubbles keep sweeping across the scene.
        velocity.multiplyScalar(0.985);

        // Hard kill only when they are far beyond the visible area.
        if (mesh.position.length() > 8) {
          sphereLifetimes[i] = 0;
          mesh.visible = false;
        }
      }

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
      // RoundedBoxGeometry inherits from BufferGeometry, which will be GC'd with the meshes.
      logoTexture.dispose();
      innerMat.dispose();
      glassMat.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0" />
  );
}

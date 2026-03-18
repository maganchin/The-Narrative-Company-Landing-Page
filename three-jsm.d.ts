declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera, EventDispatcher, MOUSE, Vector3, Object3D } from "three";

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement | undefined);

    object: Camera;
    domElement: HTMLElement | Document;

    enabled: boolean;

    target: Vector3;

    minDistance: number;
    maxDistance: number;

    minZoom: number;
    maxZoom: number;

    minPolarAngle: number;
    maxPolarAngle: number;

    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    enableDamping: boolean;
    dampingFactor: number;

    enableZoom: boolean;
    zoomSpeed: number;

    enableRotate: boolean;
    rotateSpeed: number;

    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;

    autoRotate: boolean;
    autoRotateSpeed: number;

    keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };

    update(): boolean;
    reset(): void;
    dispose(): void;
    saveState(): void;
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    listenToKeyEvents(domElement: HTMLElement): void;

    // Added in more recent versions
    target0: Vector3;
    position0: Vector3;
    zoom0: number;
    panLeft(distance: number, objectMatrix: Object3D["matrix"]): void;
    panUp(distance: number, objectMatrix: Object3D["matrix"]): void;
    pan(deltaX: number, deltaY: number): void;
  }
}

declare module "three/examples/jsm/geometries/RoundedBoxGeometry" {
  import { BufferGeometry } from "three";

  export class RoundedBoxGeometry extends BufferGeometry {
    constructor(
      width: number,
      height: number,
      depth: number,
      segments?: number,
      radius?: number
    );
  }
}

declare module "three/examples/jsm/environments/RoomEnvironment" {
  import { Scene } from "three";

  export class RoomEnvironment extends Scene {
    constructor();
  }
}


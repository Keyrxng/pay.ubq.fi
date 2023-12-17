import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const COLORS = {
  GOLD: 0xffd700,
  WHITE: 0xffffff,
  RED: 0xff0000,
  GREEN: 0x00ff00,
  BLUE: 0x0000ff,
};

export class HolidaysApp {
  private lights: THREE.PointLight[] = [];
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private present: THREE.Group;
  // private pointLightBackLeft: THREE.PointLight;
  // private pointLightBackRight: THREE.PointLight;
  // private pointLightFrontRight: THREE.PointLight;
  // private pointLightFrontLeft: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;
  private plane: THREE.Mesh;
  private cameraAngle: number = 0; // Angle for camera rotation

  constructor() {
    this.init();
  }

  private init(): void {
    // Loaders
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    const PATH = `/scripts/rewards/holidays/gift-model/gift`;
    // Replace 'path/to/material.mtl' with the path to your actual .mtl file
    mtlLoader.load(PATH.concat(`.mtl`), materials => {
      materials.preload();
      // Update materials to render both sides
      for (const materialName in materials.materials) {
        const material = materials.materials[materialName];
        material.side = THREE.DoubleSide; // Render both sides of the material
      }
      objLoader.setMaterials(materials);

      // Replace 'path/to/model.obj' with the path to your actual .obj file
      objLoader.load(PATH.concat(`.obj`), (object): void => {
        object.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material instanceof THREE.Material) {
              mesh.material.side = THREE.DoubleSide; // Ensure new geometry also has double-sided materials
            }

            if (mesh.name.includes("ribbon")) {
              // Assuming ribbon parts contain 'Ribbon' in their name
              if (
                mesh.material instanceof THREE.MeshPhongMaterial ||
                mesh.material instanceof THREE.MeshStandardMaterial ||
                mesh.material instanceof THREE.MeshBasicMaterial
              ) {
                (mesh.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).color.set(COLORS.GOLD); // Gold color
              }
            } else {
              if (
                mesh.material instanceof THREE.MeshPhongMaterial ||
                mesh.material instanceof THREE.MeshStandardMaterial ||
                mesh.material instanceof THREE.MeshBasicMaterial
              ) {
                (mesh.material as THREE.MeshPhongMaterial | THREE.MeshStandardMaterial | THREE.MeshBasicMaterial).color.set(COLORS.WHITE); // White color
              }
            }
          }
        });
        object.position.y = 0.5; // Adjust the position as needed
        object.scale.set(1, 1, 1); // Scale the object if it's too large or too small
        this.scene.add(object);
      });
    });

    // Scene, Camera, Renderer setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.domElement.id = "holidays";
    document.body.appendChild(this.renderer.domElement);

    // Plane for shadow (now transparent)
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.0 }); // Fully transparent
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = 0;
    this.plane.receiveShadow = true;
    this.scene.add(this.plane);

    const _lights = [
      { color: COLORS.WHITE, x: 0.75, y: 2, z: -0.75 },
      // { color: COLORS.RED, x: -0.75, y: 2, z: -0.75 },
      { color: COLORS.WHITE, x: 1.1, y: -0.5, z: 1.1 },
      // { color: COLORS.WHITE, x: -1.1, y: 1.5, z: -1.1 },
      // { color: COLORS.WHITE, x: -0.75, y: 0.5, z: 1.5 },
    ];

    _lights.forEach(pos => {
      const pointLight = new THREE.PointLight(pos.color, 1, 0);
      pointLight.position.set(pos.x, pos.y, pos.z);
      pointLight.castShadow = true;
      this.scene.add(pointLight);
      this.lights.push(pointLight);
    });

    // Ambient Light (for overall scene illumination)
    // this.ambientLight = new THREE.AmbientLight(0xffffff, 0.125); // Soft white light
    // this.scene.add(this.ambientLight);

    // Set initial camera position
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(this.scene.position);

    // Start the animation loop
    this.addLightHelpers();
    this.animate();
  }

  private _animate = (): void => {
    requestAnimationFrame(this._animate);

    // Rotate the camera around the present
    this.cameraAngle += 0.005;
    this.camera.position.x = 5 * Math.sin(this.cameraAngle);
    this.camera.position.z = 5 * Math.cos(this.cameraAngle);
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  };
  public get animate() {
    return this._animate;
  }
  public set animate(value) {
    this._animate = value;
  }

  private addLightHelpers(): void {
    this.lights.forEach(light => {
      const helper = new THREE.PointLightHelper(light, 0.1, 0x00ffff);
      this.scene.add(helper);
    });
  }
}
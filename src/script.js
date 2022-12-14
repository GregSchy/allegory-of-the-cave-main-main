import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

function audio() {
  const chainAudio = new Audio("/audio/Chain_On_Metal_Post.mp3");
  const chainPromise = chainAudio.play();

  if (chainPromise !== undefined) {
    chainPromise
      .then(() => {
        console.log(chainAudio);
      })
      .catch(() => {
        chainAudio.controls = true;
        chainAudio.play();
      });
  }

  const spaceMusic = new Audio("/audio/Space_Song.mp3");
  spaceMusic.volume = 0.75;
  spaceMusic.loop = true;

  setTimeout(() => {
    chainAudio.pause();
    const spacePromise = spaceMusic.play();

    if (spacePromise !== undefined) {
      spacePromise
        .then(() => {
          console.log(spaceMusic);
        })
        .catch(() => {
          const playButton = document.querySelector("#playButton");
          spaceMusic.controls = true;
          playButton.addEventListener("click", () => {
            spaceMusic.play();
          });
          playButton.hidden = false;
        });
    }
  }, 5000);
}

// Loading
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load("/texture/sun_normal.png");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const geometry = new THREE.IcosahedronGeometry(1, 15);
const skyGeometry = new THREE.SphereGeometry(80, 64, 64);

// Materials

const material = new THREE.MeshBasicMaterial();
material.color = new THREE.Color("#FDB813");
material.roughness = 0.2;
material.normalMap = sunTexture;

const skyMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture("texture/galaxy1.png"),
  side: THREE.BackSide,
  transparent: true,
});

// Mesh
const sphere = new THREE.Mesh(geometry, material);
sphere.layers.set(1);
scene.add(sphere);

const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
skyMesh.layers.set(1);
scene.add(skyMesh);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientlight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  bloomComposer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
});
renderer.autoClear = false;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0.0);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 2;
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y = 0.5 * elapsedTime;

  // Update Orbital Controls
  // controls.update()

  // Render
  bloomComposer.render();
  camera.layers.set(1);
  controls.update();
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

audio();
tick();

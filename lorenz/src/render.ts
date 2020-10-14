import { Geometry, Vector3, Color, Line, LineDashedMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { LORENZ_POS_INITIAL, LORENZ_DELTA, LORENZ_BETA, LORENZ_RHO, LORENZ_SIGMA } from "./constants";
import { updateLegend } from "./legend";
import { colorScale, lorenzSystem } from "./utils";
import { Vector } from "./vector";

export let cameraSpinning = true;
export let pos:Vector = LORENZ_POS_INITIAL;
export let oldPos = pos;
export let elapsedTime = 0;

new Geometry();
const scene = new Scene();
const WIDTH = window.innerWidth * 0.95;
const HEIGHT = window.innerHeight * 0.95;

const camera = new PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 1000);
camera.position.set(0, 0, 200);
camera.lookAt(new Vector3(0, 0, 0));
camera.setFocalLength(70); // set focal length

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

const material = new LineDashedMaterial({
  linewidth: 1,
  color: 0x000000,
});

renderer.render(scene, camera);

const nextPoint = function(x) {
  return lorenzSystem(x, LORENZ_SIGMA, LORENZ_RHO, LORENZ_BETA);
};

export function renderScene() {
  requestAnimationFrame(renderScene);

  oldPos = pos;
  // Vector.rk4 uses Runge-Kutta method
  pos = pos.rk4(LORENZ_DELTA, nextPoint);
  elapsedTime += LORENZ_DELTA;

  const geo = new Geometry();
  geo.vertices.push(new Vector3(oldPos.x, oldPos.y, oldPos.z));
  geo.vertices.push(new Vector3(pos.x, pos.y, pos.z));

  const col = new Color(colorScale(pos.x), colorScale(pos.y), colorScale(pos.z));
  material.color = col;

  const line = new Line(geo, material);
  scene.add(line);

  if (cameraSpinning) {
    // Spin camera around the visualization
    const timer = new Date().getTime() * 0.0005;
    camera.position.x = Math.floor(Math.cos(timer) * 200);
    camera.position.z = Math.floor(Math.sin(timer) * 200);
    camera.lookAt(scene.position);
  }

  updateLegend();
  renderer.render(scene, camera);
}


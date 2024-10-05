import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "/dist/planets/src/getStarfield.js";
import { getFresnelMat } from "/dist/planets/src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;  // disable panning

const marsGroup = new THREE.Group();
marsGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(marsGroup);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("/dist/textures/mars.jpg"),
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const marsMesh = new THREE.Mesh(geometry, material);
marsGroup.add(marsMesh);

const fresnelMat = getFresnelMat({rimHex : "#FF0000"});
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
marsGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5).normalize();
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);

  marsMesh.rotation.y += 0.002;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
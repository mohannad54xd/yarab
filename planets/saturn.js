import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "/dist/planets/src/getStarfield.js";
import { getFresnelMat } from "/dist/planets/src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 2;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;  // disable panning

const saturnGroup = new THREE.Group();
saturnGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(saturnGroup);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("/dist/textures/saturn.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const saturnMesh = new THREE.Mesh(geometry, material);
saturnGroup.add(saturnMesh);



const fresnelMat = getFresnelMat({rimHex : "#E9EAE0"});
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
saturnGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5).normalize();
scene.add(sunLight);

// Load the ring texture
const ringTexture = loader.load("/dist/textures/saturn_ring.png");

// Set ring dimensions
const innerRadius = 1.2; // Slightly larger than Saturn's radius
const outerRadius = 2.5;

// Create ring geometry
const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);

// Create ring material
const ringMat = new THREE.MeshBasicMaterial({
  map: ringTexture,
  side: THREE.DoubleSide,
  transparent: true, // Allow for transparency in the ring texture
  opacity: 0.8, // Adjust as needed
});

// Create the ring mesh and add it to the scene
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.position.set(0, 0, 0); // Center the ring around Saturn
ringMesh.rotation.x = -0.5 * Math.PI; // Align the ring horizontally

// Add ring to the Saturn group
saturnGroup.add(ringMesh);


function animate() {
  requestAnimationFrame(animate);

  saturnMesh.rotation.y += 0.002;
  glowMesh.rotation.y += 0.002;
  ringMesh.rotation.z += 0.002 ;
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
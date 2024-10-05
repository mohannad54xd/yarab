  import * as THREE from "three";
  import { OrbitControls } from 'jsm/controls/OrbitControls.js';

  import getStarfield from "/src/getStarfield.js";


  const w = window.innerWidth;
  const h = window.innerHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-50, 90, 150);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  document.body.appendChild(renderer.domElement);
  // THREE.ColorManagement.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;


  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Optional: smooth the controls
  controls.dampingFactor = 0.25; // Optional: adjust damping
  controls.maxDistance = 350; // Limit the maximum zoom-out distance
  controls.minDistance = 20;  // Limit the minimum zoom-in distance
  controls.enablePan = false;  // disable panning

  
  const textureLoader = new THREE.TextureLoader();



  // Create the Sun
  const sunTexture = textureLoader.load("textures/sun.jpg");
  const sungeo = new THREE.SphereGeometry(15, 50, 50);
  const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
  const sun = new THREE.Mesh(sungeo, sunMaterial);
  scene.add(sun);

  // Create a point light to simulate the Sun's light
  const sunLight = new THREE.PointLight(0xffffff, 10000, 10000); // Increase intensity and range
  sunLight.position.set(0, 0, 0); // Position at the center where the sun is
  scene.add(sunLight);


  // Optional: Add a helper to visualize the light's position
  const sunLightHelper = new THREE.PointLightHelper(sunLight, 5);
  scene.add(sunLightHelper);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.29);
  scene.add(ambientLight);


  const stars = getStarfield({numStars: 2000});
  scene.add(stars);

  const mercuryTexture = textureLoader.load("textures/mercury.jpg");
  const earthTexture = textureLoader.load("textures/00_earthmap1k.jpg");
  const venusTexture = textureLoader.load("textures/venus.jpg");
  const marsTexture = textureLoader.load("textures/mars.jpg");
  const jupiterTexture = textureLoader.load("textures/jupiter.jpg");
  const saturnTexture = textureLoader.load("textures/saturn.jpg");
  const uranusTexture = textureLoader.load("textures/uranus.jpg");
  const neptuneTexture = textureLoader.load("textures/neptune.jpg");
  const plutoTexture = textureLoader.load("textures/pluto.jpg");
  const saturnRingTexture = textureLoader.load("textures/saturn_ring.png");
  const path_of_planets = [];
  function createLineLoopWithMesh(radius, color, width) {
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: width,
    });
    const geometry = new THREE.BufferGeometry();
    const lineLoopPoints = [];

    // Calculate points for the circular path
    const numSegments = 100; // Number of segments to create the circular path
    for (let i = 0; i <= numSegments; i++) {
      const angle = (i / numSegments) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      lineLoopPoints.push(x, 0, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(lineLoopPoints, 3)
    );
    const lineLoop = new THREE.LineLoop(geometry, material);
    scene.add(lineLoop);
    path_of_planets.push(lineLoop);
  }
  //////////////////////////////////////

  // Function to create a label with a connecting line for each planet
  function createPlanetLabel(planetObj, labelName) {
    // Create a canvas to draw the label text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    // Set the canvas size to make the label wider and larger
    canvas.width = 256; // Width for moderate label size
    canvas.height = 64; // Height for moderate label size
  
    // Set font size and weight for bold text
    const fontSize = 40; // Adjust font size as needed
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
  
    // Draw the text in the center of the canvas
    context.fillText(labelName, canvas.width / 2, canvas.height / 2);
  
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
  
    // Adjust the sprite's scale for moderate initial size
    sprite.scale.set(30, 15, 1); // Adjust these values for initial size
  
    // Add the label to the scene
    scene.add(sprite);
  
    return { sprite };
  }
  
  
  
  
  
  const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hoveredPlanet = null;

// Raycast detection for hovering and clicking
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

  document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'auto';
}

window.addEventListener('mousemove', onMouseMove);

async function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(planets.map(p => p.planet));

  if (intersects.length > 0) {
    const intersectedPlanet = intersects[0].object;
    const planetName = intersectedPlanet.userData.name;

    // Redirect to the specific page for the clicked planet
    window.location.href = `planets/${planetName.toLowerCase()}.html`;
  }
}


window.addEventListener('click', onMouseClick, false);

// Fetch data from NASA API
// Update the fetchPlanetData function to use the new API
async function fetchPlanetData(planetName) {
  // Adjust planet names to match the API's expected values
  const apiPlanetNames = {
    Mercury: 'mercure',
    Venus: 'venus',
    Earth: 'terre',
    Mars: 'mars',
    Jupiter: 'jupiter',
    Saturn: 'saturne',
    Uranus: 'uranus',
    Neptune: 'neptune',
    Pluto: 'pluton'
  };

  const apiName = apiPlanetNames[planetName];
  if (!apiName) {
    console.error(`No API mapping found for planet: ${planetName}`);
    return;
  }

  const url = `https://api.le-systeme-solaire.net/rest/bodies/${apiName}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Log the data and return it
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching planet data:", error);
  }
}
function displayPlanetData(planetName, data) {
  const infoContainer = document.getElementById("planet-info");
  if (!data) {
    infoContainer.innerHTML = `<h2>${planetName}</h2><p>No data available.</p>`;
    return;
  }

  infoContainer.innerHTML = `
    <h2>${data.englishName}</h2>
    <p><strong>Mass:</strong> ${data.mass ? data.mass.massValue + ' x10^' + data.mass.massExponent + ' kg' : 'N/A'}</p>
    <p><strong>Gravity:</strong> ${data.gravity ? data.gravity + ' m/s²' : 'N/A'}</p>
    <p><strong>Mean Radius:</strong> ${data.meanRadius ? data.meanRadius + ' km' : 'N/A'}</p>
    <p><strong>Density:</strong> ${data.density ? data.density + ' g/cm³' : 'N/A'}</p>
    <p><strong>Escape Velocity:</strong> ${data.escape ? data.escape + ' m/s' : 'N/A'}</p>
    <p><strong>Moons:</strong> ${data.moons ? data.moons.length : 0}</p>
  `;
}
window.addEventListener('click', onMouseClick, false);



  //NOTE: create planet
  // Correctly apply textures to each planet
  const genratePlanet = (size, planetTexture, x, ring, labelName) => {
    const planetGeometry = new THREE.SphereGeometry(size, 50, 50);
    const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    const planetObj = new THREE.Object3D();
    planet.position.set(x, 0, 0);
  
    if (ring) {
      const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
      const ringMat = new THREE.MeshBasicMaterial({ map: ring.ringmat, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      planetObj.add(ringMesh);
      ringMesh.position.set(x, 0, 0);
      ringMesh.rotation.x = -0.5 * Math.PI;
    }
  
    scene.add(planetObj);
    planetObj.add(planet);
    createLineLoopWithMesh(x, 0xffffff, 3);
  
    // Add label with a line
    const label = createPlanetLabel(planetObj, labelName);
  
    // Attach userData for click detection
    planet.userData = { name: labelName };
  
    return {
      planetObj: planetObj,
      planet: planet,
      label: label, // Store the label reference
      clickableSquare: null, // No clickable square needed
      outline: null // No outline needed
    };
  };
  


  const planets = [
    {
      ...genratePlanet(3.2, mercuryTexture, 28, null, 'Mercury'),
      rotaing_speed_around_sun: 0.004,
      self_rotation_speed: 0.004,
    },
    {
      ...genratePlanet(5.8, venusTexture, 44, null, 'Venus'),
      rotaing_speed_around_sun: 0.015,
      self_rotation_speed: 0.002,
    },
    {
      ...genratePlanet(6, earthTexture, 62, null, 'Earth'),
      rotaing_speed_around_sun: 0.01,
      self_rotation_speed: 0.02,
    },
    {
      ...genratePlanet(4, marsTexture, 78, null, 'Mars'),
      rotaing_speed_around_sun: 0.008,
      self_rotation_speed: 0.018,
    },
    {
      ...genratePlanet(12, jupiterTexture, 100, null, 'Jupiter'),
      rotaing_speed_around_sun: 0.002,
      self_rotation_speed: 0.04,
    },
    {
      ...genratePlanet(10, saturnTexture, 138, {
        innerRadius: 10,
        outerRadius: 20,
        ringmat: saturnRingTexture,
      }, 'Saturn'),
      rotaing_speed_around_sun: 0.0009,
      self_rotation_speed: 0.038,
    },
    {
      ...genratePlanet(7, uranusTexture, 176, null, 'Uranus'),
      rotaing_speed_around_sun: 0.0004,
      self_rotation_speed: 0.03,
    },
    {
      ...genratePlanet(7, neptuneTexture, 200, null, 'Neptune'),
      rotaing_speed_around_sun: 0.0001,
      self_rotation_speed: 0.032,
    },
    {
      ...genratePlanet(2.8, plutoTexture, 216, null, 'Pluto'),
      rotaing_speed_around_sun: 0.0007,
      self_rotation_speed: 0.008,
    },
  ];
  
   // Ensure labels render on top


  // Animation loop (don't forget to call controls.update())
// Update animation loop to remove outline-related logic
function animate(time) {
  const minVisibleDistance = 300; // Distance where labels are fully visible
  const maxVisibleDistance = 600; // Distance where labels start to disappear
  const minScale = 60 // Increased scale value for labels when close to camera
  const maxScale = 30; // Increased minimum scale value for labels when far from camera

  planets.forEach(({ planetObj, planet, rotaing_speed_around_sun, self_rotation_speed, label }) => {
    // Rotate planets
    planetObj.rotateY(options.speed * rotaing_speed_around_sun);
    planet.rotateY(options.speed * self_rotation_speed);

    // Update the label position and scale
    if (label && label.sprite) {
      const planetWorldPosition = new THREE.Vector3();
      planet.getWorldPosition(planetWorldPosition);

      // Set the label's position with an offset
      label.sprite.position.copy(planetWorldPosition);
      label.sprite.position.y += 20; // Adjust vertically as needed

      // Calculate distance from camera to planet
      const distanceToCamera = camera.position.distanceTo(planetWorldPosition);

      // Calculate scale based on distance
      let scaleMultiplier;

      if (distanceToCamera < minVisibleDistance) {
        scaleMultiplier = maxScale; // Max size when close to camera
      } else if (distanceToCamera < maxVisibleDistance) {
        // Scale down as distance increases
        scaleMultiplier = maxScale + (minScale - maxScale) * (maxVisibleDistance - distanceToCamera) / (maxVisibleDistance - minVisibleDistance);
      } else {
        scaleMultiplier = minScale; // Min size when far from camera
      }

      // Apply scale to the label
      label.sprite.scale.set(scaleMultiplier, scaleMultiplier / 2, 1); // Adjust size proportionally
    }
  });

  controls.update(); // Update the controls each frame
  stars.rotation.y -= 0.0002 * options.speed;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
  //////////////////////////////////////
  //NOTE - GUI options
// Modify GUI options for speed control
const gui = new dat.GUI();
const options = {
  "Real view": true,
  "Show orbit": true,
  speed: 1,
};

// Control for 'Real view'
gui.add(options, "Real view").onChange((e) => {
  ambientLight.intensity = e ? 0 : 0.5;
});

// Control for 'Show orbit'
gui.add(options, "Show orbit").onChange((e) => {
  path_of_planets.forEach((dpath) => {
    dpath.visible = e;
  });
});

// Add a slider that allows both forward and backward motion for speed
const maxSpeed = new URL(window.location.href).searchParams.get("ms") * 1;
gui.add(options, "speed", -20, maxSpeed ? maxSpeed : 20).name("Speed");


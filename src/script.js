import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Cretaing a gui instance.
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// MeshPhysicalMaterial
const material = new THREE.MeshPhysicalMaterial();
// These are at 0 just so that we can see the effect of the transmission on a
// clear material.
material.metalness = 0;
material.roughness = 0;
gui.add(material, 'metalness').min(0).max(1).step(0.0001).name('Metalness');
gui.add(material, 'roughness').min(0).max(1).step(0.0001).name('Roughness');

// Transmission
material.transmission = 1;
material.ior = 2.5;
// This is a fixed value and the actual thickness of the object is not taken
// into account.
material.thickness = 0.5;
gui
	.add(material, 'transmission')
	.min(0)
	.max(1)
	.step(0.0001)
	.name('Transmission');
// The IOR range will not be realistic, but it will be enough to see the effect.
gui
	.add(material, 'ior')
	.min(1)
	.max(10)
	.step(0.0001)
	.name('Index of Refraction');
gui.add(material, 'thickness').min(0).max(1).step(0.0001).name('Thickness');

// First mesh: Sphere
const sphereGeomerty = new THREE.SphereGeometry(0.5, 64, 64);
const sphereMaterial = material;
const sphereMesh = new THREE.Mesh(sphereGeomerty, sphereMaterial);

// Second mesh: Plane
const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
const planeMaterial = material;
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.position.x = -2;

// Third mesh: Torus
const torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 64, 128);
const torusMaterial = material;
const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
torusMesh.position.x = 2;
scene.add(sphereMesh, planeMesh, torusMesh);

// Environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('textures/environmentMap/2k.hdr', (environmentMap) => {
	environmentMap.mapping = THREE.EquirectangularReflectionMapping;
	// Adds the background to the scene.
	scene.background = environmentMap;
	// This allows the background to contribute to the lighting of the scene.
	scene.environment = environmentMap;
});

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Rotating the objects.
	sphereMesh.rotation.y = elapsedTime * 0.1;
	planeMesh.rotation.y = elapsedTime * 0.1;
	torusMesh.rotation.y = elapsedTime * 0.1;

	sphereMesh.rotation.x = elapsedTime * -0.15;
	planeMesh.rotation.x = elapsedTime * -0.15;
	torusMesh.rotation.x = elapsedTime * -0.15;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();

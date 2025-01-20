import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const width = 10;
const height = 5;
const widthSegments = 100;
const heightSegments = 50;
const geometry = new THREE.PlaneGeometry(
  width,
  height,
  widthSegments,
  heightSegments
);

// animate the wave. uses sin and cos function to animate the wave
// calculates the x y and z position
const vertexShader = `
  precision highp float;
  
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vWave;

  void main() {    
    vec3 pos = position;
    float wave = sin(pos.x * 1.2 + uTime) * cos(pos.y * 0.8 + uTime);
    pos.z += wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
    vPos = pos;
    vWave = wave;
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform sampler2D tMap;
  uniform sampler2D tMap2;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vPos;
  varying float vWave;

  void main() {
  // use the loaded image in as texture
    vec3 color1 = texture2D(tMap, vUv).rgb;
    // vec3 color2 = texture2D(tMap2, vUv).rgb;
    // vec3 color = mix(color1, color2, step(vUv.x, sin(uTime * 0.5)));

    vec3 color = mix(vec3(0.0, 0.2, 1.0), vec3(1.0, 0.8, 0.0), vUv.y);
    // use color1 = the loaded image, as color
    gl_FragColor = vec4(color1, 1.0);
  }
`;
// line 58 and 63 changed to load the image in the shader

const texture = new THREE.TextureLoader().load("./temp.jpg");
const texture2 = new THREE.TextureLoader().load("./temp2.jpg");

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    tMap: { value: texture },
    tMap2: { value: texture2 },
    uTime: { value: 0.0 },
  },
  side: THREE.DoubleSide,
  // no wireframe visible
  // true = visible. This shows all the faces that can be manipulated
  wireframe: true,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

let clock = new THREE.Clock();
function animate() {
  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

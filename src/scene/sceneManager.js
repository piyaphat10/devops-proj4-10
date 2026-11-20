import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// จัดการ renderer, camera, controls, lights และ loop การเรนเดอร์
export function createSceneManager(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f24);
  scene.fog = new THREE.Fog(0x0a0f24, 70, 190);

  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    400,
  );
  camera.position.set(0, 15, 30);

  // ควบคุมกล้อง: หมุน / ซูมเข้า-ออก (รองรับเมาส์และทัช)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 70;
  controls.maxPolarAngle = Math.PI / 2 - 0.06; // ห้ามมุมต่ำเกินพื้น
  controls.enablePan = false;

  const tickers = [];
  const clock = new THREE.Clock();

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  function start() {
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      for (const fn of tickers) fn(t, dt);
      controls.update();
      renderer.render(scene, camera);
    });
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    addTicker: (fn) => tickers.push(fn),
    start,
  };
}

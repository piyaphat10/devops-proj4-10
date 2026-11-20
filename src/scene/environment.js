import * as THREE from 'three';
import { CONFIG } from '../app/config.js';

// ฟังก์ชันคลื่นน้ำ — ใช้ร่วมกันระหว่างผิวน้ำและกระทง (ให้กระทงลอยตามจริง)
export function waveHeight(x, z, t) {
  return Math.sin(x * 0.35 + t * 1.1) * 0.06 + Math.cos(z * 0.6 + t * 0.8) * 0.045;
}

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,244,200,1)');
  g.addColorStop(0.35, 'rgba(255,240,190,0.45)');
  g.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// แวดล้อม: พื้น, แม่น้ำ, ดวงจันทร์, ท้องฟ้า, แสง
export function createEnvironment(scene) {
  // ----- แสง -----
  scene.add(new THREE.AmbientLight(0x33415e, 1.15));
  const moonLight = new THREE.DirectionalLight(0xbfd4ff, 1.0);
  moonLight.position.set(40, 45, -50);
  scene.add(moonLight);
  const warmA = new THREE.PointLight(0xffb46b, 55, 55, 2);
  warmA.position.set(-18, 7, -8);
  scene.add(warmA);
  const warmB = new THREE.PointLight(0xffb46b, 45, 50, 2);
  warmB.position.set(20, 7, -8);
  scene.add(warmB);

  // ----- พื้น -----
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color: 0x10281a, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);

  // ----- แม่น้ำ -----
  const bed = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.riverLength, CONFIG.riverWidth + 2),
    new THREE.MeshStandardMaterial({ color: 0x04182b, roughness: 1 }),
  );
  bed.rotation.x = -Math.PI / 2;
  bed.position.y = -0.3;
  scene.add(bed);

  // ฝั่งแม่น้ำ
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x274b33, roughness: 1 });
  for (const side of [-1, 1]) {
    const bank = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.riverLength, CONFIG.bankHeight, 1.2),
      bankMat,
    );
    bank.position.set(0, CONFIG.bankHeight / 2 - 0.02, side * (CONFIG.riverWidth / 2 + 0.6));
    scene.add(bank);
  }

  // ผิวน้ำ (เลื่อนคลื่น)
  const waterGeo = new THREE.PlaneGeometry(CONFIG.riverLength, CONFIG.riverWidth, 72, 12);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0e4a7a,
    transparent: true,
    opacity: 0.88,
    roughness: 0.18,
    metalness: 0.55,
    emissive: 0x0a2f55,
    emissiveIntensity: 0.35,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 0.02;
  scene.add(water);
  const basePos = waterGeo.attributes.position.array.slice();

  // ----- ดวงจันทร์ + แสงรอบ -----
  const moonPos = new THREE.Vector3(38, 30, -70);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff6d8 }),
  );
  moon.position.copy(moonPos);
  scene.add(moon);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color: 0xfff2c0,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }));
  glow.scale.setScalar(34);
  glow.position.copy(moonPos);
  scene.add(glow);

  // ----- ดาว -----
  const starCount = 500;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 170;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) * 0.6 + 12;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xcfd8ff, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.9,
  })));

  // ----- แอนิเมชันน้ำ -----
  function tick(t) {
    const p = waterGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = basePos[i * 3];
      const z = basePos[i * 3 + 2];
      p.array[i * 3 + 1] = waveHeight(x, z, t);
    }
    p.needsUpdate = true;
    waterGeo.computeVertexNormals();
  }

  return { tick };
}

import * as THREE from 'three';
import { CONFIG, getStyle } from '../app/config.js';
import { waveHeight } from './environment.js';

// สร้างโมเดลกระทง (โมเดลเดียว เปลี่ยนสี/ลวดลายตาม style)
export function createKrathong(styleId) {
  const style = getStyle(styleId);
  const g = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: style.base, roughness: 0.85 });
  const petalMat = new THREE.MeshStandardMaterial({ color: style.petal, roughness: 0.6 });
  const flowerMat = new THREE.MeshStandardMaterial({ color: style.flower, roughness: 0.55 });
  const flameMat = new THREE.MeshStandardMaterial({
    color: style.flame, emissive: style.flame, emissiveIntensity: 2.4,
  });
  const candleMat = new THREE.MeshStandardMaterial({ color: 0xfff3d6, roughness: 0.5 });

  // ฐาน
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.16, 18), baseMat);
  base.position.y = 0.08;
  g.add(base);

  // ใบบัวพับรอบขอบ (10 ใบ เอียงออกด้านนอก)
  const petalGeo = new THREE.ConeGeometry(0.14, 0.42, 6);
  for (let i = 0; i < 10; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i / 10) * Math.PI * 2;
    const p = new THREE.Mesh(petalGeo, petalMat);
    p.position.set(0, 0.28, 0.42);
    p.rotation.x = 0.55;
    holder.add(p);
    g.add(holder);
  }

  // ดอกไม้กลาง ๆ
  const flowerGeo = new THREE.IcosahedronGeometry(0.13, 0);
  const flowerPos = [[0.18, 0.26, 0.05], [-0.14, 0.26, 0.12], [0.02, 0.27, -0.16], [-0.05, 0.25, -0.05]];
  for (const [x, y, z] of flowerPos) {
    const f = new THREE.Mesh(flowerGeo, flowerMat);
    f.position.set(x, y, z);
    g.add(f);
  }

  // เทียน + เปลวไฟ
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), candleMat);
  candle.position.set(0, 0.32, 0);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 8), flameMat);
  flame.position.set(0, 0.54, 0);
  g.add(candle, flame);

  return g;
}

// จัดการกระทงในฉาก: สร้าง/ลบตามข้อมูล + แอนิเมชันลอย
export class KrathongManager {
  constructor(scene) {
    this.scene = scene;
    this.items = new Map(); // id -> { group, speed, phase, spin }
  }

  groups() {
    return [...this.items.values()].map((i) => i.group);
  }

  sync(krathongs) {
    const ids = new Set(krathongs.map((k) => k.id));
    for (const [id, item] of this.items) {
      if (!ids.has(id)) {
        this.scene.remove(item.group);
        this.items.delete(id);
      }
    }
    for (const k of krathongs) {
      if (!this.items.has(k.id)) {
        const group = createKrathong(k.styleId);
        group.userData.krathongId = k.id;
        group.position.set(
          (Math.random() - 0.5) * CONFIG.riverLength * 0.9,
          0,
          (Math.random() - 0.5) * (CONFIG.riverWidth - 3),
        );
        group.scale.setScalar(0.9 + Math.random() * 0.5);
        this.scene.add(group);
        this.items.set(k.id, {
          group,
          speed: CONFIG.krathongSpeed * (0.7 + Math.random() * 0.6),
          phase: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.4,
        });
      }
    }
  }

  tick(t, dt) {
    const half = CONFIG.riverLength / 2;
    for (const item of this.items.values()) {
      const g = item.group;
      g.position.x += item.speed * dt;
      if (g.position.x > half + 2) g.position.x = -half - 2;
      g.position.y = waveHeight(g.position.x, g.position.z, t) + 0.05;
      g.rotation.y += item.spin * dt;
      g.rotation.x = Math.sin(t * 1.3 + item.phase) * 0.06;
      g.rotation.z = Math.cos(t * 1.1 + item.phase) * 0.06;
    }
  }
}

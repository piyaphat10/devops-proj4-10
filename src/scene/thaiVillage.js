import * as THREE from 'three';
import { CONFIG } from '../app/config.js';

// วัสดุใช้ร่วม
const wood = new THREE.MeshStandardMaterial({ color: 0x7a4a2b, roughness: 0.8 });
const darkWood = new THREE.MeshStandardMaterial({ color: 0x54341d, roughness: 0.85 });
const wall = new THREE.MeshStandardMaterial({ color: 0xd9c9a8, roughness: 0.9 });
const roofRed = new THREE.MeshStandardMaterial({ color: 0x8e2f23, roughness: 0.7 });
const white = new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.85 });
const gold = new THREE.MeshStandardMaterial({
  color: 0xd4af37, roughness: 0.35, metalness: 0.7, emissive: 0x33270a, emissiveIntensity: 0.4,
});

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

// บ้านทรงไทย: เสาสูง พื้นไม้ หลังคาทรงชาน
export function createThaiHouse() {
  const g = new THREE.Group();

  // เสา
  const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8);
  for (const dx of [-2.6, -0.9, 0.9, 2.6]) {
    for (const dz of [-2.1, -0.7, 0.7, 2.1]) {
      const p = new THREE.Mesh(postGeo, darkWood);
      p.position.set(dx, 0.8, dz);
      g.add(p);
    }
  }

  // พื้น + ผนัง
  g.add(box(6.2, 0.25, 5.2, wood, 0, 1.72, 0));
  g.add(box(5.6, 2.2, 4.6, wall, 0, 2.95, 0));

  // ประตู-หน้าต่าง
  g.add(box(1.0, 1.3, 0.1, darkWood, 0, 2.75, 2.32));
  g.add(box(0.9, 1.1, 0.1, darkWood, -1.8, 2.7, 2.32));
  g.add(box(0.9, 1.1, 0.1, darkWood, 1.8, 2.7, 2.32));

  // หลังคา 2 ชานเอียง
  const roofGeo = new THREE.BoxGeometry(6.6, 0.14, 3.4);
  const r1 = new THREE.Mesh(roofGeo, roofRed);
  r1.position.set(0, 4.7, 1.32);
  r1.rotation.x = 0.62;
  const r2 = new THREE.Mesh(roofGeo, roofRed);
  r2.position.set(0, 4.7, -1.32);
  r2.rotation.x = -0.62;
  g.add(r1, r2);

  // ยอดหลังคา (จบจั่วแบบยอดเดียว)
  const cap = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.5, 4), roofRed);
  cap.position.set(0, 5.1, 0);
  cap.rotation.y = Math.PI / 4;
  cap.scale.set(1.25, 1, 0.9);
  g.add(cap);

  // บันได
  g.add(box(1.2, 0.9, 0.8, wood, 0, 0.45, 2.9));

  return g;
}

// วัด: อุโบสิต เสาทอง หลังคา 3 ชั้น
export function createTemple() {
  const g = new THREE.Group();

  // ฐาน
  g.add(box(9, 0.8, 7, white, 0, 0.4, 0));

  // เสาทองรอบ ๆ
  const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 10);
  for (let i = -3; i <= 3; i++) {
    for (const dz of [-3.2, 3.2]) {
      const c = new THREE.Mesh(colGeo, gold);
      c.position.set(i * 1.3, 2.4, dz);
      g.add(c);
    }
  }
  for (let i = -2; i <= 2; i++) {
    for (const dx of [-4.2, 4.2]) {
      const c = new THREE.Mesh(colGeo, gold);
      c.position.set(dx, 2.4, i * 1.3);
      g.add(c);
    }
  }

  // ตัวอาคาร
  g.add(box(7.4, 2.6, 5.6, wall, 0, 2.5, 0));
  g.add(box(1.4, 2.2, 0.15, darkWood, 0, 2.2, 2.85));

  // หลังคา 3 ชั้น
  g.add(box(10.4, 0.5, 8.4, roofRed, 0, 4.35, 0));
  g.add(box(8.2, 0.5, 6.4, roofRed, 0, 5.1, 0));
  g.add(box(6.0, 0.5, 4.4, roofRed, 0, 5.85, 0));

  // ยอดเฉลียง (จบสร้าย)
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 8), gold);
  finial.position.set(0, 6.9, 0);
  g.add(finial);

  return g;
}
// เจดีย์: ฐานซ้อน + ทรงระฆัง (Lathe) + ยอดแหลม
export function createChedi() {
  const g = new THREE.Group();

  // ฐาน 3 ชั้น
  g.add(box(4.6, 0.7, 4.6, white, 0, 0.35, 0));
  g.add(box(3.6, 0.7, 3.6, white, 0, 1.05, 0));
  g.add(box(2.6, 0.7, 2.6, white, 0, 1.75, 0));

  // ทรงระฆัง
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.15, 0.05),
    new THREE.Vector2(1.35, 0.5),
    new THREE.Vector2(1.2, 1.4),
    new THREE.Vector2(0.75, 2.1),
    new THREE.Vector2(0.35, 2.5),
    new THREE.Vector2(0.0, 2.6),
  ];
  const bell = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), gold);
  bell.position.y = 2.1;
  g.add(bell);

  // ยอดแหลม
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.6, 8), gold);
  spire.position.y = 5.4;
  g.add(spire);

  return g;
}

// จัดวางหมู่สถาปัตยกรรมริมแม่น้ำ
export function createThaiVillage(scene) {
  const house = createThaiHouse();
  house.position.set(-19, 0, -13);
  house.rotation.y = 0.5;
  scene.add(house);

  const temple = createTemple();
  temple.position.set(19, 0, -16);
  temple.rotation.y = -0.35;
  scene.add(temple);

  const chedi = createChedi();
  chedi.position.set(31, 0, -5);
  scene.add(chedi);

  // เสาโคมไฟริมแม่น้ำ (ทั้ง 2 ฝั่ง)
  const lampGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
  const bulbGeo = new THREE.SphereGeometry(0.16, 10, 10);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffd27a, emissive: 0xffb44d, emissiveIntensity: 1.2,
  });
  for (const side of [-1, 1]) {
    for (const x of [-24, -8, 8, 24]) {
      const z = side * (CONFIG.riverWidth / 2 + 1.8);
      const pole = new THREE.Mesh(poleGeo, darkWood);
      pole.position.set(x, 1.1, z);
      lampGroup.add(pole);
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(x, 2.3, z);
      lampGroup.add(bulb);
    }
  }
  scene.add(lampGroup);

  return {};
}


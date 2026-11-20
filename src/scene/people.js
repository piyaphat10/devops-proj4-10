import * as THREE from 'three';
import { CONFIG } from '../app/config.js';

const SKIN_TONES = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524];
const CLOTHES = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad, 0x16a085, 0xe67e22, 0xecf0f1];

// ผู้คนเดินชมงาน 20 คน เดินวนตามริมแม่น้ำ
export class PeopleManager {
  constructor(scene) {
    this.scene = scene;
    this.people = [];

    const lanes = [
      { z: CONFIG.riverWidth / 2 + 2.2, dir: 1 },
      { z: CONFIG.riverWidth / 2 + 4.2, dir: -1 },
      { z: -(CONFIG.riverWidth / 2 + 2.2), dir: -1 },
      { z: -(CONFIG.riverWidth / 2 + 4.2), dir: 1 },
    ];

    for (let i = 0; i < CONFIG.maxPeople; i++) {
      const lane = lanes[i % lanes.length];
      const person = this.createPerson(i);
      person.position.set(
        (Math.random() - 0.5) * CONFIG.riverLength,
        0,
        lane.z + (Math.random() - 0.5) * 1.2,
      );
      person.userData = {
        dir: lane.dir,
        speed: 0.8 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
      };
      this.scene.add(person);
      this.people.push(person);
    }
  }

  createPerson(i) {
    const g = new THREE.Group();
    const cloth = new THREE.MeshStandardMaterial({ color: CLOTHES[i % CLOTHES.length], roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: SKIN_TONES[i % SKIN_TONES.length], roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 4, 10), cloth);
    body.position.y = 0.75;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skin);
    head.position.y = 1.35;

    g.add(body, head);
    return g;
  }

  tick(t, dt) {
    const half = CONFIG.riverLength / 2 + 4;
    for (const p of this.people) {
      const u = p.userData;
      p.position.x += u.speed * u.dir * dt;
      if (p.position.x > half) p.position.x = -half;
      if (p.position.x < -half) p.position.x = half;
      // แอนิเมชันกระดกตัวขณะเดิน
      p.position.y = Math.abs(Math.sin(t * 6 * u.speed + u.phase)) * 0.05;
      p.rotation.y = u.dir > 0 ? 0 : Math.PI;
      p.rotation.z = Math.sin(t * 6 * u.speed + u.phase) * 0.05;
    }
  }
}

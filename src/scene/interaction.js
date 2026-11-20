import * as THREE from 'three';

// ตรวจจับการแตะ/คลิกที่กระทง (แยกแค่ย้ายกล้องคลิกลาก)
export function createInteraction({ domElement, camera, krathongManager, onTapKrathong }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downX = 0;
  let downY = 0;

  function setPointer(e) {
    const rect = domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function findKrathongId(obj) {
    let o = obj;
    while (o) {
      if (o.userData && o.userData.krathongId) return o.userData.krathongId;
      o = o.parent;
    }
    return null;
  }

  domElement.addEventListener('pointerdown', (e) => {
    downX = e.clientX;
    downY = e.clientY;
  });

  domElement.addEventListener('pointerup', (e) => {
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (dx * dx + dy * dy > 36) return; // เป็นการลากกล้อง ไม่ใช่การแตะ

    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(krathongManager.groups(), true);
    if (hits.length > 0) {
      const id = findKrathongId(hits[0].object);
      if (id) onTapKrathong(id);
    }
  });

  // เปลี่ยนเคอร์เซอร์เป็น pointer เมื่อชี้ที่กระทง (เฉพาะเมาส์)
  domElement.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(krathongManager.groups(), true);
    domElement.style.cursor = hits.length > 0 ? 'pointer' : '';
  });
}

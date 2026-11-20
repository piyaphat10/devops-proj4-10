import { createSceneManager } from './scene/sceneManager.js';
import { createEnvironment } from './scene/environment.js';
import { createThaiVillage } from './scene/thaiVillage.js';
import { KrathongManager } from './scene/krathong.js';
import { PeopleManager } from './scene/people.js';
import { createInteraction } from './scene/interaction.js';
import { store } from './app/store.js';
import { initPopup, showKrathongPopup } from './ui/popup.js';
import { openRegisterForm } from './ui/registerForm.js';
import { openAdmin } from './ui/adminPanel.js';
import { showToast } from './ui/toast.js';

async function init() {
  const container = document.getElementById('scene-container');
  const sm = createSceneManager(container);

  // ฉากแวดล้อม (แม่น้ำ ดวงจันทร์ ท้องฟ้า แสง)
  const env = createEnvironment(sm.scene);
  sm.addTicker(env.tick);

  // บ้านไทย วัด เจดีย์
  createThaiVillage(sm.scene);

  // ผู้คนเดินชมงาน 20 คน
  const people = new PeopleManager(sm.scene);
  sm.addTicker(people.tick.bind(people));

  // กระทงในแม่น้ำ
  const krathongManager = new KrathongManager(sm.scene);
  sm.addTicker(krathongManager.tick.bind(krathongManager));

  // แตะกระทงเพื่อดูข้อมูล + โหวต
  createInteraction({
    domElement: sm.renderer.domElement,
    camera: sm.camera,
    krathongManager,
    onTapKrathong: (id) => {
      const k = store.krathongs.find((x) => x.id === id);
      if (k) showKrathongPopup(k);
    },
  });

  // ซิงก์ข้อมูล → ฉาก + แถบสถานะ
  store.onChange('krathongs', (list) => {
    krathongManager.sync(list);
    updateStatusBar();
  });
  store.onChange('settings', updateStatusBar);

  await store.init();

  // ปุ่ม UI หลัก
  document.getElementById('btn-register').addEventListener('click', openRegisterForm);
  document.getElementById('btn-admin').addEventListener('click', openAdmin);

  initPopup();
  updateStatusBar();
  sm.start();

  if (store.mode === 'local') {
    showToast('โหมดเดโม: ข้อมูลถูกเก็บไว้ในเบราว์เซอร์นี้ (ยังไม่ได้ต่อ Firebase)', '');
  }
}

function updateStatusBar() {
  const el = document.getElementById('status-bar');
  const n = store.krathongs.length;
  const q = store.settings.quota;
  const open = store.settings.registrationOpen;
  el.classList.toggle('closed', !open);
  el.innerHTML = open
    ? `<span class="dot">●</span> รับสมัครอยู่ · กระทง ${n}/${q} ลำ`
    : `<span class="dot">●</span> ปิดรับสมัครแล้ว · กระทง ${n}/${q} ลำ`;
}

init().catch((err) => {
  console.error(err);
  showToast('เริ่มแอปไม่สำเร็จ: ' + err.message, 'err');
});

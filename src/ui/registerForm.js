import { store } from '../app/store.js';
import { KRATHONG_STYLES } from '../app/config.js';
import { fileToResizedDataUrl } from '../app/utils.js';
import { showToast } from './toast.js';

let overlayEl = null;
let selectedStyle = KRATHONG_STYLES[0].id;
let photoDataUrl = null;
let submitting = false;

export function openRegisterForm() {
  if (overlayEl) return;
  if (!store.settings.registrationOpen) {
    showToast('ขณะนี้ปิดรับสมัครแล้ว', 'err');
    return;
  }
  if (store.krathongs.length >= store.settings.quota) {
    showToast('ครบจำนวนกระทงที่กำหนดแล้ว (สูงสุด ' + store.settings.quota + ' ลำ)', 'err');
    return;
  }

  selectedStyle = KRATHONG_STYLES[0].id;
  photoDataUrl = null;
  submitting = false;

  overlayEl = document.createElement('div');
  overlayEl.className = 'overlay';
  overlayEl.innerHTML = `
    <div class="card-wrap">
      <div class="card">
        <button class="close-x" aria-label="ปิด">×</button>
        <h2>🎉 สมัครลอยกระทง</h2>
        <div class="form-error" data-error></div>

        <label class="photo-upload" data-upload>
          <input type="file" accept="image/*" data-file />
          <img data-preview alt="ตัวอย่างรูป" />
          <span class="hint">📷 ถ่ายรูปตัวเอง หรือเลือกรูปจากแกลเลอรี่</span>
        </label>

        <div class="field" style="margin-top:14px">
          <label>ชื่อของคุณ</label>
          <input type="text" data-name maxlength="60" placeholder="เช่น สมชาย ใจดี" />
        </div>

        <div class="field">
          <label>คำอธิษฐาน</label>
          <textarea data-wish maxlength="300" placeholder="อธิษฐานสิ่งที่อยากขอให้ปีหน้า…"></textarea>
        </div>

        <div class="field">
          <label>เลือกแบบกระทง</label>
          <div class="style-grid" data-styles></div>
        </div>

        <button class="btn btn-gold" style="width:100%" data-submit>บันทึกและลอยกระทง 🪷</button>
      </div>
    </div>
  `;

  // ตัวเลือกแบบกระทง
  const grid = overlayEl.querySelector('[data-styles]');
  for (const s of KRATHONG_STYLES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'style-item' + (s.id === selectedStyle ? ' selected' : '');
    const color = '#' + s.petal.toString(16).padStart(6, '0');
    b.innerHTML = `<div class="swatch" style="background:${color}"></div>${s.name}`;
    b.addEventListener('click', () => {
      selectedStyle = s.id;
      grid.querySelectorAll('.style-item').forEach((el) => el.classList.remove('selected'));
      b.classList.add('selected');
    });
    grid.appendChild(b);
  }

  // อัปโหลดรูป
  const fileInput = overlayEl.querySelector('[data-file]');
  const preview = overlayEl.querySelector('[data-preview]');
  const uploadLabel = overlayEl.querySelector('[data-upload]');
  uploadLabel.addEventListener('click', (e) => {
    if (e.target !== fileInput) fileInput.click();
  });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    try {
      photoDataUrl = await fileToResizedDataUrl(file);
      preview.src = photoDataUrl;
      uploadLabel.classList.add('has-img');
    } catch {
      showToast('อ่านไฟล์รูปไม่สำเร็จ', 'err');
    }
  });

  // ปิด
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl || e.target.closest('.close-x')) closeRegisterForm();
  });

  // ส่งฟอร์ม
  overlayEl.querySelector('[data-submit]').addEventListener('click', onSubmit);

  document.getElementById('overlay-root').appendChild(overlayEl);
}

async function onSubmit() {
  if (submitting) return;
  const name = overlayEl.querySelector('[data-name]').value.trim();
  const wish = overlayEl.querySelector('[data-wish]').value.trim();
  const errEl = overlayEl.querySelector('[data-error]');

  if (!photoDataUrl) { errEl.textContent = 'กรุณาแนบรูปถ่ายตัวเอง'; return; }
  if (!name) { errEl.textContent = 'กรุณาป้อนชื่อ'; return; }
  if (!wish) { errEl.textContent = 'กรุณาป้อนคำอธิษฐาน'; return; }
  errEl.textContent = '';

  submitting = true;
  const btn = overlayEl.querySelector('[data-submit]');
  btn.disabled = true;
  btn.textContent = 'กำลังบันทึก…';

  try {
    await store.addKrathong({ name, wish, styleId: selectedStyle, photoDataUrl });
    closeRegisterForm();
    showToast('บันทึกสำเร็จ! กระทงของคุณกำลังลอยในแม่น้ำ 🪷', 'ok');
  } catch (err) {
    errEl.textContent = err.message || 'บันทึกไม่สำเร็จ';
    btn.disabled = false;
    btn.textContent = 'บันทึกและลอยกระทง 🪷';
    submitting = false;
  }
}

export function closeRegisterForm() {
  if (overlayEl) overlayEl.remove();
  overlayEl = null;
  photoDataUrl = null;
}

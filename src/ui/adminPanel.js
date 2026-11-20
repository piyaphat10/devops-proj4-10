import { store } from '../app/store.js';
import { escapeHtml, formatNumber } from '../app/utils.js';
import { showToast } from './toast.js';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
const SESSION_KEY = 'lk_admin_session';
const PH = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23223044'/%3E%3Ctext x='20' y='27' font-size='20' text-anchor='middle'%3E%F0%9F%AA%B7%3C/text%3E%3C/svg%3E";

let overlayEl = null;
let unsubscribers = [];

export function openAdmin() {
  if (overlayEl) return;
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    openAdminPanel();
  } else {
    openAdminLogin();
  }
}

/* ---------- หน้าล็อกอิน ---------- */
function openAdminLogin() {
  closeAdmin();
  overlayEl = document.createElement('div');
  overlayEl.className = 'overlay';
  overlayEl.innerHTML = `
    <div class="card-wrap">
      <div class="card">
        <button class="close-x" aria-label="ปิด">×</button>
        <h2>🔒 เข้าสู่ระบบผู้ดูแล</h2>
        <div class="form-error" data-error></div>
        <div class="field">
          <label>รหัสผ่าน</label>
          <input type="password" data-password placeholder="กรอกรหัสผ่าน" />
        </div>
        <button class="btn btn-gold" style="width:100%" data-login>เข้าสู่ระบบ</button>
      </div>
    </div>
  `;
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl || e.target.closest('.close-x')) closeAdmin();
  });
  const input = overlayEl.querySelector('[data-password]');
  input.focus();
  const tryLogin = () => {
    if (input.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      if (ADMIN_PASSWORD === 'admin123') {
        showToast('⚠️ กำลังใช้รหัสผ่านเริ่มต้น admin123 — ควรเปลี่ยนใน .env', 'err');
      }
      openAdminPanel();
    } else {
      overlayEl.querySelector('[data-error]').textContent = 'รหัสผ่านไม่ถูกต้อง';
    }
  };
  overlayEl.querySelector('[data-login]').addEventListener('click', tryLogin);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryLogin(); });
  document.getElementById('overlay-root').appendChild(overlayEl);
}
/* ---------- หน้าจัดการระบบ ---------- */
function openAdminPanel() {
  closeAdmin();
  overlayEl = document.createElement('div');
  overlayEl.className = 'overlay';
  overlayEl.innerHTML = `
    <div class="card-wrap">
      <div class="card">
        <button class="close-x" aria-label="ปิด">×</button>
        <h2>🔒 หน้าจัดการระบบ</h2>

        <div class="admin-stats">
          <div class="stat-box"><div class="num" data-stat-count>0/0</div><div class="label">กระทง / โควตา</div></div>
          <div class="stat-box"><div class="num" data-stat-votes>0</div><div class="label">คะแนนรวม</div></div>
        </div>

        <div class="admin-controls">
          <div class="line">
            <span>เปิดรับสมัคร</span>
            <label class="switch">
              <input type="checkbox" data-toggle-open />
              <span class="slider"></span>
            </label>
          </div>
          <div class="line">
            <span>โควตากระทง (ลำ)</span>
            <span>
              <input type="number" min="1" max="999" data-quota />
              <button class="btn btn-sm" data-save-quota>บันทึก</button>
            </span>
          </div>
          <div class="line">
            <button class="btn btn-sm" data-reset-votes>รีเซ็ตคะแนนทั้งหมด</button>
            <button class="btn btn-sm btn-danger" data-reset-all>ล้างข้อมูลทั้งหมด</button>
          </div>
        </div>

        <div data-list></div>

        <button class="btn btn-sm" style="width:100%;margin-top:14px" data-logout>ออกจากระบบ</button>
      </div>
    </div>
  `;

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl || e.target.closest('.close-x')) closeAdmin();
  });

  overlayEl.querySelector('[data-toggle-open]').addEventListener('change', async (e) => {
    await store.setRegistrationOpen(e.target.checked);
    showToast(e.target.checked ? 'เปิดรับสมัครแล้ว' : 'ปิดรับสมัครแล้ว', 'ok');
  });

  overlayEl.querySelector('[data-save-quota]').addEventListener('click', async () => {
    const q = overlayEl.querySelector('[data-quota]').value;
    await store.setQuota(q);
    showToast('บันทึกโควตาแล้ว', 'ok');
  });

  overlayEl.querySelector('[data-reset-votes]').addEventListener('click', async () => {
    if (!confirm('รีเซ็ตคะแนนโหวตทั้งหมดเป็น 0 ?')) return;
    await store.resetVotes();
    showToast('รีเซ็ตคะแนนแล้ว', 'ok');
  });

  overlayEl.querySelector('[data-reset-all]').addEventListener('click', async () => {
    if (!confirm('ล้างข้อมูลกระทงทั้งหมดและคะแนนโหวต ? (ลบถาวร)')) return;
    await store.resetAll();
    showToast('ล้างข้อมูลทั้งหมดแล้ว', 'ok');
  });

  overlayEl.querySelector('[data-logout]').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    closeAdmin();
  });

  unsubscribers.push(store.onChange('krathongs', renderPanel));
  unsubscribers.push(store.onChange('settings', renderPanel));

  renderPanel();
  document.getElementById('overlay-root').appendChild(overlayEl);
}

function renderPanel() {
  if (!overlayEl) return;
  const count = store.krathongs.length;
  const totalVotes = store.krathongs.reduce((s, k) => s + (k.votes || 0), 0);
  overlayEl.querySelector('[data-stat-count]').textContent = `${count}/${store.settings.quota}`;
  overlayEl.querySelector('[data-stat-votes]').textContent = formatNumber(totalVotes);
  overlayEl.querySelector('[data-toggle-open]').checked = store.settings.registrationOpen;
  overlayEl.querySelector('[data-quota]').value = store.settings.quota;

  const list = overlayEl.querySelector('[data-list]');
  if (count === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--muted);padding:18px">ยังไม่มีกระทงในแม่น้ำ</div>';
    return;
  }
  const sorted = [...store.krathongs].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  list.innerHTML = sorted.map((k, i) => `
    <div class="admin-row">
      <span style="width:18px;color:var(--muted);font-size:.8rem">${i + 1}</span>
      <img src="${escapeHtml(k.photoUrl || PH)}" alt="" />
      <div class="info">
        <div class="n">${escapeHtml(k.name)}</div>
        <div class="v">⭐ ${formatNumber(k.votes)} คะแนน</div>
      </div>
      <button class="btn btn-sm btn-danger" data-delete="${escapeHtml(k.id)}">ลบ</button>
    </div>
  `).join('');

  // ผูกปุ่มลบใหม่ทุกครั้งที่ re-render
  bindListActions();
}

function bindListActions() {
  overlayEl.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm(`ลบกระทงของ "${store.krathongs.find((k) => k.id === btn.dataset.delete)?.name}" ?`)) return;
      await store.deleteKrathong(btn.dataset.delete);
      showToast('ลบกระทงแล้ว', 'ok');
    });
  });
}

export function closeAdmin() {
  unsubscribers.forEach((u) => u());
  unsubscribers = [];
  if (overlayEl) overlayEl.remove();
  overlayEl = null;
}


import { escapeHtml, formatNumber } from '../app/utils.js';
import { getStyle } from '../app/config.js';
import { store } from '../app/store.js';
import { showToast } from './toast.js';

let overlayEl = null;
let currentId = null;

// เรียกครั้งเดียวตอนเริ่มแอป — รีเฟรชคะแนนใน popup เมื่อข้อมูลเปลี่ยน
export function initPopup() {
  store.onChange('krathongs', (list) => {
    if (!currentId || !overlayEl) return;
    const k = list.find((x) => x.id === currentId);
    if (!k) { closePopup(); return; }
    const numEl = overlayEl.querySelector('.krathong-score .num');
    if (numEl) numEl.textContent = formatNumber(k.votes);
    const btn = overlayEl.querySelector('[data-vote]');
    if (btn && store.hasVoted(k.id)) setVotedState(btn);
  });
}

export function showKrathongPopup(krathong) {
  closePopup();
  currentId = krathong.id;

  const style = getStyle(krathong.styleId);
  const photoHtml = krathong.photoUrl
    ? `<img class="krathong-photo" src="${escapeHtml(krathong.photoUrl)}" alt="รูปโปรไฟล์" />`
    : `<div class="krathong-photo" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem">🪷</div>`;

  overlayEl = document.createElement('div');
  overlayEl.className = 'overlay';
  overlayEl.innerHTML = `
    <div class="card-wrap">
      <div class="card">
        <button class="close-x" aria-label="ปิด">×</button>
        ${photoHtml}
        <div class="krathong-name">${escapeHtml(krathong.name)}</div>
        <div class="krathong-style">กระทงสไตล์ ${escapeHtml(style.name)}</div>
        <div class="krathong-wish">${escapeHtml(krathong.wish)}</div>
        <div class="krathong-score">
          <span class="num">${formatNumber(krathong.votes)}</span>
          <span class="label">คะแนน</span>
        </div>
        <button class="btn btn-gold" style="width:100%" data-vote>👍 โหวตกระทงใบนี้</button>
      </div>
    </div>
  `;

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl || e.target.closest('.close-x')) closePopup();
  });

  const btn = overlayEl.querySelector('[data-vote]');
  if (store.hasVoted(krathong.id)) {
    setVotedState(btn);
  } else {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'กำลังโหวต…';
      try {
        const ok = await store.vote(krathong.id);
        if (ok) {
          showToast('โหวตเรียบร้อย ขอบคุณที่ร่วมแสดงความคิดเห็น 🎉', 'ok');
          setVotedState(btn);
        } else {
          showToast('คุณเคยโหวตกระทงใบนี้ไปแล้ว', 'err');
          setVotedState(btn);
        }
      } catch (err) {
        showToast(`เกิดข้อผิดพลาด: ${err.message}`, 'err');
        btn.disabled = false;
        btn.textContent = '👍 โหวตกระทงใบนี้';
      }
    });
  }

  document.getElementById('overlay-root').appendChild(overlayEl);
}

function setVotedState(btn) {
  btn.disabled = true;
  btn.textContent = '✓ คุณโหวตกระทงใบนี้แล้ว';
}

export function closePopup() {
  if (overlayEl) overlayEl.remove();
  overlayEl = null;
  currentId = null;
}

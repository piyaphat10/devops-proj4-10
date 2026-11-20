// ชั้นจัดการข้อมูล: Firebase (เมื่อมี config) หรือ localStorage (โหมดเดโม)
import { isFirebaseEnabled, db } from './firebase.js';
import { uid } from './utils.js';
import { CONFIG } from './config.js';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, setDoc, deleteDoc,
  increment, serverTimestamp,
} from 'firebase/firestore';

const LS = {
  settings: 'lk_settings',
  krathongs: 'lk_krathongs',
  voted: 'lk_voted_krathongs',
};

const readLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const writeLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function getVotedIds() { return readLS(LS.voted, []); }
function markVoted(id) { writeLS(LS.voted, [...getVotedIds(), id]); }

/* ---------------- โหมดเดโม (localStorage) ---------------- */
function createLocalStore() {
  const listeners = { krathongs: new Set(), settings: new Set() };
  const store = {
    mode: 'local',
    settings: { registrationOpen: true, quota: CONFIG.defaultQuota },
    krathongs: [],
    async init() {
      this.settings = { registrationOpen: true, quota: CONFIG.defaultQuota, ...readLS(LS.settings, {}) };
      this.krathongs = readLS(LS.krathongs, []);
      this.emit('settings');
      this.emit('krathongs');
    },
    onChange(type, cb) { listeners[type].add(cb); return () => listeners[type].delete(cb); },
    emit(type) { listeners[type].forEach((cb) => cb(this[type])); },
    async addKrathong({ name, wish, styleId, photoDataUrl }) {
      if (!this.settings.registrationOpen) throw new Error('ปิดรับสมัครแล้ว');
      if (this.krathongs.length >= this.settings.quota) throw new Error('ครบจำนวนกระทงที่กำหนดแล้ว');
      const k = { id: uid(), name, wish, styleId, photoUrl: photoDataUrl, votes: 0, createdAt: Date.now() };
      this.krathongs = [...this.krathongs, k];
      writeLS(LS.krathongs, this.krathongs);
      this.emit('krathongs');
      return k;
    },
    async vote(id) {
      if (getVotedIds().includes(id)) return false;
      const k = this.krathongs.find((x) => x.id === id);
      if (!k) return false;
      k.votes += 1;
      markVoted(id);
      writeLS(LS.krathongs, this.krathongs);
      this.emit('krathongs');
      return true;
    },
    hasVoted(id) { return getVotedIds().includes(id); },
    async setRegistrationOpen(open) {
      this.settings = { ...this.settings, registrationOpen: open };
      writeLS(LS.settings, this.settings);
      this.emit('settings');
    },
    async setQuota(quota) {
      const q = Math.max(1, Math.min(999, Number(quota) || CONFIG.defaultQuota));
      this.settings = { ...this.settings, quota: q };
      writeLS(LS.settings, this.settings);
      this.emit('settings');
    },
    async deleteKrathong(id) {
      this.krathongs = this.krathongs.filter((k) => k.id !== id);
      writeLS(LS.krathongs, this.krathongs);
      this.emit('krathongs');
    },
    async resetVotes() {
      this.krathongs.forEach((k) => { k.votes = 0; });
      localStorage.removeItem(LS.voted);
      writeLS(LS.krathongs, this.krathongs);
      this.emit('krathongs');
    },
    async resetAll() {
      this.krathongs = [];
      localStorage.removeItem(LS.voted);
      writeLS(LS.krathongs, this.krathongs);
      this.emit('krathongs');
    },
  };
  return store;
}
/* ---------------- โหมด Firebase ---------------- */
function createFirebaseStore() {
  const listeners = { krathongs: new Set(), settings: new Set() };
  const store = {
    mode: 'firebase',
    settings: { registrationOpen: true, quota: CONFIG.defaultQuota },
    krathongs: [],
    async init() {
      onSnapshot(doc(db, 'settings', 'config'), (snap) => {
        if (snap.exists()) this.settings = { registrationOpen: true, quota: CONFIG.defaultQuota, ...snap.data() };
        this.emit('settings');
      });
      onSnapshot(collection(db, 'krathongs'), (snap) => {
        this.krathongs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        this.emit('krathongs');
      });
    },
    onChange(type, cb) { listeners[type].add(cb); return () => listeners[type].delete(cb); },
    emit(type) { listeners[type].forEach((cb) => cb(this[type])); },
    async addKrathong({ name, wish, styleId, photoDataUrl }) {
      if (!this.settings.registrationOpen) throw new Error('ปิดรับสมัครแล้ว');
      if (this.krathongs.length >= this.settings.quota) throw new Error('ครบจำนวนกระทงที่กำหนดแล้ว');
      // เก็บรูปแบบ data URL ในเอกสาร Firestore โดยตรง (ไม่ต้องใช้ Storage / ไม่ต้องอัปเกรดแผน)
      const docRef = await addDoc(collection(db, 'krathongs'), {
        name, wish, styleId, votes: 0, createdAt: serverTimestamp(),
        photoUrl: photoDataUrl || '',
      });
      return { id: docRef.id };
    },
    async vote(id) {
      if (getVotedIds().includes(id)) return false;
      await updateDoc(doc(db, 'krathongs', id), { votes: increment(1) });
      markVoted(id);
      return true;
    },
    hasVoted(id) { return getVotedIds().includes(id); },
    async setRegistrationOpen(open) {
      await setDoc(doc(db, 'settings', 'config'), { registrationOpen: open }, { merge: true });
    },
    async setQuota(quota) {
      const q = Math.max(1, Math.min(999, Number(quota) || CONFIG.defaultQuota));
      await setDoc(doc(db, 'settings', 'config'), { quota: q }, { merge: true });
    },
    async deleteKrathong(id) {
      await deleteDoc(doc(db, 'krathongs', id));
    },
    async resetVotes() {
      await Promise.all(this.krathongs.map((k) => updateDoc(doc(db, 'krathongs', k.id), { votes: 0 })));
      localStorage.removeItem(LS.voted);
    },
    async resetAll() {
      await Promise.all(this.krathongs.map((k) => deleteDoc(doc(db, 'krathongs', k.id))));
      localStorage.removeItem(LS.voted);
    },
  };
  return store;
}

export const store = isFirebaseEnabled ? createFirebaseStore() : createLocalStore();


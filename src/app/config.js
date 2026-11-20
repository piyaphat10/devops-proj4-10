// ค่าคงที่ของโปรเจกต์
export const CONFIG = {
  riverLength: 96,   // ความยาวแม่น้ำ (แนว X)
  riverWidth: 14,    // ความกว้างแม่น้ำ (แนว Z)
  bankHeight: 0.55,
  maxPeople: 20,     // จำนวนผู้คนในงาน
  defaultQuota: 20,  // โควตากระทงเริ่มต้น
  krathongSpeed: 0.55,
};

// รูปแบบกระทง (สี/ลวดลาย) — โมเดลเดียว เปลี่ยนสีได้
export const KRATHONG_STYLES = [
  { id: 'rose',   name: 'กุหลาบชมพู', base: 0x3f6b3a, petal: 0xff8fb1, flower: 0xffd166, flame: 0xffe9a8 },
  { id: 'violet', name: 'ดาวเรือง',   base: 0x3f6b3a, petal: 0xb388ff, flower: 0xffe082, flame: 0xfff3c4 },
  { id: 'sky',    name: 'สายฟ้า',     base: 0x4a7c43, petal: 0x64b5f6, flower: 0xb3e5fc, flame: 0xffffff },
  { id: 'sunset', name: 'สีทอง',      base: 0x6b4a2f, petal: 0xffb74d, flower: 0xfff176, flame: 0xffecb3 },
  { id: 'ruby',   name: 'ทับทิม',     base: 0x3f6b3a, petal: 0xe57373, flower: 0xffd54f, flame: 0xfff9c4 },
  { id: 'jade',   name: 'มรกต',       base: 0x2f5d46, petal: 0xa5d6a7, flower: 0xffffff, flame: 0xfffde7 },
];

export function getStyle(id) {
  return KRATHONG_STYLES.find((s) => s.id === id) || KRATHONG_STYLES[0];
}

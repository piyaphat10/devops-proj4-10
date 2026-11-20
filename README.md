# 🪷 ลอยกระทงวันเพ็ญ — เว็บแอปโหวตกระทง 3D

เว็บแอปโหวตกระทงออนไลน์ ฉาก 3D กลางคืนริมแม่น้ำ สร้างด้วย **Three.js + Firebase**
รองรับการใช้งานผ่าน Web Browser ทั้ง PC, Tablet และ Smartphone

## คุณสมบัติ

- **ฉาก 3D กลางคืน**: แม่น้ำกระเพื่อม ดวงจันทร์ บ้านทรงไทย วัด เจดีย์ และเสาโคมไฟ
- **กระทงลอยในแม่น้ำ**: โมเดล 3D สลับสี/ลวดลายได้ 6 แบบ ลอยตามกระแสน้ำ
- **ผู้คนเดินชมงาน 20 คน** เดินวนริมแม่น้ำทั้งสองฝั่ง
- **ควบคุมกล้อง**: หมุนฉาก / ซูมเข้า / ซูมออก (เมาส์ + ทัช)
- **สมัครลอยกระทง**: ถ่ายรูปตัวเองแนบในแอป → ป้อนชื่อ + คำอธิษฐาน → เลือกแบบกระทง → กดบันทึกแล้วกระทงลอยในแม่น้ำทันที
- **ระบบโหวต**: แตะที่กระทง → popup แสดงชื่อ/รูป/คำอธิษฐาน/คะแนน → ปุ่มโหวต (1 คนต่อ 1 คะแนน กันโหวตซ้ำด้วย localStorage)
- **โควตา 20 ลำ**: สมัครครบแล้วปิดรับอัตโนมัติ
- **หน้า Admin**: เปิด/ปิดรับสมัคร, กำหนดโควตา, ดูรายชื่อ+คะแนน, ลบกระทง, รีเซ็ตคะแนน/ล้างข้อมูล

## เริ่มใช้งาน

```bash
npm install
npm run dev      # เปิด http://localhost:5173
npm run build    # build ไปยังโฟลเดอร์ dist/
```

> หากยังไม่ใส่ค่า Firebase แอปจะทำงานใน **โหมดเดโม** (ข้อมูลเก็บใน localStorage ของเบราว์เซอร์)

## ต่อ Firebase (สำหรับข้อมูลรวมแบบเรียลไทม์)

1. สร้างโปรเจกต์ที่ [Firebase Console](https://console.firebase.google.com) เปิด **Firestore Database** (ไม่ต้องเปิด Storage — รูปโปรไฟล์ถูกย่อขนาดแล้วเก็บเป็น data URL ในเอกสาร Firestore โดยตรง จึงไม่ต้องอัปเกรดแผนเป็น Blaze)
2. คัดลอก `.env.example` เป็น `.env` แล้วใส่ค่า config ของโปรเจกต์
3. ตั้ง Security Rules เบื้องต้น (สำหรับเดโม — production ควรจำกัดสิทธิ์):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /settings/{doc} {
      allow read: if true;
      allow write: if true;   // TODO: จำกัดเฉพาะแอดมินเมื่อขึ้น production
    }
    match /krathongs/{id} {
      allow read, create, update, delete: if true; // TODO: จำกัดสิทธิ์เมื่อขึ้น production
    }
  }
}
```

4. รัน `npm run dev` อีกครั้ง — แอปจะใช้ Firebase อัตโนมัติ

## เผยแพร่บน GitHub Pages (อัตโนมัติผ่าน GitHub Actions)

1. Settings → **Secrets and variables → Actions** → **New repository secret** ชื่อ `ENV_FILE` แล้ววางเนื้อหาไฟล์ `.env` ทั้งก้อน (Vite ฝังค่า Firebase ตอน build จึงจำเป็นต้องมี)
2. Settings → **Pages** → Build and deployment → Source: **GitHub Actions** → Save
3. push โค้ด → workflow `เผยแพร่เว็บไซต์ (GitHub Pages)` จะ build และเผยแพร่ให้เอง (~1 นาที)
4. เปิด `https://piyaphat10.github.io/devops-proj4-10/`

> ถ้ายังไม่ใส่ secret `ENV_FILE` เว็บจะขึ้นแต่อยู่ใน **โหมดเดโม** (ข้อมูลแยกตามเบราว์เซอร์ ไม่แชร์กัน)

## โครงสร้างโปรเจกต์

```
src/
├── main.js                 # จุดเริ่มแอป เชื่อมฉาก/ข้อมูล/UI
├── app/
│   ├── config.js           # ค่าคงที่ + พาเลตสีกระทง 6 แบบ
│   ├── firebase.js         # init Firebase (ถ้ามี config)
│   ├── store.js            # ชั้นข้อมูล: Firestore หรือ localStorage (โหมดเดโม)
│   └── utils.js            # ย่อรูป, escapeHtml, uid
├── scene/
│   ├── sceneManager.js     # renderer + camera + OrbitControls
│   ├── environment.js      # แม่น้ำ ดวงจันทร์ ท้องฟ้า แสง
│   ├── thaiVillage.js      # บ้านไทย วัด เจดีย์ โคมไฟ
│   ├── krathong.js         # โมเดลกระทง + แอนิเมชันลอย
│   ├── people.js           # ผู้คน 20 คน
│   └── interaction.js      # แตะ/คลิกกระทง (raycasting)
└── ui/
    ├── style.css           # responsive (mobile-first)
    ├── popup.js            # popup รายละเอียด + ปุ่มโหวต
    ├── registerForm.js     # ฟอร์มสมัครลอยกระทง
    ├── adminPanel.js       # หน้าจัดการระบบ
    └── toast.js            # แจ้งเตือน
```

## ข้อจำกัดที่รู้ตั้งแต่ออกแบบ

- การกันโหวตซ้ำใช้ localStorage จึงไม่แน่น (ล้างคุกกี้/เปลี่ยนอุปกรณ์แล้วโหวตซ้ำได้) — เหมาะกับงานแสดงกลาง
- รหัสผ่านแอดมินฝั่ง client ใช้ได้กับเดโมเท่านั้น เมื่อขึ้น production ควรย้ายไปใช้ Firebase Authentication

# ChibiBooth

ChibiBooth adalah web photobooth online yang cute, pastel, romantis, dan mobile-friendly. User bisa membuka kamera, mengambil foto, memilih frame, memberi filter, menambahkan teks dan stiker, mencoba demo AI style, lalu download atau share hasilnya.

## Fitur

- Landing page cute dengan nuansa Korea/Jepang photobooth.
- Kamera browser memakai `navigator.mediaDevices.getUserMedia()`.
- Timer 3, 5, dan 10 detik.
- Pilihan 1, 2, 3, atau 4 foto.
- Switch kamera depan/belakang, mirror selfie mode, fullscreen camera, dan retake.
- Editor canvas 1080 x 1920 untuk output HD.
- 8 frame canvas drawing: Pink Hearts, Bear Cute, Cloud Pastel, Romantic Rose, Love Letter, Lavender Dream, Birthday Party, Bestie Mode.
- 8 filter foto: Normal, Warm, Soft Pink, Black & White, Vintage, Bright, Dreamy, Chibi Soft.
- Teks custom, warna teks, ukuran teks, dan posisi teks.
- Stiker emoji/canvas sederhana dengan pilihan posisi.
- Demo AI Style lokal tanpa API key frontend.
- Real AI API placeholder via `POST /api/ai-style`.
- Download PNG, Web Share API fallback, copy caption, dan random share caption.
- Penyimpanan sementara memakai `sessionStorage` dan preferensi editor memakai `localStorage`.

## Cara Menjalankan

Karena project ini hanya HTML, CSS, dan JavaScript vanilla, jalankan dengan salah satu cara berikut:

```bash
npx serve .
```

Atau buka folder `chibibooth` dengan Live Server di VS Code.

Setelah server aktif, buka:

```text
http://localhost:3000/chibibooth
```

Jika menjalankan server dari dalam folder `chibibooth`, buka:

```text
http://localhost:3000
```

## Catatan

- Kamera browser membutuhkan `localhost` atau HTTPS.
- Jangan taruh API key AI langsung di frontend.
- Endpoint AI asli perlu dibuat di backend/serverless:

```http
POST /api/ai-style
Content-Type: application/json

{
  "image": "data:image/png;base64,...",
  "style": "anime"
}
```

Response yang diharapkan:

```json
{
  "resultImage": "data:image/png;base64,..."
}
```

Kalau endpoint belum tersedia, ChibiBooth otomatis memakai demo style lokal.

## Struktur Folder

```text
chibibooth/
├── index.html
├── booth.html
├── editor.html
├── assets/
│   ├── icons/
│   ├── stickers/
│   ├── frames/
│   └── samples/
├── css/
│   ├── style.css
│   ├── booth.css
│   └── editor.css
├── js/
│   ├── main.js
│   ├── camera.js
│   ├── editor.js
│   ├── canvas.js
│   ├── frames.js
│   ├── filters.js
│   ├── stickers.js
│   ├── share.js
│   └── ai.js
└── README.md
```

## Roadmap

- Drag-and-drop stiker langsung di canvas.
- Galeri memories lokal.
- Backend/serverless AI style sungguhan.
- Template frame tambahan dari asset SVG/PNG.
- Export ZIP untuk banyak format sekaligus.

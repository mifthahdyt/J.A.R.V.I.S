# Voice Command HP ke Laptop

Project lokal berbasis Node.js + Express + Socket.IO, dengan speech-to-text di HP via Web Speech API.

## Struktur folder

```text
voice-command-local/
├── server.js
├── package.json
└── public/
    ├── phone.html
    ├── laptop.html
    ├── style.css
    ├── phone.js
    └── laptop.js
```

## Instalasi

1. Masuk ke folder project.
2. Jalankan:

```bash
npm install
npm start
```

3. Server akan berjalan di port `3000`.

## Membuka web

- Laptop: buka `http://localhost:3000/laptop.html`
- HP: buka `http://IP-LAPTOP:3000/phone.html`

### Cara menemukan IP laptop
Di Windows bisa pakai `ipconfig`, lalu cari IPv4 address pada adaptor aktif.

## Cara memilih mode koneksi

Di halaman HP ada dua pilihan:

- **Bluetooth** → mode ditampilkan di UI dan dicek dukungan browser-nya.
- **Kabel** → mode ditampilkan di UI sebagai mode lokal yang paling realistis untuk koneksi sederhana.

Project ini tidak memakai cloud dan tidak memakai API berbayar.

## Status koneksi

Status yang ditampilkan:

- belum terhubung
- sedang mencari perangkat
- terhubung
- gagal konek

## Catatan penting

- Web Speech API dipakai untuk speech recognition di HP.
- Web Bluetooth di browser punya dukungan yang terbatas dan hanya berjalan di secure context pada browser yang mendukung, jadi project ini memakai Socket.IO lokal untuk jalur command yang stabil. citeturn132334search3turn132334search4turn132334search2
- Socket.IO memberi komunikasi dua arah real-time antara client dan server. citeturn132334search2turn132334search8

## Command suara

- `down` → scroll bawah
- `up` → scroll atas
- `next` → pindah ke panel berikutnya
- `reset` → kembali ke atas

## Agar lebih lancar

- Pakai browser Chromium-based di HP untuk speech recognition.
- Ucapkan satu kata command dengan jelas.
- Pastikan tab laptop tetap terbuka.

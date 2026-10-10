# Dapur Nia (React + Firebase)

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env`, isi dengan nilai `firebaseConfig` dari konsol Firebase.
3. `npm run dev`

## Firebase
- Buat database Firestore (lokasi asia-southeast2), koleksi `menu`.
- Tempel isi `firestore.rules` di tab Rules, lalu Publish.
- Field `foto` (opsional) belum ada di skema resmi: minta persetujuan mentor.
- Taruh foto di `public/foto/`, isi tautan `/foto/nama-file.jpg` di formulir.

## Deploy Netlify
Build command `npm run build`, publish directory `dist`.
Isi variabel `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_APP_ID` di Site settings > Environment variables.

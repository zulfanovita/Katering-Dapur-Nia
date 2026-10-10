import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

// Pantau keadaan masuk (jangan baca auth.currentUser langsung)
export const pantau = (cb) => onAuthStateChanged(auth, cb);

// Daftar: akun baru SELALU berperan "pembeli". Peran admin hanya diubah lewat konsol Firebase.
export async function daftar({ email, sandi, nama, no_whatsapp, alamat }) {
  const c = await createUserWithEmailAndPassword(auth, email, sandi);
  try {
    await setDoc(doc(db, "pengguna", c.user.uid), {
      nama, email, peran: "pembeli", no_whatsapp, alamat, dibuat_pada: serverTimestamp(),
    });
  } catch (e) {
    // Profil gagal dibuat: hapus akun yang baru dibuat supaya bisa daftar ulang dengan email yang sama.
    await c.user.delete().catch(() => {});
    throw e;
  }
}
export const masuk = (email, sandi) => signInWithEmailAndPassword(auth, email, sandi);
export const keluar = () => signOut(auth);

// Ubah profil sendiri (peran tidak ikut diubah; rules menolak perubahan peran)
export const ubahProfil = (uid, { nama, no_whatsapp, alamat }) =>
  updateDoc(doc(db, "pengguna", uid), { nama, no_whatsapp, alamat });

// Masuk dengan Google. Pengguna baru belum punya profil: aplikasi meminta WhatsApp dan alamat.
export const masukGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());

// Buat profil pembeli untuk akun yang belum punya profil (misalnya baru masuk lewat Google)
export async function lengkapiProfil(user, { nama, no_whatsapp, alamat }) {
  await setDoc(doc(db, "pengguna", user.uid), {
    nama, email: user.email, peran: "pembeli", no_whatsapp, alamat, dibuat_pada: serverTimestamp(),
  });
  return { id: user.uid, nama, email: user.email, peran: "pembeli", no_whatsapp, alamat };
}
export const lupaSandi = (email) => sendPasswordResetEmail(auth, email);

// Profil dibuat sesaat setelah akun, jadi coba lagi beberapa kali bila belum ada.
export async function ambilProfil(uid, coba = 3) {
  for (let i = 0; i < coba; i++) {
    const s = await getDoc(doc(db, "pengguna", uid));
    if (s.exists()) return { id: s.id, ...s.data() };
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

const PESAN = {
  "auth/email-already-in-use": "Email ini sudah terdaftar. Silakan masuk.",
  "auth/weak-password": "Kata sandi minimal 6 karakter.",
  "auth/invalid-email": "Format email belum benar.",
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti.",
  "permission-denied": "Ditolak oleh aturan data (security rules). Pastikan rules terbaru sudah di-Publish.",
  "auth/operation-not-allowed": "Metode Email/Password belum diaktifkan di Firebase (Authentication > Sign-in method).",
  "auth/configuration-not-found": "Authentication belum diaktifkan di proyek Firebase. Klik Get started di menu Authentication.",
  "auth/invalid-api-key": "API key Firebase salah. Periksa file .env.",
  "auth/popup-closed-by-user": "Jendela Google ditutup sebelum selesai. Coba lagi.",
  "auth/cancelled-popup-request": "Jendela Google ditutup sebelum selesai. Coba lagi.",
  "auth/popup-blocked": "Pop-up diblokir browser. Izinkan pop-up untuk situs ini, lalu coba lagi.",
  "auth/unauthorized-domain": "Domain ini belum diizinkan di Firebase (Authentication > Settings > Authorized domains).",
  "auth/network-request-failed": "Koneksi internet bermasalah. Coba lagi.",
  "unavailable": "Tidak bisa menghubungi database. Coba lagi.",
};
export const pesanGalatAuth = (e) =>
  (PESAN[e?.code] || "Terjadi kesalahan. Coba lagi.") + ` (kode: ${e?.code || e?.message || "tidak diketahui"})`;
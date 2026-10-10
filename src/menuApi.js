import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, limit, serverTimestamp, deleteField,
} from "firebase/firestore";
import { db } from "./firebase";

const menu = collection(db, "menu");

// Read: selalu dibatasi (maks 20), tidak memuat seluruh koleksi.
export async function ambilMenu() {
  const snap = await getDocs(query(menu, orderBy("dibuat_pada", "desc"), limit(20)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Create
export const tambahMenu = ({ foto, ...r }) =>
  addDoc(menu, { ...r, ...(foto ? { foto } : {}), dibuat_pada: serverTimestamp() });

// Update (foto kosong = hapus field foto)
export const ubahMenu = (id, { foto, ...r }) =>
  updateDoc(doc(db, "menu", id), { ...r, foto: foto ? foto : deleteField() });

// Delete
export const hapusMenu = (id) => deleteDoc(doc(db, "menu", id));

// Isi data awal untuk latihan
export async function isiContoh() {
  const contoh = [
    ["Nasi Ayam Bakar", 25000, 30], ["Rendang", 35000, 12], ["Soto Betawi", 20000, 8],
    ["Sate Ayam", 25000, 20], ["Es Teh", 5000, 0],
  ];
  for (const [nama, harga, sisa_porsi] of contoh) {
    await addDoc(menu, { nama, harga, sisa_porsi, tersedia: true, dibuat_pada: serverTimestamp() });
  }
}

export function pesanGalat(e) {
  return e?.code === "permission-denied"
    ? "Ditolak oleh aturan data (security rules)."
    : "Terjadi kesalahan. Coba lagi.";
}
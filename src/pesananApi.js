import {
  collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, limit,
  serverTimestamp, writeBatch, increment,
} from "firebase/firestore";
import { db } from "./firebase";

const col = collection(db, "pesanan");
export const ONGKIR = 5000; // sama dengan aturan di firestore.rules

const hariIni = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const urut = (a) => a.sort((x, y) => (y.dibuat_pada?.seconds || 0) - (x.dibuat_pada?.seconds || 0));

// Create: total dihitung di sini dan diperiksa lagi oleh security rules
export const buatPesanan = ({ menu, jumlah, profil, uid }) =>
  addDoc(col, {
    pelanggan_id: profil.no_whatsapp, nama_pelanggan: profil.nama, alamat_kirim: profil.alamat,
    menu_id: menu.id, nama_menu: menu.nama, harga_satuan: menu.harga, jumlah_porsi: jumlah,
    ongkir: ONGKIR, total: menu.harga * jumlah + ONGKIR, status: "menunggu_bayar",
    bukti_bayar: "", tanggal: hariIni(), dibuat_pada: serverTimestamp(), pembeli_uid: uid,
  });

// Read, dibatasi 20
export async function pesananAdmin() {
  const s = await getDocs(query(col, orderBy("dibuat_pada", "desc"), limit(20)));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function pesananSaya(uid) {
  const s = await getDocs(query(col, where("pembeli_uid", "==", uid), limit(20)));
  return urut(s.docs.map((d) => ({ id: d.id, ...d.data() })));
}

// Admin: ubah status. Sisa porsi dikurangi saat "dibayar", dikembalikan bila dibatalkan setelah dibayar.
export async function ubahStatus(p, baru) {
  const b = writeBatch(db);
  b.update(doc(db, "pesanan", p.id), { status: baru });
  if (p.status === "menunggu_bayar" && baru === "dibayar")
    b.update(doc(db, "menu", p.menu_id), { sisa_porsi: increment(-p.jumlah_porsi) });
  if (p.status === "dibayar" && baru === "dibatalkan")
    b.update(doc(db, "menu", p.menu_id), { sisa_porsi: increment(p.jumlah_porsi) });
  await b.commit();
}

// Pembeli: kirim bukti bayar dan batalkan pesanan sendiri (selama belum dibayar)
export const kirimBukti = (id, teks) => updateDoc(doc(db, "pesanan", id), { bukti_bayar: teks });
export const batalkanSendiri = (id) => updateDoc(doc(db, "pesanan", id), { status: "dibatalkan" });
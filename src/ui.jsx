import { useEffect, useRef, useState } from "react";
import { pesanGalat } from "./menuApi";

export const rp = (n) => new Intl.NumberFormat("id-ID").format(n);
const P = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"/>',
  menu: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  pesan: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6"/>',
  lap: '<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  hapus: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  piring: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  kosong: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/>',
  galat: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  cari: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  burger: '<path d="M4 6h16M4 12h10M4 18h16"/>',
  bel: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  matahari: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  keluar: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  mata: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  mataTutup: '<path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.1-5M9.9 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20"/>',
  bulan: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
};
export const Ic = ({ n, s = 22, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[n] }} />
);

export const kat = (m) => (!m.tersedia ? "non" : m.sisa_porsi === 0 ? "habis" : "tersedia");
export const LBL = { tersedia: "Tersedia", habis: "Habis", non: "Non-aktif" };
export const PIL = { tersedia: "p-ok", habis: "p-habis", non: "p-non" };
export const sapa = () => { const h = new Date().getHours(); return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam"; };

export function Awan({ malam }) {
  return (
    <svg width="130" height="90" viewBox="0 0 130 90" aria-hidden="true">
      {malam ? <path d="M64 20a18 18 0 1 0 8 30 14 14 0 0 1-8-30z" fill="#F6B73C" /> : (<>
        <g stroke="#F6B73C" strokeWidth="3" strokeLinecap="round"><path d="M56 6v6M33 15l4 4M79 15l-4 4M26 36h6" /></g>
        <circle cx="56" cy="36" r="17" fill="#F6B73C" /></>)}
      <g fill="#F4A9C4"><circle cx="62" cy="68" r="14" /><circle cx="86" cy="58" r="20" /><circle cx="108" cy="70" r="13" /><rect x="62" y="68" width="46" height="15" rx="7" /></g>
    </svg>
  );
}

const kecil = (file) => new Promise((ok, no) => {
  const r = new FileReader();
  r.onerror = no;
  r.onload = () => {
    const im = new Image();
    im.onerror = no;
    im.onload = () => {
      const k = Math.min(1, 600 / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = im.width * k; c.height = im.height * k;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      ok(c.toDataURL("image/jpeg", 0.7));
    };
    im.src = r.result;
  };
  r.readAsDataURL(file);
});

export function Foto({ m }) {
  const [rusak, setRusak] = useState(false);
  useEffect(() => setRusak(false), [m.foto]);
  const k = kat(m);
  return (
    <div className="foto">
      {m.foto && !rusak
        ? <img src={m.foto} alt={"Foto " + m.nama} loading="lazy" onError={() => setRusak(true)} />
        : <div className="ph" role="img" aria-label={"Belum ada foto " + m.nama}><Ic n="piring" s={44} /></div>}
      <span className={"pil " + PIL[k]}>{LBL[k]}</span>
    </div>
  );
}

export function Modal({ label, onClose, children }) {
  const r = useRef();
  useEffect(() => { r.current.showModal(); }, []);
  return <dialog ref={r} aria-label={label} onClose={onClose}>{children}</dialog>;
}

export function Form({ edit, onClose, onSave }) {
  const [v, setV] = useState({
    nama: edit ? edit.nama : "", harga: edit ? String(edit.harga) : "",
    sisa: edit ? String(edit.sisa_porsi) : "", ada: edit ? edit.tersedia : true, foto: edit?.foto || "",
  });
  const [e, setE] = useState({});
  const [simpan, setSimpan] = useState(false);
  const set = (k) => (ev) => setV({ ...v, [k]: ev.target.type === "checkbox" ? ev.target.checked : ev.target.value });

  const pilih = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setE({ ...e, foto: "File harus berupa gambar (JPG atau PNG)." });
    try { const d = await kecil(file); setV((s) => ({ ...s, foto: d })); setE({ ...e, foto: "" }); }
    catch { setE({ ...e, foto: "Foto tidak bisa dibaca. Coba file lain." }); }
  };

  const kirim = async (ev) => {
    ev.preventDefault();
    const n = v.nama.trim(), h = Number(v.harga), s = Number(v.sisa), f = v.foto.trim(), x = {};
    if (!n) x.nama = "Nama menu wajib diisi."; else if (n.length > 60) x.nama = "Nama menu maksimal 60 karakter.";
    if (v.harga.trim() === "") x.harga = "Harga wajib diisi."; else if (!Number.isInteger(h)) x.harga = "Harga harus angka bulat, tanpa titik."; else if (h < 0) x.harga = "Harga tidak boleh negatif.";
    if (v.sisa.trim() === "") x.sisa = "Sisa porsi wajib diisi."; else if (!Number.isInteger(s)) x.sisa = "Sisa porsi harus angka bulat."; else if (s < 0) x.sisa = "Sisa porsi tidak boleh negatif.";
    if (f.length > 200000) x.foto = "Foto terlalu besar. Pilih foto lain.";
    setE(x);
    if (Object.keys(x).length) return;
    setSimpan(true);
    try { await onSave({ nama: n, harga: h, sisa_porsi: s, tersedia: v.ada, foto: f }); }
    catch (err) { setE({ kirim: pesanGalat(err) }); setSimpan(false); }
  };

  const fld = (k, l, t, id, bantu) => (
    <div className="f">
      <label htmlFor={id}>{l}</label>
      <input id={id} type={t} value={v[k]} onChange={set(k)} autoComplete="off"
        inputMode={t === "number" ? "numeric" : undefined} step={t === "number" ? 1 : undefined}
        aria-invalid={e[k] ? "true" : "false"} />
      {e[k] ? <div className="err">{e[k]}</div> : bantu ? <div className="bantu">{bantu}</div> : null}
    </div>
  );

  return (
    <Modal label={edit ? "Ubah Menu" : "Tambah Menu"} onClose={onClose}>
      <form onSubmit={kirim} noValidate>
        <h3>{edit ? "Ubah Menu" : "Tambah Menu"}</h3>
        {fld("nama", "Nama menu", "text", "nama")}
        {fld("harga", "Harga per porsi (Rp)", "number", "harga")}
        {fld("sisa", "Sisa porsi", "number", "sisa")}
        {v.foto.trim() && !e.foto ? <img className="prev" src={v.foto.trim()} alt="Pratinjau foto menu" /> : null}
        <div className="f">
          <label htmlFor="foto">Foto menu (opsional)</label>
          <input id="foto" type="file" accept="image/*" onChange={pilih} />
          {v.foto ? <button type="button" className="netral kecil" style={{ marginTop: 8 }} onClick={() => setV({ ...v, foto: "" })}>Hapus Foto</button> : null}
          {e.foto ? <div className="err">{e.foto}</div> : <div className="bantu">Foto dikecilkan otomatis sebelum disimpan.</div>}
        </div>
        <div className="cek"><input id="ada" type="checkbox" checked={v.ada} onChange={set("ada")} /><label htmlFor="ada">Tampilkan di daftar (tersedia)</label></div>
        {e.kirim ? <div className="err" role="alert">{e.kirim}</div> : null}
        <div className="tombol">
          <button type="button" className="netral" onClick={onClose}>Batal</button>
          <button type="submit" className="utama" disabled={simpan}>{simpan ? "Menyimpan..." : "Simpan Menu"}</button>
        </div>
      </form>
    </Modal>
  );
}
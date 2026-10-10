import { useEffect, useRef, useState } from "react";
import { ambilMenu, tambahMenu, ubahMenu, hapusMenu, pesanGalat } from "./menuApi";
import { pantau, daftar, masuk, keluar, lupaSandi, ubahProfil, ambilProfil, masukGoogle, lengkapiProfil, pesanGalatAuth } from "./authApi";
import { buatPesanan, pesananAdmin, pesananSaya, ubahStatus, kirimBukti, batalkanSendiri, ONGKIR } from "./pesananApi";
import { rp, Ic, kat, sapa, Awan, Foto, Modal, Form } from "./ui.jsx";

const STL = { menunggu_bayar: "Menunggu bayar", dibayar: "Dibayar", diproses: "Diproses", selesai: "Selesai", dibatalkan: "Dibatalkan" };
const STP = { selesai: "p-ok", dibatalkan: "p-habis", menunggu_bayar: "p-non", dibayar: "p-proses", diproses: "p-proses" };
const LANJUT = { menunggu_bayar: ["dibayar", "Tandai Dibayar"], dibayar: ["diproses", "Proses Pesanan"], diproses: ["selesai", "Tandai Selesai"] };

/* ---------- Halaman Masuk / Daftar / Lupa kata sandi ---------- */
function Auth({ onSukses }) {
  const [mode, setMode] = useState("masuk");
  const [v, setV] = useState({ email: "", sandi: "", sandi2: "", nama: "", wa: "", alamat: "" });
  const [e, setE] = useState({}), [busy, setBusy] = useState(false), [info, setInfo] = useState(""), [lihat, setLihat] = useState(false);
  const set = (k) => (ev) => setV({ ...v, [k]: ev.target.value });
  const ganti = (m) => { setMode(m); setE({}); setInfo(""); };

  const kirim = async (ev) => {
    ev.preventDefault();
    const x = {}, email = v.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) x.email = "Format email belum benar.";
    if (mode !== "lupa" && v.sandi.length < 6) x.sandi = "Kata sandi minimal 6 karakter.";
    if (mode === "daftar") {
      if (!v.nama.trim() || v.nama.trim().length > 60) x.nama = "Nama wajib diisi, maksimal 60 karakter.";
      if (!/^08\d{8,11}$/.test(v.wa.trim())) x.wa = "Nomor WhatsApp diawali 08, total 10 sampai 13 angka.";
      if (!v.alamat.trim() || v.alamat.trim().length > 200) x.alamat = "Alamat wajib diisi, maksimal 200 karakter.";
      if (v.sandi2 !== v.sandi) x.sandi2 = "Kata sandi tidak sama.";
    }
    setE(x); setInfo("");
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      if (mode === "masuk") { await masuk(email, v.sandi); onSukses("Berhasil masuk"); }
      else if (mode === "daftar") { await daftar({ email, sandi: v.sandi, nama: v.nama.trim(), no_whatsapp: v.wa.trim(), alamat: v.alamat.trim() }); onSukses("Akun dibuat, selamat datang"); }
      else { await lupaSandi(email); setInfo("Bila email terdaftar, tautan atur ulang sudah dikirim."); }
    } catch (err) { console.error(err); setE({ kirim: pesanGalatAuth(err) }); }
    setBusy(false);
  };
  const google = async () => {
    setBusy(true); setE({});
    try { await masukGoogle(); onSukses("Berhasil masuk"); } catch (err) { console.error(err); setE({ kirim: pesanGalatAuth(err) }); }
    setBusy(false);
  };
  const fld = (k, l, t, id, ac) => (
    <div className="f"><label htmlFor={id}>{l}</label>
      {t === "area"
        ? <textarea id={id} value={v[k]} onChange={set(k)} aria-invalid={e[k] ? "true" : "false"} />
        : t === "password"
          ? <div className="sandi"><input id={id} type={lihat ? "text" : "password"} value={v[k]} onChange={set(k)} autoComplete={ac} aria-invalid={e[k] ? "true" : "false"} />
              <button type="button" className="mata" aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={lihat} onClick={() => setLihat(!lihat)}><Ic n={lihat ? "mataTutup" : "mata"} s={22} /></button></div>
          : <input id={id} type={t} value={v[k]} onChange={set(k)} autoComplete={ac} aria-invalid={e[k] ? "true" : "false"} />}
      {e[k] ? <div className="err">{e[k]}</div> : null}</div>);
  return (
    <form className="auth" onSubmit={kirim} noValidate>
      <div className="atas"><div><h1>{mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar Pembeli" : "Lupa Kata Sandi"}</h1>
        <p>{mode === "daftar" ? "Akun baru otomatis berperan pembeli." : "Masuk ke Dapur Nia."}</p></div></div>
      {fld("email", "Email", "email", "email", "email")}
      {mode === "daftar" ? <>{fld("nama", "Nama lengkap", "text", "nama2", "name")}{fld("wa", "Nomor WhatsApp", "tel", "wa", "tel")}{fld("alamat", "Alamat pengiriman", "area", "alamat")}</> : null}
      {mode !== "lupa" ? fld("sandi", "Kata sandi", "password", "sandi", mode === "masuk" ? "current-password" : "new-password") : null}
      {mode === "daftar" ? fld("sandi2", "Ulangi kata sandi", "password", "sandi2", "new-password") : null}
      {e.kirim ? <div className="err" role="alert">{e.kirim}</div> : null}
      {info ? <div className="ok-info" role="status">{info}</div> : null}
      <div className="tombol"><button type="submit" className="utama" disabled={busy}>
        {busy ? "Memproses..." : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar" : "Kirim Tautan"}</button></div>
      {mode !== "lupa" ? <><div className="atau">atau</div>
        <button type="button" className="netral google" disabled={busy} onClick={google}><b aria-hidden="true">G</b> Masuk dengan Google</button></> : null}
      <p style={{ textAlign: "center", marginTop: 16 }}>
        {mode === "masuk" ? <><button type="button" className="link" onClick={() => ganti("lupa")}>Lupa kata sandi?</button> · <button type="button" className="link" onClick={() => ganti("daftar")}>Daftar sebagai pembeli</button></>
          : <button type="button" className="link" onClick={() => ganti("masuk")}>Kembali ke Masuk</button>}
      </p>
    </form>
  );
}

/* ---------- Lengkapi profil (pengguna Google baru) ---------- */
function Lengkapi({ user, onSelesai, onKeluar }) {
  const [v, setV] = useState({ nama: user.displayName || "", wa: "", alamat: "" });
  const [e, setE] = useState({}), [busy, setBusy] = useState(false);
  const set = (k) => (ev) => setV({ ...v, [k]: ev.target.value });
  const kirim = async (ev) => {
    ev.preventDefault();
    const x = {};
    if (!v.nama.trim() || v.nama.trim().length > 60) x.nama = "Nama wajib diisi, maksimal 60 karakter.";
    if (!/^08\d{8,11}$/.test(v.wa.trim())) x.wa = "Nomor WhatsApp diawali 08, total 10 sampai 13 angka.";
    if (!v.alamat.trim() || v.alamat.trim().length > 200) x.alamat = "Alamat wajib diisi, maksimal 200 karakter.";
    setE(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try { onSelesai(await lengkapiProfil(user, { nama: v.nama.trim(), no_whatsapp: v.wa.trim(), alamat: v.alamat.trim() })); }
    catch (err) { console.error(err); setE({ kirim: pesanGalatAuth(err) }); setBusy(false); }
  };
  const fld = (k, l, t, id) => (
    <div className="f"><label htmlFor={id}>{l}</label>
      {t === "area" ? <textarea id={id} value={v[k]} onChange={set(k)} aria-invalid={e[k] ? "true" : "false"} />
        : <input id={id} type={t} value={v[k]} onChange={set(k)} aria-invalid={e[k] ? "true" : "false"} />}
      {e[k] ? <div className="err">{e[k]}</div> : null}</div>);
  return (
    <form className="auth" onSubmit={kirim} noValidate>
      <div className="atas"><div><h1>Lengkapi Profil</h1><p>{user.email}</p></div></div>
      {fld("nama", "Nama lengkap", "text", "ln")}{fld("wa", "Nomor WhatsApp", "tel", "lw")}{fld("alamat", "Alamat pengiriman", "area", "la")}
      {e.kirim ? <div className="err" role="alert">{e.kirim}</div> : null}
      <div className="tombol"><button type="submit" className="utama" disabled={busy}>{busy ? "Menyimpan..." : "Simpan Profil"}</button></div>
      <p style={{ textAlign: "center", marginTop: 16 }}><button type="button" className="link" onClick={onKeluar}>Keluar</button></p>
    </form>
  );
}

/* ---------- Halaman Profil ---------- */
function Profil({ profil, onSimpan, onKeluar }) {
  const [v, setV] = useState({ nama: profil.nama, wa: profil.no_whatsapp, alamat: profil.alamat });
  const [e, setE] = useState({}), [busy, setBusy] = useState(false);
  const set = (k) => (ev) => setV({ ...v, [k]: ev.target.value });
  const kirim = async (ev) => {
    ev.preventDefault();
    const x = {};
    if (!v.nama.trim() || v.nama.trim().length > 60) x.nama = "Nama wajib diisi, maksimal 60 karakter.";
    if (!/^08\d{8,11}$/.test(v.wa.trim())) x.wa = "Nomor WhatsApp diawali 08, total 10 sampai 13 angka.";
    if (!v.alamat.trim() || v.alamat.trim().length > 200) x.alamat = "Alamat wajib diisi, maksimal 200 karakter.";
    setE(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try { await onSimpan({ nama: v.nama.trim(), no_whatsapp: v.wa.trim(), alamat: v.alamat.trim() }); }
    catch (err) { console.error(err); setE({ kirim: pesanGalatAuth(err) }); }
    setBusy(false);
  };
  const fld = (k, l, t, id) => (
    <div className="f"><label htmlFor={id}>{l}</label>
      {t === "area" ? <textarea id={id} value={v[k]} onChange={set(k)} aria-invalid={e[k] ? "true" : "false"} />
        : <input id={id} type={t} value={v[k]} onChange={set(k)} aria-invalid={e[k] ? "true" : "false"} />}
      {e[k] ? <div className="err">{e[k]}</div> : null}</div>);
  return (
    <div className="kartu pf">
      <div className="pf-kepala">
        <div className="pf-avatar" aria-hidden="true">{(profil.nama || "?").trim().charAt(0)}</div>
        <h2>{profil.nama}</h2>
      </div>
      <form className="pf-badan" onSubmit={kirim} noValidate>
        {fld("nama", "Nama", "text", "pn")}
        <div className="f"><label htmlFor="pe">Email</label><input id="pe" type="email" value={profil.email || ""} disabled /></div>
        {fld("wa", "Nomor WhatsApp", "tel", "pw")}
        {fld("alamat", "Alamat pengiriman", "area", "pa")}
        {e.kirim ? <div className="err" role="alert">{e.kirim}</div> : null}
        <div className="tombol"><button type="submit" className="utama" disabled={busy}>{busy ? "Menyimpan..." : "Simpan"}</button>
          <button type="button" className="bahaya" onClick={onKeluar}>Keluar</button></div>
      </form>
    </div>
  );
}

/* ---------- Formulir pesan (pembeli) ---------- */
function FormPesan({ menu, profil, onClose, onKirim }) {
  const [j, setJ] = useState("1"), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const n = Number(j), sah = Number.isInteger(n) && n >= 1 && n <= menu.sisa_porsi;
  const kirim = async (ev) => {
    ev.preventDefault();
    if (!sah) return setErr(`Jumlah porsi 1 sampai ${menu.sisa_porsi}.`);
    setBusy(true);
    try { await onKirim(n); } catch (x) { setErr(pesanGalat(x)); setBusy(false); }
  };
  return (
    <Modal label="Pesan menu" onClose={onClose}>
      <form onSubmit={kirim} noValidate className="pesan-i">
        <h3>Pesan {menu.nama}</h3>
        <p>Harga Rp{rp(menu.harga)} per porsi · sisa {menu.sisa_porsi} porsi</p>
        <div className="f" style={{ marginTop: 16 }}><label htmlFor="jml">Jumlah porsi</label>
          <input id="jml" type="number" inputMode="numeric" step={1} value={j} onChange={(ev) => { setJ(ev.target.value); setErr(""); }} aria-invalid={err ? "true" : "false"} />
          {err ? <div className="err">{err}</div> : null}</div>
        <p>Ongkir: Rp{rp(ONGKIR)}</p>
        <p>Total: <span className="total">Rp{rp(sah ? menu.harga * n + ONGKIR : 0)}</span></p>
        <p style={{ color: "var(--redup)", marginTop: 8 }}>Dikirim ke {profil.nama}, {profil.alamat} ({profil.no_whatsapp})</p>
        <div className="tombol"><button type="button" className="netral" onClick={onClose}>Batal</button>
          <button type="submit" className="utama" disabled={busy}>{busy ? "Mengirim..." : "Pesan Sekarang"}</button></div>
      </form>
    </Modal>
  );
}

/* ---------- Kartu pesanan (dipakai admin dan pembeli) ---------- */
function PesananKartu({ p, admin, onStatus, onBukti, onBatal }) {
  const [b, setB] = useState(p.bukti_bayar || ""), [sibuk, setSibuk] = useState(false);
  const jalan = async (fn) => { setSibuk(true); await fn(); setSibuk(false); };
  const lanjut = LANJUT[p.status], bisaBatal = p.status === "menunggu_bayar" || (admin && p.status === "dibayar");
  return (
    <li className="kartu"><div className="isi pesan-i">
      <div className="baris"><div className="nama">{p.nama_menu} × {p.jumlah_porsi}</div><span className={"pil " + STP[p.status]}>{STL[p.status]}</span></div>
      {admin ? <><p><b>{p.nama_pelanggan}</b> · {p.pelanggan_id}</p><p style={{ color: "var(--redup)" }}>{p.alamat_kirim}</p></> : null}
      <p style={{ color: "var(--redup)" }}>{p.tanggal} · Rp{rp(p.harga_satuan)} + ongkir Rp{rp(p.ongkir)}</p>
      <p>Total <span className="total">Rp{rp(p.total)}</span></p>
      {p.bukti_bayar && (admin || p.status !== "menunggu_bayar") ? <p>Bukti bayar: {p.bukti_bayar}</p> : null}
      {!admin && p.status === "menunggu_bayar" ? (
        <div className="f" style={{ marginTop: 12 }}><label htmlFor={"b" + p.id}>Bukti bayar (catatan transfer atau tautan gambar)</label>
          <input id={"b" + p.id} type="text" value={b} onChange={(ev) => setB(ev.target.value)} /></div>) : null}
      <div className="aksi" style={{ marginTop: 12 }}>
        {admin && lanjut ? <button className="utama kecil" disabled={sibuk} onClick={() => jalan(() => onStatus(p, lanjut[0]))}>{lanjut[1]}</button> : null}
        {!admin && p.status === "menunggu_bayar" ? <button className="utama kecil" disabled={sibuk || !b.trim()} onClick={() => jalan(() => onBukti(p, b.trim()))}>Kirim Bukti Bayar</button> : null}
        {bisaBatal ? <button className="bahaya kecil" disabled={sibuk} onClick={() => jalan(() => (admin ? onStatus(p, "dibatalkan") : onBatal(p)))}>Batalkan</button> : null}
      </div>
    </div></li>
  );
}

export default function App() {
  /* data menu */
  const [data, setData] = useState([]), [status, setStatus] = useState("memuat");
  /* login */
  const [user, setUser] = useState(null), [profil, setProfil] = useState(null), [authOk, setAuthOk] = useState(false), [tujuan, setTujuan] = useState("home");
  /* pesanan */
  const [pd, setPd] = useState([]), [ps, setPs] = useState("memuat"), [pf, setPf] = useState("semua");
  /* tampilan */
  const [tab, setTab] = useState("home");
  const [filter, setFilter] = useState("semua"), [q, setQ] = useState(""), [hf, setHf] = useState("semua"), [hq, setHq] = useState("");
  const [form, setForm] = useState(null), [hapus, setHapus] = useState(null), [fp, setFp] = useState(null);
  const [panel, setPanel] = useState(null), [toast, setToast] = useState("");
  const [tema, setTema] = useState(() => {
    try { const t = localStorage.getItem("tema"); if (t === "dark" || t === "light") return t; } catch (e) {}
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const gelap = tema === "dark", peran = profil?.peran, admin = peran === "admin", pembeli = peran === "pembeli";

  useEffect(() => { document.documentElement.dataset.theme = tema; try { localStorage.setItem("tema", tema); } catch (e) {} }, [tema]);
  const info = (t) => { setToast(t); setTimeout(() => setToast(""), 2600); };

  /* keadaan masuk: dipantau, bukan dibaca langsung */
  useEffect(() => pantau(async (u) => {
    setUser(u);
    if (!u) { setProfil(null); setAuthOk(true); return; }
    try { setProfil(await ambilProfil(u.uid)); } catch (err) { console.error(err); setProfil(null); }
    setAuthOk(true);
  }), []);

  const muat = async () => {
    setStatus("memuat");
    try { setData(await ambilMenu()); setStatus("ok"); } catch (err) { console.error(err); setStatus("gagal"); }
  };
  useEffect(() => { muat(); }, []);

  const muatPesanan = async () => {
    setPs("memuat");
    try { setPd(admin ? await pesananAdmin() : await pesananSaya(user.uid)); setPs("ok"); } catch (err) { console.error(err); setPs("gagal"); }
  };
  useEffect(() => { if (tab === "pesanan" && user && (admin || pembeli)) muatPesanan(); }, [tab, user?.uid, peran]);

  /* aksi menu (admin) */
  const simpan = async (rec) => {
    if (form.edit) await ubahMenu(form.edit.id, rec); else await tambahMenu(rec);
    info("✓ " + (form.edit ? "Menu diperbarui" : "Menu tersimpan")); setForm(null); muat();
  };
  const yaHapus = async () => {
    try { await hapusMenu(hapus.id); info("✓ Menu dihapus"); } catch (err) { info(pesanGalat(err)); }
    setHapus(null); muat();
  };
  /* aksi pesanan */
  const pesan = (m) => {
    if (!user) { setTujuan("home"); setTab("masuk"); info("Masuk dulu untuk memesan."); return; }
    if (!pembeli) { info("Hanya akun pembeli yang bisa memesan."); return; }
    setFp(m);
  };
  const kirimPesan = async (jumlah) => {
    await buatPesanan({ menu: fp, jumlah, profil, uid: user.uid });
    setFp(null); info("✓ Pesanan dibuat. Silakan transfer lalu kirim bukti bayar."); setTab("pesanan");
  };
  const aksi = (fn, ok) => async (...a) => { try { await fn(...a); info("✓ " + ok); } catch (err) { info(pesanGalat(err)); } await muatPesanan(); muat(); };
  const gantiStatus = aksi((p, s) => ubahStatus(p, s), "Status pesanan diperbarui");
  const bukti = aksi((p, t) => kirimBukti(p.id, t), "Bukti bayar terkirim");
  const batal = aksi((p) => batalkanSendiri(p.id), "Pesanan dibatalkan");
  const sukses = (t) => { info("✓ " + t); setTab(tujuan === "menu" || tujuan === "laporan" ? "home" : tujuan); window.scrollTo(0, 0); };
  const simpanProfil = async (rec) => { await ubahProfil(user.uid, rec); setProfil({ ...profil, ...rec }); info("✓ Profil diperbarui"); };
  const doKeluar = async () => { await keluar(); setPanel(null); setTab("home"); setPd([]); info("✓ Berhasil keluar"); };

  const a = data.filter((m) => m.tersedia);
  const habis = a.filter((m) => m.sisa_porsi === 0).length, ada = a.length - habis;
  const porsi = a.reduce((s, m) => s + m.sisa_porsi, 0);
  const buka = () => setForm({ edit: null });

  const keadaan = () => {
    if (status === "memuat") return (<ul className="daftar" aria-busy="true" aria-label="Memuat daftar menu">{[0, 1].map((i) => (<li key={i} className="kartu"><div className="sk" style={{ aspectRatio: "16/10", borderRadius: 0 }} /><div className="isi"><div className="sk" style={{ height: 16, width: "60%" }} /><div className="sk" style={{ height: 16, width: "35%", marginTop: 8 }} /></div></li>))}</ul>);
    if (status === "gagal") return (<div className="pusat galat"><Ic n="galat" s={40} c="var(--bahaya)" /><h3>Menu gagal dimuat</h3><p>Periksa koneksi internet, lalu coba lagi.</p><button className="sekunder" onClick={muat}>Coba lagi</button></div>);
    if (!data.length) return (<div className="pusat"><Ic n="kosong" s={40} c="var(--utama)" /><h3>Belum ada menu</h3><p>{admin ? "Tambahkan menu pertama agar pembeli bisa memesan." : "Menu belum tersedia. Silakan kembali nanti."}</p>{admin ? <button className="sekunder" onClick={buka}>Tambah Menu Pertama</button> : null}</div>);
    return null;
  };
  const kosongCari = (reset) => (<div className="pusat"><Ic n="cari" s={40} c="var(--redup)" /><h3>Menu tidak ditemukan</h3><p>Ubah kata kunci atau pilih filter lain.</p><button className="sekunder" onClick={reset}>Hapus Filter</button></div>);
  const blok = (judul, teks, tombol, fn) => (<div className="pusat"><Ic n="galat" s={40} c="var(--utama)" /><h3>{judul}</h3><p>{teks}</p><button className="sekunder" onClick={fn}>{tombol}</button></div>);

  /* ---------- isi halaman ---------- */
  let isi;
  const butuhAdmin = tab === "menu" || tab === "laporan";
  if (!authOk) isi = <div className="pusat"><p>Memeriksa keadaan masuk...</p></div>;
  else if (user && !profil) isi = <Lengkapi user={user} onSelesai={(p) => { setProfil(p); info("✓ Profil tersimpan"); }} onKeluar={doKeluar} />;
  else if (butuhAdmin && !admin) isi = !user
    ? blok("Silakan masuk dulu", "Halaman ini hanya untuk admin. Masuk untuk melanjutkan.", "Masuk", () => { setTujuan(tab); setTab("masuk"); })
    : blok("Akses ditolak", "Akunmu tidak berhak membuka halaman ini.", "Kembali ke Beranda", () => setTab("home"));
  else if (tab === "masuk" && !user) isi = <Auth onSukses={sukses} />;
  else if (tab === "masuk" || tab === "akun") isi = <Profil profil={profil} onSimpan={simpanProfil} onKeluar={doKeluar} />;
  else if (tab === "pesanan") {
    if (!user) isi = blok("Silakan masuk dulu", "Masuk untuk melihat pesananmu.", "Masuk", () => { setTujuan("pesanan"); setTab("masuk"); });
    else if (!admin && !pembeli) isi = blok("Profil tidak ditemukan", "Akunmu belum punya profil.", "Buka Akun", () => setTab("akun"));
    else {
      const L = pd.filter((p) => !admin || pf === "semua" || p.status === pf);
      const F = [["semua", "Semua"], ["menunggu_bayar", "Menunggu"], ["dibayar", "Dibayar"], ["diproses", "Diproses"], ["selesai", "Selesai"]];
      isi = (<>
        <div className="atas"><div><h1>{admin ? "Pesanan Masuk" : "Pesanan Saya"}</h1><p>{admin ? "Pesanan dari pembeli." : "Riwayat pesananmu."}</p></div></div>
        {admin ? <div className="seg" role="group" aria-label="Filter status">{F.map(([k, l]) => (<button key={k} aria-pressed={pf === k} onClick={() => setPf(k)}>{l}</button>))}</div> : null}
        {ps === "memuat" ? <ul className="daftar" aria-busy="true"><li className="kartu"><div className="isi"><div className="sk" style={{ height: 16, width: "60%" }} /><div className="sk" style={{ height: 16, width: "40%", marginTop: 8 }} /></div></li></ul>
          : ps === "gagal" ? <div className="pusat galat"><Ic n="galat" s={40} c="var(--bahaya)" /><h3>Pesanan gagal dimuat</h3><p>Periksa koneksi internet, lalu coba lagi.</p><button className="sekunder" onClick={muatPesanan}>Coba lagi</button></div>
          : !L.length ? <div className="pusat"><Ic n="kosong" s={40} c="var(--utama)" /><h3>Belum ada pesanan</h3><p>{admin ? "Pesanan dari pembeli akan muncul di sini." : "Pilih menu di Beranda untuk memesan."}</p>{!admin ? <button className="sekunder" onClick={() => setTab("home")}>Lihat Menu</button> : null}</div>
          : <ul className="daftar">{L.map((p) => <PesananKartu key={p.id + p.status} p={p} admin={admin} onStatus={gantiStatus} onBukti={bukti} onBatal={batal} />)}</ul>}
      </>);
    }
  } else if (tab === "home") {
    const L = a.filter((m) => hf === "semua" || kat(m) === hf).filter((m) => m.nama.toLowerCase().includes(hq.toLowerCase())).slice(0, 20);
    const TB = [["semua", "Semua"], ["tersedia", "Tersedia"], ["habis", `Habis (${habis})`]];
    const jam = new Date().getHours(), nama = profil?.nama ? profil.nama.split(" ")[0] : "Tamu";
    const grid = keadaan() || (L.length ? (<ul className="grid2">{L.map((m) => (
      <li key={m.id} className="kartu g"><Foto m={m} /><div className="isi"><div className="nama">{m.nama}</div><div className="meta1">Sisa {m.sisa_porsi} porsi</div><span className="harga">Rp{rp(m.harga)}</span>
        <div className="aksi2">{admin ? <>
          <button className="ubah" aria-label={"Ubah " + m.nama} onClick={() => setForm({ edit: m })}><Ic n="edit" s={18} /></button>
          <button className="hapus" aria-label={"Hapus " + m.nama} onClick={() => setHapus(m)}><Ic n="hapus" s={18} /></button></>
          : <button className="ubah" disabled={m.sisa_porsi === 0} onClick={() => pesan(m)}>{m.sisa_porsi === 0 ? "Habis" : "Pesan"}</button>}</div></div></li>))}</ul>)
      : kosongCari(() => { setHf("semua"); setHq(""); }));
    isi = (<>
      <div className="top">
        <button className="ikon" aria-label="Buka menu aplikasi" onClick={() => setPanel("menu")}><Ic n="burger" s={26} /></button>
        <div style={{ display: "flex", alignItems: "center" }}>
          {user ? null : <button className="sekunder kecil" onClick={() => { setTujuan("home"); setTab("masuk"); }}>Masuk</button>}
          <button className="ikon" aria-label={gelap ? "Pakai tema terang" : "Pakai tema gelap"} onClick={() => setTema(gelap ? "light" : "dark")}><Ic n={gelap ? "matahari" : "bulan"} s={26} /></button>
          <button className="ikon" aria-label={habis ? `Notifikasi, ${habis} menu habis` : "Notifikasi"} onClick={() => setPanel("notif")}><Ic n="bel" s={26} />{habis && status === "ok" ? <span className="titik" /> : null}</button>
          {user ? <button className="ikon" aria-label="Keluar" title="Keluar" onClick={doKeluar}><Ic n="keluar" s={26} /></button> : null}
        </div></div>
      <div className="sapa"><div><h1>{sapa()},<br /><em>{nama}!</em></h1><p>{admin ? "Semoga dagangan laris hari ini ✨" : user ? "Mau makan apa hari ini? ✨" : "Masuk untuk memesan ✨"}</p></div><Awan malam={jam >= 18 || jam < 5} /></div>
      <div className="cari"><input type="search" placeholder="Cari menu katering..." aria-label="Cari menu katering" value={hq} onChange={(ev) => setHq(ev.target.value)} /></div>
      <div className="tabs" role="group" aria-label="Filter menu">{TB.map(([k, l]) => (<button key={k} aria-selected={hf === k} onClick={() => setHf(k)}>{l}</button>))}</div>
      {status === "ok" ? <p className="hitung">{a.length} menu · {porsi} porsi siap jual</p> : null}{grid}</>);
  } else if (tab === "menu") {
    const F = [["semua", "Semua", a.length], ["tersedia", "Tersedia", ada], ["habis", "Habis", habis], ["non", "Non-aktif", data.length - a.length]];
    const L = data.filter((m) => (filter === "semua" ? m.tersedia : kat(m) === filter)).filter((m) => m.nama.toLowerCase().includes(q.toLowerCase())).slice(0, 20);
    const daftarMenu = keadaan() || (L.length ? (<ul className="daftar">{L.map((m) => (
      <li key={m.id} className="kartu"><Foto m={m} /><div className="isi"><div className="baris"><div className="nama">{m.nama}</div><div className="harga">Rp{rp(m.harga)}</div></div>
        <div className="meta"><span>Sisa porsi</span><b>{m.sisa_porsi} porsi</b></div>
        <div className="aksi"><button className="sekunder kecil" aria-label={"Ubah " + m.nama} onClick={() => setForm({ edit: m })}>Ubah</button><button className="bahaya kecil" aria-label={"Hapus " + m.nama} onClick={() => setHapus(m)}>Hapus</button></div></div></li>))}</ul>)
      : kosongCari(() => { setFilter("semua"); setQ(""); }));
    isi = (<>
      <div className="atas"><div><h1>Kelola Menu</h1><p>{status === "ok" ? `${a.length} menu tampil · ${porsi} porsi siap jual` : "Memuat daftar menu..."}</p></div></div>
      <div className="cari"><input type="search" placeholder="Cari nama menu..." aria-label="Cari nama menu" value={q} onChange={(ev) => setQ(ev.target.value)} /></div>
      <div className="seg" role="group" aria-label="Filter">{F.map(([k, l, n]) => (<button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)}>{l} ({n})</button>))}</div>{daftarMenu}</>);
  } else isi = blok("Modul Laporan", "Porsi terjual dan uang masuk per tanggal. Dibangun pada praktik berikutnya.", "Kembali ke Menu", () => setTab("menu"));

  const T = !user ? [["home", "Beranda", "home"], ["masuk", "Masuk", "user"]]
    : admin ? [["home", "Beranda", "home"], ["menu", "Menu", "menu"], null, ["pesanan", "Pesanan", "pesan"], ["laporan", "Laporan", "lap"], ["akun", "Profil", "user"]]
    : [["home", "Beranda", "home"], ["pesanan", "Pesanan", "pesan"], ["akun", "Profil", "user"]];
  const linkPanel = !user ? [["home", "Beranda"], ["masuk", "Masuk atau Daftar"]] : admin ? [["home", "Beranda"], ["menu", "Kelola Menu"], ["pesanan", "Pesanan Masuk"], ["laporan", "Laporan"], ["akun", "Profil"]] : [["home", "Beranda"], ["pesanan", "Pesanan Saya"], ["akun", "Profil"]];

  return (
    <>
      <div className="app">{isi}</div>
      <nav aria-label="Navigasi utama" style={{ gridTemplateColumns: `repeat(${T.length},1fr)` }}>{T.map((t) => t
        ? <button key={t[0]} aria-current={tab === t[0] ? "page" : undefined} onClick={() => { setTab(t[0]); window.scrollTo(0, 0); }}><Ic n={t[2]} />{t[1]}</button>
        : <button key="plus" className="plus" aria-label="Tambah Menu" onClick={buka}><Ic n="plus" s={28} /></button>)}</nav>
      {form && admin && <Form key={form.edit ? form.edit.id : "baru"} edit={form.edit} onClose={() => setForm(null)} onSave={simpan} />}
      {fp && <FormPesan menu={fp} profil={profil} onClose={() => setFp(null)} onKirim={kirimPesan} />}
      {panel === "menu" && (<Modal label="Menu aplikasi" onClose={() => setPanel(null)}><h3>Menu Aplikasi</h3>
        {user ? <p style={{ margin: "0 0 12px", color: "var(--redup)" }}>{profil?.nama || user.email} · {admin ? "Admin" : pembeli ? "Pembeli" : "Tanpa profil"}</p> : null}
        {linkPanel.map(([k, l]) => (<button key={k} className="tautan" onClick={() => { setTab(k); setPanel(null); }}>{l}</button>))}
        <button className="tautan" onClick={() => setTema(gelap ? "light" : "dark")}>Tema: {gelap ? "Gelap" : "Terang"} (ketuk untuk ganti)</button>
        <div className="tombol">{user ? <button className="bahaya" onClick={doKeluar}>Keluar</button> : null}<button className="utama" onClick={() => setPanel(null)}>Tutup</button></div></Modal>)}
      {panel === "notif" && (<Modal label="Notifikasi" onClose={() => setPanel(null)}><h3>Notifikasi</h3>
        {a.filter((m) => m.sisa_porsi === 0).map((m) => (<p key={m.id} style={{ margin: "0 0 8px" }}><b>{m.nama}</b> sudah habis.</p>))}
        {habis ? null : <p style={{ margin: 0, color: "var(--redup)" }}>Belum ada notifikasi baru.</p>}
        <div className="tombol"><button className="utama" onClick={() => setPanel(null)}>Tutup</button></div></Modal>)}
      {hapus && (<Modal label="Konfirmasi hapus" onClose={() => setHapus(null)}><h3>Hapus {hapus.nama}?</h3>
        <p style={{ margin: 0, color: "var(--redup)" }}>Menu ini hilang permanen dan tidak bisa dikembalikan.</p>
        <div className="tombol"><button className="netral" onClick={() => setHapus(null)}>Batal</button><button className="bahaya solid" onClick={yaHapus}>Hapus Menu</button></div></Modal>)}
      <div id="toast" className={toast ? "on" : ""} role="status">{toast}</div>
    </>
  );
}
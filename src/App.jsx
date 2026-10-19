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

function AdminReport({ pesanan, status, onReload }) {
  const [periode, setPeriode] = useState("semua");
  const sekarang = new Date();
  const awal = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
  if (periode === "7hari") awal.setDate(awal.getDate() - 6);
  if (periode === "bulan") awal.setDate(1);
  const tanggalPesanan = (p) => {
    if (typeof p.tanggal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.tanggal)) {
      const [tahun, bulan, hari] = p.tanggal.split("-").map(Number);
      return new Date(tahun, bulan - 1, hari);
    }
    return p.dibuat_pada?.toDate ? p.dibuat_pada.toDate() : null;
  };
  const daftar = periode === "semua"
    ? pesanan
    : pesanan.filter((p) => {
      const tanggal = tanggalPesanan(p);
      return tanggal && tanggal >= awal;
    });
  const terbayar = daftar.filter((p) => ["dibayar", "diproses", "selesai"].includes(p.status));
  const omzet = terbayar.reduce((jumlah, p) => jumlah + (Number(p.total) || 0), 0);
  const porsi = terbayar.reduce((jumlah, p) => jumlah + (Number(p.jumlah_porsi) || 0), 0);
  const statusPesanan = [
    ["menunggu_bayar", "Menunggu bayar"],
    ["dibayar", "Dibayar"],
    ["diproses", "Diproses"],
    ["selesai", "Selesai"],
    ["dibatalkan", "Dibatalkan"],
  ];
  const terlaris = Object.values(terbayar.reduce((hasil, p) => {
    const nama = p.nama_menu || "Menu tanpa nama";
    hasil[nama] = hasil[nama] || { nama, jumlah: 0, porsi: 0 };
    hasil[nama].jumlah += 1;
    hasil[nama].porsi += Number(p.jumlah_porsi) || 0;
    return hasil;
  }, {})).sort((x, y) => y.porsi - x.porsi).slice(0, 5);
  const maksPorsi = Math.max(1, ...terlaris.map((item) => item.porsi));
  const formatTanggal = (p) => {
    const tanggal = tanggalPesanan(p);
    return tanggal ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(tanggal) : "Tanggal tidak tersedia";
  };

  return (
    <section className="laporan">
      <div className="atas"><div><h1>Laporan</h1><p>Ringkasan pesanan dan penjualan Dapur Nia.</p></div>
        <button className="reset" onClick={onReload} disabled={status === "memuat"}>{status === "memuat" ? "Memuat..." : "Muat ulang"}</button></div>
      <div className="seg" role="group" aria-label="Filter periode laporan">
        {[["semua", "Semua terbaru"], ["7hari", "7 hari"], ["bulan", "Bulan ini"]].map(([key, label]) => (
          <button key={key} aria-pressed={periode === key} onClick={() => setPeriode(key)}>{label}</button>
        ))}
      </div>
      <p className="laporan-catatan">Laporan dihitung dari maksimal 20 pesanan terbaru yang tersedia.</p>
      {status === "memuat" ? <div className="pusat" aria-busy="true"><p>Memuat laporan pesanan...</p></div>
        : status === "gagal" ? <div className="pusat galat"><Ic n="galat" s={40} c="var(--bahaya)" /><h3>Laporan gagal dimuat</h3><p>Periksa koneksi internet, lalu coba lagi.</p><button className="sekunder" onClick={onReload}>Coba lagi</button></div>
          : <>
            <div className="laporan-ringkas">
              <article className="laporan-kartu"><span>Pesanan</span><b>{rp(daftar.length)}</b><small>{periode === "semua" ? "Dalam 20 pesanan terbaru" : "Pada periode terpilih"}</small></article>
              <article className="laporan-kartu"><span>Omzet terkonfirmasi</span><b>Rp{rp(omzet)}</b><small>Tidak termasuk menunggu bayar atau dibatalkan</small></article>
              <article className="laporan-kartu"><span>Porsi terjual</span><b>{rp(porsi)}</b><small>Dari pesanan yang sudah dibayar</small></article>
              <article className="laporan-kartu"><span>Pesanan selesai</span><b>{rp(daftar.filter((p) => p.status === "selesai").length)}</b><small>Pesanan berstatus selesai</small></article>
            </div>
            <div className="laporan-baris">
              <section className="laporan-panel">
                <h2>Status pesanan</h2>
                <ul className="laporan-status">{statusPesanan.map(([key, label]) => {
                  const jumlah = daftar.filter((p) => p.status === key).length;
                  return <li key={key}><span>{label}</span><b>{rp(jumlah)}</b></li>;
                })}</ul>
              </section>
              <section className="laporan-panel">
                <h2>Menu terlaris</h2>
                {terlaris.length ? <ul className="laporan-terlaris">{terlaris.map((item) => (
                  <li key={item.nama}><div className="baris"><b>{item.nama}</b><span>{rp(item.porsi)} porsi</span></div>
                    <div className="laporan-bar"><span style={{ width: `${item.porsi / maksPorsi * 100}%` }} /></div></li>
                ))}</ul> : <p className="laporan-kosong">Belum ada penjualan terkonfirmasi pada periode ini.</p>}
              </section>
            </div>
            <section className="laporan-panel laporan-riwayat">
              <h2>Pesanan terbaru</h2>
              {daftar.length ? <ul>{daftar.slice(0, 8).map((p) => (
                <li key={p.id}><div><b>{p.nama_menu || "Menu tanpa nama"}</b><small>{formatTanggal(p)} · {p.nama_pelanggan || "Pelanggan"}</small></div>
                  <div className="laporan-nilai"><span className={"pil " + (STP[p.status] || "p-non")}>{STL[p.status] || "Tidak diketahui"}</span><b>Rp{rp(Number(p.total) || 0)}</b></div>
                </li>
              ))}</ul> : <p className="laporan-kosong">Belum ada pesanan pada periode ini.</p>}
            </section>
          </>}
    </section>
  );
}

function NotificationPanel({ loggedIn, role, status, pesanan, menuHabis, onReload, onLogin, onViewOrders, onClose }) {
  const tanggalPesanan = (p) => {
    if (typeof p.tanggal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.tanggal)) {
      const [tahun, bulan, hari] = p.tanggal.split("-").map(Number);
      return new Date(tahun, bulan - 1, hari);
    }
    return p.dibuat_pada?.toDate ? p.dibuat_pada.toDate() : null;
  };
  const perhatian = role === "admin"
    ? pesanan.filter((p) => p.status === "menunggu_bayar")
    : pesanan.filter((p) => p.status === "menunggu_bayar" && !p.bukti_bayar);
  const pesananLain = pesanan.filter((p) => !perhatian.some((x) => x.id === p.id)).slice(0, 8);
  const formatTanggal = (p) => {
    const tanggal = tanggalPesanan(p);
    return tanggal ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(tanggal) : "Tanggal tidak tersedia";
  };
  const pesanStatus = (p) => {
    if (role === "admin" && p.status === "menunggu_bayar") {
      return p.bukti_bayar ? `Bukti pembayaran dari ${p.nama_pelanggan || "pelanggan"} menunggu verifikasi.`
        : `Pesanan dari ${p.nama_pelanggan || "pelanggan"} menunggu pembayaran.`;
    }
    if (role === "pembeli" && p.status === "menunggu_bayar") {
      return p.bukti_bayar ? "Bukti pembayaran sudah dikirim dan menunggu verifikasi."
        : "Silakan selesaikan pembayaran untuk pesanan ini.";
    }
    return `Status pesanan: ${STL[p.status] || "Tidak diketahui"}.`;
  };

  return (
    <Modal label="Notifikasi" onClose={onClose}>
      <div className="notif-kepala"><h3>Notifikasi</h3></div>
      {!loggedIn ? <>
        <p className="notif-kosong">Masuk untuk melihat notifikasi pesananmu.</p>
        <div className="tombol"><button className="netral" onClick={onClose}>Tutup</button><button className="utama" onClick={onLogin}>Masuk</button></div>
      </> : role !== "admin" && role !== "pembeli" ? <>
        <p className="notif-kosong">Profil akun tidak tersedia, jadi notifikasi pesanan belum bisa dimuat.</p>
        <div className="tombol"><button className="utama" onClick={onClose}>Tutup</button></div>
      </> : status === "memuat" ? <div className="notif-kosong" role="status" aria-busy="true">Memuat notifikasi...</div>
        : status === "gagal" ? <div className="notif-gagal" role="alert"><p>Notifikasi gagal dimuat. Periksa koneksi internet, lalu coba lagi.</p><button className="sekunder" onClick={onReload}>Coba lagi</button></div>
          : <>
            {perhatian.length ? <section className="notif-bagian">
              <h4>{role === "admin" ? "Perlu perhatian" : "Perlu tindakan"}</h4>
              <ul className="notif-daftar">{perhatian.map((p) => (
                <li key={p.id}><button className="notif-item" onClick={() => onViewOrders()}>
                  <span className="notif-ikon"><Ic n="pesan" s={20} /></span>
                  <span className="notif-isi"><b>{p.nama_menu || "Pesanan"} × {p.jumlah_porsi || 0}</b><span>{pesanStatus(p)}</span><small>{formatTanggal(p)} · Rp{rp(Number(p.total) || 0)}</small></span>
                  <span className={"pil " + (STP[p.status] || "p-non")}>{STL[p.status] || "Status"}</span>
                </button></li>
              ))}</ul>
            </section> : null}
            {pesananLain.length ? <section className="notif-bagian">
              <h4>{role === "admin" ? "Pesanan terbaru" : "Pembaruan pesanan"}</h4>
              <ul className="notif-daftar">{pesananLain.map((p) => (
                <li key={p.id}><button className="notif-item" onClick={() => onViewOrders()}>
                  <span className="notif-ikon"><Ic n="pesan" s={20} /></span>
                  <span className="notif-isi"><b>{p.nama_menu || "Pesanan"} × {p.jumlah_porsi || 0}</b><span>{pesanStatus(p)}</span><small>{formatTanggal(p)} · Rp{rp(Number(p.total) || 0)}</small></span>
                  <span className={"pil " + (STP[p.status] || "p-non")}>{STL[p.status] || "Status"}</span>
                </button></li>
              ))}</ul>
            </section> : null}
            {menuHabis.length ? <section className="notif-bagian">
              <h4>Informasi menu</h4>
              <ul className="notif-daftar">{menuHabis.map((m) => (
                <li key={m.id}><div className="notif-item notif-info">
                  <span className="notif-ikon"><Ic n="piring" s={20} /></span>
                  <span className="notif-isi"><b>{m.nama}</b><span>Menu sedang habis.</span></span>
                  <span className="pil p-habis">Habis</span>
                </div></li>
              ))}</ul>
            </section> : null}
            {!pesanan.length && !menuHabis.length ? <p className="notif-kosong">Belum ada notifikasi. Pesanan dan informasi stok akan muncul di sini.</p> : null}
            <div className="tombol"><button className="netral" onClick={onClose}>Tutup</button>
              {pesanan.length ? <button className="utama" onClick={onViewOrders}>Lihat Pesanan</button> : null}</div>
          </>}
    </Modal>
  );
}

export default function App() {
  /* data menu */
  const [data, setData] = useState([]), [status, setStatus] = useState("memuat");
  /* login */
  const [user, setUser] = useState(null), [profil, setProfil] = useState(null), [authOk, setAuthOk] = useState(false), [tujuan, setTujuan] = useState("home");
  /* pesanan */
  const [pd, setPd] = useState([]), [ps, setPs] = useState("memuat"), [pf, setPf] = useState("semua");
  const [notifPesanan, setNotifPesanan] = useState([]), [notifStatus, setNotifStatus] = useState("diam");
  const notifRequest = useRef(0);
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
  const muatNotifikasi = async () => {
    if (!user || (!admin && !pembeli)) return;
    const request = ++notifRequest.current;
    const uid = user.uid;
    setNotifStatus("memuat");
    try {
      const terbaru = admin ? await pesananAdmin() : await pesananSaya(uid);
      if (request !== notifRequest.current || user?.uid !== uid) return;
      setNotifPesanan(terbaru);
      setNotifStatus("ok");
    } catch (err) {
      if (request !== notifRequest.current || user?.uid !== uid) return;
      console.error(err);
      setNotifStatus("gagal");
    }
  };
  useEffect(() => {
    if (user && (admin || pembeli)) muatNotifikasi();
    else { notifRequest.current += 1; setNotifPesanan([]); setNotifStatus("diam"); }
  }, [user?.uid, peran]);
  useEffect(() => { if ((tab === "pesanan" || tab === "laporan") && user && (admin || pembeli)) muatPesanan(); }, [tab, user?.uid, peran]);

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
    muatNotifikasi();
    setFp(null); info("✓ Pesanan dibuat. Silakan transfer lalu kirim bukti bayar."); setTab("pesanan");
  };
  const aksi = (fn, ok) => async (...a) => { try { await fn(...a); info("✓ " + ok); } catch (err) { info(pesanGalat(err)); } await muatPesanan(); muatNotifikasi(); muat(); };
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
  const pendingNotif = notifPesanan.filter((p) => p.status === "menunggu_bayar" && (admin || !p.bukti_bayar)).length;
  const jumlahNotif = pendingNotif + habis;
  const bukaNotifikasi = () => {
    setPanel("notif");
    if (user && (admin || pembeli)) muatNotifikasi();
  };
  const lihatPesananDariNotif = () => {
    setPanel(null);
    if (user) { setTab("pesanan"); window.scrollTo(0, 0); }
  };

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
          <button className="ikon" aria-label={jumlahNotif ? `Notifikasi, ${jumlahNotif} perlu perhatian` : "Notifikasi"} aria-haspopup="dialog" aria-expanded={panel === "notif"} onClick={bukaNotifikasi}>
            <Ic n="bel" s={26} />{jumlahNotif && (status === "ok" || notifStatus === "ok") ? <span className="notif-badge">{jumlahNotif > 9 ? "9+" : jumlahNotif}</span> : null}
          </button>
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
  } else isi = <AdminReport pesanan={pd} status={ps} onReload={muatPesanan} />;

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
      {panel === "notif" && <NotificationPanel loggedIn={Boolean(user)} role={peran} status={notifStatus} pesanan={notifPesanan}
        menuHabis={a.filter((m) => m.sisa_porsi === 0)} onReload={muatNotifikasi} onClose={() => setPanel(null)}
        onLogin={() => { setTujuan("home"); setPanel(null); setTab("masuk"); }} onViewOrders={lihatPesananDariNotif} />}
      {hapus && (<Modal label="Konfirmasi hapus" onClose={() => setHapus(null)}><h3>Hapus {hapus.nama}?</h3>
        <p style={{ margin: 0, color: "var(--redup)" }}>Menu ini hilang permanen dan tidak bisa dikembalikan.</p>
        <div className="tombol"><button className="netral" onClick={() => setHapus(null)}>Batal</button><button className="bahaya solid" onClick={yaHapus}>Hapus Menu</button></div></Modal>)}
      <div id="toast" className={toast ? "on" : ""} role="status">{toast}</div>
    </>
  );
}
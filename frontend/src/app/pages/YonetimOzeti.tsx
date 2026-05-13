import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import {
  AlertTriangle, CheckCircle2, ArrowUpRight, Download,
  MessageSquare, X, Send, CheckCheck, AlertCircle,
  ChevronRight, Lock, Zap, ShoppingBag,
  ShieldCheck, Timer, Target,
} from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { kpiYonetimOzeti, formatTL, formatSayi } from "../data/mockData";

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const KULLANICILAR = ["Ahmet Yılmaz", "Fatma Demir", "Mehmet Çelik", "Zeynep Arslan"];

const DURUM_COLORS: Record<string, string> = {
  Açık: "#ef4444",
  İşlemde: "#f59e0b",
  Kapatıldı: "#22c55e",
};

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface Mesaj {
  id: string;
  gonderen: string;
  metin: string;
  zaman: string;
}

type FarkDurum = "Açık" | "İşlemde" | "Kapatıldı";

interface FarkKalemi {
  id: string;
  siparisNo: string;
  pazaryeri: string;
  barkod: string;
  urunAdi: string;
  brutSatis: number;
  komisyonGideri: number;
  kargoGideri: number;
  komisyonFarki: number;
  desiFarki: number;
  kargoFarki: number;
  netKar: number;
  toplamFark: number;
  farkTipleri: string[];
  onemi: "Yüksek" | "Orta" | "Düşük";
  durum: FarkDurum;
  atananKullanici: string;
  acilmaZamani: string;
  kapatan?: string;
  kapatmaZamani?: string;
  kapatmaAciklamasi?: string;
  mesajlar: Mesaj[];
}

// ─── Mock Veri ────────────────────────────────────────────────────────────────
const initialKalemler: FarkKalemi[] = [
  {
    id: "fk1", siparisNo: "SPT-AMAZON-2026-0289", pazaryeri: "Amazon",
    barkod: "8681000000106", urunAdi: "Yoga Matı Deluxe",
    brutSatis: 2450, komisyonGideri: 388.25, kargoGideri: 95,
    komisyonFarki: -45.25, desiFarki: 0, kargoFarki: 0,
    netKar: -18.8, toplamFark: 45.25, farkTipleri: ["Komisyon Farkı"],
    onemi: "Yüksek", durum: "İşlemde", atananKullanici: "Fatma Demir",
    acilmaZamani: "07.05.2026 08:30",
    mesajlar: [
      { id: "m1", gonderen: "Ahmet Yılmaz", metin: "Fatma Hanım, Amazon Seller Central üzerinden komisyon itiraz formu doldurulacak. Bu hafta içinde çözülmesini bekliyorum.", zaman: "07.05.2026 09:00" },
      { id: "m2", gonderen: "Fatma Demir", metin: "Anlaşıldı. Amazon ile iletişime geçtim, itiraz formu gönderildi. Yanıt bekleniyor.", zaman: "07.05.2026 10:45" },
    ],
  },
  {
    id: "fk2", siparisNo: "SPT-FLO-2026-0021", pazaryeri: "FLO",
    barkod: "8681000000157", urunAdi: "Running Ayakkabı M42",
    brutSatis: 1249, komisyonGideri: 174.86, kargoGideri: 112,
    komisyonFarki: 0, desiFarki: 3, kargoFarki: -30,
    netKar: -88.84, toplamFark: 30, farkTipleri: ["Desi Farkı"],
    onemi: "Yüksek", durum: "Açık", atananKullanici: "Ahmet Yılmaz",
    acilmaZamani: "07.05.2026 09:15", mesajlar: [],
  },
  {
    id: "fk3", siparisNo: "SPT-HEPSI-2026-0142", pazaryeri: "Hepsiburada",
    barkod: "8681000000072", urunAdi: "Pro Koşu Şortu",
    brutSatis: 879, komisyonGideri: 145.96, kargoGideri: 91,
    komisyonFarki: -18.5, desiFarki: 2, kargoFarki: -16,
    netKar: -42.14, toplamFark: 34.5, farkTipleri: ["Komisyon Farkı", "Desi Farkı"],
    onemi: "Orta", durum: "Açık", atananKullanici: "Mehmet Çelik",
    acilmaZamani: "07.05.2026 10:00", mesajlar: [],
  },
  {
    id: "fk4", siparisNo: "SPT-LCW-2026-0018", pazaryeri: "LCW",
    barkod: "8681000000164", urunAdi: "Slim Fit Spor Eşofman Alt",
    brutSatis: 549, komisyonGideri: 79.6, kargoGideri: 55,
    komisyonFarki: -13.72, desiFarki: 0, kargoFarki: 0,
    netKar: -54.06, toplamFark: 13.72, farkTipleri: ["Komisyon Farkı"],
    onemi: "Orta", durum: "Açık", atananKullanici: "Fatma Demir",
    acilmaZamani: "06.05.2026 15:40", mesajlar: [],
  },
  {
    id: "fk5", siparisNo: "SPT-TRENDYOL-2026-0003", pazaryeri: "Trendyol",
    barkod: "8681000000035", urunAdi: "DryFit Antrenman Tişörtü",
    brutSatis: 1133, komisyonGideri: 135.96, kargoGideri: 70,
    komisyonFarki: 0, desiFarki: 1, kargoFarki: -8,
    netKar: -59.46, toplamFark: 8, farkTipleri: ["Desi Farkı"],
    onemi: "Düşük", durum: "İşlemde", atananKullanici: "Zeynep Arslan",
    acilmaZamani: "07.05.2026 11:20",
    mesajlar: [
      { id: "m3", gonderen: "Ahmet Yılmaz", metin: "Zeynep Hanım, bu kalemin bu haftaya kadar kapatılması gerekiyor.", zaman: "07.05.2026 11:30" },
    ],
  },
  {
    id: "fk6", siparisNo: "SPT-PAZARAMA-2026-0009", pazaryeri: "Pazarama",
    barkod: "8681000000178", urunAdi: "Protein Shaker Seti",
    brutSatis: 799, komisyonGideri: 112.66, kargoGideri: 70,
    komisyonFarki: -8.79, desiFarki: 1, kargoFarki: -8,
    netKar: -33.75, toplamFark: 16.79, farkTipleri: ["Komisyon Farkı", "Desi Farkı"],
    onemi: "Düşük", durum: "Açık", atananKullanici: "Mehmet Çelik",
    acilmaZamani: "05.05.2026 14:00", mesajlar: [],
  },
  {
    id: "fk7", siparisNo: "SPT-TRENDYOL-2026-0087", pazaryeri: "Trendyol",
    barkod: "8681000000143", urunAdi: "Fitness Eldiveni L/XL",
    brutSatis: 1899, komisyonGideri: 260.22, kargoGideri: 68,
    komisyonFarki: -32.34, desiFarki: 0, kargoFarki: 0,
    netKar: -1.78, toplamFark: 32.34, farkTipleri: ["Komisyon Farkı"],
    onemi: "Yüksek", durum: "Kapatıldı", atananKullanici: "Ahmet Yılmaz",
    acilmaZamani: "06.05.2026 16:10", kapatan: "Ahmet Yılmaz",
    kapatmaZamani: "06.05.2026 17:45",
    kapatmaAciklamasi: "Trendyol finans ekibi ile görüşüldü. Kategori bazlı komisyon oranı %12 olarak teyit edildi ve Nisan mutabakat faturasına düzeltme yansıtıldı. İade alacağı oluşturuldu, 5 iş günü içinde hesabımıza aktarılacak.",
    mesajlar: [
      { id: "m4", gonderen: "Ahmet Yılmaz", metin: "Trendyol yetkilileri hatayı kabul etti. Mutabakat faturasına yansıyacak.", zaman: "06.05.2026 17:00" },
    ],
  },
  {
    id: "fk8", siparisNo: "SPT-N11-2026-0034", pazaryeri: "n11",
    barkod: "8681000000119", urunAdi: "Spor Çorap Seti 3lü",
    brutSatis: 650, komisyonGideri: 78, kargoGideri: 62,
    komisyonFarki: 0, desiFarki: 1, kargoFarki: -7,
    netKar: -28.5, toplamFark: 7, farkTipleri: ["Desi Farkı"],
    onemi: "Düşük", durum: "Kapatıldı", atananKullanici: "Zeynep Arslan",
    acilmaZamani: "05.05.2026 10:30", kapatan: "Zeynep Arslan",
    kapatmaZamani: "05.05.2026 14:20",
    kapatmaAciklamasi: "n11 kargo birimi ile görüşüldü. Paket boyutunun hatalı ölçüldüğü doğrulandı. Düzeltme talebi oluşturuldu ve onaylandı. Fazla ödenen 7 TL bir sonraki mutabakat döneminde mahsup edilecek.",
    mesajlar: [],
  },
];

// ─── Yardımcı stiller ─────────────────────────────────────────────────────────
const onemiKonfig = {
  Yüksek: { cls: "bg-red-100 text-red-700 border-red-200",    icon: <Zap className="w-2.5 h-2.5" /> },
  Orta:   { cls: "bg-amber-100 text-amber-700 border-amber-200", icon: null },
  Düşük:  { cls: "bg-slate-100 text-slate-500 border-slate-200", icon: null },
};

const durumKonfig: Record<FarkDurum, { cls: string; dot: string; label: string }> = {
  Açık:      { cls: "text-red-600 bg-red-50 border-red-200",       dot: "bg-red-500",    label: "Açık" },
  İşlemde:   { cls: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500",  label: "İşlemde" },
  Kapatıldı: { cls: "text-green-700 bg-green-50 border-green-200", dot: "bg-green-500",  label: "Kapatıldı" },
};

const farkTipiCls: Record<string, string> = {
  "Komisyon Farkı": "bg-purple-50 text-purple-700 border-purple-200",
  "Desi Farkı":     "bg-orange-50 text-orange-700 border-orange-200",
};

// ─── Detay Drawer ─────────────────────────────────────────────────────────────
interface DrawerProps {
  kalem: FarkKalemi;
  onClose: () => void;
  onUpdate: (updated: FarkKalemi) => void;
}

function FarkDetayDrawer({ kalem, onClose, onUpdate }: DrawerProps) {
  const [mesajMetni, setMesajMetni]         = useState("");
  const [kapatmaMode, setKapatmaMode]       = useState(false);
  const [kapatanKisi, setKapatanKisi]       = useState(KULLANICILAR[0]);
  const [kapatmaAciklama, setKapatmaAciklama] = useState("");
  const [aciklamaHata, setAciklamaHata]     = useState(false);
  const mesajEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mesajEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [kalem.mesajlar.length]);

  const handleMesajGonder = () => {
    if (!mesajMetni.trim()) return;
    const yeniMesaj: Mesaj = {
      id: `m${Date.now()}`,
      gonderen: "Ahmet Yılmaz",
      metin: mesajMetni.trim(),
      zaman: new Date().toLocaleString("tr-TR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    };
    onUpdate({ ...kalem, mesajlar: [...kalem.mesajlar, yeniMesaj], durum: "İşlemde" });
    setMesajMetni("");
    toast.success("Mesaj gönderildi", { description: `${kalem.atananKullanici} adlı kişiye iletildi.` });
  };

  const handleKapat = () => {
    if (!kapatmaAciklama.trim()) { setAciklamaHata(true); return; }
    const now = new Date().toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    onUpdate({ ...kalem, durum: "Kapatıldı", kapatan: kapatanKisi, kapatmaZamani: now, kapatmaAciklamasi: kapatmaAciklama.trim() });
    toast.success("Fark kalemi kapatıldı", { description: `${kalem.siparisNo} — ${kapatanKisi} tarafından kapatıldı.` });
    setKapatmaMode(false);
  };

  const isKapatildi = kalem.durum === "Kapatıldı";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Fark Kalemi Detayı</p>
            <h2 className="text-sm font-semibold text-slate-800 font-mono">{kalem.siparisNo}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${durumKonfig[kalem.durum].cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${durumKonfig[kalem.durum].dot}`} />
                {durumKonfig[kalem.durum].label}
              </span>
              {kalem.farkTipleri.map((t) => (
                <span key={t} className={`inline-flex px-2 py-0.5 rounded text-xs border ${farkTipiCls[t] || "bg-slate-50 text-slate-600 border-slate-200"}`}>{t}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">

            {/* Ürün Bilgisi */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ürün Bilgisi</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{kalem.urunAdi}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{kalem.barkod}</p>
                </div>
                <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg flex-shrink-0">{kalem.pazaryeri}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Atanan: <span className="font-medium text-slate-600">{kalem.atananKullanici}</span>
                &nbsp;·&nbsp;{kalem.acilmaZamani}
              </p>
            </div>

            {/* Finansal Özet */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Finansal Özet</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Brüt Satış",      val: formatTL(kalem.brutSatis),     color: "text-slate-800" },
                  { label: "Net Kâr",          val: formatTL(kalem.netKar),        color: kalem.netKar < 0 ? "text-red-600" : "text-green-600" },
                  { label: "Komisyon Gideri",  val: formatTL(kalem.komisyonGideri), color: "text-slate-700" },
                  { label: "Kargo Gideri",     val: formatTL(kalem.kargoGideri),   color: "text-slate-700" },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fark Detayı */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Tespit Edilen Farklar</span>
              </div>
              <div className="space-y-2">
                {kalem.komisyonFarki !== 0 && (
                  <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                    <span className="text-xs text-slate-600">Komisyon Fazla Faturalandı</span>
                    <span className="text-xs font-semibold text-red-600">{formatTL(Math.abs(kalem.komisyonFarki))}</span>
                  </div>
                )}
                {kalem.desiFarki !== 0 && (
                  <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                    <span className="text-xs text-slate-600">Desi Farkı ({kalem.desiFarki > 0 ? "+" : ""}{kalem.desiFarki} desi)</span>
                    <span className="text-xs font-semibold text-red-600">{formatTL(Math.abs(kalem.kargoFarki))}</span>
                  </div>
                )}
                <div className="flex justify-between bg-red-100 rounded-lg px-3 py-2 border border-red-200">
                  <span className="text-xs font-semibold text-red-800">Toplam Fark Kaybı</span>
                  <span className="text-sm font-bold text-red-700">-{formatTL(kalem.toplamFark)}</span>
                </div>
              </div>
            </div>

            {/* Kapatıldı Kaydı */}
            {isKapatildi && (
              <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">Sipariş Detayı — Kapatma Kaydı</span>
                </div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-xs font-bold flex-shrink-0">
                    {(kalem.kapatan || "").split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{kalem.kapatan}</p>
                    <p className="text-xs text-slate-400">{kalem.kapatmaZamani}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />Kapandı
                  </span>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Kapatma Açıklaması</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{kalem.kapatmaAciklamasi}</p>
                </div>
              </div>
            )}

            {/* Mesajlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mesajlar</span>
                {kalem.mesajlar.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{kalem.mesajlar.length}</span>
                )}
              </div>
              {kalem.mesajlar.length === 0 ? (
                <div className="text-center py-5 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Henüz mesaj yok
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {kalem.mesajlar.map((msg) => {
                    const isManager = msg.gonderen === "Ahmet Yılmaz";
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isManager ? "flex-row-reverse" : ""}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isManager ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {msg.gonderen.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${isManager ? "items-end" : "items-start"} flex flex-col`}>
                          <div className={`rounded-xl px-3 py-2 text-xs ${isManager ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-100 text-slate-700 rounded-tl-sm"}`}>
                            {msg.metin}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 px-1">{msg.gonderen.split(" ")[0]} · {msg.zaman.split(" ")[1]}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={mesajEndRef} />
                </div>
              )}

              {!isKapatildi && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={mesajMetni}
                    onChange={(e) => setMesajMetni(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleMesajGonder()}
                    placeholder="Mesaj yaz..."
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleMesajGonder} disabled={!mesajMetni.trim()}
                    className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Kalemi Kapat */}
            {!isKapatildi && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setKapatmaMode(!kapatmaMode)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition-colors ${kapatmaMode ? "bg-green-50 text-green-800" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />Bu Kalemi Kapat
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${kapatmaMode ? "rotate-90" : ""}`} />
                </button>
                {kapatmaMode && (
                  <div className="p-4 space-y-3 border-t border-slate-200 bg-white">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Kapatan Kişi</label>
                      <select value={kapatanKisi} onChange={(e) => setKapatanKisi(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                        {KULLANICILAR.map((k) => <option key={k}>{k}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Kapatma Açıklaması <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={kapatmaAciklama}
                        onChange={(e) => { setKapatmaAciklama(e.target.value); setAciklamaHata(false); }}
                        placeholder="Bu fark nasıl çözüldü? Açıklama zorunludur ve sipariş detayında görünecektir..."
                        rows={4}
                        className={`w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none ${aciklamaHata ? "border-red-400 focus:ring-red-400 bg-red-50" : "border-slate-200 focus:ring-green-500"}`}
                      />
                      {aciklamaHata && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Açıklama zorunludur.
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{kapatmaAciklama.length} / 500 karakter</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setKapatmaMode(false)}
                        className="flex-1 py-2 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                        Vazgeç
                      </button>
                      <button onClick={handleKapat}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <CheckCheck className="w-3.5 h-3.5" />Onayla & Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function YonetimOzeti() {
  const navigate = useNavigate();
  const [kalemler, setKalemler] = useState<FarkKalemi[]>(initialKalemler);
  const [selectedKalem, setSelectedKalem] = useState<FarkKalemi | null>(null);
  const [activeTab, setActiveTab] = useState<FarkDurum | "Tümü">("Tümü");
  const [search, setSearch] = useState("");

  // ── Hesaplamalar ──────────────────────────────────────────────────────────
  const toplamFark      = Math.abs(kpiYonetimOzeti.komisyonFarki) + Math.abs(kpiYonetimOzeti.desiKargoFarki);
  const acikSayisi      = kalemler.filter((k) => k.durum !== "Kapatıldı").length;
  const kapatilanlar    = kalemler.filter((k) => k.durum === "Kapatıldı");
  const kapatilanTutar  = kapatilanlar.reduce((s, k) => s + k.toplamFark, 0);
  const kapatmaOrani    = Math.round((kapatilanlar.length / kalemler.length) * 100);
  const uyumOrani       = (((kpiYonetimOzeti.toplamSiparis - kpiYonetimOzeti.zararEdenSiparisler) / kpiYonetimOzeti.toplamSiparis) * 100).toFixed(1);
  const yuksekOncelikli = kalemler.filter((k) => k.onemi === "Yüksek" && k.durum !== "Kapatıldı").length;

  // Durum pasta verisi
  const durumPie = [
    { name: "Açık",      value: kalemler.filter(k => k.durum === "Açık").length,      tutar: kalemler.filter(k=>k.durum==="Açık").reduce((s,k)=>s+k.toplamFark,0) },
    { name: "İşlemde",   value: kalemler.filter(k => k.durum === "İşlemde").length,   tutar: kalemler.filter(k=>k.durum==="İşlemde").reduce((s,k)=>s+k.toplamFark,0) },
    { name: "Kapatıldı", value: kalemler.filter(k => k.durum === "Kapatıldı").length, tutar: kalemler.filter(k=>k.durum==="Kapatıldı").reduce((s,k)=>s+k.toplamFark,0) },
  ];

  // Pazaryeri yoğunluğu
  const pazaryeriData = React.useMemo(() => {
    const map: Record<string, { tutar: number; acik: number; islemde: number }> = {};
    kalemler.forEach((k) => {
      if (k.durum === "Kapatıldı") return;

      if (!map[k.pazaryeri]) map[k.pazaryeri] = { tutar: 0, acik: 0, islemde: 0 };
      map[k.pazaryeri].tutar += k.toplamFark;
      if (k.durum === "Açık") map[k.pazaryeri].acik++;
      if (k.durum === "İşlemde") map[k.pazaryeri].islemde++;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, aktifToplam: v.acik + v.islemde }))
      .sort((a, b) => b.aktifToplam - a.aktifToplam || b.tutar - a.tutar);
  }, [kalemler]);

  // Personel aktivite
  const personelData = React.useMemo(() => {
    const map: Record<string, { islemde: number; kapatan: number }> = {};
    KULLANICILAR.forEach((k) => { map[k] = { islemde: 0, kapatan: 0 }; });
    kalemler.forEach((k) => {
      if (!map[k.atananKullanici]) map[k.atananKullanici] = { islemde: 0, kapatan: 0 };
      if (k.durum === "İşlemde") map[k.atananKullanici].islemde++;
      if (k.kapatan) {
        if (!map[k.kapatan]) map[k.kapatan] = { islemde: 0, kapatan: 0 };
        map[k.kapatan].kapatan++;
      }
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, toplam: v.islemde }))
      .sort((a, b) => b.kapatan - a.kapatan || b.toplam - a.toplam);
  }, [kalemler]);

  const sekmeler: Array<FarkDurum | "Tümü"> = ["Tümü", "Açık", "İşlemde", "Kapatıldı"];
  const tabCount = (t: FarkDurum | "Tümü") =>
    t === "Tümü" ? kalemler.length : kalemler.filter((k) => k.durum === t).length;
  const showOwnerColumn = activeTab !== "Açık";

  const filtered = kalemler.filter((k) => {
    const tabMatch    = activeTab === "Tümü" || k.durum === activeTab;
    const searchMatch = !search || k.siparisNo.toLowerCase().includes(search.toLowerCase()) ||
      k.urunAdi.toLowerCase().includes(search.toLowerCase()) ||
      k.pazaryeri.toLowerCase().includes(search.toLowerCase());
    return tabMatch && searchMatch;
  });

  const handleUpdate = (updated: FarkKalemi) => {
    setKalemler((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    setSelectedKalem(updated);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Yönetim Özeti"
        subtitle="Nisan 2026 — E-Ticaret departmanı operasyonel özet"
        actions={
          <button
            onClick={() => toast.success("Rapor hazırlanıyor", { description: "Yönetici özet raporu dışa aktarılıyor..." })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" />Rapor İndir
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-5 space-y-5">

        {/* ─── Uyarı Bandı ─── */}
        {yuksekOncelikli > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-xs text-red-800">
                <strong>{yuksekOncelikli} yüksek öncelikli</strong> fark kalemi bekliyor.
                Toplam fark kaybı: <strong>{formatTL(toplamFark)}</strong>
              </span>
            </div>
            <button onClick={() => navigate("/fark-inceleme-kuyrugu")}
              className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 flex-shrink-0">
              Tam Kuyruk <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── 4 Operasyonel KPI ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* 1. Mutabakat Uyum Oranı */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">▲ 1.2%</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">Mutabakat Uyum Oranı</p>
            <p className="text-2xl font-bold text-slate-800">%{uyumOrani}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{formatSayi(kpiYonetimOzeti.toplamSiparis - kpiYonetimOzeti.zararEdenSiparisler)} uyumlu</span>
                <span className="text-red-400">{formatSayi(kpiYonetimOzeti.zararEdenSiparisler)} riskli</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${uyumOrani}%` }} />
              </div>
            </div>
          </div>

          {/* 2. Toplam Fark Kaybı */}
          <div className="bg-white rounded-xl border-l-4 border-l-red-500 border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-xs text-red-500 font-medium">▲ 7.4%</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">Toplam Fark Kaybı</p>
            <p className="text-2xl font-bold text-red-700">-{formatTL(toplamFark)}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Komisyon</span>
                <span className="font-medium text-slate-700">{formatTL(Math.abs(kpiYonetimOzeti.komisyonFarki))}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Kargo / Desi</span>
                <span className="font-medium text-slate-700">{formatTL(Math.abs(kpiYonetimOzeti.desiKargoFarki))}</span>
              </div>
            </div>
          </div>

          {/* 3. Kapatma Performansı */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs text-slate-400">{kapatilanlar.length}/{kalemler.length} kalem</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">Kapatma Performansı</p>
            <p className="text-2xl font-bold text-slate-800">%{kapatmaOrani}</p>
            <div className="mt-2">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${kapatmaOrani}%` }} />
              </div>
              <p className="text-xs text-green-600 font-medium">{formatTL(kapatilanTutar)} kurtarıldı</p>
            </div>
          </div>

          {/* 4. Ort. Kapatma Süresi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Timer className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">▼ 0.4 gün</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">Ort. Kapatma Süresi</p>
            <p className="text-2xl font-bold text-slate-800">1.8 <span className="text-sm font-normal text-slate-400">gün</span></p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">En hızlı</span>
                <span className="font-medium text-slate-600">0.8 gün</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">En yavaş</span>
                <span className="font-medium text-slate-600">3.2 gün</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3 Dashboard Paneli ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Panel 1: Fark Kalemi Durumu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Fark Kalemi Durumu</h3>
            <p className="text-xs text-slate-400 mb-3">Toplam {kalemler.length} kalem · Bu ay</p>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="52%" height={140}>
                <PieChart>
                  <Pie data={durumPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                    dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                    {durumPie.map((entry) => (
                      <Cell key={entry.name} fill={DURUM_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, "Kalem"]} contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {durumPie.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DURUM_COLORS[d.name] }} />
                        <span className="text-slate-600">{d.name}</span>
                      </span>
                      <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-3.5">-{formatTL(d.tutar)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 2: Pazaryeri Fark Yoğunluğu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Pazaryeri Fark Yoğunluğu</h3>
            <p className="text-xs text-slate-400 mb-3">Açık ve işlemdeki fark kalemleri</p>
            <div className="space-y-2.5">
              {pazaryeriData.map((py) => {
                const maxAktif = pazaryeriData[0]?.aktifToplam || 1;
                const pct = (py.aktifToplam / maxAktif) * 100;
                return (
                  <div key={py.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-700 w-20 truncate">{py.name}</span>
                        {py.acik > 0 && (
                          <span className="px-1 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-xs leading-none">{py.acik} açık</span>
                        )}
                        {py.islemde > 0 && (
                          <span className="px-1 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-xs leading-none">{py.islemde} işlemde</span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono">{py.aktifToplam} kalem · {formatTL(py.tutar)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: py.acik > 0 ? "#ef4444" : "#f59e0b" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 3: Personel Aktivite */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Personel Aktivite</h3>
            <p className="text-xs text-slate-400 mb-3">İşlemdeki kalem & kapatma sayısı</p>
            <div className="space-y-2">
              {personelData.map((p) => {
                const initials = p.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2);
                const hasBekleyen = p.islemde > 0;
                return (
                  <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${p.kapatan > 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {p.islemde > 0 && <span className="text-xs text-amber-500">{p.islemde} işlemde</span>}
                        {!hasBekleyen && <span className="text-xs text-slate-400">Bekleyen yok</span>}
                      </div>
                    </div>
                    {p.kapatan > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />{p.kapatan}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 px-2">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Fark Yönetim Merkezi ─── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-4 pb-0">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Fark Yönetim Merkezi</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fark oluşan siparişleri inceleyin, sorumluya mesaj gönderin, kalemi kapatın.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input type="text" placeholder="Sipariş veya ürün ara..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                </div>
                <button onClick={() => navigate("/fark-inceleme-kuyrugu")}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1.5 rounded-lg hover:bg-blue-50">
                  <ArrowUpRight className="w-3.5 h-3.5" />Tam Kuyruk
                </button>
              </div>
            </div>
            {/* Sekmeler */}
            <div className="flex items-center gap-0.5 border-b border-slate-200 -mx-5 px-5">
              {sekmeler.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}>
                  {tab}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    {tabCount(tab)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tablo */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Önem",
                    "Ürün / Sipariş",
                    "Pazaryeri",
                    "Fark Türü",
                    "Fark Tutarı",
                    "Net Kâr",
                    ...(showOwnerColumn ? ["Atanan / Kapatan"] : []),
                    "Durum",
                    "",
                  ].map((col) => (
                    <th key={col} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={showOwnerColumn ? 9 : 8} className="px-5 py-12 text-center text-xs text-slate-400">Bu sekmeye ait kayıt yok.</td>
                  </tr>
                ) : (
                  filtered.map((kalem) => {
                    const isK = kalem.durum === "Kapatıldı";
                    return (
                      <tr key={kalem.id} onClick={() => setSelectedKalem(kalem)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          selectedKalem?.id === kalem.id ? "bg-blue-50" :
                          isK ? "bg-slate-50/50 hover:bg-slate-50" : "hover:bg-blue-50/30"
                        }`}>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${onemiKonfig[kalem.onemi].cls}`}>
                            {onemiKonfig[kalem.onemi].icon}{kalem.onemi}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <p className={`text-xs font-medium text-slate-800 ${isK ? "opacity-60" : ""}`}>{kalem.urunAdi}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{kalem.siparisNo}</p>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">{kalem.pazaryeri}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {kalem.farkTipleri.map((t) => (
                              <span key={t} className={`px-1.5 py-0.5 rounded text-xs border ${farkTipiCls[t] || ""}`}>{t}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-semibold ${isK ? "text-slate-400 line-through" : "text-red-600"}`}>
                            -{formatTL(kalem.toplamFark)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-medium ${kalem.netKar < 0 ? (isK ? "text-slate-400" : "text-red-600") : "text-green-600"}`}>
                            {formatTL(kalem.netKar)}
                          </span>
                        </td>
                        {showOwnerColumn && (
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isK ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                {(isK ? kalem.kapatan || "" : kalem.atananKullanici).split(" ").map((w) => w[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-xs text-slate-700">
                                  {isK ? kalem.kapatan : kalem.atananKullanici.split(" ")[0]}
                                </p>
                                {isK && <p className="text-xs text-slate-400">Kapattı</p>}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${durumKonfig[kalem.durum].cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${durumKonfig[kalem.durum].dot}`} />
                            {durumKonfig[kalem.durum].label}
                          </span>
                          {kalem.mesajlar.length > 0 && (
                            <div className="flex items-center gap-0.5 mt-1">
                              <MessageSquare className="w-2.5 h-2.5 text-slate-400" />
                              <span className="text-xs text-slate-400">{kalem.mesajlar.length}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <ChevronRight className={`w-4 h-4 ${selectedKalem?.id === kalem.id ? "text-blue-500" : "text-slate-300"}`} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-slate-400">
              <strong className="text-slate-600">{kalemler.length}</strong> kalem &nbsp;·&nbsp;
              <strong className="text-red-500">{kalemler.filter(k=>k.durum==="Açık").length}</strong> açık &nbsp;·&nbsp;
              <strong className="text-amber-600">{kalemler.filter(k=>k.durum==="İşlemde").length}</strong> işlemde &nbsp;·&nbsp;
              <strong className="text-green-600">{kapatilanlar.length}</strong> kapatıldı
            </p>
            <p className="text-xs text-slate-400">
              Bu ay kurtarılan: <strong className="text-green-700">{formatTL(kapatilanTutar)}</strong>
            </p>
          </div>
        </div>
      </div>

      {selectedKalem && (
        <FarkDetayDrawer kalem={selectedKalem} onClose={() => setSelectedKalem(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}

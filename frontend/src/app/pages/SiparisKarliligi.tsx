import React, { useState } from "react";
import {
  Search,
  TrendingDown,
  AlertTriangle,
  X,
  Download,
  ClipboardCheck,
  CheckCircle2,
  CircleAlert,
  WalletCards,
  BadgePercent,
  LineChart,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { KpiCard } from "../components/KpiCard";
import { karlilikKayitlari, pazaryerleri, formatTL, formatSayi, type KarlilikKaydi } from "../data/mockData";

export default function SiparisKarliligi() {
  const [search, setSearch] = useState("");
  const [filterPazaryeri, setFilterPazaryeri] = useState("Tümü");
  const [filterZarar, setFilterZarar] = useState("Tümü");
  const [selectedKayit, setSelectedKayit] = useState<KarlilikKaydi | null>(null);
  const [notText, setNotText] = useState("");

  const filtered = karlilikKayitlari.filter((k) => {
    const searchMatch = !search || k.siparisNo.toLowerCase().includes(search.toLowerCase());
    const pyMatch = filterPazaryeri === "Tümü" || k.pazaryeri === filterPazaryeri;
    const zararMatch = filterZarar === "Tümü" ||
      (filterZarar === "Zarar Eden" && k.zararMi) ||
      (filterZarar === "Kârlı" && !k.zararMi);
    return searchMatch && pyMatch && zararMatch;
  });

  const kpis = {
    toplamSiparis: karlilikKayitlari.length,
    karliSiparis: karlilikKayitlari.filter((k) => !k.zararMi).length,
    zararEdenSiparis: karlilikKayitlari.filter((k) => k.zararMi).length,
    zararTutari: karlilikKayitlari
      .filter((k) => k.netKar < 0)
      .reduce((s, k) => s + Math.abs(k.netKar), 0),
    brutSatis: karlilikKayitlari.reduce((s, k) => s + k.brutSatis, 0),
    netKar: karlilikKayitlari.reduce((s, k) => s + k.netKar, 0),
    karMarji: 0,
  };
  kpis.karMarji = kpis.brutSatis > 0 ? (kpis.netKar / kpis.brutSatis) * 100 : 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Sipariş Kârlılığı"
        subtitle="Sipariş bazında gerçekleşen kârlılık analizi"
        actions={
          <button
            onClick={() => toast.success("CSV dışa aktarma başlatıldı", { description: `${filtered.length} kayıt aktarılıyor...` })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV İndir
          </button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className={`p-5 space-y-5 ${selectedKayit ? "mr-96" : ""}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <KpiCard
              title="Kontrol Edilen Sipariş"
              value={formatSayi(kpis.toplamSiparis)}
              subtext="Aktarılan kârlılık kaydı"
              variant="default"
              icon={<ClipboardCheck className="w-4 h-4" />}
            />
            <KpiCard
              title="Kârlı Sipariş"
              value={formatSayi(kpis.karliSiparis)}
              subtext="Net kârı pozitif"
              variant="success"
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <KpiCard
              title="Zarar Eden Sipariş"
              value={formatSayi(kpis.zararEdenSiparis)}
              subtext="İnceleme önceliği"
              variant="danger"
              icon={<CircleAlert className="w-4 h-4" />}
            />
            <KpiCard
              title="Riskli Zarar Tutarı"
              value={formatTL(kpis.zararTutari)}
              subtext="Negatif net kâr toplamı"
              variant="danger"
              icon={<WalletCards className="w-4 h-4" />}
            />
            <KpiCard
              title="Net Kâr"
              value={formatTL(kpis.netKar)}
              subtext="Tüm listelenen kayıtlar"
              variant={kpis.netKar < 0 ? "danger" : "success"}
              icon={<LineChart className="w-4 h-4" />}
            />
            <KpiCard
              title="Kâr Marjı"
              value={`%${kpis.karMarji.toFixed(1)}`}
              subtext="Net kâr / brüt satış"
              variant={kpis.karMarji < 5 ? "warning" : "success"}
              icon={<BadgePercent className="w-4 h-4" />}
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-44 max-w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sipariş No ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterPazaryeri}
                onChange={(e) => setFilterPazaryeri(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm Pazaryerleri</option>
                {pazaryerleri.map((p) => <option key={p}>{p}</option>)}
              </select>
              <select
                value={filterZarar}
                onChange={(e) => setFilterZarar(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tümü</option>
                <option value="Zarar Eden">Zarar Eden</option>
                <option value="Kârlı">Kârlı</option>
              </select>
              <div className="flex items-center gap-2 ml-auto text-xs text-slate-500">
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                <span>{karlilikKayitlari.filter((k) => k.zararMi).length} zarar eden sipariş</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">{filtered.length} sipariş listeleniyor</p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" />
                <span className="text-xs text-slate-400">Zarar eden satırlar vurgulu</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Sipariş No", "Pazaryeri", "Brüt Satış", "İade/İptal", "Komisyon", "Kargo", "Ceza", "Ek Bedel", "Ürün Maliyeti", "Net Gelir", "Net Kâr", "Kâr Marjı", "Zarar mı?", "Zarar Nedeni"].map((col) => (
                      <th key={col} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-4 py-10 text-center text-xs text-slate-400">
                        Filtre kriterlerine uygun sipariş bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((kayit) => (
                      <tr
                        key={kayit.id}
                        onClick={() => setSelectedKayit(selectedKayit?.id === kayit.id ? null : kayit)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          selectedKayit?.id === kayit.id ? "bg-blue-50" :
                          kayit.zararMi ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-xs font-mono text-blue-600 whitespace-nowrap">{kayit.siparisNo}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{kayit.pazaryeri}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{formatTL(kayit.brutSatis)}</td>
                        <td className="px-3 py-2.5 text-xs">
                          {kayit.iadeIptal > 0 ? (
                            <span className="text-orange-600">-{formatTL(kayit.iadeIptal)}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">-{formatTL(kayit.komisyon)}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">-{formatTL(kayit.kargo)}</td>
                        <td className="px-3 py-2.5 text-xs">
                          {kayit.ceza > 0 ? (
                            <span className="text-red-600">-{formatTL(kayit.ceza)}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {kayit.ekBedel > 0 ? (
                            <span className="text-amber-600">-{formatTL(kayit.ekBedel)}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">-{formatTL(kayit.urunMaliyeti)}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700 font-medium">{formatTL(kayit.netGelir)}</td>
                        <td className="px-3 py-2.5 text-xs font-semibold">
                          <span className={kayit.netKar < 0 ? "text-red-600" : "text-green-600"}>
                            {formatTL(kayit.netKar)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          <span className={`font-medium ${kayit.karMarji < 0 ? "text-red-600" : kayit.karMarji < 5 ? "text-amber-600" : "text-green-600"}`}>
                            %{kayit.karMarji.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {kayit.zararMi ? (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              Evet
                            </span>
                          ) : (
                            <span className="text-green-600">Hayır</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 max-w-32 truncate">
                          {kayit.zararNedeni || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Drawer - starts below TopBar */}
      {selectedKayit && (
        <div className="fixed right-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col" style={{ top: "62px" }}>
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Kârlılık Detayı</h3>
              <p className="text-xs font-mono text-blue-600 mt-0.5">{selectedKayit.siparisNo}</p>
            </div>
            <button onClick={() => setSelectedKayit(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2">
              {selectedKayit.zararMi ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Zarar Eden Sipariş
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                  Kârlı Sipariş
                </span>
              )}
            </div>

            {/* Özet */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-lg p-3 ${selectedKayit.netKar < 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                <p className="text-xs text-slate-500 mb-0.5">Net Kâr</p>
                <p className={`text-lg font-bold ${selectedKayit.netKar < 0 ? "text-red-700" : "text-green-700"}`}>{formatTL(selectedKayit.netKar)}</p>
              </div>
              <div className={`rounded-lg p-3 ${selectedKayit.karMarji < 0 ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"}`}>
                <p className="text-xs text-slate-500 mb-0.5">Kâr Marjı</p>
                <p className={`text-lg font-bold ${selectedKayit.karMarji < 0 ? "text-red-700" : "text-slate-800"}`}>%{selectedKayit.karMarji.toFixed(1)}</p>
              </div>
            </div>

            {/* Gelir/Gider */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Gelir ve Giderler</p>
              <div className="space-y-2">
                {[
                  { label: "Brüt Satış", val: formatTL(selectedKayit.brutSatis), positive: true },
                  { label: "İade/İptal", val: selectedKayit.iadeIptal > 0 ? `-${formatTL(selectedKayit.iadeIptal)}` : "—", negative: selectedKayit.iadeIptal > 0 },
                  { label: "Komisyon Gideri", val: `-${formatTL(selectedKayit.komisyon)}`, negative: true },
                  { label: "Kargo Gideri", val: `-${formatTL(selectedKayit.kargo)}`, negative: true },
                  { label: "Ceza Gideri", val: selectedKayit.ceza > 0 ? `-${formatTL(selectedKayit.ceza)}` : "—", negative: selectedKayit.ceza > 0 },
                  { label: "Ek Bedel Gideri", val: selectedKayit.ekBedel > 0 ? `-${formatTL(selectedKayit.ekBedel)}` : "—", negative: selectedKayit.ekBedel > 0 },
                  { label: "Ürün Maliyeti", val: `-${formatTL(selectedKayit.urunMaliyeti)}`, negative: true },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{r.label}</span>
                    <span className={`font-medium ${r.positive ? "text-green-700" : r.negative ? "text-red-600" : "text-slate-400"}`}>{r.val}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">Net Gelir</span>
                    <span className="font-semibold text-slate-700">{formatTL(selectedKayit.netGelir)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">Net Kâr</span>
                    <span className={`font-bold text-sm ${selectedKayit.netKar < 0 ? "text-red-700" : "text-green-700"}`}>
                      {formatTL(selectedKayit.netKar)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Kâr Marjı</span>
                    <span className={`font-semibold ${selectedKayit.karMarji < 0 ? "text-red-600" : "text-green-600"}`}>
                      %{selectedKayit.karMarji.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedKayit.zararMi && selectedKayit.zararNedeni && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Zarar Nedeni</p>
                <p className="text-xs text-red-600">{selectedKayit.zararNedeni}</p>
              </div>
            )}

            {/* Not */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1.5">İnceleme Notu</p>
              <textarea
                rows={3}
                value={notText}
                onChange={(e) => setNotText(e.target.value)}
                placeholder="İnceleme notu ekleyin..."
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
          <div className="p-4 border-t border-slate-200">
            <button
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                toast.success("İnceleme kuyruğuna eklendi", {
                  description: `${selectedKayit.siparisNo} — ${formatTL(selectedKayit.netKar)} net kâr${notText.trim() ? " · Not eklendi" : ""}`,
                });
                setSelectedKayit(null);
                setNotText("");
              }}
            >
              <Send className="w-3.5 h-3.5" />
              İncelemeye Notu Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

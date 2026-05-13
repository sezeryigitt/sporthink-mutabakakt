import React, { useState } from "react";
import { Search, X, Send, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { desiKayitlari, pazaryerleri, formatTL, type DesiKaydi } from "../data/mockData";

function GuvenSkorBar({ skor }: { skor: number }) {
  const color = skor >= 90 ? "bg-green-500" : skor >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${skor}%` }} />
      </div>
      <span className="text-xs text-slate-600 w-7 text-right">{skor}</span>
    </div>
  );
}

type SortKey = keyof DesiKaydi;
type SortDir = "asc" | "desc";

export default function DesiKargoMutabakati() {
  const [search, setSearch] = useState("");
  const [filterPazaryeri, setFilterPazaryeri] = useState("Tümü");
  const [filterDurum, setFilterDurum] = useState("Tümü");
  const [selectedKayit, setSelectedKayit] = useState<DesiKaydi | null>(null);
  const [notText, setNotText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = desiKayitlari
    .filter((k) => {
      const searchMatch = !search ||
        k.siparisNo.toLowerCase().includes(search.toLowerCase()) ||
        k.paketNo.toLowerCase().includes(search.toLowerCase()) ||
        k.takipNo.includes(search);
      const pyMatch = filterPazaryeri === "Tümü" || k.pazaryeri === filterPazaryeri;
      const durumMatch = filterDurum === "Tümü" || k.durum === filterDurum;
      return searchMatch && pyMatch && durumMatch;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv), "tr") : String(bv).localeCompare(String(av), "tr");
    });

  const kpis = {
    toplamKayit: desiKayitlari.length,
    uyumlu: desiKayitlari.filter((k) => k.durum === "Uyumlu").length,
    desiFarki: desiKayitlari.filter((k) => k.durum !== "Uyumlu").length,
    toplamKargoFarki: desiKayitlari.reduce((s, k) => s + k.tutarFarki, 0),
    ortalamaDesiFarki: (
      desiKayitlari.reduce((s, k) => s + Math.abs(k.desiFarki), 0) /
      (desiKayitlari.filter((k) => k.desiFarki !== 0).length || 1)
    ).toFixed(1),
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : null;

  const cols: { label: string; key: SortKey }[] = [
    { label: "Sipariş No", key: "siparisNo" },
    { label: "Pazaryeri", key: "pazaryeri" },
    { label: "Durum", key: "durum" },
    { label: "Paket No", key: "paketNo" },
    { label: "Takip No", key: "takipNo" },
    { label: "Kargo Firması", key: "kargoFirmasi" },
    { label: "Bekl. Desi", key: "beklenenDesi" },
    { label: "Fat. Desi", key: "faturalananDesi" },
    { label: "Desi Farkı", key: "desiFarki" },
    { label: "Bekl. Kargo", key: "beklenenKargo" },
    { label: "Fat. Kargo", key: "faturalananKargo" },
    { label: "Tutar Farkı", key: "tutarFarki" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Desi/Kargo Mutabakatı"
        subtitle="Beklenen ve faturalanan desi/kargo tutarı karşılaştırması"
      />

      <div className="flex-1 overflow-auto">
        <div className={`p-5 space-y-5 transition-all ${selectedKayit ? "mr-96" : ""}`}>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard title="Toplam Desi Kaydı" value={kpis.toplamKayit} variant="default" />
            <KpiCard title="Uyumlu Kayıt" value={kpis.uyumlu} variant="success" />
            <KpiCard title="Desi Farkı Olan" value={kpis.desiFarki} variant="danger" />
            <KpiCard title="Toplam Kargo Farkı" value={formatTL(kpis.toplamKargoFarki)} variant="danger" subtext="Fazla faturalanan" />
            <KpiCard title="Ortalama Desi Farkı" value={`${kpis.ortalamaDesiFarki} desi`} variant="warning" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-44 max-w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sipariş No, Paket No, Takip No..."
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
                value={filterDurum}
                onChange={(e) => setFilterDurum(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm Durumlar</option>
                <option>Uyumlu</option>
                <option>Desi Farkı Var</option>
                <option>Manuel İnceleme</option>
              </select>
              {(search || filterPazaryeri !== "Tümü" || filterDurum !== "Tümü") && (
                <button
                  onClick={() => { setSearch(""); setFilterPazaryeri("Tümü"); setFilterDurum("Tümü"); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Temizle
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-xs text-slate-500">{filtered.length} kayıt listeleniyor</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {cols.map(({ label, key }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-700 select-none"
                      >
                        {label}<SortIcon col={key} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-10 text-center text-xs text-slate-400">
                        Filtre kriterlerine uygun kayıt bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((kayit) => (
                      <tr
                        key={kayit.id}
                        onClick={() => setSelectedKayit(selectedKayit?.id === kayit.id ? null : kayit)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          selectedKayit?.id === kayit.id ? "bg-blue-50" : "hover:bg-slate-50"
                        } ${kayit.durum !== "Uyumlu" ? "bg-orange-50/20" : ""}`}
                      >
                        <td className="px-3 py-2.5 text-xs font-mono text-blue-600 whitespace-nowrap">{kayit.siparisNo}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{kayit.pazaryeri}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={kayit.durum} />
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{kayit.paketNo}</td>
                        <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{kayit.takipNo}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{kayit.kargoFirmasi}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{kayit.beklenenDesi}</td>
                        <td className={`px-3 py-2.5 text-xs font-medium ${kayit.faturalananDesi > kayit.beklenenDesi ? "text-red-600" : "text-slate-700"}`}>
                          {kayit.faturalananDesi}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          {kayit.desiFarki > 0 ? (
                            <span className="text-orange-600 font-semibold">+{kayit.desiFarki}</span>
                          ) : (
                            <span className="text-green-600">0</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{formatTL(kayit.beklenenKargo)}</td>
                        <td className={`px-3 py-2.5 text-xs font-medium ${kayit.faturalananKargo > kayit.beklenenKargo ? "text-red-600" : "text-slate-700"}`}>
                          {formatTL(kayit.faturalananKargo)}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium">
                          {kayit.tutarFarki < 0 ? (
                            <span className="text-red-600">{formatTL(kayit.tutarFarki)}</span>
                          ) : (
                            <span className="text-green-600">—</span>
                          )}
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
              <h3 className="text-sm font-semibold text-slate-800">Desi/Kargo Detayı</h3>
              <p className="text-xs font-mono text-blue-600 mt-0.5">{selectedKayit.siparisNo}</p>
            </div>
            <button onClick={() => setSelectedKayit(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedKayit.durum} size="md" />
              {selectedKayit.tutarFarki < 0 && (
                <span className="text-sm font-semibold text-red-600">{formatTL(selectedKayit.tutarFarki)} fark</span>
              )}
            </div>

            {/* Kargo Bilgileri */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Kargo Bilgileri</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Pazaryeri", val: selectedKayit.pazaryeri },
                  { label: "Kargo Firması", val: selectedKayit.kargoFirmasi },
                  { label: "Paket No", val: selectedKayit.paketNo },
                  { label: "Takip No", val: selectedKayit.takipNo },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-xs text-slate-400">{r.label}</p>
                    <p className="text-xs font-medium text-slate-700 font-mono">{r.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desi Karşılaştırma */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Desi Karşılaştırması</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <p className="text-xs text-slate-400">Beklenen</p>
                  <p className="text-lg font-bold text-slate-800">{selectedKayit.beklenenDesi}</p>
                  <p className="text-xs text-slate-400">desi</p>
                </div>
                <div className={`rounded-lg p-2 border ${selectedKayit.desiFarki > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                  <p className="text-xs text-slate-400">Faturalanan</p>
                  <p className={`text-lg font-bold ${selectedKayit.desiFarki > 0 ? "text-red-700" : "text-green-700"}`}>{selectedKayit.faturalananDesi}</p>
                  <p className="text-xs text-slate-400">desi</p>
                </div>
                <div className={`rounded-lg p-2 border ${selectedKayit.desiFarki > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"}`}>
                  <p className="text-xs text-slate-400">Fark</p>
                  <p className={`text-lg font-bold ${selectedKayit.desiFarki > 0 ? "text-orange-700" : "text-green-700"}`}>
                    {selectedKayit.desiFarki > 0 ? `+${selectedKayit.desiFarki}` : selectedKayit.desiFarki}
                  </p>
                  <p className="text-xs text-slate-400">desi</p>
                </div>
              </div>
            </div>

            {/* Kargo Karşılaştırma */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Kargo Tutarı</p>
              {[
                { label: "Beklenen Kargo", val: formatTL(selectedKayit.beklenenKargo) },
                { label: "Faturalanan Kargo", val: formatTL(selectedKayit.faturalananKargo), highlight: selectedKayit.faturalananKargo > selectedKayit.beklenenKargo },
                { label: "Tutar Farkı", val: formatTL(selectedKayit.tutarFarki), danger: selectedKayit.tutarFarki < 0 },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{r.label}</span>
                  <span className={`font-medium ${r.danger ? "text-red-600 font-bold" : r.highlight ? "text-red-600" : "text-slate-700"}`}>{r.val}</span>
                </div>
              ))}
            </div>
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
                  description: `${selectedKayit.siparisNo} — Desi farkı: ${selectedKayit.desiFarki}${notText.trim() ? " · Not eklendi" : ""}`,
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
import React, { useState } from "react";
import { Search, X, Send, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { komisyonKayitlari, pazaryerleri, formatTL, type KomisyonKaydi } from "../data/mockData";

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

type SortKey = keyof KomisyonKaydi;
type SortDir = "asc" | "desc";

export default function KomisyonMutabakati() {
  const [search, setSearch] = useState("");
  const [filterPazaryeri, setFilterPazaryeri] = useState("Tümü");
  const [filterDurum, setFilterDurum] = useState("Tümü");
  const [filterFark, setFilterFark] = useState("Tümü");
  const [selectedKayit, setSelectedKayit] = useState<KomisyonKaydi | null>(null);
  const [notText, setNotText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = komisyonKayitlari
    .filter((k) => {
      const searchMatch =
        !search ||
        k.siparisNo.toLowerCase().includes(search.toLowerCase()) ||
        k.barkod.includes(search) ||
        k.urunAdi.toLowerCase().includes(search.toLowerCase());
      const pyMatch = filterPazaryeri === "Tümü" || k.pazaryeri === filterPazaryeri;
      const durumMatch = filterDurum === "Tümü" || k.durum === filterDurum;
      const farkMatch =
        filterFark === "Tümü" ||
        (filterFark === "0-10" && Math.abs(k.farkTutari) <= 10) ||
        (filterFark === "10-50" && Math.abs(k.farkTutari) > 10 && Math.abs(k.farkTutari) <= 50) ||
        (filterFark === "50+" && Math.abs(k.farkTutari) > 50);
      return searchMatch && pyMatch && durumMatch && farkMatch;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv), "tr")
        : String(bv).localeCompare(String(av), "tr");
    });

  const kpis = {
    toplamKayit: komisyonKayitlari.length,
    uyumlu: komisyonKayitlari.filter((k) => k.durum === "Uyumlu").length,
    farkOlan: komisyonKayitlari.filter((k) => k.durum === "Fark Var").length,
    toplamFark: komisyonKayitlari.reduce((s, k) => s + k.farkTutari, 0),
    farkOrani: Math.round((komisyonKayitlari.filter((k) => k.durum === "Fark Var").length / komisyonKayitlari.length) * 100),
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : (
      <span className="w-3 h-3 inline ml-0.5 opacity-0 group-hover:opacity-40">↕</span>
    );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Komisyon Mutabakatı"
        subtitle="Beklenen komisyon ile pazaryerinin faturalanan komisyonunu karşılaştırın"
      />

      <div className="flex-1 overflow-auto">
        <div className={`p-5 space-y-5 transition-all ${selectedKayit ? "mr-96" : ""}`}>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard title="Kontrol Edilen Sipariş" value={kpis.toplamKayit} variant="default" />
            <KpiCard title="Uyumlu" value={kpis.uyumlu} variant="success" />
            <KpiCard title="Fark Var" value={kpis.farkOlan} variant="danger" />
            <KpiCard title="Toplam Komisyon Farkı" value={formatTL(kpis.toplamFark)} variant="danger" subtext="Pazaryeri fazla kesinti" />
            <KpiCard title="Fark Oranı" value={`%${kpis.farkOrani}`} variant="warning" />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-44 max-w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sipariş no, barkod veya ürün adı ara..."
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
                <option>Fark Var</option>
              </select>
              <select
                value={filterFark}
                onChange={(e) => setFilterFark(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm Komisyon Farkları</option>
                <option value="0-10">0 – 10 TL</option>
                <option value="10-50">10 – 50 TL</option>
                <option value="50+">50+ TL</option>
              </select>
              {(search || filterPazaryeri !== "Tümü" || filterDurum !== "Tümü" || filterFark !== "Tümü") && (
                <button
                  onClick={() => { setSearch(""); setFilterPazaryeri("Tümü"); setFilterDurum("Tümü"); setFilterFark("Tümü"); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Filtreyi Temizle
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">{filtered.length} kayıt listeleniyor</p>
              <span className="text-xs text-slate-400">Sütun başlığına tıklayarak sıralayabilirsiniz</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      { label: "Sipariş No", key: "siparisNo" as SortKey },
                      { label: "Pazaryeri", key: "pazaryeri" as SortKey },
                      { label: "Durum", key: "durum" as SortKey },
                      { label: "Barkod", key: "barkod" as SortKey },
                      { label: "Ürün Adı", key: "urunAdi" as SortKey },
                      { label: "Komisyon Matrahı", key: "komisyonMatrahi" as SortKey },
                      { label: "Beklenen Oran", key: "beklenenOran" as SortKey },
                      { label: "Faturalanan Oran", key: "faturalananOran" as SortKey },
                      { label: "Beklenen Komisyon", key: "beklenenKomisyon" as SortKey },
                      { label: "Faturalanan Komisyon", key: "faturalananKomisyon" as SortKey },
                      { label: "Komisyon Farkı", key: "farkTutari" as SortKey },
                    ].map(({ label, key }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap cursor-pointer hover:text-slate-700 group select-none"
                      >
                        {label}<SortIcon col={key} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-xs text-slate-400">
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
                        } ${kayit.durum === "Fark Var" ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-3 py-2.5 text-xs font-mono text-blue-600 whitespace-nowrap">{kayit.siparisNo}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{kayit.pazaryeri}</td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={kayit.durum} />
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{kayit.barkod}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700 max-w-40 truncate">{kayit.urunAdi}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{formatTL(kayit.komisyonMatrahi)}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">%{kayit.beklenenOran}</td>
                        <td className={`px-3 py-2.5 text-xs font-medium ${kayit.faturalananOran > kayit.beklenenOran ? "text-red-600" : "text-slate-700"}`}>
                          %{kayit.faturalananOran}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-700">{formatTL(kayit.beklenenKomisyon)}</td>
                        <td className={`px-3 py-2.5 text-xs font-medium ${kayit.faturalananKomisyon > kayit.beklenenKomisyon ? "text-red-600" : "text-slate-700"}`}>
                          {formatTL(kayit.faturalananKomisyon)}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-medium">
                          {kayit.farkTutari !== 0 ? (
                            <span className="text-red-600">{formatTL(kayit.farkTutari)}</span>
                          ) : (
                            <span className="text-slate-500">{formatTL(0)}</span>
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
              <h3 className="text-sm font-semibold text-slate-800">Komisyon Detayı</h3>
              <p className="text-xs font-mono text-blue-600 mt-0.5">{selectedKayit.siparisNo}</p>
            </div>
            <button
              onClick={() => setSelectedKayit(null)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedKayit.durum} size="md" />
              {selectedKayit.farkTutari < 0 && (
                <span className="text-sm font-semibold text-red-600">{formatTL(selectedKayit.farkTutari)} fark</span>
              )}
            </div>

            {/* Ürün Bilgileri */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ürün Bilgileri</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-400">Pazaryeri</p>
                  <p className="text-xs font-medium text-slate-700">{selectedKayit.pazaryeri}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Barkod</p>
                  <p className="text-xs font-mono text-slate-700">{selectedKayit.barkod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Ürün Adı</p>
                  <p className="text-xs font-medium text-slate-700">{selectedKayit.urunAdi}</p>
                </div>
              </div>
            </div>

            {/* Komisyon Karşılaştırma */}
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Komisyon Karşılaştırması</p>
              <div className="space-y-2">
                {[
                  { label: "Komisyon Matrahı", val: formatTL(selectedKayit.komisyonMatrahi) },
                  { label: "Beklenen Kaynak", val: selectedKayit.hesaplamaKaynagi },
                  { label: "Beklenen Oran", val: `%${selectedKayit.beklenenOran}` },
                  { label: "Faturalanan Oran", val: `%${selectedKayit.faturalananOran}`, highlight: selectedKayit.faturalananOran > selectedKayit.beklenenOran },
                  { label: "Beklenen Komisyon", val: formatTL(selectedKayit.beklenenKomisyon) },
                  { label: "Faturalanan Komisyon", val: formatTL(selectedKayit.faturalananKomisyon), highlight: selectedKayit.faturalananKomisyon > selectedKayit.beklenenKomisyon },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{row.label}</span>
                    <span className={`font-medium ${row.highlight ? "text-red-600" : "text-slate-700"}`}>{row.val}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Komisyon Farkı</span>
                    <span className={`font-bold text-sm ${selectedKayit.farkTutari < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatTL(selectedKayit.farkTutari)}
                    </span>
                  </div>
                </div>
              </div>
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
                  description: `${selectedKayit.siparisNo} — ${formatTL(selectedKayit.farkTutari)} fark${notText.trim() ? " · Not eklendi" : ""}`,
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

import React, { useState } from "react";
import { Search, X, MessageSquarePlus, CheckCircle2, Loader2, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { StatusBadge } from "../components/StatusBadge";
import { kuyrukKayitlari as initialKayitlar, type KuyrukKaydi, type KuyrukDurum } from "../data/mockData";

const durumRenkleri: Record<KuyrukDurum, string> = {
  "Açık": "bg-red-50 border-red-200",
  "İşlemde": "bg-blue-50 border-blue-200",
  "Çözüldü": "bg-green-50 border-green-200",
};

const durumBasligi: Record<KuyrukDurum, string> = {
  "Açık": "Açık",
  "İşlemde": "İşlemde",
  "Çözüldü": "Çözüldü",
};

const onemiRengi: Record<string, string> = {
  "Yüksek": "text-red-600",
  "Orta": "text-amber-600",
  "Düşük": "text-slate-500",
};

const onemiBg: Record<string, string> = {
  "Yüksek": "bg-red-50 border-red-200 text-red-700",
  "Orta": "bg-amber-50 border-amber-200 text-amber-700",
  "Düşük": "bg-slate-100 border-slate-200 text-slate-600",
};

export default function FarkIncelemeKuyrugu() {
  const [viewMode, setViewMode] = useState<"tablo" | "kanban">("tablo");
  const [search, setSearch] = useState("");
  const [filterTur, setFilterTur] = useState("Tümü");
  const [filterDurum, setFilterDurum] = useState("Tümü");
  const [selectedKayit, setSelectedKayit] = useState<KuyrukKaydi | null>(null);
  const [not, setNot] = useState("");
  const [kayitlar, setKayitlar] = useState<KuyrukKaydi[]>(initialKayitlar);
  const aktifKullanici = "Aktif Kullanıcı";

  const filtered = kayitlar.filter((k) => {
    const searchMatch = !search ||
      k.siparisNo.toLowerCase().includes(search.toLowerCase()) ||
      k.detay.toLowerCase().includes(search.toLowerCase());
    const turMatch = filterTur === "Tümü" || k.isTuru === filterTur;
    const durumMatch = filterDurum === "Tümü" || k.durum === filterDurum;
    return searchMatch && turMatch && durumMatch;
  });

  const durumlar: KuyrukDurum[] = ["Açık", "İşlemde", "Çözüldü"];

  const updateDurum = (id: string, yeniDurum: KuyrukDurum, cozumAciklamasi?: string) => {
    setKayitlar((prev) => prev.map((k) => {
      if (k.id !== id) return k;
      return {
        ...k,
        durum: yeniDurum,
        atananKullanici: yeniDurum === "Açık" ? "" : k.atananKullanici || aktifKullanici,
        cozumAciklamasi: yeniDurum === "Çözüldü" ? cozumAciklamasi : k.cozumAciklamasi,
      };
    }));
    if (selectedKayit?.id === id) {
      setSelectedKayit((prev) => prev ? {
        ...prev,
        durum: yeniDurum,
        atananKullanici: yeniDurum === "Açık" ? "" : prev.atananKullanici || aktifKullanici,
        cozumAciklamasi: yeniDurum === "Çözüldü" ? cozumAciklamasi : prev.cozumAciklamasi,
      } : null);
    }
    const mesajlar: Record<KuyrukDurum, string> = {
      "İşlemde": "İşleme alındı",
      "Çözüldü": "Çözüldü olarak işaretlendi",
      "Açık": "Tekrar açıldı",
    };
    toast.success(mesajlar[yeniDurum]);
  };

  const cozumle = (kayit: KuyrukKaydi) => {
    if (selectedKayit?.id !== kayit.id) {
      setSelectedKayit(kayit);
      setNot("");
      toast.info("Çözüm için açıklama girin", { description: "İş kapatılmadan önce sağ panelde açıklama zorunludur." });
      return;
    }

    if (!not.trim()) {
      toast.error("Açıklama zorunlu", { description: "İşlemi çözmek için açıklama alanını doldurun." });
      return;
    }

    updateDurum(kayit.id, "Çözüldü", not.trim());
    setNot("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Fark İnceleme Kuyruğu"
        subtitle="Komisyon, desi ve kârlılık fark işlemlerinin takibi"
        actions={
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {([["tablo", List], ["kanban", LayoutGrid]] as const).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-white shadow-sm text-slate-800 font-medium"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {mode === "tablo" ? "Tablo" : "Kanban"}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className={`p-5 space-y-5 ${selectedKayit ? "mr-96" : ""}`}>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {durumlar.map((d) => {
              const count = kayitlar.filter((k) => k.durum === d).length;
              const colors: Record<KuyrukDurum, string> = {
                "Açık": "text-red-700 bg-red-50 border-red-200",
                "İşlemde": "text-blue-700 bg-blue-50 border-blue-200",
                "Çözüldü": "text-green-700 bg-green-50 border-green-200",
              };
              return (
                <button
                  key={d}
                  onClick={() => setFilterDurum(filterDurum === d ? "Tümü" : d)}
                  className={`${colors[d]} border rounded-lg px-4 py-3 shadow-sm text-left transition-all hover:shadow-md ${filterDurum === d ? "ring-2 ring-blue-400" : ""}`}
                >
                  <p className="text-xs text-slate-500 mb-1">{durumBasligi[d]}</p>
                  <p className="text-2xl font-semibold">{count}</p>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-44 max-w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sipariş no veya iş detayı ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterTur}
                onChange={(e) => setFilterTur(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm İş Türleri</option>
                <option>Komisyon</option>
                <option>Desi/Kargo</option>
                <option>Kârlılık</option>
              </select>
              <select
                value={filterDurum}
                onChange={(e) => setFilterDurum(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm Durumlar</option>
                {durumlar.map((d) => <option key={d}>{d}</option>)}
              </select>
              {(search || filterTur !== "Tümü" || filterDurum !== "Tümü") && (
                <button
                  onClick={() => { setSearch(""); setFilterTur("Tümü"); setFilterDurum("Tümü"); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Temizle
                </button>
              )}
            </div>
          </div>

          {viewMode === "tablo" ? (
            /* TABLE VIEW */
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-xs text-slate-500">{filtered.length} iş kaydı listeleniyor</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["İş Türü", "Önem", "Sipariş No", "Pazaryeri", "İş Detayı", "Atanan", "Açılma", "Durum", "Aksiyon"].map((col) => (
                        <th key={col} className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">
                          Filtre kriterlerine uygun iş kaydı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((kayit) => (
                        <tr
                          key={kayit.id}
                          onClick={() => setSelectedKayit(selectedKayit?.id === kayit.id ? null : kayit)}
                          className={`border-b border-slate-100 cursor-pointer transition-colors ${
                            selectedKayit?.id === kayit.id ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <StatusBadge status={kayit.isTuru} />
                          </td>
                          <td className="px-3 py-2.5 text-xs">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${onemiBg[kayit.onemiDerecesi]}`}>
                              {kayit.onemiDerecesi}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-xs font-mono text-blue-600 whitespace-nowrap">{kayit.siparisNo}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-700">{kayit.pazaryeri}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-700 max-w-md truncate">{kayit.detay}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600">
                            {kayit.durum === "Açık" ? <span className="text-slate-300">-</span> : kayit.atananKullanici}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{kayit.acilmaZamani}</td>
                          <td className="px-3 py-2.5">
                            <StatusBadge status={kayit.durum} />
                          </td>
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              {kayit.durum !== "İşlemde" && kayit.durum !== "Çözüldü" && (
                                <button
                                  onClick={() => updateDurum(kayit.id, "İşlemde")}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  title="İşleme Al"
                                >
                                  <Loader2 className="w-3 h-3" />
                                </button>
                              )}
                              {kayit.durum !== "Çözüldü" && (
                                <button
                                  onClick={() => cozumle(kayit)}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-green-50 text-green-600 hover:bg-green-100"
                                  title="Çözüldü"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* KANBAN VIEW */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {durumlar.map((durum) => {
                const kisiler = kayitlar.filter((k) => k.durum === durum);
                return (
                  <div key={durum} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-700">{durumBasligi[durum]}</h4>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{kisiler.length}</span>
                    </div>
                    <div className="space-y-2 min-h-16">
                      {kisiler.map((kayit) => (
                        <div
                          key={kayit.id}
                          onClick={() => setSelectedKayit(selectedKayit?.id === kayit.id ? null : kayit)}
                          className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                            durumRenkleri[durum]
                          } ${selectedKayit?.id === kayit.id ? "ring-2 ring-blue-400" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <StatusBadge status={kayit.isTuru} size="sm" />
                            <span className={`text-xs font-semibold ${onemiRengi[kayit.onemiDerecesi]}`}>
                              {kayit.onemiDerecesi}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 leading-tight mb-1.5 line-clamp-3">{kayit.detay}</p>
                          <p className="text-xs font-mono text-blue-600 mb-1.5">{kayit.siparisNo}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{kayit.durum === "Açık" ? "Ortak havuz" : kayit.atananKullanici.split(" ")[0]}</span>
                            <span>{kayit.acilmaZamani.split(" ")[0]}</span>
                          </div>
                        </div>
                      ))}
                      {kisiler.length === 0 && (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center text-xs text-slate-300">
                          Kayıt yok
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer - starts below TopBar */}
      {selectedKayit && (
        <div className="fixed right-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col" style={{ top: "62px" }}>
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">İş Detayı</h3>
              <p className="text-xs font-mono text-blue-600 mt-0.5">{selectedKayit.siparisNo}</p>
            </div>
            <button onClick={() => setSelectedKayit(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={selectedKayit.durum} size="md" />
              <StatusBadge status={selectedKayit.isTuru} size="md" />
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${onemiBg[selectedKayit.onemiDerecesi]}`}>
                {selectedKayit.onemiDerecesi} Öncelik
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">İş Bilgileri</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-400">İş Detayı</p>
                  <p className="text-xs font-medium text-slate-800 leading-snug">{selectedKayit.detay}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-400">Pazaryeri</p>
                    <p className="text-xs font-medium text-slate-700">{selectedKayit.pazaryeri}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Atanan Kullanıcı</p>
                    <p className="text-xs font-medium text-slate-700">
                      {selectedKayit.durum === "Açık" ? "Henüz işleme alınmadı" : selectedKayit.atananKullanici}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Açılma Zamanı</p>
                    <p className="text-xs font-medium text-slate-700">{selectedKayit.acilmaZamani}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">İş Türü</p>
                    <p className="text-xs font-medium text-slate-700">{selectedKayit.isTuru}</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedKayit.durum === "Çözüldü" && selectedKayit.cozumAciklamasi && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Çözüm Açıklaması</p>
                <p className="text-xs text-green-700 leading-snug">{selectedKayit.cozumAciklamasi}</p>
              </div>
            )}

            {/* Not Ekleme */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1.5">Açıklama / Not</p>
              <textarea
                rows={3}
                value={not}
                onChange={(e) => setNot(e.target.value)}
                placeholder="Çözüm için açıklama zorunludur..."
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => {
                  if (not.trim()) {
                    toast.success("Not kaydedildi");
                    setNot("");
                  } else {
                    toast.info("Lütfen bir not girin");
                  }
                }}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Not Kaydet
              </button>
            </div>
          </div>

          {/* Status Actions */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <p className="text-xs text-slate-500 font-medium">Durum Güncelle</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs rounded-lg transition-colors ${
                  selectedKayit.durum === "İşlemde"
                    ? "bg-blue-600 text-white cursor-default"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
                onClick={() => updateDurum(selectedKayit.id, "İşlemde")}
                disabled={selectedKayit.durum === "İşlemde" || selectedKayit.durum === "Çözüldü"}
              >
                <Loader2 className="w-3.5 h-3.5" />
                İşleme Al
              </button>
              <button
                className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs rounded-lg transition-colors ${
                  selectedKayit.durum === "Çözüldü"
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                }`}
                onClick={() => cozumle(selectedKayit)}
                disabled={selectedKayit.durum === "Çözüldü"}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Çözüldü
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileText,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Search,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "../components/TopBar";
import { StatusBadge } from "../components/StatusBadge";
import {
  aktarimKayitlari as initialKayitlar,
  pazaryerleri,
  type AktarimKaydi,
} from "../data/mockData";

type HızlıSeçenek = {
  label: string;
  veriTuru: string;
  kaynakSistem: string;
  pazaryeriSecimi: boolean;
  subLabel?: string;
  odak?: "komisyon" | "desi";
};

const hızlıKartlar: Array<{
  id: string;
  baslik: string;
  aciklama: string;
  icon: React.ElementType;
  renk: keyof typeof renkMap;
  seçenekler: HızlıSeçenek[];
}> = [
  {
    id: "pazaryeri",
    baslik: "Pazaryeri Mutabakat Kaynağı",
    aciklama: "Faturalanan komisyon ve desi/kargo değerleri",
    icon: Database,
    renk: "green",
    seçenekler: [
      {
        label: "Komisyon Mutabakat Dosyası",
        veriTuru: "Komisyon Fatura",
        kaynakSistem: "Pazaryeri",
        pazaryeriSecimi: true,
        odak: "komisyon",
      },
      {
        label: "Desi / Kargo Mutabakat Dosyası",
        veriTuru: "Desi/Kargo Finans Raporu",
        kaynakSistem: "Pazaryeri",
        pazaryeriSecimi: true,
        odak: "desi",
      },
    ],
  },
  {
    id: "hamurlabs",
    baslik: "Hamurlabs Sipariş Kaynağı",
    aciklama: "Sipariş ve iptal hareketleri",
    icon: Store,
    renk: "blue",
    seçenekler: [
      {
        label: "Sipariş Dosyası",
        veriTuru: "Sipariş",
        kaynakSistem: "Hamurlabs",
        pazaryeriSecimi: false,
      },
      {
        label: "İptal Dosyası",
        veriTuru: "İptal",
        kaynakSistem: "Hamurlabs",
        pazaryeriSecimi: false,
      },
    ],
  },
  {
    id: "hitit",
    baslik: "Hitit Satış / ERP Kaynağı",
    aciklama: "Satış, iade ve maliyet verileri",
    icon: Building2,
    renk: "purple",
    seçenekler: [
      {
        label: "Satış Dosyası",
        veriTuru: "ERP Satış",
        kaynakSistem: "Hitit",
        pazaryeriSecimi: false,
      },
      {
        label: "İade Dosyası",
        veriTuru: "ERP İade",
        kaynakSistem: "Hitit",
        pazaryeriSecimi: false,
      },
    ],
  },
];

const renkMap = {
  blue: {
    icon: "bg-sky-50 text-sky-700 border-sky-100",
    panel: "bg-sky-50/70 border-sky-100",
    option: "border-sky-200 text-sky-800 hover:bg-sky-50",
    selected: "border-sky-500 bg-sky-50 ring-sky-100",
    button: "bg-sky-600 hover:bg-sky-700",
  },
  purple: {
    icon: "bg-violet-50 text-violet-700 border-violet-100",
    panel: "bg-violet-50/70 border-violet-100",
    option: "border-violet-200 text-violet-800 hover:bg-violet-50",
    selected: "border-violet-500 bg-violet-50 ring-violet-100",
    button: "bg-violet-600 hover:bg-violet-700",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-700 border-emerald-100",
    panel: "bg-emerald-50/70 border-emerald-100",
    option: "border-emerald-200 text-emerald-800 hover:bg-emerald-50",
    selected: "border-emerald-500 bg-emerald-50 ring-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
};

const durumIkon = {
  Aktarıldı: <ArrowUpCircle className="w-4 h-4 text-blue-500" />,
  Hatalı: <AlertCircle className="w-4 h-4 text-red-500" />,
  Bekliyor: <Clock className="w-4 h-4 text-amber-500" />,
};

const pazaryeriMeta: Record<string, { kod: string }> = {
  Trendyol: { kod: "TY" },
  Hepsiburada: { kod: "HB" },
  Amazon: { kod: "AZ" },
  n11: { kod: "N11" },
  Pazarama: { kod: "PZ" },
  LCW: { kod: "LCW" },
  FLO: { kod: "FLO" },
};

const veriKapsamlari = [
  {
    id: "komisyon",
    label: "Komisyon",
    veriTuru: "Komisyon Fatura",
    icon: ReceiptText,
  },
  {
    id: "desi",
    label: "Desi / Kargo",
    veriTuru: "Desi/Kargo Finans Raporu",
    icon: PackageCheck,
  },
];

interface ModalConfig {
  genel?: boolean;
  kaynakSistem?: string;
  veriTuru?: string;
  pazaryeriSecimi?: boolean;
  subLabel?: string;
  odak?: "komisyon" | "desi";
}

interface UploadModalProps {
  config: ModalConfig;
  onClose: () => void;
  onSuccess: (kayit: AktarimKaydi) => void;
}

function UploadModal({ config, onClose, onSuccess }: UploadModalProps) {
  const [kaynak, setKaynak] = useState(config.kaynakSistem || "Pazaryeri");
  const [veriTuru, setVeriTuru] = useState(config.veriTuru || "Komisyon Fatura");
  const [pazaryeri, setPazaryeri] = useState(config.pazaryeriSecimi === false ? "Tüm" : "Trendyol");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locked = !config.genel;
  const pazaryeriGerekli = kaynak === "Pazaryeri" && config.pazaryeriSecimi !== false;
  const seciliKapsam =
    veriKapsamlari.find((kapsam) => kapsam.veriTuru === veriTuru) || veriKapsamlari[0];

  const veriTuruOptions: Record<string, string[]> = {
    Hamurlabs: ["Sipariş", "İptal"],
    Hitit: ["ERP Satış", "ERP İade"],
    Pazaryeri: veriKapsamlari.map((kapsam) => kapsam.veriTuru),
  };

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Geçersiz dosya türü", {
        description: "Excel veya CSV dosyası kabul edilir (.xlsx, .xls, .csv)",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Dosya çok büyük", { description: "Maksimum 50 MB desteklenmektedir." });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleKaynakChange = (nextKaynak: string) => {
    const nextOptions = veriTuruOptions[nextKaynak] || [];
    setKaynak(nextKaynak);
    setVeriTuru(nextOptions[0] || "");
    setPazaryeri(nextKaynak === "Pazaryeri" ? "Trendyol" : "Tüm");
  };

  const handleUpload = () => {
    if (pazaryeriGerekli && !pazaryeri) {
      toast.error("Pazaryeri seçimi gerekli", {
        description: "Komisyon ve desi mutabakatı pazaryeri bazında işlenir.",
      });
      return;
    }

    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 18) + 5;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const satirSayisi = Math.floor(Math.random() * 2000) + 100;
      const yeniKayit: AktarimKaydi = {
        id: String(Date.now()),
        dosyaAdi: selectedFile.name,
        kaynakSistem: kaynak,
        veriTuru,
        pazaryeri: pazaryeriGerekli ? pazaryeri : "Tüm",
        satirSayisi,
        durum: "Aktarıldı",
        aktaranKullanici: "Ahmet Yılmaz",
        aktarimZamani: new Date().toLocaleString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      onSuccess(yeniKayit);
      toast.success("Dosya başarıyla aktarıldı", {
        description: `${selectedFile.name} - ${satirSayisi.toLocaleString("tr-TR")} satır işlendi`,
      });
      onClose();
    }, 2300);
  };

  const dosyaSecimAlani = !selectedFile ? (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
        dragOver
          ? "border-blue-400 bg-blue-50"
          : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? "text-blue-500" : "text-slate-300"}`} />
      <p className="text-xs text-slate-600 mb-1">
        Dosyayı buraya sürükleyin veya <span className="text-blue-700 font-medium">tıklayın</span>
      </p>
      <p className="text-xs text-slate-400">Excel / CSV - Maks. 50 MB</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  ) : (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-800 truncate">{selectedFile.name}</p>
          <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
        </div>
        {!uploading && (
          <button
            onClick={() => setSelectedFile(null)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400"
            aria-label="Dosyayı kaldır"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Aktarılıyor...</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Dosya Aktar</h2>
            {config.subLabel && <p className="text-xs text-slate-500 mt-0.5">{config.subLabel}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-auto">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Kaynak Sistem</label>
                  {locked ? (
                    <div className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-medium">
                      {kaynak}
                    </div>
                  ) : (
                    <select
                      value={kaynak}
                      onChange={(e) => handleKaynakChange(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Pazaryeri</option>
                      <option>Hamurlabs</option>
                      <option>Hitit</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Veri Türü</label>
                  {locked ? (
                    <div className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-medium">
                      {veriTuru}
                    </div>
                  ) : (
                    <select
                      value={veriTuru}
                      onChange={(e) => setVeriTuru(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {(veriTuruOptions[kaynak] || []).map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {pazaryeriGerekli && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="text-xs font-semibold text-slate-800">Pazaryeri Seçimi</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {pazaryerleri.map((item) => {
                      const selected = pazaryeri === item;
                      const meta = pazaryeriMeta[item];

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setPazaryeri(item)}
                          className={`border rounded-lg p-3 text-left transition-all ${
                            selected
                              ? "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100"
                              : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold flex-shrink-0 ${
                                selected
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-700 border-slate-200"
                              }`}
                            >
                              {meta?.kod || item.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{item}</p>
                            </div>
                            {selected && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {kaynak === "Pazaryeri" && (
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-2">Mutabakat Kapsamı</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {veriKapsamlari.map((kapsam) => {
                      const Icon = kapsam.icon;
                      const selected = veriTuru === kapsam.veriTuru;

                      return (
                        <button
                          key={kapsam.id}
                          type="button"
                          onClick={() => setVeriTuru(kapsam.veriTuru)}
                          className={`border rounded-lg p-3 text-left transition-all ${
                            selected
                              ? "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100"
                              : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${selected ? "text-emerald-700" : "text-slate-500"}`} />
                            <p className="text-xs font-semibold text-slate-900">{kapsam.label}</p>
                            {selected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dosyaSecimAlani}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Aktarılıyor...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Dosyayı Aktar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({
  kayit,
  onConfirm,
  onCancel,
}: {
  kayit: AktarimKaydi;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="bg-red-50 border-b border-red-200">
      <td colSpan={9} className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong className="font-medium">{kayit.dosyaAdi}</strong> silinecek. Bu işlem geri
              alınamaz.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Vazgeç
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function VeriAktarimi() {
  const [search, setSearch] = useState("");
  const [filterDurum, setFilterDurum] = useState("Tümü");
  const [filterKaynak, setFilterKaynak] = useState("Tümü");
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [kayitlar, setKayitlar] = useState<AktarimKaydi[]>(initialKayitlar);
  const [expandedKart, setExpandedKart] = useState<string | null>("pazaryeri");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      kayitlar.filter((k) => {
        const searchText = `${k.dosyaAdi} ${k.veriTuru} ${k.pazaryeri}`.toLowerCase();
        const searchMatch = !search || searchText.includes(search.toLowerCase());
        const durumMatch = filterDurum === "Tümü" || k.durum === filterDurum;
        const kaynakMatch = filterKaynak === "Tümü" || k.kaynakSistem === filterKaynak;
        return searchMatch && durumMatch && kaynakMatch;
      }),
    [filterDurum, filterKaynak, kayitlar, search],
  );

  const stats = {
    toplam: kayitlar.length,
    aktarildi: kayitlar.filter((k) => k.durum === "Aktarıldı").length,
    hatali: kayitlar.filter((k) => k.durum === "Hatalı").length,
    bekliyor: kayitlar.filter((k) => k.durum === "Bekliyor").length,
  };

  const handleSuccess = (yeniKayit: AktarimKaydi) => {
    setKayitlar((prev) => [yeniKayit, ...prev]);
  };

  const handleDelete = (id: string) => {
    const kayit = kayitlar.find((k) => k.id === id);
    setKayitlar((prev) => prev.filter((k) => k.id !== id));
    setDeleteId(null);
    toast.success("Kayıt silindi", { description: kayit?.dosyaAdi });
  };

  const kaynakBadge = (kaynak: string) =>
    kaynak === "Hamurlabs"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : kaynak === "Hitit"
        ? "bg-violet-50 text-violet-700 border-violet-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Veri Aktarımı"
        subtitle="Hamurlabs, Hitit ve pazaryeri dosya aktarım yönetimi"
        actions={
          <button
            onClick={() => setModalConfig({ genel: true, pazaryeriSecimi: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Yeni Dosya Aktar
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Toplam Aktarım", value: stats.toplam, filtreKey: "Tümü", color: "text-slate-800", bg: "bg-white border-slate-200" },
            { label: "Aktarıldı", value: stats.aktarildi, filtreKey: "Aktarıldı", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
            { label: "Hatalı", value: stats.hatali, filtreKey: "Hatalı", color: "text-red-700", bg: "bg-red-50 border-red-200" },
            { label: "Bekliyor", value: stats.bekliyor, filtreKey: "Bekliyor", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setFilterDurum(filterDurum === s.filtreKey ? "Tümü" : s.filtreKey)}
              className={`${s.bg} border rounded-lg px-4 py-3 shadow-sm text-left transition-all hover:shadow-md ${
                filterDurum === s.filtreKey ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Aktarım Akışı</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hamurlabs sipariş/iptal, Hitit satış/iade ve pazaryeri mutabakat dosyaları ayrı kaynaklar olarak aktarılır.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-4">
            {hızlıKartlar.map((kart) => {
              const r = renkMap[kart.renk];
              const Icon = kart.icon;
              const isExpanded = expandedKart === kart.id;

              return (
                <div key={kart.id} className={`border rounded-lg overflow-hidden ${isExpanded ? r.panel : "bg-white border-slate-200"}`}>
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                    onClick={() => setExpandedKart(isExpanded ? null : kart.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${r.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{kart.baslik}</p>
                      <p className="text-xs text-slate-500 leading-tight">{kart.aciklama}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 px-4 py-3 space-y-2 bg-white/70">
                      {kart.seçenekler.map((opt) => (
                        <button
                          key={opt.label}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors bg-white ${r.option}`}
                          onClick={() => {
                            setModalConfig({
                              kaynakSistem: opt.kaynakSistem,
                              veriTuru: opt.veriTuru,
                              pazaryeriSecimi: opt.pazaryeriSecimi,
                              subLabel: `${kart.baslik} > ${opt.label}`,
                              odak: opt.odak,
                            });
                            setExpandedKart(null);
                          }}
                        >
                          <span>{opt.label}</span>
                          <Upload className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Aktarım Geçmişi</h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Dosya, tür veya pazaryeri ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
              <select
                value={filterKaynak}
                onChange={(e) => setFilterKaynak(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm Kaynaklar</option>
                <option>Hamurlabs</option>
                <option>Hitit</option>
                <option>Pazaryeri</option>
              </select>
              <select
                value={filterDurum}
                onChange={(e) => setFilterDurum(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tümü">Tüm Durumlar</option>
                <option>Aktarıldı</option>
                <option>Bekliyor</option>
                <option>Hatalı</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Dosya Adı",
                    "Kaynak Sistem",
                    "Veri Türü",
                    "Pazaryeri",
                    "Satır Sayısı",
                    "Durum",
                    "Aktaran",
                    "Aktarım Zamanı",
                    "İşlem",
                  ].map((col) => (
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
                      Filtre kriterlerine uygun aktarım kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filtered.map((kayit) => (
                    <React.Fragment key={kayit.id}>
                      <tr className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${deleteId === kayit.id ? "bg-red-50/40" : ""}`}>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-700 max-w-xs truncate">{kayit.dosyaAdi}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${kaynakBadge(kayit.kaynakSistem)}`}>
                            {kayit.kaynakSistem}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{kayit.veriTuru}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{kayit.pazaryeri}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-700 font-mono">{kayit.satirSayisi.toLocaleString("tr-TR")}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            {durumIkon[kayit.durum]}
                            <StatusBadge status={kayit.durum} />
                          </div>
                          {kayit.hata && <p className="text-xs text-red-500 mt-0.5 max-w-[200px] truncate">{kayit.hata}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{kayit.aktaranKullanici}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{kayit.aktarimZamani}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            {kayit.hata && (
                              <button
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-amber-50 text-amber-500"
                                title="Yeniden Dene"
                                onClick={() => toast.info("Yeniden aktarma başlatıldı", { description: kayit.dosyaAdi })}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 hover:text-red-600"
                              title="Sil"
                              onClick={() => setDeleteId(deleteId === kayit.id ? null : kayit.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {deleteId === kayit.id && (
                        <DeleteConfirm kayit={kayit} onConfirm={() => handleDelete(kayit.id)} onCancel={() => setDeleteId(null)} />
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalConfig && <UploadModal config={modalConfig} onClose={() => setModalConfig(null)} onSuccess={handleSuccess} />}
    </div>
  );
}

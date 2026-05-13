import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, CheckCircle2, XCircle } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { pazaryeriListesi, komisyonOranlari } from "../data/mockData";

type Tab = "Pazaryerleri" | "Pazaryeri Hesapları" | "Komisyon Oranları" | "Kargo/Desi Ücretleri" | "Kesinti Kategorileri" | "Ürün Eşleşmeleri";

const tabs: Tab[] = [
  "Pazaryerleri",
  "Pazaryeri Hesapları",
  "Komisyon Oranları",
  "Kargo/Desi Ücretleri",
  "Kesinti Kategorileri",
  "Ürün Eşleşmeleri",
];

const hesaplar = [
  { id: "h1", pazaryeri: "Trendyol", hesapAdi: "Sporthink Ana Mağaza", cariKod: "TY-001", aktif: true },
  { id: "h2", pazaryeri: "Hepsiburada", hesapAdi: "Sporthink HB", cariKod: "HB-001", aktif: true },
  { id: "h3", pazaryeri: "Amazon", hesapAdi: "Sporthink TR", cariKod: "AMZ-001", aktif: true },
  { id: "h4", pazaryeri: "n11", hesapAdi: "Sporthink n11", cariKod: "N11-001", aktif: true },
  { id: "h5", pazaryeri: "FLO", hesapAdi: "Sporthink FLO", cariKod: "FLO-001", aktif: false },
];

const kargoDesiUcretleri = [
  { id: "kd1", pazaryeri: "Trendyol", kargoFirması: "Yurtiçi Kargo", desi: 1, ucret: 32 },
  { id: "kd2", pazaryeri: "Trendyol", kargoFirması: "Yurtiçi Kargo", desi: 2, ucret: 42 },
  { id: "kd3", pazaryeri: "Trendyol", kargoFirması: "Yurtiçi Kargo", desi: 3, ucret: 62 },
  { id: "kd4", pazaryeri: "Trendyol", kargoFirması: "Yurtiçi Kargo", desi: 4, ucret: 70 },
  { id: "kd5", pazaryeri: "Hepsiburada", kargoFirması: "Aras Kargo", desi: 1, ucret: 35 },
  { id: "kd6", pazaryeri: "Hepsiburada", kargoFirması: "Aras Kargo", desi: 5, ucret: 75 },
];

const kesintiKategorileri = [
  { id: "kk1", ad: "Satış Komisyonu", tur: "Komisyon", zorunlu: true },
  { id: "kk2", ad: "İade Komisyonu", tur: "Komisyon", zorunlu: true },
  { id: "kk3", ad: "Desi/Kargo Bedeli", tur: "Kargo", zorunlu: true },
  { id: "kk4", ad: "Geç Teslimat Cezası", tur: "Ceza", zorunlu: false },
  { id: "kk5", ad: "Hasar Cezası", tur: "Ceza", zorunlu: false },
  { id: "kk6", ad: "Reklam Bedeli", tur: "Ek Bedel", zorunlu: false },
  { id: "kk7", ad: "Stopaj Kesintisi", tur: "Vergi", zorunlu: true },
];

const urunEslesmeleri = [
  { id: "ue1", pazaryeri: "Trendyol", pazaryeriKodu: "TY-8681000000035", barkod: "8681000000035", urunAdi: "DryFit Antrenman Tişörtü", eskiKod: "SKU-001" },
  { id: "ue2", pazaryeri: "Hepsiburada", pazaryeriKodu: "HB-8681000000072", barkod: "8681000000072", urunAdi: "Pro Koşu Şortu", eskiKod: "SKU-002" },
  { id: "ue3", pazaryeri: "Amazon", pazaryeriKodu: "AMZ-B09XYZ", barkod: "8681000000106", urunAdi: "Yoga Matı Deluxe", eskiKod: "SKU-003" },
];

export default function PazaryeriAyarlari() {
  const [activeTab, setActiveTab] = useState<Tab>("Pazaryerleri");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const openModal = (title: string) => {
    setModalTitle(title);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TopBar
        title="Pazaryeri Ayarları"
        subtitle="Pazaryeri, komisyon oranı, kargo-desi tarifesi ve kategori yönetimi"
        actions={
          <button
            onClick={() => openModal(`Yeni ${activeTab.slice(0, -1) || activeTab}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Ekle
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-5 space-y-4">
        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {activeTab === "Pazaryerleri" && (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Pazaryeri Adı", "Entegrasyon Türü", "Kom. Hesaplama Türü", "Durum", "Son Güncelleme", "İşlem"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pazaryeriListesi.map((py) => (
                    <tr key={py.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-medium text-slate-800">{py.ad}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{py.entegrasyonTuru}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{py.komisyonHesaplamaTuru}</td>
                      <td className="px-4 py-3">
                        {py.aktif ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Pasif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{py.sonGuncelleme}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal("Pazaryeri Düzenle")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Pazaryeri Hesapları" && (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Pazaryeri", "Hesap Adı", "Cari Kod", "Durum", "İşlem"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hesaplar.map((h) => (
                    <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-700">{h.pazaryeri}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-800">{h.hesapAdi}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{h.cariKod}</td>
                      <td className="px-4 py-3">
                        {h.aktif ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Aktif</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400"><XCircle className="w-3.5 h-3.5" /> Pasif</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal("Hesap Düzenle")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3 h-3" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Komisyon Oranları" && (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Pazaryeri", "Kategori", "Alt Kategori", "Oran (%)", "Geçerlilik Başlangıç", "Geçerlilik Bitiş", "İşlem"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {komisyonOranlari.map((ko) => (
                    <tr key={ko.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-700">{ko.pazaryeri}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{ko.kategori}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{ko.alt_kategori}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">%{ko.oran}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ko.gecerlilikBaslangic}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ko.gecerlilikBitis}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal("Komisyon Oranı Düzenle")} className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3 h-3" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Kargo/Desi Ücretleri" && (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Pazaryeri", "Kargo Firması", "Desi", "Ücret (TL)", "İşlem"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kargoDesiUcretleri.map((kd) => (
                    <tr key={kd.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-700">{kd.pazaryeri}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{kd.kargoFirması}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">{kd.desi}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{kd.ucret} TL</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3 h-3" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Kesinti Kategorileri" && (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Kategori Adı", "Tür", "Zorunlu mu?", "İşlem"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kesintiKategorileri.map((kk) => (
                    <tr key={kk.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-medium text-slate-800">{kk.ad}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${
                          kk.tur === "Komisyon" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          kk.tur === "Kargo" ? "bg-orange-50 text-orange-700 border-orange-200" :
                          kk.tur === "Ceza" ? "bg-red-50 text-red-700 border-red-200" :
                          kk.tur === "Vergi" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {kk.tur}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {kk.zorunlu ? (
                          <span className="text-green-700">Evet</span>
                        ) : (
                          <span className="text-slate-400">Hayır</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3 h-3" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Ürün Eşleşmeleri" && (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Pazaryeri", "Pazaryeri Kodu", "Barkod", "Ürün Adı", "ERP Kodu", "İşlem"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {urunEslesmeleri.map((ue) => (
                    <tr key={ue.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-700">{ue.pazaryeri}</td>
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">{ue.pazaryeriKodu}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{ue.barkod}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{ue.urunAdi}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{ue.eskiKod}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3 h-3" /></button>
                          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{modalTitle}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">Form alanları burada görünecek. Seçili sekmeye göre dinamik olarak yüklenecek.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Ad / Başlık</label>
                  <input type="text" className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Girin..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Durum</label>
                  <select className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Aktif</option>
                    <option>Pasif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">İptal</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

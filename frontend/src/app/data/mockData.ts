// Mock data for Sporthink Mutabakat Uygulaması

export const pazaryerleri = ["Trendyol", "Hepsiburada", "Amazon", "n11", "Pazarama", "LCW", "FLO"];

export const kpiYonetimOzeti = {
  toplamSiparis: 4_821,
  netGelir: 1_847_320,
  netKar: 312_450,
  karMarji: 16.9,
  komisyonFarki: -28_740,
  desiKargoFarki: -12_890,
  zararEdenSiparisler: 287,
  acikIncelemeIsleri: 143,
};

export const pazaryeriKarDagilimi = [
  { name: "Trendyol", kar: 148_200, zarar: -18_400 },
  { name: "Hepsiburada", kar: 87_300, zarar: -9_200 },
  { name: "Amazon", kar: 52_100, zarar: -5_800 },
  { name: "n11", kar: 21_400, zarar: -3_100 },
  { name: "Pazarama", kar: 11_200, zarar: -1_400 },
  { name: "LCW", kar: 8_900, zarar: -800 },
  { name: "FLO", kar: 6_100, zarar: -600 },
];

export const komisyonFarkiTrendi = [
  { ay: "Kas'25", fark: -8_200 },
  { ay: "Ara'25", fark: -11_400 },
  { ay: "Oca'26", fark: -9_800 },
  { ay: "Şub'26", fark: -15_200 },
  { ay: "Mar'26", fark: -22_100 },
  { ay: "Nis'26", fark: -28_740 },
];

export const desiKargoFarkiTrendi = [
  { ay: "Kas'25", fark: -3_100 },
  { ay: "Ara'25", fark: -4_200 },
  { ay: "Oca'26", fark: -5_800 },
  { ay: "Şub'26", fark: -7_400 },
  { ay: "Mar'26", fark: -9_100 },
  { ay: "Nis'26", fark: -12_890 },
];

export const zararNedenleri = [
  { name: "Desi Farkı", deger: 38.4 },
  { name: "Komisyon Farkı", deger: 28.7 },
  { name: "Iade Kaybı", deger: 18.2 },
  { name: "Ceza Kesintisi", deger: 9.3 },
  { name: "Diğer", deger: 5.4 },
];

export type SiparisStatus = "Uyumlu" | "Desi Farkı" | "Komisyon Farkı" | "Manuel İnceleme" | "Zarar Eden";

export interface RiskliSiparis {
  siparisNo: string;
  pazaryeri: string;
  barkod: string;
  brutSatis: number;
  komisyonGideri: number;
  kargoGideri: number;
  desiFarki: number;
  komisyonFarki: number;
  netKar: number;
  durum: SiparisStatus;
}

export const riskliSiparisler: RiskliSiparis[] = [
  { siparisNo: "SPT-TRENDYOL-2026-0003", pazaryeri: "Trendyol", barkod: "8681000000035", brutSatis: 1133, komisyonGideri: 135.96, kargoGideri: 70, desiFarki: 1, komisyonFarki: 0, netKar: -59.46, durum: "Desi Farkı" },
  { siparisNo: "SPT-HEPSI-2026-0142", pazaryeri: "Hepsiburada", barkod: "8681000000072", brutSatis: 879, komisyonGideri: 140.64, kargoGideri: 85, desiFarki: 2, komisyonFarki: 18.5, netKar: -42.14, durum: "Komisyon Farkı" },
  { siparisNo: "SPT-AMAZON-2026-0289", pazaryeri: "Amazon", barkod: "8681000000106", brutSatis: 2450, komisyonGideri: 392, kargoGideri: 42, desiFarki: 0, komisyonFarki: 45.2, netKar: -18.8, durum: "Komisyon Farkı" },
  { siparisNo: "SPT-N11-2026-0034", pazaryeri: "n11", barkod: "8681000000119", brutSatis: 650, komisyonGideri: 97.5, kargoGideri: 62, desiFarki: 1, komisyonFarki: 0, netKar: -28.5, durum: "Desi Farkı" },
  { siparisNo: "SPT-TRENDYOL-2026-0087", pazaryeri: "Trendyol", barkod: "8681000000143", brutSatis: 1899, komisyonGideri: 227.88, kargoGideri: 58, desiFarki: 0, komisyonFarki: 32.4, netKar: -12.28, durum: "Manuel İnceleme" },
  { siparisNo: "SPT-FLO-2026-0021", pazaryeri: "FLO", barkod: "8681000000157", brutSatis: 1249, komisyonGideri: 199.84, kargoGideri: 74, desiFarki: 3, komisyonFarki: 0, netKar: -88.84, durum: "Desi Farkı" },
  { siparisNo: "SPT-LCW-2026-0018", pazaryeri: "LCW", barkod: "8681000000164", brutSatis: 549, komisyonGideri: 76.86, kargoGideri: 62, desiFarki: 0, komisyonFarki: 14.2, netKar: -54.06, durum: "Komisyon Farkı" },
  { siparisNo: "SPT-PAZARAMA-2026-0009", pazaryeri: "Pazarama", barkod: "8681000000178", brutSatis: 799, komisyonGideri: 119.85, kargoGideri: 68, desiFarki: 1, komisyonFarki: 8.9, netKar: -33.75, durum: "Zarar Eden" },
];

// Veri Aktarımı
export type AktarimDurum = "Aktarıldı" | "Hatalı" | "Bekliyor";
export interface AktarimKaydi {
  id: string;
  dosyaAdi: string;
  kaynakSistem: string;
  veriTuru: string;
  pazaryeri: string;
  satirSayisi: number;
  durum: AktarimDurum;
  aktaranKullanici: string;
  aktarimZamani: string;
  hata?: string;
}

export const aktarimKayitlari: AktarimKaydi[] = [
  { id: "1", dosyaAdi: "hamurlabs_siparisler_nisan2026.xlsx", kaynakSistem: "Hamurlabs", veriTuru: "Sipariş", pazaryeri: "Tüm", satirSayisi: 1842, durum: "Aktarıldı", aktaranKullanici: "Ahmet Yılmaz", aktarimZamani: "07.05.2026 09:14" },
  { id: "2", dosyaAdi: "hamurlabs_iptal_nisan2026.xlsx", kaynakSistem: "Hamurlabs", veriTuru: "İptal", pazaryeri: "Tüm", satirSayisi: 234, durum: "Aktarıldı", aktaranKullanici: "Ahmet Yılmaz", aktarimZamani: "07.05.2026 09:18" },
  { id: "3", dosyaAdi: "hitit_satis_nisan2026.xlsx", kaynakSistem: "Hitit", veriTuru: "ERP Satış", pazaryeri: "Tüm", satirSayisi: 2108, durum: "Aktarıldı", aktaranKullanici: "Fatma Demir", aktarimZamani: "07.05.2026 10:02" },
  { id: "4", dosyaAdi: "hitit_iade_nisan2026.xlsx", kaynakSistem: "Hitit", veriTuru: "ERP İade", pazaryeri: "Tüm", satirSayisi: 189, durum: "Aktarıldı", aktaranKullanici: "Fatma Demir", aktarimZamani: "07.05.2026 10:05" },
  { id: "5", dosyaAdi: "trendyol_desi_kargo_nisan2026.xlsx", kaynakSistem: "Pazaryeri", veriTuru: "Desi/Kargo Finans Raporu", pazaryeri: "Trendyol", satirSayisi: 3421, durum: "Aktarıldı", aktaranKullanici: "Mehmet Çelik", aktarimZamani: "07.05.2026 11:30" },
  { id: "6", dosyaAdi: "hepsiburada_komisyon_nisan2026.xlsx", kaynakSistem: "Pazaryeri", veriTuru: "Komisyon Fatura", pazaryeri: "Hepsiburada", satirSayisi: 891, durum: "Hatalı", aktaranKullanici: "Mehmet Çelik", aktarimZamani: "07.05.2026 11:45", hata: "Kolon eşleşme hatası: 'komisyon_tutari' bulunamadı" },
  { id: "7", dosyaAdi: "amazon_desi_kargo_nisan2026.xlsx", kaynakSistem: "Pazaryeri", veriTuru: "Desi/Kargo Finans Raporu", pazaryeri: "Amazon", satirSayisi: 1204, durum: "Bekliyor", aktaranKullanici: "Zeynep Arslan", aktarimZamani: "07.05.2026 13:10" },
  { id: "8", dosyaAdi: "n11_komisyon_nisan2026.xlsx", kaynakSistem: "Pazaryeri", veriTuru: "Komisyon Fatura", pazaryeri: "n11", satirSayisi: 445, durum: "Aktarıldı", aktaranKullanici: "Zeynep Arslan", aktarimZamani: "07.05.2026 13:40" },
];

// Komisyon Mutabakatı
export type KomisyonDurum = "Uyumlu" | "Fark Var";
export interface KomisyonKaydi {
  id: string;
  siparisNo: string;
  pazaryeri: string;
  barkod: string;
  urunAdi: string;
  komisyonMatrahi: number;
  hesaplamaKaynagi: string;
  beklenenOran: number;
  faturalananOran: number;
  beklenenKomisyon: number;
  faturalananKomisyon: number;
  farkTutari: number;
  guvenSkoru: number;
  durum: KomisyonDurum;
}

export const komisyonKayitlari: KomisyonKaydi[] = [
  { id: "k1", siparisNo: "SPT-TRENDYOL-2026-0003", pazaryeri: "Trendyol", barkod: "8681000000035", urunAdi: "DryFit Antrenman Tişörtü", komisyonMatrahi: 1133, hesaplamaKaynagi: "Kategori Oranı", beklenenOran: 12, faturalananOran: 12, beklenenKomisyon: 135.96, faturalananKomisyon: 135.96, farkTutari: 0, guvenSkoru: 98, durum: "Uyumlu" },
  { id: "k2", siparisNo: "SPT-HEPSI-2026-0142", pazaryeri: "Hepsiburada", barkod: "8681000000072", urunAdi: "Pro Koşu Şortu", komisyonMatrahi: 879, hesaplamaKaynagi: "Ürün Bazlı", beklenenOran: 14.5, faturalananOran: 16.6, beklenenKomisyon: 127.46, faturalananKomisyon: 145.96, farkTutari: -18.5, guvenSkoru: 72, durum: "Fark Var" },
  { id: "k3", siparisNo: "SPT-AMAZON-2026-0289", pazaryeri: "Amazon", barkod: "8681000000106", urunAdi: "Yoga Matı Deluxe", komisyonMatrahi: 2450, hesaplamaKaynagi: "Kategori Oranı", beklenenOran: 14, faturalananOran: 15.85, beklenenKomisyon: 343, faturalananKomisyon: 388.25, farkTutari: -45.25, guvenSkoru: 68, durum: "Fark Var" },
  { id: "k4", siparisNo: "SPT-N11-2026-0034", pazaryeri: "n11", barkod: "8681000000119", urunAdi: "Spor Çorap Seti 3lü", komisyonMatrahi: 650, hesaplamaKaynagi: "Kategori Oranı", beklenenOran: 12, faturalananOran: 12, beklenenKomisyon: 78, faturalananKomisyon: 78, farkTutari: 0, guvenSkoru: 95, durum: "Uyumlu" },
  { id: "k5", siparisNo: "SPT-TRENDYOL-2026-0087", pazaryeri: "Trendyol", barkod: "8681000000143", urunAdi: "Fitness Eldiveni L/XL", komisyonMatrahi: 1899, hesaplamaKaynagi: "Manuel Giris", beklenenOran: 12, faturalananOran: 13.7, beklenenKomisyon: 227.88, faturalananKomisyon: 260.22, farkTutari: -32.34, guvenSkoru: 55, durum: "Fark Var" },
  { id: "k6", siparisNo: "SPT-FLO-2026-0021", pazaryeri: "FLO", barkod: "8681000000157", urunAdi: "Running Ayakkabı M42", komisyonMatrahi: 1249, hesaplamaKaynagi: "Kategori Oranı", beklenenOran: 14, faturalananOran: 14, beklenenKomisyon: 174.86, faturalananKomisyon: 174.86, farkTutari: 0, guvenSkoru: 99, durum: "Uyumlu" },
  { id: "k7", siparisNo: "SPT-LCW-2026-0018", pazaryeri: "LCW", barkod: "8681000000164", urunAdi: "Slim Fit Spor Eşofman Alt", komisyonMatrahi: 549, hesaplamaKaynagi: "Kategori Oranı", beklenenOran: 12, faturalananOran: 14.5, beklenenKomisyon: 65.88, faturalananKomisyon: 79.6, farkTutari: -13.72, guvenSkoru: 74, durum: "Fark Var" },
  { id: "k8", siparisNo: "SPT-PAZARAMA-2026-0009", pazaryeri: "Pazarama", barkod: "8681000000178", urunAdi: "Protein Shaker Seti", komisyonMatrahi: 799, hesaplamaKaynagi: "Kategori Oranı", beklenenOran: 13, faturalananOran: 14.1, beklenenKomisyon: 103.87, faturalananKomisyon: 112.66, farkTutari: -8.79, guvenSkoru: 81, durum: "Fark Var" },
];

// Desi/Kargo Mutabakatı
export type DesiDurum = "Uyumlu" | "Desi Farkı Var" | "Manuel İnceleme";
export interface DesiKaydi {
  id: string;
  siparisNo: string;
  pazaryeri: string;
  paketNo: string;
  takipNo: string;
  kargoFirmasi: string;
  beklenenDesi: number;
  faturalananDesi: number;
  desiFarki: number;
  beklenenKargo: number;
  faturalananKargo: number;
  tutarFarki: number;
  durum: DesiDurum;
  guvenSkoru: number;
}

export const desiKayitlari: DesiKaydi[] = [
  { id: "d1", siparisNo: "SPT-TRENDYOL-2026-0003", pazaryeri: "Trendyol", paketNo: "PKT-001234", takipNo: "4901234567890", kargoFirmasi: "Yurtiçi Kargo", beklenenDesi: 3, faturalananDesi: 4, desiFarki: 1, beklenenKargo: 62, faturalananKargo: 70, tutarFarki: -8, durum: "Desi Farkı Var", guvenSkoru: 88 },
  { id: "d2", siparisNo: "SPT-HEPSI-2026-0142", pazaryeri: "Hepsiburada", paketNo: "PKT-005621", takipNo: "4901234567902", kargoFirmasi: "Aras Kargo", beklenenDesi: 5, faturalananDesi: 7, desiFarki: 2, beklenenKargo: 75, faturalananKargo: 91, tutarFarki: -16, durum: "Desi Farkı Var", guvenSkoru: 76 },
  { id: "d3", siparisNo: "SPT-AMAZON-2026-0289", pazaryeri: "Amazon", paketNo: "PKT-009874", takipNo: "4901234567918", kargoFirmasi: "MNG Kargo", beklenenDesi: 8, faturalananDesi: 8, desiFarki: 0, beklenenKargo: 95, faturalananKargo: 95, tutarFarki: 0, durum: "Uyumlu", guvenSkoru: 99 },
  { id: "d4", siparisNo: "SPT-N11-2026-0034", pazaryeri: "n11", paketNo: "PKT-003412", takipNo: "4901234567924", kargoFirmasi: "Yurtiçi Kargo", beklenenDesi: 2, faturalananDesi: 3, desiFarki: 1, beklenenKargo: 55, faturalananKargo: 62, tutarFarki: -7, durum: "Desi Farkı Var", guvenSkoru: 85 },
  { id: "d5", siparisNo: "SPT-TRENDYOL-2026-0087", pazaryeri: "Trendyol", paketNo: "PKT-007821", takipNo: "4901234567930", kargoFirmasi: "Sürat Kargo", beklenenDesi: 4, faturalananDesi: 4, desiFarki: 0, beklenenKargo: 68, faturalananKargo: 68, tutarFarki: 0, durum: "Uyumlu", guvenSkoru: 97 },
  { id: "d6", siparisNo: "SPT-FLO-2026-0021", pazaryeri: "FLO", paketNo: "PKT-002198", takipNo: "4901234567946", kargoFirmasi: "PTT Kargo", beklenenDesi: 6, faturalananDesi: 9, desiFarki: 3, beklenenKargo: 82, faturalananKargo: 112, tutarFarki: -30, durum: "Desi Farkı Var", guvenSkoru: 62 },
  { id: "d7", siparisNo: "SPT-LCW-2026-0018", pazaryeri: "LCW", paketNo: "PKT-004567", takipNo: "4901234567952", kargoFirmasi: "Yurtiçi Kargo", beklenenDesi: 2, faturalananDesi: 2, desiFarki: 0, beklenenKargo: 55, faturalananKargo: 55, tutarFarki: 0, durum: "Uyumlu", guvenSkoru: 100 },
  { id: "d8", siparisNo: "SPT-PAZARAMA-2026-0009", pazaryeri: "Pazarama", paketNo: "PKT-001098", takipNo: "4901234567968", kargoFirmasi: "Aras Kargo", beklenenDesi: 3, faturalananDesi: 4, desiFarki: 1, beklenenKargo: 62, faturalananKargo: 70, tutarFarki: -8, durum: "Manuel İnceleme", guvenSkoru: 71 },
];

// Sipariş Kârlılığı
export interface KarlilikKaydi {
  id: string;
  siparisNo: string;
  pazaryeri: string;
  brutSatis: number;
  iadeIptal: number;
  komisyon: number;
  kargo: number;
  ceza: number;
  ekBedel: number;
  urunMaliyeti: number;
  netGelir: number;
  netKar: number;
  karMarji: number;
  zararMi: boolean;
  zararNedeni?: string;
}

export const karlilikKayitlari: KarlilikKaydi[] = [
  { id: "p1", siparisNo: "SPT-TRENDYOL-2026-0003", pazaryeri: "Trendyol", brutSatis: 1133, iadeIptal: 0, komisyon: 135.96, kargo: 70, ceza: 0, ekBedel: 0, urunMaliyeti: 986.5, netGelir: 927.04, netKar: -59.46, karMarji: -6.4, zararMi: true, zararNedeni: "Desi Farkı" },
  { id: "p2", siparisNo: "SPT-HEPSI-2026-0142", pazaryeri: "Hepsiburada", brutSatis: 879, iadeIptal: 0, komisyon: 145.96, kargo: 91, ceza: 0, ekBedel: 0, urunMaliyeti: 684.18, netGelir: 642.04, netKar: -42.14, karMarji: -6.6, zararMi: true, zararNedeni: "Komisyon Farkı + Desi" },
  { id: "p3", siparisNo: "SPT-AMAZON-2026-0289", pazaryeri: "Amazon", brutSatis: 2450, iadeIptal: 0, komisyon: 388.25, kargo: 95, ceza: 0, ekBedel: 25, urunMaliyeti: 1960, netGelir: 1941.75, netKar: -18.25, karMarji: -0.9, zararMi: true, zararNedeni: "Komisyon Farkı" },
  { id: "p4", siparisNo: "SPT-N11-2026-0034", pazaryeri: "n11", brutSatis: 650, iadeIptal: 0, komisyon: 78, kargo: 62, ceza: 0, ekBedel: 0, urunMaliyeti: 481.5, netGelir: 510, netKar: 28.5, karMarji: 5.6, zararMi: false },
  { id: "p5", siparisNo: "SPT-TRENDYOL-2026-0087", pazaryeri: "Trendyol", brutSatis: 1899, iadeIptal: 0, komisyon: 260.22, kargo: 68, ceza: 15, ekBedel: 0, urunMaliyeti: 1557.78, netGelir: 1571, netKar: -1.78, karMarji: -0.1, zararMi: true, zararNedeni: "Ceza + Komisyon Farkı" },
  { id: "p6", siparisNo: "SPT-FLO-2026-0021", pazaryeri: "FLO", brutSatis: 1249, iadeIptal: 0, komisyon: 174.86, kargo: 112, ceza: 0, ekBedel: 0, urunMaliyeti: 1050.98, netGelir: 962.14, netKar: -88.84, karMarji: -9.2, zararMi: true, zararNedeni: "Yüksek Desi Farkı" },
  { id: "p7", siparisNo: "SPT-LCW-2026-0018", pazaryeri: "LCW", brutSatis: 549, iadeIptal: 0, komisyon: 79.6, kargo: 55, ceza: 0, ekBedel: 0, urunMaliyeti: 468.46, netGelir: 414.4, netKar: -54.06, karMarji: -13.1, zararMi: true, zararNedeni: "Komisyon Farkı" },
  { id: "p8", siparisNo: "SPT-TRENDYOL-2026-0112", pazaryeri: "Trendyol", brutSatis: 3299, iadeIptal: 0, komisyon: 395.88, kargo: 75, ceza: 0, ekBedel: 0, urunMaliyeti: 2475, netGelir: 2828.12, netKar: 353.12, karMarji: 12.5, zararMi: false },
  { id: "p9", siparisNo: "SPT-HEPSI-2026-0198", pazaryeri: "Hepsiburada", brutSatis: 1599, iadeIptal: 0, komisyon: 223.86, kargo: 68, ceza: 0, ekBedel: 0, urunMaliyeti: 1215.24, netGelir: 1307.14, netKar: 91.9, karMarji: 7.0, zararMi: false },
  { id: "p10", siparisNo: "SPT-AMAZON-2026-0341", pazaryeri: "Amazon", brutSatis: 4199, iadeIptal: 320, komisyon: 558.53, kargo: 95, ceza: 0, ekBedel: 18, urunMaliyeti: 3150, netGelir: 3207.47, netKar: 57.47, karMarji: 1.8, zararMi: false },
];

// Fark İnceleme Kuyruğu
export type KuyrukDurum = "Açık" | "İşlemde" | "Çözüldü";
export type OnemiDerecesi = "Yüksek" | "Orta" | "Düşük";
export type IslerTuru = "Komisyon" | "Desi/Kargo" | "Kârlılık";

export interface KuyrukKaydi {
  id: string;
  isTuru: IslerTuru;
  onemiDerecesi: OnemiDerecesi;
  siparisNo: string;
  pazaryeri: string;
  baslik: string;
  detay: string;
  atananKullanici: string;
  acilmaZamani: string;
  durum: KuyrukDurum;
  cozumAciklamasi?: string;
}

export const kuyrukKayitlari: KuyrukKaydi[] = [
  { id: "q1", isTuru: "Komisyon", onemiDerecesi: "Yüksek", siparisNo: "SPT-AMAZON-2026-0289", pazaryeri: "Amazon", baslik: "Komisyon oranı %14 yerine %15.85 uygulandı", detay: "Yoga Matı Deluxe ürününde beklenen %14 komisyon yerine %15.85 faturalanan. Fark: -45.25 TL", atananKullanici: "", acilmaZamani: "07.05.2026 08:30", durum: "Açık" },
  { id: "q2", isTuru: "Desi/Kargo", onemiDerecesi: "Yüksek", siparisNo: "SPT-FLO-2026-0021", pazaryeri: "FLO", baslik: "Desi 6 yerine 9 olarak faturalandı", detay: "Running Ayakkabı M42 için beklenen desi 6 iken 9 olarak faturalandı. Kargo farkı: -30 TL", atananKullanici: "Ahmet Yılmaz", acilmaZamani: "07.05.2026 09:15", durum: "İşlemde" },
  { id: "q3", isTuru: "Komisyon", onemiDerecesi: "Orta", siparisNo: "SPT-HEPSI-2026-0142", pazaryeri: "Hepsiburada", baslik: "Komisyon oranı farkı tespit edildi", detay: "Pro Koşu Şortu ürününde %14.5 yerine %16.6 komisyon uygulandı. Fark: -18.50 TL", atananKullanici: "", acilmaZamani: "07.05.2026 10:00", durum: "Açık" },
  { id: "q4", isTuru: "Desi/Kargo", onemiDerecesi: "Orta", siparisNo: "SPT-TRENDYOL-2026-0003", pazaryeri: "Trendyol", baslik: "Desi 3 yerine 4 fatura edildi", detay: "DryFit Antrenman Tişörtü için desi farkı 1 birim. Kargo farkı: -8 TL. Zarar eden sipariş.", atananKullanici: "Zeynep Arslan", acilmaZamani: "07.05.2026 11:20", durum: "İşlemde" },
  { id: "q5", isTuru: "Kârlılık", onemiDerecesi: "Yüksek", siparisNo: "SPT-LCW-2026-0018", pazaryeri: "LCW", baslik: "Negatif kâr marjı: -%13.1", detay: "Slim Fit Spor Eşofman sipariş -54.06 TL zarar. Hem komisyon farkı hem de düşük satış fiyatı etkisi.", atananKullanici: "", acilmaZamani: "06.05.2026 15:40", durum: "Açık" },
  { id: "q6", isTuru: "Komisyon", onemiDerecesi: "Orta", siparisNo: "SPT-TRENDYOL-2026-0087", pazaryeri: "Trendyol", baslik: "Manuel inceleme: komisyon kaynağı belirsiz", detay: "Fitness Eldiveni için komisyon hesaplama kaynağı 'Manuel Giriş'. Kategori oranı doğrulanmalı.", atananKullanici: "Ahmet Yılmaz", acilmaZamani: "06.05.2026 16:10", durum: "Çözüldü", cozumAciklamasi: "Kategori oranı kontrol edildi, manuel giriş doğrulandı ve fark kapatıldı." },
  { id: "q7", isTuru: "Desi/Kargo", onemiDerecesi: "Düşük", siparisNo: "SPT-PAZARAMA-2026-0009", pazaryeri: "Pazarama", baslik: "Desi farkı 1 birim - takipte", detay: "Protein Shaker Seti için desi 3 yerine 4. Kargo farkı 8 TL. Pazarama ile görüşülüyor.", atananKullanici: "", acilmaZamani: "05.05.2026 14:00", durum: "Açık" },
  { id: "q8", isTuru: "Komisyon", onemiDerecesi: "Düşük", siparisNo: "SPT-N11-2026-0034", pazaryeri: "n11", baslik: "n11 komisyon oranı yeniden kontrol", detay: "Spor Çorap Seti 3lü için komisyon uyumlu görünüyor ancak kategori eşleşmesi kontrol edilmeli.", atananKullanici: "Zeynep Arslan", acilmaZamani: "05.05.2026 10:30", durum: "Çözüldü", cozumAciklamasi: "Kategori eşleşmesi tekrar kontrol edildi, komisyon uyumu teyit edildi." },
];

// Pazaryeri Ayarları
export const pazaryeriListesi = [
  { id: "py1", ad: "Trendyol", aktif: true, entegrasyonTuru: "API + CSV", komisyonHesaplamaTuru: "Brüt Satış", sonGuncelleme: "01.04.2026" },
  { id: "py2", ad: "Hepsiburada", aktif: true, entegrasyonTuru: "CSV", komisyonHesaplamaTuru: "KDV Hariç", sonGuncelleme: "01.04.2026" },
  { id: "py3", ad: "Amazon", aktif: true, entegrasyonTuru: "API + XLSX", komisyonHesaplamaTuru: "Brüt Satış", sonGuncelleme: "15.03.2026" },
  { id: "py4", ad: "n11", aktif: true, entegrasyonTuru: "CSV", komisyonHesaplamaTuru: "Brüt Satış", sonGuncelleme: "01.03.2026" },
  { id: "py5", ad: "Pazarama", aktif: true, entegrasyonTuru: "XLSX", komisyonHesaplamaTuru: "Brüt Satış", sonGuncelleme: "15.02.2026" },
  { id: "py6", ad: "LCW", aktif: false, entegrasyonTuru: "CSV", komisyonHesaplamaTuru: "İndirim Sonrası", sonGuncelleme: "01.02.2026" },
  { id: "py7", ad: "FLO", aktif: true, entegrasyonTuru: "XLSX", komisyonHesaplamaTuru: "Brüt Satış", sonGuncelleme: "01.01.2026" },
];

export const komisyonOranlari = [
  { id: "ko1", pazaryeri: "Trendyol", kategori: "Spor Giyim", alt_kategori: "Tişört", oran: 12, gecerlilikBaslangic: "01.01.2026", gecerlilikBitis: "31.12.2026" },
  { id: "ko2", pazaryeri: "Trendyol", kategori: "Spor Giyim", alt_kategori: "Şort", oran: 12, gecerlilikBaslangic: "01.01.2026", gecerlilikBitis: "31.12.2026" },
  { id: "ko3", pazaryeri: "Hepsiburada", kategori: "Spor Giyim", alt_kategori: "Tişört", oran: 14.5, gecerlilikBaslangic: "01.01.2026", gecerlilikBitis: "31.12.2026" },
  { id: "ko4", pazaryeri: "Amazon", kategori: "Spor & Outdoor", alt_kategori: "Fitness", oran: 14, gecerlilikBaslangic: "01.01.2026", gecerlilikBitis: "31.12.2026" },
  { id: "ko5", pazaryeri: "n11", kategori: "Spor", alt_kategori: "Çorap", oran: 12, gecerlilikBaslangic: "01.01.2026", gecerlilikBitis: "31.12.2026" },
  { id: "ko6", pazaryeri: "FLO", kategori: "Spor Ayakkabı", alt_kategori: "Koşu", oran: 14, gecerlilikBaslangic: "01.01.2026", gecerlilikBitis: "31.12.2026" },
];

// Kullanıcılar ve Loglar
export const kullanicilar = [
  { id: "u1", adSoyad: "Ahmet Yılmaz", eposta: "ahmet.yilmaz@sporthink.com.tr", rol: "Finans Müdürü", aktif: true, olusturmaZamani: "15.01.2025" },
  { id: "u2", adSoyad: "Fatma Demir", eposta: "fatma.demir@sporthink.com.tr", rol: "Operasyon Uzmanı", aktif: true, olusturmaZamani: "20.01.2025" },
  { id: "u3", adSoyad: "Mehmet Çelik", eposta: "mehmet.celik@sporthink.com.tr", rol: "Veri Analist", aktif: true, olusturmaZamani: "01.02.2025" },
  { id: "u4", adSoyad: "Zeynep Arslan", eposta: "zeynep.arslan@sporthink.com.tr", rol: "Operasyon Uzmanı", aktif: true, olusturmaZamani: "10.03.2025" },
  { id: "u5", adSoyad: "Hasan Kaya", eposta: "hasan.kaya@sporthink.com.tr", rol: "Sistem Yöneticisi", aktif: false, olusturmaZamani: "05.01.2025" },
];

export const denetimLoglari = [
  { id: "l1", kullanici: "Ahmet Yılmaz", aksiyon: "IMPORT", varlikAdi: "hamurlabs_siparisler_nisan2026.xlsx", varlikId: "AKT-001", ipAdresi: "10.0.1.42", zaman: "07.05.2026 09:14:22" },
  { id: "l2", kullanici: "Ahmet Yılmaz", aksiyon: "IMPORT", varlikAdi: "hamurlabs_iade_nisan2026.xlsx", varlikId: "AKT-002", ipAdresi: "10.0.1.42", zaman: "07.05.2026 09:18:05" },
  { id: "l3", kullanici: "Fatma Demir", aksiyon: "IMPORT", varlikAdi: "hitit_satis_nisan2026.csv", varlikId: "AKT-003", ipAdresi: "10.0.1.55", zaman: "07.05.2026 10:02:11" },
  { id: "l4", kullanici: "Mehmet Çelik", aksiyon: "IMPORT", varlikAdi: "trendyol_finans_nisan2026.xlsx", varlikId: "AKT-005", ipAdresi: "10.0.1.67", zaman: "07.05.2026 11:30:44" },
  { id: "l5", kullanici: "Mehmet Çelik", aksiyon: "IMPORT_ERROR", varlikAdi: "hepsiburada_fatura_nisan2026.xlsx", varlikId: "AKT-006", ipAdresi: "10.0.1.67", zaman: "07.05.2026 11:45:18" },
  { id: "l6", kullanici: "Fatma Demir", aksiyon: "QUEUE_UPDATE", varlikAdi: "SPT-FLO-2026-0021", varlikId: "q2", ipAdresi: "10.0.1.55", zaman: "07.05.2026 12:10:33" },
  { id: "l7", kullanici: "Ahmet Yılmaz", aksiyon: "QUEUE_RESOLVE", varlikAdi: "SPT-TRENDYOL-2026-0087", varlikId: "q6", ipAdresi: "10.0.1.42", zaman: "06.05.2026 16:45:00" },
  { id: "l8", kullanici: "Zeynep Arslan", aksiyon: "IMPORT", varlikAdi: "amazon_settlement_nisan2026.xlsx", varlikId: "AKT-007", ipAdresi: "10.0.1.89", zaman: "07.05.2026 13:10:28" },
  { id: "l9", kullanici: "Zeynep Arslan", aksiyon: "IMPORT", varlikAdi: "n11_komisyon_nisan2026.csv", varlikId: "AKT-008", ipAdresi: "10.0.1.89", zaman: "07.05.2026 13:40:55" },
  { id: "l10", kullanici: "Fatma Demir", aksiyon: "LOGIN", varlikAdi: "—", varlikId: "—", ipAdresi: "10.0.1.55", zaman: "07.05.2026 08:55:01" },
];

export const formatTL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(n);

export const formatSayi = (n: number) =>
  new Intl.NumberFormat("tr-TR").format(n);

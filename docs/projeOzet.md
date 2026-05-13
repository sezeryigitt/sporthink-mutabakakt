# Sporthink Mutabakat Backend Handover

## 1. Projenin Genel Ozeti ve Amaci

Sporthink Mutabakat, Sporthink firmasinin pazaryeri satislarini siparis bazinda komisyon, desi/kargo ve karlilik acisindan kontrol eden bir mutabakat sistemidir.

Ana veri kaynaklari:

- Hamurlabs: pazaryeri siparisleri ve iade/iptal satirlari.
- Hitit/ERP: satis faturasi, iade faturasi, urun ve maliyet bilgileri.
- Pazaryeri raporlari/faturalari: komisyon, kargo/desi, ceza, ek bedel, indirim, stopaj ve diger finansal hareketler.

Ana hedef:

- `siparis_no` uzerinden Hamurlabs, Hitit ve pazaryeri finans verilerini eslestirmek.
- Beklenen komisyon ile faturalanan komisyonu karsilastirmak.
- Beklenen desi/kargo ile pazaryerinin faturalandirdigi desi/kargo degerini karsilastirmak.
- Siparis bazinda net gelir, net kar, zarar durumu ve mutabakat farklarini raporlamak.

Canli veritabani:

- Veritabani: `sporthinkmutabakat`
- Motor: MySQL 8.0.44 Azure
- Charset/collation: `utf8mb4`, `utf8mb4_turkish_ci`
- Migration dosyalari:
  - `migrations/001_initial_marketplace_schema.sql`
  - `migrations/002_simplify_reconciliation_scope.sql`

## 2. Mimari Kararlar

- Sistem pazaryeri merkezlidir; ana is tablolarinda `pazaryeri_id` bulunur.
- Ana operasyonel baglanti kolonu `siparis_no` olarak belirlenmistir.
- Tablo ve kolon adlari Turkce is terimleriyle, ASCII karakterlerle yazilir.
- Excel/CSV kaynak satirlari kaybolmaz; ham satirlar JSON olarak saklanir.
- Beklenen degerler sistem/ERP/parametrelerden hesaplanir.
- Faturalanan degerler pazaryeri fatura veya finans raporlarindan gelir.
- Desi/kargo tarafinda dogrudan kargo firmasi faturasi importu yoktur.
- Desi/kargo icin faturalanan degerler `pazaryeri_finansal_hareketleri` tablosundan okunur.
- Banka, POS, muhasebe defteri ve dogrudan kargo firmasi fatura mutabakati kapsam disidir.

## 3. Veritabani Semasi

### 3.1 Referans Tablolari

#### `pazaryerleri`

Pazaryeri ana referans tablosu.

| Kolon | Tip | Not |
|---|---|---|
| `pazaryeri_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_kodu` | `varchar(30)` | Unique |
| `pazaryeri_adi` | `varchar(100)` |  |
| `aktif_mi` | `tinyint(1)` |  |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `pazaryeri_hesaplari`

Pazaryeri altinda satici/magaza bilgileri.

| Kolon | Tip | Not |
|---|---|---|
| `pazaryeri_hesap_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `satici_kodu` | `varchar(80)` | Nullable |
| `satici_adi` | `varchar(150)` | Nullable |
| `magaza_kodu` | `varchar(80)` | Nullable |
| `magaza_adi` | `varchar(150)` | Nullable |
| `vergi_no` | `varchar(30)` | Nullable |
| `aktif_mi` | `tinyint(1)` |  |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `kargo_firmalari`

Kargo firmasi referansi.

| Kolon | Tip | Not |
|---|---|---|
| `kargo_firma_id` | `bigint unsigned` | PK, auto increment |
| `kargo_firma_kodu` | `varchar(40)` | Unique |
| `kargo_firma_adi` | `varchar(120)` |  |
| `aktif_mi` | `tinyint(1)` |  |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `urun_kategorileri`

Urun kategori agaci.

| Kolon | Tip | Not |
|---|---|---|
| `urun_kategori_id` | `bigint unsigned` | PK, auto increment |
| `kategori_adi` | `varchar(180)` | Unique |
| `ust_kategori_id` | `bigint unsigned` | FK -> `urun_kategorileri.urun_kategori_id`, nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `urunler`

Urun, barkod, SKU ve maliyet bilgileri.

| Kolon | Tip | Not |
|---|---|---|
| `urun_id` | `bigint unsigned` | PK, auto increment |
| `barkod` | `varchar(80)` | Unique |
| `sku` | `varchar(100)` | Indexed, nullable |
| `stok_kodu` | `varchar(100)` | Nullable |
| `urun_adi` | `varchar(255)` | Nullable |
| `marka` | `varchar(120)` | Nullable |
| `urun_kategori_id` | `bigint unsigned` | FK -> `urun_kategorileri.urun_kategori_id`, nullable |
| `birim_maliyet` | `decimal(18,4)` | Nullable |
| `aktif_mi` | `tinyint(1)` |  |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `pazaryeri_urun_eslesmeleri`

Sporthink urunleri ile pazaryeri urun kodlari eslesmesi.

| Kolon | Tip | Not |
|---|---|---|
| `pazaryeri_urun_eslesme_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id` |
| `pazaryeri_sku` | `varchar(120)` | Indexed, nullable |
| `pazaryeri_urun_kodu` | `varchar(120)` | Nullable |
| `pazaryeri_kategori_adi` | `varchar(180)` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `kesinti_kategorileri`

Pazaryeri finans hareketlerinin siniflandirma tablosu.

| Kolon | Tip | Not |
|---|---|---|
| `kesinti_kategori_id` | `bigint unsigned` | PK, auto increment |
| `kesinti_kodu` | `varchar(60)` | Unique |
| `kesinti_adi` | `varchar(120)` |  |
| `ana_grup` | `enum('komisyon','kargo','ceza','ek_bedel','indirim','vergi','iade','odeme','diger')` | Indexed |
| `varsayilan_yon` | `enum('gelir','gider')` |  |
| `pazaryeri_icin_zorunlu_mu` | `tinyint(1)` |  |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `pazaryeri_zorunlu_kesintileri`

Pazaryeri bazinda zorunlu takip edilecek kesinti tipleri.

| Kolon | Tip | Not |
|---|---|---|
| `pazaryeri_zorunlu_kesinti_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `kesinti_kategori_id` | `bigint unsigned` | FK -> `kesinti_kategorileri.kesinti_kategori_id` |
| `olusturma_zamani` | `timestamp` |  |

#### `pazaryeri_komisyon_oranlari`

Beklenen komisyon hesaplama parametreleri.

| Kolon | Tip | Not |
|---|---|---|
| `komisyon_oran_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `urun_kategori_id` | `bigint unsigned` | FK -> `urun_kategorileri.urun_kategori_id`, nullable |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id`, nullable |
| `oran_yuzde` | `decimal(9,4)` |  |
| `gecerlilik_baslangic` | `date` |  |
| `gecerlilik_bitis` | `date` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `pazaryeri_kargo_desi_ucretleri`

Opsiyonel beklenen kargo/desi tarife tablosu.

| Kolon | Tip | Not |
|---|---|---|
| `kargo_desi_ucret_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `kargo_firma_id` | `bigint unsigned` | FK -> `kargo_firmalari.kargo_firma_id`, nullable |
| `desi_degeri` | `decimal(10,2)` |  |
| `tutar` | `decimal(18,4)` |  |
| `kdv_dahil_mi` | `tinyint(1)` |  |
| `gecerlilik_baslangic` | `date` |  |
| `gecerlilik_bitis` | `date` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

### 3.2 Import ve Kaynak Belge Tablolari

#### `aktarim_partileri`

Dosya/import parti bilgisi.

| Kolon | Tip | Not |
|---|---|---|
| `aktarim_parti_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id`, nullable |
| `kaynak_sistem` | `enum('hamurlabs','hitit','pazaryeri')` | Indexed |
| `veri_turu` | `enum('pazaryeri_siparisi','pazaryeri_iade_iptal','pazaryeri_faturasi','erp_satis','erp_iade')` | Indexed |
| `kaynak_dosya_yolu` | `varchar(600)` |  |
| `kaynak_dosya_adi` | `varchar(255)` |  |
| `satir_sayisi` | `int unsigned` | Nullable |
| `aktarim_durumu` | `enum('bekliyor','aktarildi','dogrulandi','hatali')` | Default `bekliyor` |
| `aktaran_kullanici` | `varchar(120)` | Nullable |
| `aktarim_zamani` | `timestamp` |  |
| `aciklama` | `text` | Nullable |

#### `ham_aktarim_satirlari`

Kaynak dosyadan gelen ham satirlarin JSON saklama katmani.

| Kolon | Tip | Not |
|---|---|---|
| `ham_aktarim_satir_id` | `bigint unsigned` | PK, auto increment |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id` |
| `kaynak_satir_no` | `int unsigned` |  |
| `satir_hash` | `char(64)` | Indexed, nullable |
| `ham_veri` | `json` | Orijinal satir |
| `dogrulama_durumu` | `enum('bekliyor','gecerli','uyari','hata')` | Default `bekliyor` |
| `olusturma_zamani` | `timestamp` |  |

#### `kaynak_belgeler`

Pazaryeri kaynakli fatura/rapor/ekstre belge basligi.

| Kolon | Tip | Not |
|---|---|---|
| `kaynak_belge_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id`, nullable |
| `pazaryeri_hesap_id` | `bigint unsigned` | FK -> `pazaryeri_hesaplari.pazaryeri_hesap_id`, nullable |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id`, nullable |
| `belge_turu` | `enum('pazaryeri_komisyon_faturasi','pazaryeri_kargo_kesinti_faturasi','pazaryeri_hizmet_bedeli_faturasi','pazaryeri_finans_raporu','pazaryeri_iade_raporu','pazaryeri_faturasi')` | Belge kategorisi |
| `belge_no` | `varchar(100)` | Dis belge/fatura/rapor numarasi, indexed, nullable |
| `belge_tarihi` | `date` | Nullable |
| `donem_baslangic` | `date` | Nullable |
| `donem_bitis` | `date` | Nullable |
| `toplam_tutar` | `decimal(18,4)` | Nullable |
| `kdv_tutari` | `decimal(18,4)` | Nullable |
| `aciklama` | `text` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

### 3.3 Operasyonel Veri Tablolari

#### `siparis_satirlari`

Hamurlabs pazaryeri siparis satirlari. Ana operasyonel omurga tablosudur.

| Kolon | Tip | Not |
|---|---|---|
| `siparis_satir_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `pazaryeri_hesap_id` | `bigint unsigned` | FK -> `pazaryeri_hesaplari.pazaryeri_hesap_id`, nullable |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id`, nullable |
| `siparis_no` | `varchar(100)` | Ana eslestirme anahtari, indexed |
| `pazaryeri_siparis_no` | `varchar(100)` | Nullable |
| `paket_no` | `varchar(100)` | Nullable |
| `takip_no` | `varchar(120)` | Nullable |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id`, nullable |
| `barkod` | `varchar(80)` | Indexed, nullable |
| `sku` | `varchar(100)` | Nullable |
| `urun_adi` | `varchar(255)` | Nullable |
| `adet` | `decimal(18,4)` |  |
| `birim_fiyat` | `decimal(18,4)` | Nullable |
| `brut_tutar` | `decimal(18,4)` | Nullable |
| `kdv_orani` | `decimal(7,4)` | Nullable |
| `kdv_haric_tutar` | `decimal(18,4)` | Nullable |
| `siparis_durumu` | `varchar(80)` | Nullable |
| `siparis_olusturma_zamani` | `datetime` | Indexed, nullable |
| `kargo_gonderim_zamani` | `datetime` | Nullable |
| `kargo_firma_id` | `bigint unsigned` | FK -> `kargo_firmalari.kargo_firma_id`, nullable |
| `tahmini_desi` | `decimal(10,2)` | Nullable |
| `pazaryeri_fiyati` | `decimal(18,4)` | Nullable |
| `ham_veri` | `json` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `pazaryeri_iade_iptal_satirlari`

Hamurlabs/pazaryeri iade ve iptal satirlari.

| Kolon | Tip | Not |
|---|---|---|
| `pazaryeri_iade_iptal_satir_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `siparis_satir_id` | `bigint unsigned` | FK -> `siparis_satirlari.siparis_satir_id`, nullable |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id`, nullable |
| `siparis_no` | `varchar(100)` | Indexed |
| `paket_no` | `varchar(100)` | Nullable |
| `barkod` | `varchar(80)` | Indexed, nullable |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id`, nullable |
| `iade_iptal_turu` | `enum('iade','iptal')` |  |
| `neden` | `varchar(255)` | Nullable |
| `adet` | `decimal(18,4)` |  |
| `tutar` | `decimal(18,4)` | Nullable |
| `iade_iptal_zamani` | `datetime` | Nullable |
| `durum` | `varchar(80)` | Nullable |
| `ham_veri` | `json` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `erp_satis_satirlari`

Hitit/ERP satis ve maliyet satirlari.

| Kolon | Tip | Not |
|---|---|---|
| `erp_satis_satir_id` | `bigint unsigned` | PK, auto increment |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id`, nullable |
| `siparis_no` | `varchar(100)` | Indexed |
| `satis_yeri_kodu` | `varchar(80)` | Nullable |
| `satis_yeri_adi` | `varchar(150)` | Nullable |
| `fatura_no` | `varchar(100)` | Nullable |
| `belge_takip_no` | `varchar(120)` | Nullable |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id`, nullable |
| `barkod` | `varchar(80)` | Indexed, nullable |
| `sku` | `varchar(100)` | Nullable |
| `marka` | `varchar(120)` | Nullable |
| `musteri_kodu` | `varchar(100)` | Nullable |
| `musteri_adi` | `varchar(180)` | Nullable |
| `adet` | `decimal(18,4)` |  |
| `birim_maliyet` | `decimal(18,4)` | Nullable |
| `toplam_maliyet` | `decimal(18,4)` | Nullable |
| `kdv_haric_tutar` | `decimal(18,4)` | Nullable |
| `kdv_tutari` | `decimal(18,4)` | Nullable |
| `kdv_dahil_tutar` | `decimal(18,4)` | Nullable |
| `fatura_tarihi` | `date` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `erp_iade_satirlari`

Hitit/ERP iade satirlari.

| Kolon | Tip | Not |
|---|---|---|
| `erp_iade_satir_id` | `bigint unsigned` | PK, auto increment |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id`, nullable |
| `siparis_no` | `varchar(100)` | Indexed |
| `iade_fatura_no` | `varchar(100)` | Nullable |
| `asil_fatura_no` | `varchar(100)` | Nullable |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id`, nullable |
| `barkod` | `varchar(80)` | Indexed, nullable |
| `sku` | `varchar(100)` | Nullable |
| `marka` | `varchar(120)` | Nullable |
| `musteri_kodu` | `varchar(100)` | Nullable |
| `musteri_adi` | `varchar(180)` | Nullable |
| `adet` | `decimal(18,4)` |  |
| `kdv_haric_tutar` | `decimal(18,4)` | Nullable |
| `kdv_tutari` | `decimal(18,4)` | Nullable |
| `kdv_dahil_tutar` | `decimal(18,4)` | Nullable |
| `iade_fatura_tarihi` | `date` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `pazaryeri_finansal_hareketleri`

Pazaryeri rapor/faturalarindan gelen gerceklesen finans hareketleri.

| Kolon | Tip | Not |
|---|---|---|
| `pazaryeri_finansal_hareket_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `siparis_satir_id` | `bigint unsigned` | FK -> `siparis_satirlari.siparis_satir_id`, nullable |
| `kaynak_belge_id` | `bigint unsigned` | FK -> `kaynak_belgeler.kaynak_belge_id`, nullable |
| `aktarim_parti_id` | `bigint unsigned` | FK -> `aktarim_partileri.aktarim_parti_id`, nullable |
| `kesinti_kategori_id` | `bigint unsigned` | FK -> `kesinti_kategorileri.kesinti_kategori_id` |
| `siparis_no` | `varchar(100)` | Indexed |
| `pazaryeri_siparis_no` | `varchar(100)` | Nullable |
| `paket_no` | `varchar(100)` | Nullable |
| `barkod` | `varchar(80)` | Nullable |
| `urun_id` | `bigint unsigned` | FK -> `urunler.urun_id`, nullable |
| `hareket_yonu` | `enum('gelir','gider')` |  |
| `tutar` | `decimal(18,4)` |  |
| `kdv_tutari` | `decimal(18,4)` | Nullable |
| `adet` | `decimal(18,4)` | Nullable |
| `desi` | `decimal(10,2)` | Nullable |
| `komisyon_orani_yuzde` | `decimal(9,4)` | Nullable |
| `islem_zamani` | `datetime` | Indexed, nullable |
| `vade_tarihi` | `date` | Nullable |
| `fatura_no` | `varchar(100)` | Nullable |
| `dis_kayit_no` | `varchar(120)` | Nullable |
| `aciklama` | `text` | Nullable |
| `ham_veri` | `json` | Nullable |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

### 3.4 Mutabakat ve Analiz Tablolari

#### `komisyon_mutabakatlari`

Beklenen ve faturalanan komisyon karsilastirmasi.

| Kolon | Tip | Not |
|---|---|---|
| `komisyon_mutabakat_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `siparis_satir_id` | `bigint unsigned` | FK -> `siparis_satirlari.siparis_satir_id`, nullable |
| `siparis_no` | `varchar(100)` | Indexed |
| `barkod` | `varchar(80)` | Nullable |
| `hesaplanan_matrah_tutari` | `decimal(18,4)` | Nullable |
| `beklenen_oran_yuzde` | `decimal(9,4)` | Nullable |
| `faturalanan_oran_yuzde` | `decimal(9,4)` | Nullable |
| `beklenen_komisyon_tutari` | `decimal(18,4)` | Nullable |
| `faturalanan_komisyon_tutari` | `decimal(18,4)` | Nullable |
| `fark_tutari` | `decimal(18,4)` | Stored generated |
| `tolerans_tutari` | `decimal(18,4)` | Default `0.0500` |
| `mutabakat_durumu` | `enum('uyumlu','fark_var','beklenen_eksik','fatura_eksik','manuel_inceleme')` | Default `manuel_inceleme` |
| `hesaplama_zamani` | `timestamp` |  |
| `inceleyen_kullanici` | `varchar(120)` | Nullable |
| `inceleme_zamani` | `datetime` | Nullable |
| `aciklama` | `text` | Nullable |

#### `desi_mutabakatlari`

Beklenen ve faturalanan desi/kargo karsilastirmasi.

| Kolon | Tip | Not |
|---|---|---|
| `desi_mutabakat_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `siparis_satir_id` | `bigint unsigned` | FK -> `siparis_satirlari.siparis_satir_id`, nullable |
| `pazaryeri_finansal_hareket_id` | `bigint unsigned` | FK -> `pazaryeri_finansal_hareketleri.pazaryeri_finansal_hareket_id`, nullable |
| `siparis_no` | `varchar(100)` | Indexed |
| `paket_no` | `varchar(100)` | Nullable |
| `takip_no` | `varchar(120)` | Indexed, nullable |
| `kargo_firma_id` | `bigint unsigned` | FK -> `kargo_firmalari.kargo_firma_id`, nullable |
| `beklenen_desi` | `decimal(10,2)` | Nullable |
| `faturalanan_desi` | `decimal(10,2)` | Nullable |
| `beklenen_kargo_tutari` | `decimal(18,4)` | Nullable |
| `faturalanan_kargo_tutari` | `decimal(18,4)` | Nullable |
| `desi_farki` | `decimal(10,2)` | Stored generated |
| `tutar_farki` | `decimal(18,4)` | Stored generated |
| `tolerans_tutari` | `decimal(18,4)` | Default `0.0500` |
| `mutabakat_durumu` | `enum('uyumlu','fark_var','beklenen_eksik','fatura_eksik','manuel_inceleme')` | Default `manuel_inceleme` |
| `hesaplama_zamani` | `timestamp` |  |
| `inceleyen_kullanici` | `varchar(120)` | Nullable |
| `inceleme_zamani` | `datetime` | Nullable |
| `aciklama` | `text` | Nullable |

#### `siparis_karlilik_ozetleri`

Siparis bazinda kar/zarar ve genel mutabakat sonucu.

| Kolon | Tip | Not |
|---|---|---|
| `siparis_karlilik_ozet_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `siparis_no` | `varchar(100)` | Indexed |
| `ozet_tarihi` | `date` |  |
| `brut_satis_tutari` | `decimal(18,4)` | Default `0.0000` |
| `iade_iptal_tutari` | `decimal(18,4)` | Default `0.0000` |
| `komisyon_gideri` | `decimal(18,4)` | Default `0.0000` |
| `kargo_gideri` | `decimal(18,4)` | Default `0.0000` |
| `ceza_gideri` | `decimal(18,4)` | Default `0.0000` |
| `ek_bedel_gideri` | `decimal(18,4)` | Default `0.0000` |
| `indirim_tutari` | `decimal(18,4)` | Default `0.0000` |
| `vergi_gideri` | `decimal(18,4)` | Default `0.0000` |
| `desi_farki_tutari` | `decimal(18,4)` | Default `0.0000` |
| `komisyon_farki_tutari` | `decimal(18,4)` | Default `0.0000` |
| `urun_maliyeti` | `decimal(18,4)` | Default `0.0000` |
| `net_gelir` | `decimal(18,4)` | Default `0.0000` |
| `net_kar` | `decimal(18,4)` | Indexed, default `0.0000` |
| `kar_marji_yuzde` | `decimal(9,4)` | Nullable |
| `genel_mutabakat_durumu` | `enum('uyumlu','fark_var','manuel_inceleme')` | Default `uyumlu` |
| `zarar_mi` | `tinyint(1)` | Default `0` |
| `hesaplama_zamani` | `timestamp` |  |

#### `mutabakat_is_kuyrugu`

Fark veya manuel inceleme gerektiren islerin takip kuyrugu.

| Kolon | Tip | Not |
|---|---|---|
| `mutabakat_is_id` | `bigint unsigned` | PK, auto increment |
| `pazaryeri_id` | `bigint unsigned` | FK -> `pazaryerleri.pazaryeri_id` |
| `siparis_no` | `varchar(100)` |  |
| `is_turu` | `enum('komisyon','desi','odeme','iade','karlilik','diger')` |  |
| `onem_derecesi` | `enum('dusuk','orta','yuksek','kritik')` | Default `orta` |
| `is_durumu` | `enum('acik','islemde','cozuldu','yok_sayildi')` | Indexed, default `acik` |
| `acilma_zamani` | `timestamp` |  |
| `kapanma_zamani` | `datetime` | Nullable |

### 3.5 Guvenlik ve Log Tablolari

#### `kullanicilar`

| Kolon | Tip | Not |
|---|---|---|
| `kullanici_id` | `bigint unsigned` | PK, auto increment |
| `eposta` | `varchar(180)` | Unique |
| `ad_soyad` | `varchar(180)` |  |
| `parola_hash` | `varchar(255)` |  |
| `aktif_mi` | `tinyint(1)` |  |
| `olusturma_zamani` | `timestamp` |  |
| `guncelleme_zamani` | `timestamp` | on update |

#### `roller`

| Kolon | Tip | Not |
|---|---|---|
| `rol_id` | `bigint unsigned` | PK, auto increment |
| `rol_kodu` | `varchar(50)` | Unique |
| `rol_adi` | `varchar(100)` |  |
| `olusturma_zamani` | `timestamp` |  |

#### `kullanici_rolleri`

| Kolon | Tip | Not |
|---|---|---|
| `kullanici_id` | `bigint unsigned` | PK, FK -> `kullanicilar.kullanici_id` |
| `rol_id` | `bigint unsigned` | PK, FK -> `roller.rol_id` |
| `olusturma_zamani` | `timestamp` |  |

#### `denetim_loglari`

| Kolon | Tip | Not |
|---|---|---|
| `denetim_log_id` | `bigint unsigned` | PK, auto increment |
| `kullanici_id` | `bigint unsigned` | FK -> `kullanicilar.kullanici_id`, nullable |
| `aksiyon` | `varchar(120)` |  |
| `varlik_adi` | `varchar(120)` | Indexed, nullable |
| `varlik_id` | `varchar(120)` | Nullable |
| `ip_adresi` | `varchar(60)` | Nullable |
| `kullanici_aracisi` | `varchar(255)` | Nullable |
| `ek_veri` | `json` | Nullable |
| `olusturma_zamani` | `timestamp` | Indexed |

### 3.6 View'lar

#### `vw_pazaryeri_zorunlu_kesinti_durumu`

Pazaryeri bazinda zorunlu kesinti kategorilerini listeler.

Alanlar:

- `pazaryeri_id`
- `pazaryeri_kodu`
- `pazaryeri_adi`
- `kesinti_kodu`
- `kesinti_adi`
- `ana_grup`
- `zorunlu_mu`

#### `vw_siparis_finans_ozeti`

Siparis ve pazaryeri bazinda finansal hareket ozetini verir.

Alanlar:

- `pazaryeri_id`
- `pazaryeri_kodu`
- `siparis_no`
- `brut_satis_tutari`
- `komisyon_gideri`
- `kargo_gideri`
- `ceza_gideri`
- `ek_bedel_gideri`
- `diger_gelir_tutari`
- `toplam_gider_tutari`

## 4. Temel Iliskiler

- `pazaryerleri` -> `pazaryeri_hesaplari`
- `pazaryerleri` -> `aktarim_partileri`
- `aktarim_partileri` -> `ham_aktarim_satirlari`
- `pazaryerleri` / `pazaryeri_hesaplari` / `aktarim_partileri` -> `kaynak_belgeler`
- `urun_kategorileri` -> `urunler`
- `pazaryerleri` + `urunler` -> `pazaryeri_urun_eslesmeleri`
- `pazaryerleri` + `urunler`/`urun_kategorileri` -> `pazaryeri_komisyon_oranlari`
- `pazaryerleri` + `kargo_firmalari` -> `pazaryeri_kargo_desi_ucretleri`
- `siparis_satirlari` -> `pazaryeri_iade_iptal_satirlari`
- `siparis_satirlari` -> `pazaryeri_finansal_hareketleri`
- `kaynak_belgeler` -> `pazaryeri_finansal_hareketleri`
- `kesinti_kategorileri` -> `pazaryeri_finansal_hareketleri`
- `siparis_satirlari` -> `komisyon_mutabakatlari`
- `siparis_satirlari` -> `desi_mutabakatlari`
- `pazaryeri_finansal_hareketleri` -> `desi_mutabakatlari`
- `pazaryerleri` + `siparis_no` -> `siparis_karlilik_ozetleri`
- `pazaryerleri` + `siparis_no` -> `mutabakat_is_kuyrugu`
- `kullanicilar` + `roller` -> `kullanici_rolleri`
- `kullanicilar` -> `denetim_loglari`

## 5. Belirlenen Is Kurallari ve Kisitlamalar

### 5.1 Kapsam

- Kapsamda: pazaryeri siparisleri, iade/iptal, pazaryeri finans/fatura raporlari, Hitit satis/iade/maliyet, komisyon mutabakati, desi/kargo mutabakati, siparis karliligi.
- Kapsam disi: banka/POS/havale mutabakati, muhasebe defteri mutabakati, dogrudan kargo firmasi faturasi importu.

### 5.2 Ana Eslestirme Kurallari

- Birincil is anahtari `siparis_no` olarak kullanilir.
- Mümkun oldugunda eslestirme `pazaryeri_id + siparis_no` ile yapilir.
- Satir seviyesinde ek eslestirme icin `siparis_satir_id`, `barkod`, `paket_no`, `takip_no`, `pazaryeri_siparis_no` kullanilabilir.
- `ham_veri` alanlari kaynak satiri korumak icindir; is kurallari normalize tablolardaki kolonlar uzerinden calismalidir.

### 5.3 Komisyon Kurallari

- Beklenen komisyon `pazaryeri_komisyon_oranlari` ve siparis tutarlari uzerinden hesaplanir.
- Faturalanan komisyon `pazaryeri_finansal_hareketleri` icinde `kesinti_kategorileri.ana_grup = 'komisyon'` olan hareketlerden okunur.
- `komisyon_mutabakatlari.fark_tutari`, faturalanan komisyon eksi beklenen komisyon mantigiyla stored generated alandir.
- `mutabakat_durumu` degerleri: `uyumlu`, `fark_var`, `beklenen_eksik`, `fatura_eksik`, `manuel_inceleme`.
- Varsayilan tolerans `0.0500` olarak modellenmistir.

### 5.4 Desi/Kargo Kurallari

- Beklenen desi/kargo tutari siparis/ERP verisi veya opsiyonel `pazaryeri_kargo_desi_ucretleri` tablosundan hesaplanabilir.
- Faturalanan desi/kargo degeri dogrudan kargo firmasi faturasindan degil, pazaryeri finans/fatura raporundan gelir.
- Faturalanan kargo/desi hareketi `pazaryeri_finansal_hareketleri` icinde `kesinti_kategorileri.ana_grup = 'kargo'` olan hareketlerdir.
- `desi_mutabakatlari.pazaryeri_finansal_hareket_id`, ilgili faturalanan kargo/desi hareketine baglanir.
- `desi_farki` ve `tutar_farki` stored generated alanlardir.

### 5.5 Karlilik Kurallari

- Siparis karliligi `siparis_karlilik_ozetleri` tablosunda tutulur.
- Komisyon, kargo, ceza, ek bedel, indirim, vergi ve urun maliyeti net gelir/net kar hesabina etki eder.
- `desi_farki_tutari` ve `komisyon_farki_tutari`, siparisin mutabakat farki etkisini gosterir.
- `genel_mutabakat_durumu = 'fark_var'` ise siparis yonetim/incedeme ekranlarinda farkli kayit olarak ele alinmalidir.
- `zarar_mi = 1` ise siparis zarar etmistir.

### 5.6 Import Kurallari

- Her dosya yukleme islemi once `aktarim_partileri` kaydi olusturmalidir.
- Kaynak satirlar `ham_aktarim_satirlari.ham_veri` icinde JSON olarak saklanmalidir.
- Normalize is tablolarina yazim, ham veriden sonra yapilmalidir.
- `kaynak_sistem` sadece `hamurlabs`, `hitit`, `pazaryeri` olabilir.
- `veri_turu` sadece `pazaryeri_siparisi`, `pazaryeri_iade_iptal`, `pazaryeri_faturasi`, `erp_satis`, `erp_iade` olabilir.

### 5.7 Kaynak Belge Kurallari

- `kaynak_belgeler` operasyonel hareket tablosu degildir; belge basligi/izlenebilirlik tablosudur.
- `belge_turu`, belgenin is kategorisini belirtir.
- `belge_no`, pazaryeri veya dis sistemdeki fatura/rapor/ekstre numarasidir.
- `pazaryeri_finansal_hareketleri.kaynak_belge_id`, hareketin hangi kaynak belgeye dayandigini gosterir.

### 5.8 Durum ve Kuyruk Kurallari

- Mutabakat farklari veya eksik veri durumlari `mutabakat_is_kuyrugu` ile takip edilir.
- Is durumlari: `acik`, `islemde`, `cozuldu`, `yok_sayildi`.
- Onem dereceleri: `dusuk`, `orta`, `yuksek`, `kritik`.
- Kapanan islerde `kapanma_zamani` doldurulmalidir.

## 6. Backend Gelistirmesi Icin Ilk Adimlar

### 6.1 Proje Altyapisi

1. Backend uygulamasini MySQL 8 uyumlu ORM/query katmani ile baslat.
2. Canli veritabani baglantisini `.env` uzerinden yonet.
3. SSL gereksinimini Azure MySQL baglantisinda destekle.
4. Migration kaynaklari olarak mevcut SQL dosyalarini esas al.
5. Model adlarinda tablo adlarini koru; kolon adlarini backend DTO ve API katmaninda da tutarli kullan.

### 6.2 Oncelikli Moduller

1. `health`: veritabani baglanti kontrolu.
2. `pazaryerleri`: pazaryeri ve hesap listeleri.
3. `veri-aktarimi`: import parti olusturma, ham satir kaydetme, dogrulama durumu.
4. `siparisler`: `siparis_no` bazli siparis, ERP, iade ve finans hareketlerini birlestiren okuma endpointleri.
5. `komisyon-mutabakati`: beklenen/faturalanan komisyon listeleme ve detay.
6. `desi-mutabakati`: beklenen/faturalanan desi/kargo listeleme ve detay.
7. `karlilik`: `siparis_karlilik_ozetleri` ve `vw_siparis_finans_ozeti` tabanli rapor endpointleri.
8. `fark-kuyrugu`: `mutabakat_is_kuyrugu` acik/islemde/cozuldu akisi.
9. `auth`: `kullanicilar`, `roller`, `kullanici_rolleri`.
10. `audit`: `denetim_loglari`.

### 6.3 Onerilen Ilk Endpointler

| Method | Path | Amac |
|---|---|---|
| `GET` | `/health` | Uygulama ve veritabani saglik kontrolu |
| `GET` | `/pazaryerleri` | Aktif pazaryerleri |
| `GET` | `/pazaryerleri/:id/hesaplar` | Pazaryeri hesaplari |
| `GET` | `/siparisler/:siparisNo` | Siparis omurga detayi |
| `GET` | `/siparisler/:siparisNo/finans-ozeti` | Finansal hareket ozeti |
| `GET` | `/komisyon-mutabakatlari` | Komisyon fark listesi |
| `GET` | `/komisyon-mutabakatlari/:id` | Komisyon mutabakat detayi |
| `GET` | `/desi-mutabakatlari` | Desi/kargo fark listesi |
| `GET` | `/desi-mutabakatlari/:id` | Desi/kargo mutabakat detayi |
| `GET` | `/karlilik/siparisler` | Siparis karlilik listesi |
| `GET` | `/fark-kuyrugu` | Acik/islemde mutabakat isleri |
| `PATCH` | `/fark-kuyrugu/:id` | Is durumu, onem ve kapanis guncelleme |

### 6.4 Backend Uygulama Notlari

- Para alanlari icin float kullanma; `decimal` uyumlu veri tipi veya string mapping kullan.
- Tarih/saat alanlarinda timezone davranisini merkezi olarak belirle.
- `siparis_no` filtreleri tum mutabakat ekranlarinda temel sorgu parametresi olmalidir.
- Liste endpointlerinde `pazaryeri_id`, tarih araligi, `mutabakat_durumu`, `is_durumu`, `zarar_mi` filtreleri desteklenmelidir.
- Rapor endpointlerinde join carpmasi riskine karsi once alt toplamlar aggregate edilmeli, sonra siparis ozetiyle birlestirilmelidir.
- Yazma islemlerinde `denetim_loglari` kaydi olusturulmalidir.
- Import islemleri transaction icinde tasarlanmalidir.
- Ham veri kaydi basarili olmadan normalize tablolara yazim yapilmalidir.

## 7. Backend Asistani Icin Sabit Kabul Edilecek Kararlar

- Yeni tablo onermeden once mevcut tablolardan biriyle cozulebilirlik kontrol edilmeli.
- Banka, POS, muhasebe ve dogrudan kargo firmasi faturasi kapsamina genisleme yapilmamali.
- Desi/kargo faturalanan verisi `pazaryeri_finansal_hareketleri` uzerinden ele alinmali.
- Komisyon mutabakati `komisyon_mutabakatlari` uzerinden ele alinmali.
- Dashboard ve siparis karliligi `siparis_karlilik_ozetleri` ve view'lar uzerinden okunmali.
- `siparis_no`, sistemin ana is anahtari olarak korunmali.

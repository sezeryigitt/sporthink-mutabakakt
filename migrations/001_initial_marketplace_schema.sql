CREATE DATABASE IF NOT EXISTS sporthinkmutabakat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_turkish_ci;

USE sporthinkmutabakat;

CREATE TABLE pazaryerleri (
  pazaryeri_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_kodu VARCHAR(30) NOT NULL,
  pazaryeri_adi VARCHAR(100) NOT NULL,
  aktif_mi BOOLEAN NOT NULL DEFAULT TRUE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_id),
  UNIQUE KEY uq_pazaryerleri_kod (pazaryeri_kodu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_hesaplari (
  pazaryeri_hesap_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  satici_kodu VARCHAR(80) NULL,
  satici_adi VARCHAR(150) NULL,
  magaza_kodu VARCHAR(80) NULL,
  magaza_adi VARCHAR(150) NULL,
  vergi_no VARCHAR(30) NULL,
  aktif_mi BOOLEAN NOT NULL DEFAULT TRUE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_hesap_id),
  KEY ix_pazaryeri_hesaplari_pazaryeri (pazaryeri_id),
  CONSTRAINT fk_pazaryeri_hesaplari_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kargo_firmalari (
  kargo_firma_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kargo_firma_kodu VARCHAR(40) NOT NULL,
  kargo_firma_adi VARCHAR(120) NOT NULL,
  aktif_mi BOOLEAN NOT NULL DEFAULT TRUE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kargo_firma_id),
  UNIQUE KEY uq_kargo_firmalari_kod (kargo_firma_kodu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE aktarim_partileri (
  aktarim_parti_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NULL,
  kaynak_alani ENUM(
    'pazaryeri_faturasi',
    'pazaryeri_siparisi',
    'pazaryeri_iade_iptal',
    'erp_satis',
    'erp_iade',
    'kargo_faturasi',
    'banka',
    'kurumsal_fatura',
    'parametre',
    'kontrol'
  ) NOT NULL,
  kaynak_dosya_yolu VARCHAR(600) NOT NULL,
  kaynak_dosya_adi VARCHAR(255) NOT NULL,
  kaynak_sayfa_adi VARCHAR(150) NULL,
  satir_sayisi INT UNSIGNED NULL,
  aktarim_durumu ENUM('bekliyor', 'aktarildi', 'dogrulandi', 'hatali') NOT NULL DEFAULT 'bekliyor',
  aktaran_kullanici VARCHAR(120) NULL,
  aktarim_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  aciklama TEXT NULL,
  PRIMARY KEY (aktarim_parti_id),
  KEY ix_aktarim_partileri_pazaryeri (pazaryeri_id),
  KEY ix_aktarim_partileri_kaynak_alani (kaynak_alani),
  CONSTRAINT fk_aktarim_partileri_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE ham_aktarim_satirlari (
  ham_aktarim_satir_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aktarim_parti_id BIGINT UNSIGNED NOT NULL,
  kaynak_satir_no INT UNSIGNED NOT NULL,
  satir_hash CHAR(64) NULL,
  ham_veri JSON NOT NULL,
  dogrulama_durumu ENUM('bekliyor', 'gecerli', 'uyari', 'hata') NOT NULL DEFAULT 'bekliyor',
  dogrulama_mesaji TEXT NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ham_aktarim_satir_id),
  UNIQUE KEY uq_ham_aktarim_satirlari_parti_satir (aktarim_parti_id, kaynak_satir_no),
  KEY ix_ham_aktarim_satirlari_hash (satir_hash),
  CONSTRAINT fk_ham_aktarim_satirlari_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kaynak_belgeler (
  kaynak_belge_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NULL,
  pazaryeri_hesap_id BIGINT UNSIGNED NULL,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  belge_turu ENUM(
    'komisyon_faturasi',
    'kargo_faturasi',
    'ceza_faturasi',
    'ek_bedel_faturasi',
    'odeme_ekstresi',
    'iade_iptal_listesi',
    'banka_ekstresi',
    'kurumsal_fatura',
    'diger'
  ) NOT NULL,
  belge_no VARCHAR(100) NULL,
  belge_tarihi DATE NULL,
  donem_baslangic DATE NULL,
  donem_bitis DATE NULL,
  para_birimi CHAR(3) NOT NULL DEFAULT 'TRY',
  toplam_tutar DECIMAL(18,4) NULL,
  kdv_tutari DECIMAL(18,4) NULL,
  aciklama TEXT NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kaynak_belge_id),
  KEY ix_kaynak_belgeler_pazaryeri (pazaryeri_id),
  KEY ix_kaynak_belgeler_hesap (pazaryeri_hesap_id),
  KEY ix_kaynak_belgeler_parti (aktarim_parti_id),
  KEY ix_kaynak_belgeler_belge_no (belge_no),
  CONSTRAINT fk_kaynak_belgeler_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_kaynak_belgeler_hesap
    FOREIGN KEY (pazaryeri_hesap_id) REFERENCES pazaryeri_hesaplari (pazaryeri_hesap_id),
  CONSTRAINT fk_kaynak_belgeler_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kesinti_kategorileri (
  kesinti_kategori_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kesinti_kodu VARCHAR(60) NOT NULL,
  kesinti_adi VARCHAR(120) NOT NULL,
  ana_grup ENUM('komisyon', 'kargo', 'ceza', 'ek_bedel', 'indirim', 'vergi', 'iade', 'odeme', 'diger') NOT NULL,
  varsayilan_yon ENUM('gelir', 'gider') NOT NULL,
  pazaryeri_icin_zorunlu_mu BOOLEAN NOT NULL DEFAULT FALSE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kesinti_kategori_id),
  UNIQUE KEY uq_kesinti_kategorileri_kod (kesinti_kodu),
  KEY ix_kesinti_kategorileri_ana_grup (ana_grup)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_zorunlu_kesintileri (
  pazaryeri_zorunlu_kesinti_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  kesinti_kategori_id BIGINT UNSIGNED NOT NULL,
  zorunlu_mu BOOLEAN NOT NULL DEFAULT TRUE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_zorunlu_kesinti_id),
  UNIQUE KEY uq_pazaryeri_zorunlu_kesintileri (pazaryeri_id, kesinti_kategori_id),
  CONSTRAINT fk_pazaryeri_zorunlu_kesintileri_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_pazaryeri_zorunlu_kesintileri_kategori
    FOREIGN KEY (kesinti_kategori_id) REFERENCES kesinti_kategorileri (kesinti_kategori_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE urun_kategorileri (
  urun_kategori_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kategori_adi VARCHAR(180) NOT NULL,
  ust_kategori_id BIGINT UNSIGNED NULL,
  tahmini_desi DECIMAL(10,2) NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (urun_kategori_id),
  UNIQUE KEY uq_urun_kategorileri_ad (kategori_adi),
  CONSTRAINT fk_urun_kategorileri_ust
    FOREIGN KEY (ust_kategori_id) REFERENCES urun_kategorileri (urun_kategori_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE urunler (
  urun_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  barkod VARCHAR(80) NOT NULL,
  sku VARCHAR(100) NULL,
  stok_kodu VARCHAR(100) NULL,
  urun_adi VARCHAR(255) NULL,
  marka VARCHAR(120) NULL,
  urun_kategori_id BIGINT UNSIGNED NULL,
  birim_maliyet DECIMAL(18,4) NULL,
  aktif_mi BOOLEAN NOT NULL DEFAULT TRUE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (urun_id),
  UNIQUE KEY uq_urunler_barkod (barkod),
  KEY ix_urunler_sku (sku),
  KEY ix_urunler_kategori (urun_kategori_id),
  CONSTRAINT fk_urunler_kategori
    FOREIGN KEY (urun_kategori_id) REFERENCES urun_kategorileri (urun_kategori_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_urun_eslesmeleri (
  pazaryeri_urun_eslesme_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  urun_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_sku VARCHAR(120) NULL,
  pazaryeri_urun_kodu VARCHAR(120) NULL,
  pazaryeri_kategori_adi VARCHAR(180) NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_urun_eslesme_id),
  UNIQUE KEY uq_pazaryeri_urun_eslesmeleri (pazaryeri_id, urun_id),
  KEY ix_pazaryeri_urun_eslesmeleri_sku (pazaryeri_sku),
  CONSTRAINT fk_pazaryeri_urun_eslesmeleri_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_pazaryeri_urun_eslesmeleri_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_komisyon_oranlari (
  komisyon_oran_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  urun_kategori_id BIGINT UNSIGNED NULL,
  urun_id BIGINT UNSIGNED NULL,
  oran_yuzde DECIMAL(9,4) NOT NULL,
  kdv_dahil_mi BOOLEAN NOT NULL DEFAULT TRUE,
  gecerlilik_baslangic DATE NOT NULL,
  gecerlilik_bitis DATE NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (komisyon_oran_id),
  KEY ix_komisyon_oranlari_arama (pazaryeri_id, urun_kategori_id, urun_id, gecerlilik_baslangic, gecerlilik_bitis),
  CONSTRAINT fk_komisyon_oranlari_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_komisyon_oranlari_kategori
    FOREIGN KEY (urun_kategori_id) REFERENCES urun_kategorileri (urun_kategori_id),
  CONSTRAINT fk_komisyon_oranlari_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_kargo_desi_ucretleri (
  kargo_desi_ucret_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  kargo_firma_id BIGINT UNSIGNED NULL,
  desi_degeri DECIMAL(10,2) NOT NULL,
  tutar DECIMAL(18,4) NOT NULL,
  kdv_dahil_mi BOOLEAN NOT NULL DEFAULT FALSE,
  gecerlilik_baslangic DATE NOT NULL,
  gecerlilik_bitis DATE NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kargo_desi_ucret_id),
  UNIQUE KEY uq_kargo_desi_ucretleri_donem (pazaryeri_id, kargo_firma_id, desi_degeri, gecerlilik_baslangic),
  KEY ix_kargo_desi_ucretleri_arama (pazaryeri_id, kargo_firma_id, desi_degeri, gecerlilik_baslangic, gecerlilik_bitis),
  CONSTRAINT fk_kargo_desi_ucretleri_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_kargo_desi_ucretleri_kargo_firma
    FOREIGN KEY (kargo_firma_id) REFERENCES kargo_firmalari (kargo_firma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_siparis_satirlari (
  pazaryeri_siparis_satir_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_hesap_id BIGINT UNSIGNED NULL,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NOT NULL,
  pazaryeri_siparis_no VARCHAR(100) NULL,
  paket_no VARCHAR(100) NULL,
  takip_no VARCHAR(120) NULL,
  urun_id BIGINT UNSIGNED NULL,
  barkod VARCHAR(80) NULL,
  sku VARCHAR(100) NULL,
  urun_adi VARCHAR(255) NULL,
  marka VARCHAR(120) NULL,
  adet DECIMAL(18,4) NOT NULL DEFAULT 1,
  birim_fiyat DECIMAL(18,4) NULL,
  brut_tutar DECIMAL(18,4) NULL,
  kdv_orani DECIMAL(7,4) NULL,
  kdv_haric_tutar DECIMAL(18,4) NULL,
  siparis_durumu VARCHAR(80) NULL,
  satis_tipi VARCHAR(80) NULL,
  siparis_olusturma_zamani DATETIME NULL,
  kargo_gonderim_zamani DATETIME NULL,
  kargo_firma_id BIGINT UNSIGNED NULL,
  tahmini_desi DECIMAL(10,2) NULL,
  pazaryeri_fiyati DECIMAL(18,4) NULL,
  para_birimi CHAR(3) NOT NULL DEFAULT 'TRY',
  ham_veri JSON NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_siparis_satir_id),
  KEY ix_pazaryeri_siparis_satirlari_pazaryeri_siparis (pazaryeri_id, siparis_no),
  KEY ix_pazaryeri_siparis_satirlari_siparis (siparis_no),
  KEY ix_pazaryeri_siparis_satirlari_barkod (barkod),
  KEY ix_pazaryeri_siparis_satirlari_urun (urun_id),
  KEY ix_pazaryeri_siparis_satirlari_tarih (siparis_olusturma_zamani, kargo_gonderim_zamani),
  CONSTRAINT fk_pazaryeri_siparis_satirlari_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_pazaryeri_siparis_satirlari_hesap
    FOREIGN KEY (pazaryeri_hesap_id) REFERENCES pazaryeri_hesaplari (pazaryeri_hesap_id),
  CONSTRAINT fk_pazaryeri_siparis_satirlari_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id),
  CONSTRAINT fk_pazaryeri_siparis_satirlari_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id),
  CONSTRAINT fk_pazaryeri_siparis_satirlari_kargo_firma
    FOREIGN KEY (kargo_firma_id) REFERENCES kargo_firmalari (kargo_firma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_iade_iptal_satirlari (
  pazaryeri_iade_iptal_satir_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_siparis_satir_id BIGINT UNSIGNED NULL,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NOT NULL,
  paket_no VARCHAR(100) NULL,
  barkod VARCHAR(80) NULL,
  urun_id BIGINT UNSIGNED NULL,
  iade_iptal_turu ENUM('iade', 'iptal') NOT NULL,
  neden VARCHAR(255) NULL,
  adet DECIMAL(18,4) NOT NULL DEFAULT 1,
  tutar DECIMAL(18,4) NULL,
  iade_iptal_zamani DATETIME NULL,
  durum VARCHAR(80) NULL,
  ham_veri JSON NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_iade_iptal_satir_id),
  KEY ix_iade_iptal_pazaryeri_siparis (pazaryeri_id, siparis_no),
  KEY ix_iade_iptal_siparis (siparis_no),
  KEY ix_iade_iptal_barkod (barkod),
  CONSTRAINT fk_iade_iptal_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_iade_iptal_siparis_satir
    FOREIGN KEY (pazaryeri_siparis_satir_id) REFERENCES pazaryeri_siparis_satirlari (pazaryeri_siparis_satir_id),
  CONSTRAINT fk_iade_iptal_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id),
  CONSTRAINT fk_iade_iptal_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE erp_satis_satirlari (
  erp_satis_satir_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NOT NULL,
  satis_yeri_kodu VARCHAR(80) NULL,
  satis_yeri_adi VARCHAR(150) NULL,
  fatura_no VARCHAR(100) NULL,
  belge_takip_no VARCHAR(120) NULL,
  urun_id BIGINT UNSIGNED NULL,
  barkod VARCHAR(80) NULL,
  sku VARCHAR(100) NULL,
  marka VARCHAR(120) NULL,
  musteri_kodu VARCHAR(100) NULL,
  musteri_adi VARCHAR(180) NULL,
  adet DECIMAL(18,4) NOT NULL DEFAULT 1,
  kdv_haric_tutar DECIMAL(18,4) NULL,
  kdv_tutari DECIMAL(18,4) NULL,
  kdv_dahil_tutar DECIMAL(18,4) NULL,
  fatura_tarihi DATE NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (erp_satis_satir_id),
  KEY ix_erp_satis_satirlari_siparis (siparis_no),
  KEY ix_erp_satis_satirlari_barkod (barkod),
  CONSTRAINT fk_erp_satis_satirlari_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id),
  CONSTRAINT fk_erp_satis_satirlari_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE erp_iade_satirlari (
  erp_iade_satir_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NOT NULL,
  iade_fatura_no VARCHAR(100) NULL,
  asil_fatura_no VARCHAR(100) NULL,
  urun_id BIGINT UNSIGNED NULL,
  barkod VARCHAR(80) NULL,
  sku VARCHAR(100) NULL,
  marka VARCHAR(120) NULL,
  musteri_kodu VARCHAR(100) NULL,
  musteri_adi VARCHAR(180) NULL,
  adet DECIMAL(18,4) NOT NULL DEFAULT 1,
  kdv_haric_tutar DECIMAL(18,4) NULL,
  kdv_tutari DECIMAL(18,4) NULL,
  kdv_dahil_tutar DECIMAL(18,4) NULL,
  iade_fatura_tarihi DATE NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (erp_iade_satir_id),
  KEY ix_erp_iade_satirlari_siparis (siparis_no),
  KEY ix_erp_iade_satirlari_barkod (barkod),
  CONSTRAINT fk_erp_iade_satirlari_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id),
  CONSTRAINT fk_erp_iade_satirlari_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE pazaryeri_finansal_hareketleri (
  pazaryeri_finansal_hareket_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_siparis_satir_id BIGINT UNSIGNED NULL,
  kaynak_belge_id BIGINT UNSIGNED NULL,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  kesinti_kategori_id BIGINT UNSIGNED NOT NULL,
  siparis_no VARCHAR(100) NOT NULL,
  pazaryeri_siparis_no VARCHAR(100) NULL,
  paket_no VARCHAR(100) NULL,
  barkod VARCHAR(80) NULL,
  urun_id BIGINT UNSIGNED NULL,
  hareket_yonu ENUM('gelir', 'gider') NOT NULL,
  tutar DECIMAL(18,4) NOT NULL,
  kdv_tutari DECIMAL(18,4) NULL,
  para_birimi CHAR(3) NOT NULL DEFAULT 'TRY',
  adet DECIMAL(18,4) NULL,
  desi DECIMAL(10,2) NULL,
  komisyon_orani_yuzde DECIMAL(9,4) NULL,
  islem_zamani DATETIME NULL,
  vade_tarihi DATE NULL,
  fatura_no VARCHAR(100) NULL,
  dis_kayit_no VARCHAR(120) NULL,
  aciklama TEXT NULL,
  ham_veri JSON NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pazaryeri_finansal_hareket_id),
  KEY ix_finansal_hareketler_pazaryeri_siparis (pazaryeri_id, siparis_no),
  KEY ix_finansal_hareketler_siparis (siparis_no),
  KEY ix_finansal_hareketler_kesinti (kesinti_kategori_id),
  KEY ix_finansal_hareketler_belge (kaynak_belge_id),
  KEY ix_finansal_hareketler_siparis_satir (pazaryeri_siparis_satir_id),
  KEY ix_finansal_hareketler_tarih (islem_zamani, vade_tarihi),
  CONSTRAINT fk_finansal_hareketler_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_finansal_hareketler_siparis_satir
    FOREIGN KEY (pazaryeri_siparis_satir_id) REFERENCES pazaryeri_siparis_satirlari (pazaryeri_siparis_satir_id),
  CONSTRAINT fk_finansal_hareketler_belge
    FOREIGN KEY (kaynak_belge_id) REFERENCES kaynak_belgeler (kaynak_belge_id),
  CONSTRAINT fk_finansal_hareketler_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id),
  CONSTRAINT fk_finansal_hareketler_kesinti
    FOREIGN KEY (kesinti_kategori_id) REFERENCES kesinti_kategorileri (kesinti_kategori_id),
  CONSTRAINT fk_finansal_hareketler_urun
    FOREIGN KEY (urun_id) REFERENCES urunler (urun_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kargo_fatura_gonderileri (
  kargo_fatura_gonderi_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kargo_firma_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_id BIGINT UNSIGNED NULL,
  kaynak_belge_id BIGINT UNSIGNED NULL,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NULL,
  gonderi_kodu VARCHAR(120) NULL,
  takip_no VARCHAR(120) NULL,
  fatura_no VARCHAR(100) NULL,
  fatura_tarihi DATE NULL,
  gonderici_adi VARCHAR(180) NULL,
  alici_adi VARCHAR(180) NULL,
  gonderi_yonu ENUM('satis', 'iade', 'diger') NOT NULL DEFAULT 'satis',
  faturalanan_desi DECIMAL(10,2) NULL,
  faturalanan_agirlik DECIMAL(10,2) NULL,
  faturalanan_tutar DECIMAL(18,4) NULL,
  kdv_tutari DECIMAL(18,4) NULL,
  gonderi_zamani DATETIME NULL,
  teslim_zamani DATETIME NULL,
  ham_veri JSON NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kargo_fatura_gonderi_id),
  KEY ix_kargo_fatura_gonderileri_siparis (siparis_no),
  KEY ix_kargo_fatura_gonderileri_takip (takip_no),
  KEY ix_kargo_fatura_gonderileri_pazaryeri (pazaryeri_id),
  CONSTRAINT fk_kargo_fatura_gonderileri_kargo_firma
    FOREIGN KEY (kargo_firma_id) REFERENCES kargo_firmalari (kargo_firma_id),
  CONSTRAINT fk_kargo_fatura_gonderileri_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_kargo_fatura_gonderileri_belge
    FOREIGN KEY (kaynak_belge_id) REFERENCES kaynak_belgeler (kaynak_belge_id),
  CONSTRAINT fk_kargo_fatura_gonderileri_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE komisyon_mutabakatlari (
  komisyon_mutabakat_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_siparis_satir_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NOT NULL,
  barkod VARCHAR(80) NULL,
  beklenen_oran_yuzde DECIMAL(9,4) NULL,
  faturalanan_oran_yuzde DECIMAL(9,4) NULL,
  beklenen_komisyon_tutari DECIMAL(18,4) NULL,
  faturalanan_komisyon_tutari DECIMAL(18,4) NULL,
  fark_tutari DECIMAL(18,4) AS (COALESCE(faturalanan_komisyon_tutari, 0) - COALESCE(beklenen_komisyon_tutari, 0)) STORED,
  tolerans_tutari DECIMAL(18,4) NOT NULL DEFAULT 0.05,
  mutabakat_durumu ENUM('uyumlu', 'fark_var', 'beklenen_eksik', 'fatura_eksik', 'manuel_inceleme') NOT NULL DEFAULT 'manuel_inceleme',
  guven_skoru DECIMAL(5,4) NULL,
  hesaplama_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  inceleyen_kullanici VARCHAR(120) NULL,
  inceleme_zamani DATETIME NULL,
  aciklama TEXT NULL,
  PRIMARY KEY (komisyon_mutabakat_id),
  KEY ix_komisyon_mutabakatlari_pazaryeri_siparis (pazaryeri_id, siparis_no),
  KEY ix_komisyon_mutabakatlari_siparis (siparis_no),
  CONSTRAINT fk_komisyon_mutabakatlari_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_komisyon_mutabakatlari_siparis_satir
    FOREIGN KEY (pazaryeri_siparis_satir_id) REFERENCES pazaryeri_siparis_satirlari (pazaryeri_siparis_satir_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE desi_mutabakatlari (
  desi_mutabakat_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  pazaryeri_siparis_satir_id BIGINT UNSIGNED NULL,
  kargo_fatura_gonderi_id BIGINT UNSIGNED NULL,
  siparis_no VARCHAR(100) NOT NULL,
  paket_no VARCHAR(100) NULL,
  takip_no VARCHAR(120) NULL,
  kargo_firma_id BIGINT UNSIGNED NULL,
  beklenen_desi DECIMAL(10,2) NULL,
  faturalanan_desi DECIMAL(10,2) NULL,
  beklenen_kargo_tutari DECIMAL(18,4) NULL,
  faturalanan_kargo_tutari DECIMAL(18,4) NULL,
  desi_farki DECIMAL(10,2) AS (COALESCE(faturalanan_desi, 0) - COALESCE(beklenen_desi, 0)) STORED,
  tutar_farki DECIMAL(18,4) AS (COALESCE(faturalanan_kargo_tutari, 0) - COALESCE(beklenen_kargo_tutari, 0)) STORED,
  tolerans_tutari DECIMAL(18,4) NOT NULL DEFAULT 0.05,
  mutabakat_durumu ENUM('uyumlu', 'fark_var', 'beklenen_eksik', 'fatura_eksik', 'manuel_inceleme') NOT NULL DEFAULT 'manuel_inceleme',
  guven_skoru DECIMAL(5,4) NULL,
  hesaplama_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  inceleyen_kullanici VARCHAR(120) NULL,
  inceleme_zamani DATETIME NULL,
  aciklama TEXT NULL,
  PRIMARY KEY (desi_mutabakat_id),
  KEY ix_desi_mutabakatlari_pazaryeri_siparis (pazaryeri_id, siparis_no),
  KEY ix_desi_mutabakatlari_siparis (siparis_no),
  KEY ix_desi_mutabakatlari_takip (takip_no),
  CONSTRAINT fk_desi_mutabakatlari_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id),
  CONSTRAINT fk_desi_mutabakatlari_siparis_satir
    FOREIGN KEY (pazaryeri_siparis_satir_id) REFERENCES pazaryeri_siparis_satirlari (pazaryeri_siparis_satir_id),
  CONSTRAINT fk_desi_mutabakatlari_kargo_gonderi
    FOREIGN KEY (kargo_fatura_gonderi_id) REFERENCES kargo_fatura_gonderileri (kargo_fatura_gonderi_id),
  CONSTRAINT fk_desi_mutabakatlari_kargo_firma
    FOREIGN KEY (kargo_firma_id) REFERENCES kargo_firmalari (kargo_firma_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE siparis_karlilik_ozetleri (
  siparis_karlilik_ozet_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  siparis_no VARCHAR(100) NOT NULL,
  ozet_tarihi DATE NOT NULL,
  brut_satis_tutari DECIMAL(18,4) NOT NULL DEFAULT 0,
  iade_iptal_tutari DECIMAL(18,4) NOT NULL DEFAULT 0,
  komisyon_gideri DECIMAL(18,4) NOT NULL DEFAULT 0,
  kargo_gideri DECIMAL(18,4) NOT NULL DEFAULT 0,
  ceza_gideri DECIMAL(18,4) NOT NULL DEFAULT 0,
  ek_bedel_gideri DECIMAL(18,4) NOT NULL DEFAULT 0,
  indirim_tutari DECIMAL(18,4) NOT NULL DEFAULT 0,
  vergi_gideri DECIMAL(18,4) NOT NULL DEFAULT 0,
  urun_maliyeti DECIMAL(18,4) NOT NULL DEFAULT 0,
  net_gelir DECIMAL(18,4) NOT NULL DEFAULT 0,
  net_kar DECIMAL(18,4) NOT NULL DEFAULT 0,
  kar_marji_yuzde DECIMAL(9,4) NULL,
  zarar_nedeni VARCHAR(255) NULL,
  hesaplama_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (siparis_karlilik_ozet_id),
  UNIQUE KEY uq_siparis_karlilik_ozetleri (pazaryeri_id, siparis_no, ozet_tarihi),
  KEY ix_siparis_karlilik_ozetleri_siparis (siparis_no),
  KEY ix_siparis_karlilik_ozetleri_kar (net_kar),
  CONSTRAINT fk_siparis_karlilik_ozetleri_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE banka_hareketleri (
  banka_hareket_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  islem_kodu VARCHAR(120) NULL,
  banka_adi VARCHAR(120) NULL,
  pos_banka_adi VARCHAR(120) NULL,
  kart_banka_adi VARCHAR(120) NULL,
  maskeli_kart_no VARCHAR(40) NULL,
  islem_zamani DATETIME NULL,
  valor_tarihi DATE NULL,
  gun_sonu_tarihi DATE NULL,
  brut_tutar DECIMAL(18,4) NULL,
  komisyon_tutari DECIMAL(18,4) NULL,
  komisyon_orani_yuzde DECIMAL(9,4) NULL,
  net_tutar DECIMAL(18,4) NULL,
  para_birimi CHAR(3) NOT NULL DEFAULT 'TRY',
  iliskili_siparis_no VARCHAR(100) NULL,
  islem_tipi VARCHAR(80) NULL,
  aciklama TEXT NULL,
  ham_veri JSON NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (banka_hareket_id),
  KEY ix_banka_hareketleri_siparis (iliskili_siparis_no),
  KEY ix_banka_hareketleri_tarih (islem_zamani, valor_tarihi),
  CONSTRAINT fk_banka_hareketleri_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kurumsal_fatura_defteri (
  kurumsal_fatura_defter_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aktarim_parti_id BIGINT UNSIGNED NULL,
  yon ENUM('gelen', 'giden') NOT NULL,
  fis_tarihi DATE NULL,
  hareket_turu VARCHAR(100) NULL,
  evrak_no VARCHAR(100) NULL,
  hesap_adi VARCHAR(180) NULL,
  aciklama TEXT NULL,
  borc_tutari DECIMAL(18,4) NOT NULL DEFAULT 0,
  alacak_tutari DECIMAL(18,4) NOT NULL DEFAULT 0,
  bakiye_tutari DECIMAL(18,4) NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kurumsal_fatura_defter_id),
  KEY ix_kurumsal_fatura_defteri_evrak (evrak_no),
  KEY ix_kurumsal_fatura_defteri_tarih (fis_tarihi),
  CONSTRAINT fk_kurumsal_fatura_defteri_parti
    FOREIGN KEY (aktarim_parti_id) REFERENCES aktarim_partileri (aktarim_parti_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE mutabakat_is_kuyrugu (
  mutabakat_is_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pazaryeri_id BIGINT UNSIGNED NOT NULL,
  siparis_no VARCHAR(100) NOT NULL,
  is_turu ENUM('komisyon', 'desi', 'odeme', 'iade', 'karlilik', 'diger') NOT NULL,
  onem_derecesi ENUM('dusuk', 'orta', 'yuksek', 'kritik') NOT NULL DEFAULT 'orta',
  is_durumu ENUM('acik', 'islemde', 'cozuldu', 'yok_sayildi') NOT NULL DEFAULT 'acik',
  baslik VARCHAR(180) NOT NULL,
  detay TEXT NULL,
  atanan_kullanici VARCHAR(120) NULL,
  acilma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kapanma_zamani DATETIME NULL,
  PRIMARY KEY (mutabakat_is_id),
  KEY ix_mutabakat_is_kuyrugu_pazaryeri_siparis (pazaryeri_id, siparis_no),
  KEY ix_mutabakat_is_kuyrugu_durum (is_durumu, onem_derecesi),
  CONSTRAINT fk_mutabakat_is_kuyrugu_pazaryeri
    FOREIGN KEY (pazaryeri_id) REFERENCES pazaryerleri (pazaryeri_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE roller (
  rol_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rol_kodu VARCHAR(50) NOT NULL,
  rol_adi VARCHAR(100) NOT NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rol_id),
  UNIQUE KEY uq_roller_kod (rol_kodu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kullanicilar (
  kullanici_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  eposta VARCHAR(180) NOT NULL,
  ad_soyad VARCHAR(180) NOT NULL,
  parola_hash VARCHAR(255) NOT NULL,
  aktif_mi BOOLEAN NOT NULL DEFAULT TRUE,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  guncelleme_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (kullanici_id),
  UNIQUE KEY uq_kullanicilar_eposta (eposta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE kullanici_rolleri (
  kullanici_id BIGINT UNSIGNED NOT NULL,
  rol_id BIGINT UNSIGNED NOT NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (kullanici_id, rol_id),
  CONSTRAINT fk_kullanici_rolleri_kullanici
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar (kullanici_id),
  CONSTRAINT fk_kullanici_rolleri_rol
    FOREIGN KEY (rol_id) REFERENCES roller (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

CREATE TABLE denetim_loglari (
  denetim_log_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kullanici_id BIGINT UNSIGNED NULL,
  aksiyon VARCHAR(120) NOT NULL,
  varlik_adi VARCHAR(120) NULL,
  varlik_id VARCHAR(120) NULL,
  ip_adresi VARCHAR(60) NULL,
  kullanici_aracisi VARCHAR(255) NULL,
  ek_veri JSON NULL,
  olusturma_zamani TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (denetim_log_id),
  KEY ix_denetim_loglari_kullanici (kullanici_id),
  KEY ix_denetim_loglari_varlik (varlik_adi, varlik_id),
  KEY ix_denetim_loglari_tarih (olusturma_zamani),
  CONSTRAINT fk_denetim_loglari_kullanici
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar (kullanici_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

INSERT INTO pazaryerleri (pazaryeri_kodu, pazaryeri_adi) VALUES
  ('trendyol', 'Trendyol'),
  ('hepsiburada', 'Hepsiburada'),
  ('flo', 'FLO'),
  ('n11', 'n11'),
  ('pazarama', 'Pazarama'),
  ('lcw', 'LC Waikiki'),
  ('amazon', 'Amazon')
ON DUPLICATE KEY UPDATE pazaryeri_adi = VALUES(pazaryeri_adi), aktif_mi = TRUE;

INSERT INTO kesinti_kategorileri (kesinti_kodu, kesinti_adi, ana_grup, varsayilan_yon, pazaryeri_icin_zorunlu_mu) VALUES
  ('satis_komisyonu', 'Satis Komisyonu', 'komisyon', 'gider', TRUE),
  ('iade_komisyonu_iadesi', 'Iade Komisyonu Iadesi', 'komisyon', 'gelir', FALSE),
  ('satis_kargo_tutari', 'Satis Kargo Tutari', 'kargo', 'gider', TRUE),
  ('iade_kargo_tutari', 'Iade Kargo Tutari', 'kargo', 'gider', FALSE),
  ('kargo_bedeli_iadesi', 'Kargo Bedeli Iadesi', 'kargo', 'gelir', FALSE),
  ('tedarik_edememe_cezasi', 'Tedarik Edememe Cezasi', 'ceza', 'gider', TRUE),
  ('termin_gecikme_cezasi', 'Termin/Tedarik Gecikmesi Cezasi', 'ceza', 'gider', FALSE),
  ('yanlis_urun_cezasi', 'Yanlis Urun Cezasi', 'ceza', 'gider', FALSE),
  ('kusurlu_urun_cezasi', 'Kusurlu Urun Cezasi', 'ceza', 'gider', FALSE),
  ('eksik_urun_cezasi', 'Eksik Urun Cezasi', 'ceza', 'gider', FALSE),
  ('ek_bedel', 'Ek Bedel', 'ek_bedel', 'gider', TRUE),
  ('platform_hizmet_bedeli', 'Platform Hizmet Bedeli', 'ek_bedel', 'gider', FALSE),
  ('pazarlama_hizmet_bedeli', 'Pazarlama Hizmet Bedeli', 'ek_bedel', 'gider', FALSE),
  ('entegrasyon_bedeli', 'Entegrasyon Bedeli', 'ek_bedel', 'gider', FALSE),
  ('tahsilat_yonetim_bedeli', 'Tahsilat Yonetim Bedeli', 'ek_bedel', 'gider', FALSE),
  ('kampanya_indirimi', 'Kampanya Indirimi', 'indirim', 'gelir', FALSE),
  ('kupon', 'Kupon', 'indirim', 'gelir', FALSE),
  ('stopaj', 'Stopaj', 'vergi', 'gider', FALSE),
  ('stopaj_iadesi', 'Stopaj Iadesi', 'vergi', 'gelir', FALSE)
ON DUPLICATE KEY UPDATE
  kesinti_adi = VALUES(kesinti_adi),
  ana_grup = VALUES(ana_grup),
  varsayilan_yon = VALUES(varsayilan_yon),
  pazaryeri_icin_zorunlu_mu = VALUES(pazaryeri_icin_zorunlu_mu);

INSERT INTO pazaryeri_zorunlu_kesintileri (pazaryeri_id, kesinti_kategori_id, zorunlu_mu)
SELECT p.pazaryeri_id, k.kesinti_kategori_id, TRUE
FROM pazaryerleri p
JOIN kesinti_kategorileri k
  ON k.kesinti_kodu IN ('satis_komisyonu', 'satis_kargo_tutari', 'tedarik_edememe_cezasi', 'ek_bedel')
ON DUPLICATE KEY UPDATE zorunlu_mu = TRUE;

INSERT INTO kargo_firmalari (kargo_firma_kodu, kargo_firma_adi) VALUES
  ('aras', 'Aras Kargo'),
  ('hepsijet', 'HepsiJET'),
  ('mng', 'MNG Kargo'),
  ('yurtici', 'Yurtici Kargo'),
  ('surat', 'Surat Kargo'),
  ('sendeo', 'Sendeo'),
  ('ptt', 'PTT Kargo'),
  ('tex', 'Trendyol Express'),
  ('kargoist', 'Kargoist'),
  ('horoz', 'Horoz Lojistik'),
  ('ceva', 'Ceva Lojistik'),
  ('borusan', 'Borusan Lojistik')
ON DUPLICATE KEY UPDATE kargo_firma_adi = VALUES(kargo_firma_adi), aktif_mi = TRUE;

INSERT INTO roller (rol_kodu, rol_adi) VALUES
  ('admin', 'Sistem Yoneticisi'),
  ('finans', 'Finans Kullanicisi'),
  ('operasyon', 'Operasyon Kullanicisi'),
  ('goruntuleyici', 'Rapor Goruntuleyici')
ON DUPLICATE KEY UPDATE rol_adi = VALUES(rol_adi);

CREATE OR REPLACE VIEW vw_pazaryeri_zorunlu_kesinti_durumu AS
SELECT
  p.pazaryeri_id,
  p.pazaryeri_kodu,
  p.pazaryeri_adi,
  k.kesinti_kodu,
  k.kesinti_adi,
  k.ana_grup,
  z.zorunlu_mu
FROM pazaryerleri p
JOIN pazaryeri_zorunlu_kesintileri z ON z.pazaryeri_id = p.pazaryeri_id
JOIN kesinti_kategorileri k ON k.kesinti_kategori_id = z.kesinti_kategori_id;

CREATE OR REPLACE VIEW vw_siparis_finans_ozeti AS
SELECT
  ss.pazaryeri_id,
  p.pazaryeri_kodu,
  ss.siparis_no,
  ss.brut_satis_tutari,
  COALESCE(fs.komisyon_gideri, 0) AS komisyon_gideri,
  COALESCE(fs.kargo_gideri, 0) AS kargo_gideri,
  COALESCE(fs.ceza_gideri, 0) AS ceza_gideri,
  COALESCE(fs.ek_bedel_gideri, 0) AS ek_bedel_gideri,
  COALESCE(fs.diger_gelir_tutari, 0) AS diger_gelir_tutari,
  COALESCE(fs.toplam_gider_tutari, 0) AS toplam_gider_tutari
FROM (
  SELECT
    pazaryeri_id,
    siparis_no,
    SUM(COALESCE(brut_tutar, 0)) AS brut_satis_tutari
  FROM pazaryeri_siparis_satirlari
  GROUP BY pazaryeri_id, siparis_no
) ss
JOIN pazaryerleri p ON p.pazaryeri_id = ss.pazaryeri_id
LEFT JOIN (
  SELECT
    fh.pazaryeri_id,
    fh.siparis_no,
    SUM(CASE WHEN k.ana_grup = 'komisyon' AND fh.hareket_yonu = 'gider' THEN fh.tutar ELSE 0 END) AS komisyon_gideri,
    SUM(CASE WHEN k.ana_grup = 'kargo' AND fh.hareket_yonu = 'gider' THEN fh.tutar ELSE 0 END) AS kargo_gideri,
    SUM(CASE WHEN k.ana_grup = 'ceza' AND fh.hareket_yonu = 'gider' THEN fh.tutar ELSE 0 END) AS ceza_gideri,
    SUM(CASE WHEN k.ana_grup = 'ek_bedel' AND fh.hareket_yonu = 'gider' THEN fh.tutar ELSE 0 END) AS ek_bedel_gideri,
    SUM(CASE WHEN fh.hareket_yonu = 'gelir' THEN fh.tutar ELSE 0 END) AS diger_gelir_tutari,
    SUM(CASE WHEN fh.hareket_yonu = 'gider' THEN fh.tutar ELSE 0 END) AS toplam_gider_tutari
  FROM pazaryeri_finansal_hareketleri fh
  JOIN kesinti_kategorileri k ON k.kesinti_kategori_id = fh.kesinti_kategori_id
  GROUP BY fh.pazaryeri_id, fh.siparis_no
) fs
  ON fs.pazaryeri_id = ss.pazaryeri_id
 AND fs.siparis_no = ss.siparis_no;

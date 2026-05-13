USE sporthinkmutabakat;

DROP VIEW IF EXISTS vw_siparis_finans_ozeti;

ALTER TABLE desi_mutabakatlari
  ADD COLUMN pazaryeri_finansal_hareket_id BIGINT UNSIGNED NULL AFTER pazaryeri_siparis_satir_id;

UPDATE desi_mutabakatlari dm
JOIN pazaryeri_finansal_hareketleri fh
  ON fh.pazaryeri_id = dm.pazaryeri_id
 AND fh.siparis_no = dm.siparis_no
JOIN kesinti_kategorileri kk
  ON kk.kesinti_kategori_id = fh.kesinti_kategori_id
 AND kk.ana_grup = 'kargo'
SET dm.pazaryeri_finansal_hareket_id = fh.pazaryeri_finansal_hareket_id;

ALTER TABLE desi_mutabakatlari
  DROP FOREIGN KEY fk_desi_mutabakatlari_kargo_gonderi;

ALTER TABLE desi_mutabakatlari
  DROP COLUMN kargo_fatura_gonderi_id,
  ADD KEY ix_desi_mutabakatlari_finansal_hareket (pazaryeri_finansal_hareket_id),
  ADD CONSTRAINT fk_desi_mutabakatlari_finansal_hareket
    FOREIGN KEY (pazaryeri_finansal_hareket_id)
    REFERENCES pazaryeri_finansal_hareketleri (pazaryeri_finansal_hareket_id);

ALTER TABLE aktarim_partileri
  ADD COLUMN kaynak_sistem ENUM('hamurlabs', 'hitit', 'pazaryeri') NULL AFTER pazaryeri_id,
  ADD COLUMN veri_turu ENUM('pazaryeri_siparisi', 'pazaryeri_iade_iptal', 'pazaryeri_faturasi', 'erp_satis', 'erp_iade') NULL AFTER kaynak_sistem;

UPDATE aktarim_partileri
SET
  kaynak_sistem = CASE
    WHEN kaynak_alani IN ('pazaryeri_siparisi', 'pazaryeri_iade_iptal') THEN 'hamurlabs'
    WHEN kaynak_alani IN ('erp_satis', 'erp_iade') THEN 'hitit'
    ELSE 'pazaryeri'
  END,
  veri_turu = CASE
    WHEN kaynak_alani = 'pazaryeri_siparisi' THEN 'pazaryeri_siparisi'
    WHEN kaynak_alani = 'pazaryeri_iade_iptal' THEN 'pazaryeri_iade_iptal'
    WHEN kaynak_alani = 'erp_satis' THEN 'erp_satis'
    WHEN kaynak_alani = 'erp_iade' THEN 'erp_iade'
    ELSE 'pazaryeri_faturasi'
  END;

ALTER TABLE aktarim_partileri
  MODIFY COLUMN kaynak_sistem ENUM('hamurlabs', 'hitit', 'pazaryeri') NOT NULL,
  MODIFY COLUMN veri_turu ENUM('pazaryeri_siparisi', 'pazaryeri_iade_iptal', 'pazaryeri_faturasi', 'erp_satis', 'erp_iade') NOT NULL,
  DROP INDEX ix_aktarim_partileri_kaynak_alani,
  DROP COLUMN kaynak_alani,
  ADD KEY ix_aktarim_partileri_kaynak_sistem (kaynak_sistem),
  ADD KEY ix_aktarim_partileri_veri_turu (veri_turu);

UPDATE aktarim_partileri
SET kaynak_sistem = 'hitit', veri_turu = 'erp_satis'
WHERE kaynak_dosya_yolu LIKE '%barkdluSatis%'
   OR kaynak_dosya_yolu LIKE '%barkodluSatisGuncelExcel%';

UPDATE aktarim_partileri
SET kaynak_sistem = 'hitit', veri_turu = 'erp_iade'
WHERE kaynak_dosya_yolu LIKE '%barkodluIadeGuncel%'
   OR kaynak_dosya_yolu LIKE '%barkodluIade2%';

ALTER TABLE kaynak_belgeler
  MODIFY COLUMN belge_turu ENUM(
    'komisyon_faturasi',
    'kargo_faturasi',
    'ceza_faturasi',
    'ek_bedel_faturasi',
    'odeme_ekstresi',
    'pazaryeri_komisyon_faturasi',
    'pazaryeri_kargo_kesinti_faturasi',
    'pazaryeri_hizmet_bedeli_faturasi',
    'pazaryeri_finans_raporu',
    'pazaryeri_iade_raporu',
    'pazaryeri_faturasi'
  ) NOT NULL;

UPDATE kaynak_belgeler
SET belge_turu = CASE
  WHEN belge_turu = 'komisyon_faturasi' THEN 'pazaryeri_komisyon_faturasi'
  WHEN belge_turu = 'kargo_faturasi' THEN 'pazaryeri_kargo_kesinti_faturasi'
  WHEN belge_turu IN ('ceza_faturasi', 'ek_bedel_faturasi') THEN 'pazaryeri_hizmet_bedeli_faturasi'
  WHEN belge_turu = 'odeme_ekstresi' THEN 'pazaryeri_finans_raporu'
  ELSE 'pazaryeri_faturasi'
END;

ALTER TABLE kaynak_belgeler
  MODIFY COLUMN belge_turu ENUM(
    'pazaryeri_komisyon_faturasi',
    'pazaryeri_kargo_kesinti_faturasi',
    'pazaryeri_hizmet_bedeli_faturasi',
    'pazaryeri_finans_raporu',
    'pazaryeri_iade_raporu',
    'pazaryeri_faturasi'
  ) NOT NULL;

ALTER TABLE pazaryeri_komisyon_oranlari
  ADD COLUMN hesaplama_matrahi ENUM('brut_tutar', 'kdv_haric_tutar', 'indirim_sonrasi_tutar') NOT NULL DEFAULT 'indirim_sonrasi_tutar' AFTER kdv_dahil_mi;

ALTER TABLE erp_satis_satirlari
  ADD COLUMN birim_maliyet DECIMAL(18,4) NULL AFTER adet,
  ADD COLUMN toplam_maliyet DECIMAL(18,4) NULL AFTER birim_maliyet;

UPDATE erp_satis_satirlari es
JOIN urunler u ON u.urun_id = es.urun_id
SET
  es.birim_maliyet = u.birim_maliyet,
  es.toplam_maliyet = COALESCE(u.birim_maliyet, 0) * COALESCE(es.adet, 0);

ALTER TABLE komisyon_mutabakatlari
  ADD COLUMN hesaplanan_matrah_tutari DECIMAL(18,4) NULL AFTER barkod,
  ADD COLUMN komisyon_hesaplama_kaynagi ENUM('brut_tutar', 'kdv_haric_tutar', 'indirim_sonrasi_tutar') NOT NULL DEFAULT 'indirim_sonrasi_tutar' AFTER hesaplanan_matrah_tutari;

UPDATE komisyon_mutabakatlari km
JOIN pazaryeri_siparis_satirlari ss
  ON ss.pazaryeri_siparis_satir_id = km.pazaryeri_siparis_satir_id
SET km.hesaplanan_matrah_tutari = ss.brut_tutar;

ALTER TABLE siparis_karlilik_ozetleri
  ADD COLUMN desi_farki_tutari DECIMAL(18,4) NOT NULL DEFAULT 0 AFTER vergi_gideri,
  ADD COLUMN komisyon_farki_tutari DECIMAL(18,4) NOT NULL DEFAULT 0 AFTER desi_farki_tutari,
  ADD COLUMN genel_mutabakat_durumu ENUM('uyumlu', 'fark_var', 'manuel_inceleme') NOT NULL DEFAULT 'uyumlu' AFTER kar_marji_yuzde,
  ADD COLUMN zarar_mi BOOLEAN NOT NULL DEFAULT FALSE AFTER genel_mutabakat_durumu;

UPDATE siparis_karlilik_ozetleri sko
LEFT JOIN (
  SELECT pazaryeri_id, siparis_no, SUM(tutar_farki) AS desi_farki_tutari
  FROM desi_mutabakatlari
  GROUP BY pazaryeri_id, siparis_no
) dm
  ON dm.pazaryeri_id = sko.pazaryeri_id
 AND dm.siparis_no = sko.siparis_no
LEFT JOIN (
  SELECT pazaryeri_id, siparis_no, SUM(fark_tutari) AS komisyon_farki_tutari
  FROM komisyon_mutabakatlari
  GROUP BY pazaryeri_id, siparis_no
) km
  ON km.pazaryeri_id = sko.pazaryeri_id
 AND km.siparis_no = sko.siparis_no
SET
  sko.desi_farki_tutari = COALESCE(dm.desi_farki_tutari, 0),
  sko.komisyon_farki_tutari = COALESCE(km.komisyon_farki_tutari, 0),
  sko.genel_mutabakat_durumu = CASE
    WHEN COALESCE(dm.desi_farki_tutari, 0) <> 0 OR COALESCE(km.komisyon_farki_tutari, 0) <> 0 THEN 'fark_var'
    ELSE 'uyumlu'
  END,
  sko.zarar_mi = sko.net_kar < 0;

ALTER TABLE pazaryeri_iade_iptal_satirlari
  DROP FOREIGN KEY fk_iade_iptal_siparis_satir;

ALTER TABLE pazaryeri_finansal_hareketleri
  DROP FOREIGN KEY fk_finansal_hareketler_siparis_satir;

ALTER TABLE komisyon_mutabakatlari
  DROP FOREIGN KEY fk_komisyon_mutabakatlari_siparis_satir;

ALTER TABLE desi_mutabakatlari
  DROP FOREIGN KEY fk_desi_mutabakatlari_siparis_satir;

RENAME TABLE pazaryeri_siparis_satirlari TO siparis_satirlari;

ALTER TABLE siparis_satirlari
  RENAME COLUMN pazaryeri_siparis_satir_id TO siparis_satir_id;

ALTER TABLE pazaryeri_iade_iptal_satirlari
  RENAME COLUMN pazaryeri_siparis_satir_id TO siparis_satir_id;

ALTER TABLE pazaryeri_finansal_hareketleri
  RENAME COLUMN pazaryeri_siparis_satir_id TO siparis_satir_id;

ALTER TABLE komisyon_mutabakatlari
  RENAME COLUMN pazaryeri_siparis_satir_id TO siparis_satir_id;

ALTER TABLE desi_mutabakatlari
  RENAME COLUMN pazaryeri_siparis_satir_id TO siparis_satir_id;

ALTER TABLE pazaryeri_iade_iptal_satirlari
  ADD CONSTRAINT fk_iade_iptal_siparis_satir
    FOREIGN KEY (siparis_satir_id) REFERENCES siparis_satirlari (siparis_satir_id);

ALTER TABLE pazaryeri_finansal_hareketleri
  ADD CONSTRAINT fk_finansal_hareketler_siparis_satir
    FOREIGN KEY (siparis_satir_id) REFERENCES siparis_satirlari (siparis_satir_id);

ALTER TABLE komisyon_mutabakatlari
  ADD CONSTRAINT fk_komisyon_mutabakatlari_siparis_satir
    FOREIGN KEY (siparis_satir_id) REFERENCES siparis_satirlari (siparis_satir_id);

ALTER TABLE desi_mutabakatlari
  ADD CONSTRAINT fk_desi_mutabakatlari_siparis_satir
    FOREIGN KEY (siparis_satir_id) REFERENCES siparis_satirlari (siparis_satir_id);

DROP TABLE IF EXISTS banka_hareketleri;
DROP TABLE IF EXISTS kurumsal_fatura_defteri;
DROP TABLE IF EXISTS kargo_fatura_gonderileri;

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
  FROM siparis_satirlari
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

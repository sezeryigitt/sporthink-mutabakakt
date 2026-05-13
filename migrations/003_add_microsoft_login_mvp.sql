USE sporthinkmutabakat;

ALTER TABLE kullanicilar
  MODIFY COLUMN parola_hash VARCHAR(255) NULL,
  ADD COLUMN giris_saglayici ENUM('local', 'microsoft') NOT NULL DEFAULT 'local' AFTER parola_hash,
  ADD COLUMN microsoft_oid VARCHAR(255) NULL AFTER giris_saglayici,
  ADD COLUMN microsoft_tid VARCHAR(255) NULL AFTER microsoft_oid,
  ADD COLUMN son_giris_zamani DATETIME NULL AFTER microsoft_tid,
  ADD KEY ix_kullanicilar_microsoft_oid_tid (microsoft_oid, microsoft_tid);

INSERT INTO roller (rol_kodu, rol_adi)
VALUES ('READ_ONLY', 'Salt Okuma Yetkisi')
ON DUPLICATE KEY UPDATE rol_adi = VALUES(rol_adi);

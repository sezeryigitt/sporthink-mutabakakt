# Sporthink Mutabakat Veritabani Mimarisi

Bu tasarimda ana odak pazaryeridir. Siparisler Hamurlabs uzerinden sisteme gelir, satis/iade/maliyet bilgileri Hitit tarafindan tamamlanir, faturalanan komisyon/kargo/ceza/ek bedel gibi gerceklesen degerler pazaryeri fatura veya finans raporlarindan okunur.

Tablo ve kolon adlari Turkce secildi. SQL ve yazilim tarafinda sorun cikarmamasi icin Turkce karakter kullanilmadi; ornegin `pazaryerleri`, `siparis_no`, `komisyon_mutabakatlari`.

## Ana Omurga

- `pazaryerleri`: Trendyol, Hepsiburada, FLO, n11, Pazarama, LCW ve Amazon ana pazaryeri kayitlari.
- `pazaryeri_hesaplari`: Pazaryeri icindeki satici, magaza, cari veya store bilgileri.
- `aktarim_partileri`: Excel/CSV yuklemelerinin dosya, sayfa, kaynak sistem ve veri turu bilgisi. Kaynak sistem `hamurlabs`, `hitit` veya `pazaryeri`; veri turu siparis, iade/iptal, ERP satis/iade veya pazaryeri faturasi olarak ayrilir.
- `ham_aktarim_satirlari`: Kaynak satirlarin JSON olarak saklandigi izlenebilir ham veri katmani.
- `kaynak_belgeler`: Pazaryeri faturasi, pazaryeri finans raporu, komisyon faturasi, kargo kesinti faturasi ve iade raporu gibi pazaryeri kaynakli belge basliklari.

## Pazaryeri Merkezli Is Tablolari

- `siparis_satirlari`: Hamurlabs'tan gelen pazaryeri siparis satirlari. `siparis_no` her mutabakat icin ana baglanti kolonudur.
- `pazaryeri_iade_iptal_satirlari`: Hamurlabs/pazaryeri iade ve iptal satirlari.
- `pazaryeri_finansal_hareketleri`: Pazaryeri fatura/finans raporundan gelen faturalanan komisyon, kargo, ceza, ek bedel, indirim, stopaj ve iade gelir/gider hareketlerinin ortak tablosu.
- `kesinti_kategorileri`: Komisyon, kargo, ceza, ek bedel ve diger finansal hareket siniflari.
- `pazaryeri_zorunlu_kesintileri`: Her pazaryerinde zorunlu izlenecek kesinti tipleri. MVP icin opsiyonel kontrol tablosudur.

## Ana Mutabakat Alanlari

- `komisyon_mutabakatlari`: Hesaplanan komisyon ile pazaryerinden faturalanan komisyonu karsilastirir. Satis ve iade komisyonu ayrimi bu tabloda beklenen/faturalanan tutarlar uzerinden izlenir.
- `desi_mutabakatlari`: Beklenen desi/kargo bedeli ile pazaryeri finansal hareketindeki faturalanan desi/kargo bedelini karsilastirir.
- `siparis_karlilik_ozetleri`: Komisyon, kargo, ceza, ek bedel, iade ve maliyet etkisini siparis bazinda net gelir/net kar sonucuna indirger.
- `mutabakat_is_kuyrugu`: Farkli, eksik veya manuel inceleme gerektiren kayitlarin takip kuyrugu.

## Parametre ve Referans Tablolari

- `urunler`: Barkod, SKU, stok kodu, marka, guncel urun maliyeti.
- `urun_kategorileri`: Kategori ve tahmini desi bilgisi.
- `pazaryeri_urun_eslesmeleri`: Pazaryeri urun kodlari ile Sporthink urunlerinin eslesmesi.
- `pazaryeri_komisyon_oranlari`: Pazaryeri, kategori veya urun bazli komisyon oranlari. `hesaplama_matrahi` ile komisyonun brut, KDV haric veya indirim sonrasi tutardan hesaplanacagi belirtilir.
- `pazaryeri_kargo_desi_ucretleri`: Pazaryeri, kargo firmasi ve desi bazli kargo anlasma tutarlari. ERP/Hitit beklenen kargo tutarini vermedigi veya ikinci kontrol istendigi durumda kullanilacak opsiyonel referans tablodur.
- `kargo_firmalari`: Siparisin hangi kargo firmasi ile gonderildigini gosteren sade referans tablo.

## Hitit / ERP Katmani

- `erp_satis_satirlari`: Hitit/ERP satis faturasi satirlari. Satis anindaki `birim_maliyet` ve `toplam_maliyet` burada saklanir.
- `erp_iade_satirlari`: Hitit/ERP iade faturasi satirlari.

Kapsam disina alinan tablolar: `banka_hareketleri`, `kurumsal_fatura_defteri`, `kargo_fatura_gonderileri`. Sistem banka/POS/muhasebe mutabakati veya dogrudan kargo firmasi faturasi importu yapmaz; faturalanan kargo/desi bilgisi pazaryeri finansal hareketlerinden okunur.

## Raporlama

- `vw_pazaryeri_zorunlu_kesinti_durumu`: Pazaryeri bazli zorunlu kesinti kategorileri.
- `vw_siparis_finans_ozeti`: Siparis no ve pazaryeri bazli finansal hareket ozeti.

## Guvenlik ve Yetki

- `kullanicilar`: Sistem kullanicilari.
- `roller`: Yetki rolleri.
- `kullanici_rolleri`: Kullanici-rol eslesmeleri.
- `denetim_loglari`: Kritik islemler, importlar, girisler ve hata izleri.

## Tasarim Ilkeleri

- Pazaryeri merkezlidir: tum ana hareketlerde `pazaryeri_id` vardir.
- `siparis_no` tum mutabakat baglantilarinda indekslidir.
- Komisyon ve desi mutabakati ayrik, raporlanabilir ve manuel incelemeye uygundur.
- Beklenen komisyon sistem tarafindan komisyon oranlarindan hesaplanir; faturalanan komisyon pazaryeri finans/fatura verisinden gelir.
- Beklenen desi/kargo tutari Hitit/ERP verisinden veya opsiyonel kargo-desi tarifesinden gelir; faturalanan desi/kargo tutari pazaryeri finansal hareketinden gelir.
- Excel kolonlari birebir tabloya gomulmek yerine normalize edilmis is tablolarina aktarilir; ham satirlar `ham_aktarim_satirlari.ham_veri` icinde kaybolmadan saklanir.
- Dashboard ve kar/zarar hesaplari icin detay hareketler korunur, ozetler `siparis_karlilik_ozetleri` tablosunda hizli sorgulanir.

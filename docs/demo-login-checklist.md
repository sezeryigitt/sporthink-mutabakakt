# Microsoft Login Demo Checklist

Bu checklist profesore gosterilecek MVP Microsoft login demosu icindir.

## Demo Ortami

- Test tenant primary domain: `sezeryigit2022gmail.onmicrosoft.com`
- App registration supported account type: `Single tenant only`
- Redirect URI: `http://localhost:5173`
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001/api`

## Demo Oncesi Kontrol

- Azure App Registration icinde SPA redirect URI `http://localhost:5173` olarak kayitli.
- API permissions ekraninda MVP disi Graph izinleri yok.
- Frontend `.env` demo tenant authority degerini kullaniyor.
- Backend `.env` sadece `sezeryigit2022gmail.onmicrosoft.com` domainini kabul ediyor.
- Backend `.env` `MICROSOFT_ADMIN_EMAILS` icinde demo yonetici hesabini iceriyor.
- `operasyon` rolu veritabaninda mevcut.
- Backend `/api/health` endpoint'i `database.status = up` donuyor.
- Tarayicida eski Microsoft veya localhost session verileri temizlenmis.

## Demo Akisi

1. `http://localhost:5173/login` adresini ac.
2. `Microsoft / Outlook ile Giris Yap` butonuna tikla.
3. Microsoft login ekraninda test tenant kullanicisi ile oturum ac.
4. Uygulama backend'e Microsoft `id_token` gonderir.
5. Backend token signature, audience, issuer, tenant ve domain kontrollerini yapar.
6. Kullanici yoksa `kullanicilar` tablosuna otomatik eklenir.
7. Yeni kullaniciya `operasyon` rolu atanir.
8. Backend app JWT uretir.
9. Frontend dashboard'a doner.
10. `GET /api/auth/me` app JWT ile kullanici bilgisini doner.

## Veritabaninda Beklenenler

- `kullanicilar.eposta`: test tenant kullanici e-postasi
- `kullanicilar.ad_soyad`: Microsoft profil adi
- `kullanicilar.giris_saglayici`: `microsoft`
- `kullanicilar.microsoft_oid`: Microsoft object id
- `kullanicilar.microsoft_tid`: Microsoft tenant id
- `kullanicilar.son_giris_zamani`: login zamani
- `kullanicilar.aktif_mi`: `1`
- `kullanici_rolleri`: kullanici icin `operasyon` rolu
- Demo yonetici hesabi icin `kullanici_rolleri`: `admin` rolu
- `denetim_loglari`: `auth.microsoft.user_created` ve `auth.microsoft.login_success`

## Production Notu

Bu demo ortaminda Microsoft login akisini gostermek icin test tenant kullanilmistir. Production ortaminda Sporthink'in kendi Microsoft Entra tenant'i ve `@sporthink.com.tr` domain'i kullanilacaktir.

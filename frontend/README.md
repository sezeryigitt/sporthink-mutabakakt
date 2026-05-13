# Sporthink Frontend

Sporthink pazaryeri mutabakat ve karlilik panelinin frontend uygulamasi.

## Calistirma

```bash
npm install
npm run dev
```

Varsayilan yerel adres: `http://localhost:5173`

## Microsoft login MVP

Bu MVP sadece OpenID Connect kimlik dogrulamasi yapar. MSAL login istegi minimum scope listesiyle calisir:

```ts
scopes: ["openid", "profile", "email"]
```

`User.Read`, `Mail.Read`, `Calendars.Read`, `offline_access` veya Microsoft Graph izinleri MVP kapsaminda kullanilmaz. DEU gibi kurumsal/universite tenant'larinda user consent kapaliysa, Microsoft yine de "Yonetici onayi gerekiyor" ekrani gosterebilir. Bu durumda Azure tenant yoneticisinin uygulamaya onay vermesi veya policy tarafinda kullanici onayini acmasi gerekir.

Bu demo ortaminda Microsoft login akisini gostermek icin test tenant kullanilmistir. Production ortaminda Sporthink'in kendi Microsoft Entra tenant'i ve @sporthink.com.tr domain'i kullanilacaktir.

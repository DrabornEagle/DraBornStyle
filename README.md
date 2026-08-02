# DraBornStyle v0.1 Final

DraBornStyle; berber, kuaför ve salonlar için geliştirilecek randevu, işlem, müşteri akışı, ödeme ve raporlama sisteminin **ilk temel sürümüdür**.

Bu dalda yalnızca yol haritasındaki **v0.1 Final — Giriş, Kayıt, Rol ve Panel Omurgası** aktiftir. v0.2 ve sonraki özellikler ana akışta açılmamıştır.

## v0.1 Final kapsamı

- Kayıt ve giriş ekranı
- Kayıt olan kullanıcıya otomatik `customer` rolü
- `dkd_user_role_access` rol erişim modeli
- Usta başvurusu
- İşletme sahibi başvurusu
- Admin başvuru onayı ve reddi
- Admin tarafından usta/işletme rolü ekleme ve kaldırma
- Rol bazlı panel yönlendirme
- Müşteri paneli
- Usta paneli
- İşletme paneli
- Admin paneli
- Birden fazla role sahip kullanıcı için panel değiştirme
- Demo oturum, kullanıcı, rol ve başvuru verilerinin AsyncStorage içinde saklanması
- `index.js → App.tsx` ana giriş yapısı
- Modern ve responsive berber temalı arayüz

## Demo hesapları

Tüm demo hesaplarının şifresi: `123456`

| Rol | E-posta |
|---|---|
| Müşteri | `musteri@demo.com` |
| Usta | `usta@demo.com` |
| İşletme | `isletme@demo.com` |
| Admin | `draborneagle@gmail.com` |

Ek olarak `basvuru@demo.com` hesabında admin panelinden onaylanabilecek bekleyen usta başvurusu bulunur.

## Expo Go ile temiz test

```bash
cd ~
rm -rf DraBornStyle
git clone https://github.com/DrabornEagle/DraBornStyle.git
cd DraBornStyle
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --tunnel --clear
```

Android telefonunda güncel Expo Go uygulamasını açıp QR kodunu okut.

## Veri yapısı

v0.1 demosunda Supabase yoktur. Demo veri ve oturum değişiklikleri şu anahtarda cihazda saklanır:

```text
@drabornstyle/v0.1-final/demo-state
```

Gerçek Supabase entegrasyonunda rol erişim kaynağı `dkd_user_role_access` olarak korunacaktır.

## Sürüm disiplini

- Güncel uygulama sürümü: `0.1.0`
- Sonraki geliştirme: `v0.2.17 Final`
- v0.2 başlamadan önce v0.1 kullanıcı, rol, başvuru ve panel omurgası korunacaktır.

Detaylı durum listesi için [ROADMAP.md](ROADMAP.md), test senaryoları için [docs/V0.1_TEST_PLAN.md](docs/V0.1_TEST_PLAN.md) dosyasına bakın.

# DraBornStyle

DraBornStyle; berberleri keşfetme, hizmet seçme, randevu oluşturma ve Style Club deneyimini gösteren, **veritabanı kullanmayan Expo Go demo uygulamasıdır**.

## Güncel sürüm

- **v0.3.0 — v0.1 + v0.2 + v0.3 toplu demo**
- Expo SDK 57
- React Native 0.86
- React 19.2
- Android Expo Go için hazırlanmıştır.
- Supabase, backend ve API anahtarı yoktur.
- Demo değişiklikleri yalnızca cihazdaki AsyncStorage alanında saklanır.

## Tamamlanan ana özellikler

- Animasyonlu onboarding
- Modern renkli berber arayüzü
- Arama, filtreleme ve favoriler
- Canlı demo sıra ve ilk boş saat bilgisi
- Hizmet + gün + saat seçilen randevu akışı
- Yaklaşan/geçmiş randevu yönetimi
- İptal ve yeniden planlama
- Style Club puan, ödül ve görev ekranı
- Bildirim paneli
- Profil, bildirim tercihi ve demo sıfırlama
- Cihazda kalıcı demo verileri
- Dar Android ekranlar için responsive yerleşim
- Safe-area uyumlu alt navigasyon ve rezervasyon paneli

Tam kutucuklu sürüm planı için [ROADMAP.md](ROADMAP.md) dosyasına bakın.

## Expo Go ile temiz kurulum

```bash
cd ~
rm -rf DraBornStyle
git clone https://github.com/DrabornEagle/DraBornStyle.git
cd DraBornStyle
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --tunnel --clear
```

Android telefonda güncel Expo Go uygulamasını açıp terminaldeki QR kodunu okutun.

> Termux ekranında görünen React Native DevTools `arm64` uyarısı Metro'yu durdurmuyorsa uygulamanın açılmasına engel değildir. QR kodu ve `Using Expo Go` satırı görünüyorsa Metro çalışmaktadır.

## Sürüm geçmişi

### v0.1

Temel Expo Go yapısı, modern ana sayfa, demo veriler, berber/hizmet kartları, navigasyon ve temel animasyonlar.

### v0.2

Keşfet, filtreler, favoriler, tam randevu paneli, randevu yönetimi ve Style Club.

### v0.3

AsyncStorage kalıcılığı, onboarding, bildirimler, profil, demo sıfırlama, gelişmiş animasyonlar ve tüm ekranlarda responsive düzeltmeler.

## Veri mimarisi

`src/data/mockData.ts` demo berber, hizmet, tarih ve saat verilerini sağlar. Kullanıcı etkileşimleri `src/hooks/usePersistentDemo.ts` üzerinden AsyncStorage'a yazılır. Gerçek ürün aşamasında bu katman Supabase servisleriyle değiştirilecektir.

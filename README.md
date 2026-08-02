# DraBornStyle

DraBornStyle; berberleri keşfetme, hizmet seçme, randevu oluşturma ve sadakat ödüllerini deneyimleme odaklı, **veritabanı kullanmayan Expo Go demo uygulamasıdır**.

## Güncel sürüm

- **v0.3.0**
- Expo SDK 57
- React Native 0.86
- React 19.2
- Android Expo Go ile test edilmek üzere hazırlanmıştır.
- Supabase, backend ve API anahtarı yoktur.
- Demo değişiklikleri yalnızca cihazdaki AsyncStorage alanında saklanır.

## Özellikler

- 3 ekranlık animasyonlu onboarding
- Renkli modern berber teması ve hareketli arka plan dokuları
- Arama, filtreleme ve favori berberler
- Canlı demo sıra bilgisi ve ilk müsait saat
- Hizmet + gün + saat seçilen rezervasyon akışı
- Yaklaşan/geçmiş randevu yönetimi
- Style Club puan, ödül ve haftalık görev ekranı
- Bildirim paneli
- Profil, bildirim tercihi ve demo verilerini sıfırlama
- Buton basma, sayfa geçişi, sheet, progress ve giriş animasyonları

## Expo Go ile çalıştırma

Termux veya bilgisayarda:

```bash
git clone https://github.com/DrabornEagle/DraBornStyle.git
cd DraBornStyle
npm install
npx expo start --tunnel
```

Android telefonda güncel Expo Go uygulamasını açıp terminaldeki QR kodunu okutun.

## Sürüm geçmişi

### v0.1
- Expo SDK 57 proje temeli
- Modern ana sayfa
- Demo berber ve hizmet verileri
- Alt navigasyon ve temel animasyonlar

### v0.2
- Keşfet arama/filtre sistemi
- Favoriler
- Hizmet, gün ve saat seçilen rezervasyon paneli
- Randevu listesi ve Style Club taslağı

### v0.3
- AsyncStorage ile yerel demo kalıcılığı
- Onboarding, bildirimler, profil ve demo sıfırlama
- Ödül görevleri, canlı sıra, gelişmiş mikro animasyonlar
- Arayüz ve akışların tam demo cilası

## Veri mimarisi

`src/data/mockData.ts` içindeki berber, hizmet, tarih ve saat verileri kullanılır. Kullanıcı etkileşimleri `src/hooks/usePersistentDemo.ts` üzerinden AsyncStorage'a yazılır. Gerçek ürün aşamasında bu katman Supabase servisleriyle değiştirilebilir.

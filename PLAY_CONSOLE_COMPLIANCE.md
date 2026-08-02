# DraBornStyle 0.4.0 — Google Play Kontrol Listesi

## Teknik sürüm

- Uygulama sürümü: `0.4.0`
- Android versionCode: `1`
- Paket adı: `com.draborneagle.drabornstyle`
- Expo SDK: `57`
- Android targetSdkVersion: Expo SDK 57 varsayılanı olan API 36
- Google Play yükleme dosyası: Release AAB
- Release APK: yalnızca doğrudan cihaz testi için

## Uygulanan güvenlik ve gizlilik önlemleri

- Gizlilik politikası depoda herkese açık tutulur.
- Hesap/veri silme açıklaması depoda herkese açık tutulur.
- Uygulama içinden yerel kullanıcı verilerini temizleme yolu bulunur.
- Kullanılmayan konum, mikrofon, kamera, medya, rehber, telefon ve üstte gösterim izinleri engellenir.
- Reklam SDK'sı yoktur.
- Analiz SDK'sı yoktur.
- Sunucuya veri aktarımı yoktur.
- Arka planda konum veya izleme yoktur.
- Kullanıcı tarafından oluşturulan demo verileri yalnızca cihazda tutulur.

## Play Console beyanları

Mevcut 0.4.0 koduna göre aşağıdaki cevaplar kullanılmalıdır. Uygulamaya yeni SDK veya çevrimiçi hizmet eklenirse cevaplar yeniden değerlendirilmelidir.

- **Reklam içeriyor mu?** Hayır.
- **Uygulama erişimi:** Demo kullanıcıları ve uygulama içi kayıt akışıyla erişilebilir.
- **Hedef kitle:** Çocuklara özel değildir.
- **Haber/sağlık/finans uygulaması:** Hayır.
- **Konum verisi:** Toplanmaz.
- **Kişiler/rehber:** Toplanmaz.
- **Fotoğraf/video:** Toplanmaz.
- **Ses:** Toplanmaz.
- **Cihaz kimliği veya reklam kimliği:** Uygulama kodu tarafından toplanmaz.
- **Kişisel bilgiler:** Ad, e-posta ve telefon yalnızca cihazdaki çevrimdışı demo işlevleri için kullanıcı tarafından girilebilir; geliştiriciye veya üçüncü tarafa aktarılmaz.
- **Veri paylaşımı:** Yok.
- **Veri silme:** Uygulama içindeki Gizlilik ve Veri merkezi veya uygulamayı kaldırma yoluyla.

## Play Console'a girilecek bağlantılar

- Gizlilik politikası: `https://github.com/DrabornEagle/DraBornStyle/blob/main/PRIVACY_POLICY.md`
- Hesap/veri silme açıklaması: `https://github.com/DrabornEagle/DraBornStyle/blob/main/ACCOUNT_DELETION.md`

## Yayın öncesi manuel mağaza kontrolleri

Aşağıdaki öğeler kaynak koddan otomatik üretilemez ve Play Console'da tamamlanmalıdır:

- özgün uygulama simgesi,
- özellik görseli ve telefon ekran görüntüleri,
- kısa ve uzun mağaza açıklaması,
- içerik derecelendirme anketi,
- hedef kitle ve içerik beyanı,
- Data safety formunun bu belgeyle tutarlı doldurulması,
- uygulama imzalama ve Play App Signing kurulumu,
- ilk AAB'nin dahili test kanalına yüklenmesi.

## Her yayın öncesi zorunlu doğrulama

```bash
npm install
npm run typecheck
npx expo-doctor@latest
npx expo config --type public
```

VersionCode her Google Play yüklemesinde bir önceki yüklemeden büyük olmalıdır. `0.4.0` için başlangıç değeri `1`; sonraki Play yüklemesinde en az `2` kullanılmalıdır.

# DraBornStyle v0.1.1 · Expo Go açılış düzeltmesi

11 Ekim 2026. Kullanıcının Expo Go 58.0.2 ekranında bildirilen hata:

```text
[runtime not ready]: Cannot find native module 'ExpoTopicSubscriptionModule'
```

`src/services/notifications.ts` dosyası bildirim paketini uygulama açılışında import ediyordu. SDK 58'de paketin ana giriş noktası konu aboneliği modülünü de yükler; Android Expo Go'da bu native modül bulunmayınca React ekranları açılmadan hata oluşuyordu. İşlev içindeki Expo Go kontrolü, import daha önce çalıştığı için açılışı korumuyordu.

v0.1.1'de bu import ilk açılıştan kaldırıldı. Android Expo Go yolu, bildirim ayarları düğmesine basıldığında da paketi çalıştırmadan uygulama içi bildirim durumunu döndürür. Development build'de paket gerektiğinde yüklenir; EAS yapılandırması veya native modül eksikse anlaşılır hata gösterilir. Android yerel/uzaktan cihaz bildirimleri bu Expo Go test yolunda kullanılmaz. Supabase uygulama içi bildirim sorguları ve realtime bağlantısı korunur.

## Doğrulama

- `npm run typecheck`: geçti.
- `npm test`: toplam 8 test geçti; 5 bildirim regresyon testi ve 3 mevcut para/tarih testi.
- Regresyon testi gerçek bildirim servisinin TypeScript kodunu çalıştırır. Native paket yüklenirse kullanıcının bildirdiği hatayı atan bir ortamla uygulama açılışını ve bildirim düğmesini doğrular. Android Expo Go ve web için native paket yükleme sayısı sıfırdır.
- Development build için eksik EAS yapılandırması, eksik native modül, push token kaydı ve cihaz token'ının kaldırılması denetlendi. Gerçek FCM teslimatı test edilmedi.
- `npm run export:android`: Hermes/JavaScript paketi geçti, 903 modül. APK/AAB değildir.
- `npm run export:web`: geçti.
- Yerel çevrimdışı Expo bağımlılık kontrolü geçti; çevrimiçi kontrol GitHub Actions tarafından yürütülür.
- Fiziksel Android cihazda v0.1.1 açılışı henüz doğrulanmadı. Bu rapor native modül eksikliği altında servis regresyonunu ve paket üretimini kapsar.

## Güncelleme

Termux'taki eski Metro sunucusunu Ctrl+C ile durdurun. README'deki ZIP komutları güncel kaynakları ayrı `DraBornStyle-v0.1.1` klasörüne indirir; `--go --localhost --port 8081 --clear` ile başlatır. Aynı telefondaki Expo Go 58.0.2'de `exp://127.0.0.1:8081` adresini açın. Bu işlem Supabase kayıtlarını veya cihazdaki oturum verisini silmez.

`SUPABASE_ACCESS_TOKEN`, GitHub Actions'ın veritabanı migration yetkisidir; uygulamanın Expo Go açılış hatasının çözümü değildir. Token yalnızca repository Actions secret olarak saklanmalıdır; uygulamaya, `.env` istemci ayarlarına veya kaynaklara yazılmamalıdır.

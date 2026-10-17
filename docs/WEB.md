# DraBornStyle · Android ile ortak web sürümü

Web: https://www.draborneagle.com/DraBornStyle/

Kaynak: https://github.com/DrabornEagle/DraBornStyle
Yayın klasörü: https://github.com/DrabornEagle/DrabornEagle_Web/tree/main/DraBornStyle

Bu klasör aynı React Native / Expo kaynaklarından üretilir. Ekranlar, marka görselleri, müşteri/usta/işletme/admin rolleri, fiyat hesaplama ve doğrulamalar Android ile ortaktır. Ayrı bir web veritabanı veya örnek kullanıcı oluşturulmaz.

## Ortak veriler ve yetkiler

- İki cihazda aynı hesabınızla giriş yapın. Randevular, çalışma saatleri, hizmet/fiyatlar, sohbet, favoriler, profil, bildirimler ve ödeme kayıtları aynı `xpdiwyxnnrmyvpcqwuyb` Supabase projesinde tutulur.
- Aynı `db_style_query`, `db_style_command`, `db_style_slots` ve fiyat RPC'leri, Storage kovaları ve sunucu RLS kuralları kullanılır. Tarayıcı oturumu bu uygulamaya ait `db_style_auth_v01` anahtarında saklanır.
- Realtime açık ekranları günceller. Bağlantı tekrar kurulduğunda ve uygulamaya dönüldüğünde veriler yeniden okunur; 45 saniyelik kontrol kaçırılmış değişiklikleri tamamlar.
- Normal hesaplar ve misafirler demo kayıtlarını göremez. Admin kendi demo görünümünü açıkça etkinleştirmelidir. Gerçek verilerle test için demo kapalı kalır.
- Randevu oluşturulduğunda konum onayı açılır. Tarayıcı konum izni ancak onaydan sonra istenir; paylaşım aynı randevu ve iki saatlik sunucu sınırıyla çalışır.

## Tarayıcı uyarlamaları

Mobilde Android düzeni, masaüstünde aynı ekranların en fazla 1120 piksel genişliği kullanılır. Tarayıcıda harita Leaflet/OpenStreetMap, yol tarifi Google Maps ile açılır; işletme ve izinle paylaşılan müşteri konumları birlikte gösterilir. Fotoğraf ve dekontlar tarayıcının dosya seçicisiyle yüklenir. HTTPS ve konum izni gerekir. Uygulama içi bildirimler ortaktır. Kapalı sekmede Android arka plan konumu veya Android push servisi çalışmaz.

E-posta doğrulama ve şifre sıfırlama bağlantıları webde `/DraBornStyle/` ve `/DraBornStyle/reset/` adreslerine döner. Ortak kaynak reposundaki mevcut deployment CI, `scripts/dkd-configure-web-auth.mjs` ile yalnızca bu iki üretim adresini Supabase Auth izin listesine ekler ve yeniden okuyarak doğrular. Önceden izinli adresler, Android bağlantıları ve ortak projenin varsayılan Site URL ayarı korunur. Deployment erişim anahtarı yalnızca mevcut CI secret'ından okunur; Auth config içeriği veya gizli anahtarlar günlüğe ya da web dosyalarına yazılmaz.

## Yeniden üretme

```bash
git clone https://github.com/DrabornEagle/DraBornStyle.git
cd DraBornStyle
npm ci
npm run check
npm run export:site
```

`dist-site/` içeriği web reposundaki `DraBornStyle/` klasörüne kopyalanır. Alt dizin ön eki derleme sırasında uygulanır; `index.html` elle yamanmaz. `DKD-SOURCE.json` yayının hangi Android kaynak commit'inden üretildiğini gösterir. `DrabornEagle_Web` reposundaki `dkd-drabornstyle-web-sync.yml` yeni kaynak commit'ini kontrol eder, test eder ve sadece bu klasörü günceller; elle de çalıştırılabilir. Bu klasördeki üretilmiş JS dosyalarını düzenlemeyin, ortak kaynakta değişiklik yapın.

Veri senkronizasyonu Realtime ile anlıktır. Kaynak kod güncellemelerinin webde yayınlanması ise senkronizasyon iş akışı tamamlandıktan sonra gerçekleşir.

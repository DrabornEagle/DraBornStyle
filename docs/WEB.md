# DraBornStyle · Android ile ortak web sürümü

Web: https://www.draborneagle.com/DraBornStyle/

Kaynak: https://github.com/DrabornEagle/DraBornStyle
Yayın klasörü: https://github.com/DrabornEagle/DrabornEagle_Web/tree/main/DraBornStyle

Bu klasör aynı React Native / Expo kaynaklarından üretilir. Ekranlar, marka görselleri, müşteri/usta/işletme/admin rolleri, fiyat hesaplama ve doğrulamalar Android ile ortaktır. Ayrı bir web veritabanı veya örnek kullanıcı oluşturulmaz.

İlk ziyaret ve çıkış sonrası doğrudan berber görselli giriş formu açılır; aradaki karşılama ekranı kaldırılmıştır. Chrome'da yazarken görünen iç odak çerçevesi kaldırılır, erişilebilir renkli dış odak çerçevesi korunur. Kaydedilmiş e-posta/şifre doldurma işlevi çalışmaya devam eder ve koyu tema kullanır. Ana sayfa ve Keşfet, ortası sakin bırakılmış Miami berber/palmiye arka planını kullanır; profil ve ayrıntı ekranları sade kalır.

## Ortak veriler ve yetkiler

- İki cihazda aynı hesabınızla giriş yapın. Randevular, çalışma saatleri, hizmet/fiyatlar, sohbet, favoriler, profil, bildirimler ve ödeme kayıtları aynı `xpdiwyxnnrmyvpcqwuyb` Supabase projesinde tutulur.
- Aynı `db_style_query`, `db_style_command`, `db_style_slots` ve fiyat RPC'leri, Storage kovaları ve sunucu RLS kuralları kullanılır. Tarayıcı oturumu bu uygulamaya ait `db_style_auth_v01` anahtarında saklanır.
- Realtime açık ekranları günceller. Bağlantı tekrar kurulduğunda ve uygulamaya dönüldüğünde veriler yeniden okunur; 45 saniyelik kontrol kaçırılmış değişiklikleri tamamlar.
- Normal hesaplar ve misafirler demo kayıtlarını göremez. Admin kendi demo görünümünü açıkça etkinleştirmelidir. Gerçek verilerle test için demo kapalı kalır.
- Randevu oluşturulduğunda konum onayı açılır. Tarayıcı konum izni ancak onaydan sonra istenir; paylaşım aynı randevu ve iki saatlik sunucu sınırıyla çalışır.

## Tarayıcı uyarlamaları

Mobilde Android düzeni, masaüstünde aynı ekranların en fazla 1120 piksel genişliği kullanılır. Tarayıcıda harita Leaflet/OpenStreetMap, yol tarifi Google Maps ile açılır; işletme ve izinle paylaşılan müşteri konumları birlikte gösterilir. Fotoğraf ve dekontlar tarayıcının dosya seçicisiyle yüklenir. HTTPS ve konum izni gerekir. Uygulama içi bildirimler ortaktır. Kapalı sekmede Android arka plan konumu veya Android push servisi çalışmaz.

E-posta doğrulama ve şifre sıfırlama bağlantıları webde `/DraBornStyle/` ve `/DraBornStyle/reset/` adreslerine döner. Supabase Authentication → URL Configuration → Redirect URLs listesinde `https://www.draborneagle.com/DraBornStyle/` ve `https://www.draborneagle.com/DraBornStyle/reset/` adresleri izinli olmalıdır. Önceden izinli adresler, Android bağlantıları ve ortak projenin Site URL ayarı korunmalıdır.

**17 Ekim 2026 doğrulaması:** Her iki DraBornStyle üretim adresi Supabase panelinde kaydedildi. Sayfa yeniden yüklenerek sunucuda kalıcı oldukları doğrulandı. Var olan DraBornSeries yönlendirmeleri ve ortak projenin Site URL ayarı korundu. Bu yayın için bekleyen Auth URL yapılandırması kalmadı. E-posta gönderimi ve gerçek kullanıcı hesabıyla şifre değiştirme bu kontrolde yapılmadı.

Şifre sıfırlama sayfası, oturum yazı tipleri yüklenmeden önce açılmış olsa da `/reset/` dönüş yolunu tanır. Sayfa yenilendiğinde şifre formu korunur; başarılı değişiklikten sonra dönüş yolu temizlenir.

Mevcut veritabanı deployment anahtarı Auth ayar API'sinde HTTP 403 döndürdüğünden, bu ayar ayrı yönetilir. Auth ayar yetkisi olan bir CI anahtarı yapılandırıldığında `DKD_STYLE_CONFIGURE_WEB_AUTH=true` repository variable'ı, `scripts/dkd-configure-web-auth.mjs` yardımcısını etkinleştirir. Yardımcı sadece bu iki adresi ekler ve yeniden okuyarak doğrular; mevcut adresleri silmez, Site URL'yi değiştirmez, Auth config içeriği veya gizli anahtarları günlüğe ya da web dosyalarına yazmaz. Anahtarları sohbet veya istemci kodunda paylaşmayın.

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

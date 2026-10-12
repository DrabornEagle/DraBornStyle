# DraBornStyle v0.4.0 doğrulama raporu

12 Ekim 2026 · Mevcut Supabase projesi: `xpdiwyxnnrmyvpcqwuyb` (DraBorn-Park-Garage-Series).

Bu rapor gerçek veritabanı, HTTP API, web arayüzü ve paket üretimini birbirinden ayırır. Web ekran testleri fiziksel Android / Expo Go testi değildir. Demo içindeki finans verileri açıkça örnek olarak etiketlenir; gerçek ödeme tahsilatı yapılmadı.

## 12 Ekim 2026 · Login, otomatik konum onayı ve organik veriler

- Sürüm `0.4.0`, Android version code `1` olarak kaldı. Login'de eski salon arka planı, aşağı alınmış marka yazısı ve büyütülmüş logo; diğer ekranlarda sade zemin kullanılır.
- TypeScript, 19 regresyon testi, 25 yerel Chromium kontrolü, Android Hermes/Web paketleri ve çevrimdışı Expo paket kontrolü geçti. Konum onayı randevu oluşturulunca açılır; Daha Sonra/manuel tekrar açma ve simüle tarayıcı GPS'iyle onaydan sonra paylaşım doğrulandı. Fiziksel Android GPS/izin testi yapılmadı.
- Supabase migration `20261012085802_db_style_dkd_demo_visibility` uygulandı. 37 kısıtlayıcı erişim politikası eklendi. Normal/anon hesaplar demo işletmeleri ve bağlı kayıtları göremez; Admin yalnızca demo modunu açınca görür. Doğrudan fiyat, saat ve randevu RPC'leri de aynı görünürlük sınırını uygular. Demo varsayılan kapalı; önceden kalan demo kayıtları silinmedi.
- `tests/demo-isolation.sql` gerçek PostgreSQL üzerinde geçti: yalnızca sentetik Auth kimlikleri ve uygulama fixture'ları, Admin aç/kapat, normal kullanıcı/ziyaretçi sorguları, doğrudan RPC engelleri ve gerçek işletme için fiyat/randevu akışı. Sonunda bütün fixture değişiklikleri ROLLBACK ile geri alındı; özel bir kullanıcının hesabına giriş yapılmadı.
- Son durum: 0 etkin demo grubu, 0 gerçek işletme. Kullanıcı gerçek işletmesini eklediğinde normal keşif ekranında listelenebilir. Test kayıtları bırakılmadı.
- Güvenlik danışmanı taramasında `db_style` kapsamına ait bulgu yok. Ortak projenin diğer uygulamalarına ait nesneler değiştirilmedi.
- Kanıt: `docs/ui-v04-results.json`, `docs/screens/v04-*.png`, `tests/location-consent.test.mjs` ve `tests/demo-isolation.sql`.

## 11 Ekim 2026 · v0.4.0 / version code 1 · Sadeleştirme

- Expo yapılandırması `version: 0.4.0`, `android.versionCode: 1`; paket ve kilit dosyası sürümleri de `0.4.0`.
- TypeScript, 16 birim/regresyon testi, yerel çevrimdışı Expo bağımlılık kontrolü, Android Hermes ve Web paket üretimi geçti. Çevrimdışı bağımlılık kontrolü uzak manifest doğrulaması değildir; CI çevrimiçi kontrol çalıştırır.
- Giriş logosu ve eşit genişlikli yakın seçenekler, karşılama düğmeleri, geçişte kaydırmanın sıfırlanması, profil grupları ve menü yönlendirmeleri yerel Web paketinde örnek hesap/API verileriyle kontrol edilir. 21 kontrol grubu geçti; yakalanmamış tarayıcı hatası yok. Genişlikler 320, 360, 414 ve 1120 piksel. Kanıt: [ui-v04-results.json](ui-v04-results.json) ve `screens/v04-*.png`.
- Örnek arayüz oturumu gerçek bir Supabase hesabı değildir. HTTP ve WebSocket istekleri tarayıcı içinde karşılanır/engellenir; bu sonuçlar canlı sunucu kimlik doğrulamasını veya veritabanı işlevlerini doğrulamaz.
- Canlı hesaba giriş kontrolü otomatik onay incelemesi tarafından, bu görevde hesap erişim yetkisi doğrulanamadığı gerekçesiyle engellendi; sürdürülmedi. Önceki sürümlerdeki canlı giriş sonuçları bu sürümde yeniden elde edilmiş gibi gösterilmez.
- Fiziksel Android/Expo Go/Termux, klavye/izin/GPS ve APK/AAB testi yapılmadı. `export:android`, APK/AAB değil Hermes/JavaScript paketi üretir. Bu sürümde veritabanı migration değişikliği yok.

### Android hata düzeltmeleri

- Finans tahsilat kartında `Card`/`LinearGradient` altında kalan `{" "}` kaldırıldı. Bu metin Android'deki `<Text>` hatasını doğuruyordu. Bütün kaynak JSX dosyaları için literal metin/sayı kontrolü ve raporlanan boşluğu yakalayan regresyon testi eklendi. Harita koordinatı `0` olduğunda koşullu render'ın ham sayı döndürmesi de önlendi.
- `ImageBackground` kullanımları `View` + mutlak konumlu `Image` olarak değiştirildi.
- Konum servisi Expo'nun `isRunningInExpoGo()` kontrolünü kullanır; Expo Go/Web görev tanımlamaz ve arka plan konum durumunu sorgulamaz. Ön plan paylaşımı/kapatma, sunucudaki paylaşım izninin geri alınması, development build arka plan başlangıç/bitişi ve izin reddi yerel native API taklitleriyle test edilir.
- `npm run start:termux`, Expo CLI 58'in `EXPO_UNSTABLE_HEADLESS=1` seçeneğini kullanır. CLI kaynaklarında bu ayar `enableStandaloneFuseboxShell` değerini kapatır; Android/arm64 için olmayan masaüstü uygulama kurulumunu başlatmaz. Bağımlılık ve yeni mimari doğrulaması açık tutulur. Regresyon testi kurulu CLI middleware'inin gerçek seçeneklerini kontrol eder. IPv4 DNS önceliğiyle Metro `127.0.0.1` üzerinden hazır durum yanıtı verdi; masaüstü kurulum hatası oluşmadı (yerel Linux başlangıç kontrolü, fiziksel Termux testi değil). Üretim modu veya LogBox kapatma kullanılmaz.
- Bu testler fiziksel Android çalıştırması değildir. Termux'a özgü native sistem davranışı gerçek cihazda ayrıca kontrol edilmelidir.

## v0.3.0 · Gönderilen mockuplara göre yeniden kurulan arayüz

- On referansın ekran eşleştirmesi ve uygulama farkları [DESIGN.md](DESIGN.md) içinde. Önceki çizimli Miami sahnesi kaldırıldı; fotoğraf salon arka planı, alfa şeffaf neon makas markası ve gömülü Allura el yazısı fontu eklendi. Keşfet, rol panelleri, randevu takvimi, çalışan haftası ve sohbet yeniden düzenlendi.
- TypeScript, 8 birim/regresyon testi, çevrimdışı Expo paket uyumu, Android Hermes ve Web paket üretimi geçti. Çevrimdışı uyum kontrolü tek başına uzak manifest doğrulaması değildir; CI ayrıca çevrimiçi kontrol çalıştırır.
- 13 Chromium kontrol grubu gerçek Supabase verisiyle geçti: yeni giriş formu/Enter, e-posta normalizasyonu, şifre görünürlüğü, tüm roller, arama, ay/gün/saat seçimi, onay düğmesinin seçim öncesi kapalı olması, isteğe bağlı kod, çalışan editörüne geçiş, sohbet alanı, rapor doğrulaması, finans ve global menü. [ui-design-results.json](ui-design-results.json).
- 360, 414, 864 ve 1120 pikselde ekran görüntüleri alındı; kök yatay taşma ve yakalanmamış tarayıcı hatası yok. Dar sohbet başlığı ve tek günlük grafiğin aşırı geniş çubuğu görsel incelemeden sonra düzeltildi. Yatay işletme/usta/saat listeleri ve zaman çizelgesi bilerek kaydırılabilir.
- Test uygulama verilerine yazmaz: command RPC'leri testte durdurulur. Mevcut aktif demo grubu korunur; yeni demo, randevu, çalışan, ödeme veya mesaj oluşturulmaz. Normal Auth giriş isteği doğrulanır, parola ve yetkiler değiştirilmez. Admin hesabının şifresi kaynağa yazılmaz.
- Bu sürüm için yeni migration yok. Önceki RLS, finans ve Expo Go bildirim korumaları korunmuştur. Önceki 17 yazma/gerçek zamanlı test bu sürümde yeniden çalıştırılmış gibi gösterilmez.
- Fiziksel Android/Termux/Expo Go, GPS/harita/seçici/klavye/işletim sistemi izin testi yapılmadı. SDK paket üretimi APK/AAB üretimi değildir. E-posta teslimatı ve Google/telefon sağlayıcıları bu tasarım işiyle yapılandırılmadı.

## v0.2.0 · Tarihsel Berber / Miami arayüzü ve yönetici girişi

- Yeni tasarım sistemi, hareketli berber direği ve gün batımı/palmiye çizimi, giriş ve keşif düzeni, hızlı işlemler, rol panelleri, kartlar, formlar, sohbet balonları ve alt gezinme çubuğu hazır. Hareket azaltma ayarı ve arka plan durumu animasyonları durdurur.
- `draborneagle@gmail.com` için istenen mevcut şifreyle canlı Auth API ve gerçek giriş formu başarılı. Sunucu Admin yetkisini UUID tablosundan doğruladı. Şifre değiştirilmedi ve kaynağa yazılmadı. E-posta çevresindeki boşluklar/büyük harf, şifre göster/gizle ve Enter ile giriş canlı formda doğrulandı.
- TypeScript, 8 birim/regresyon testi, çevrimdışı SDK paket kontrolü, Android Hermes ve Web paket üretimi geçti.
- 17 canlı Chromium arayüz senaryosu geçti; sonuçlar [ui-test-results.json](ui-test-results.json), görseller [screens](screens) altında. Demo yükleme, tüm roller, randevu oluşturma/iptali, çat kapı işlemi başlatma/tamamlama, çalışan ekleme, gerçek zamanlı mesaj, çevrimdışı yazmanın engellenmesi ve yeniden bağlantıda tek mesaj doğrulandı. 360 ve 414 piksel yerleşimleri kontrol edildi.
- Test demo verileri temizlendi. 45 uygulama tablosunun 45’inde RLS etkin. Mevcut Admin kaydı korunuyor. v0.2.0 için yeni migration yok.
- `SUPABASE_ACCESS_TOKEN` tek proje, Database Read-write ve 90 gün kapsamıyla oluşturulup GitHub Actions repository secret olarak kaydedildi. Token şema düzeyinde değil, proje veritabanı düzeyinde erişim taşır. Migration scripti yalnız `db_style` dosyalarını uygular.
- Secret kurulumundan sonraki [CI #6](https://github.com/DrabornEagle/DraBornStyle/actions/runs/38144678520) çalışmasında `validate` ve `migrations` işleri başarıyla tamamlandı; secret eksikliği adımı atlandı.
- Fiziksel Android / Termux / Expo Go testi bu çalışma ortamında yapılmadı. Aşağıdaki v0.1 ve v0.1.1 bölümleri tarihsel doğrulama kanıtlarıdır.

## v0.1.1 · Expo Go açılış düzeltmesi

Kullanıcının gerçek cihazında `ExpoTopicSubscriptionModule` eksikliği nedeniyle ilk açılış hatası bildirmesinin ardından Android Expo Go'daki eager bildirim import'u kaldırıldı. Eksik native modülü taklit eden servis açılışı ve düğme testleri dahil toplam 8 test geçti; TypeScript, Android Hermes/Web paket üretimi ve yerel bağımlılık kontrolü başarılı. Fiziksel cihazda düzeltmenin açılışı henüz doğrulanmadı. Ayrıntılar: [EXPO-GO-FIX.md](EXPO-GO-FIX.md). Aşağıdaki kapsamlı DB/UI kanıtları v0.1 için çalıştırılan testlerdir; bu istemci düzeltmesi veritabanında değişiklik yapmaz.

## Uygulanan değişiklikler

- 12 migration mevcut projeye uygulandı; dosya/sürüm listesi [migrations.json](migrations.json).
- Özel `db_style` şemasında 45 tablo, tamamında RLS. `public` şemasındaki beş API girişinin tamamı `SECURITY INVOKER`; doğrudan özel şema REST erişimi açılmadı.
- Usta takviminde PostgreSQL aralık çakışma kısıtı, transactional iş akışları, idempotency anahtarı ve değişmez kuruş bazlı finans kayıtları.
- İki uygulamaya özel storage bucket, realtime yayınları ve iki zamanlanmış iş oluşturuldu. Diğer uygulamaların bucket veya politikaları değiştirilmedi.
- Mevcut Auth hesabı güvenli Admin UUID kaydıyla yetkilendirildi; giriş API üzerinden doğrulandı. Ortak Auth kullanıcıları silinmedi, parola kaynaklara yazılmadı.
- Kullanılan görseller, rol ekranları ve modüler kaynaklar `src`, `assets`, `supabase`, `tests` dizinlerindedir. APK/AAB oluşturulmadı.

## Çalıştırılan kontroller

| Kontrol                          | Sonuç                         | Kanıt / sınır                                                                                                                                |
| -------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                       | Geçti                         | `npm run typecheck`                                                                                                                          |
| Para ve İstanbul tarih işlemleri | 3 test grubu geçti            | `npm test`; kuruş girişleri, indirim/borç hesabı, geçersiz tarih ve gün sınırları                                                            |
| Gerçek PostgreSQL iş akışları    | Geçti                         | `tests/database.sql`; bütün fixture değişiklikleri `ROLLBACK` ile geri alındı                                                                |
| Gerçek HTTP eşzamanlılık         | Geçti                         | `tests/live-api.mjs`; aynı slot için iki eşzamanlı istekte biri başarılı, biri reddedildi; aynı anahtarlı tekrar tek kayıt döndürdü          |
| Canlı API kaynakları             | Geçti                         | 10 yetkili kaynak ve rapor tutarları; yalnızca etiketli demo fixture kullanıldı                                                              |
| Mobil genişlikte web arayüzü     | 15 kontrol geçti, hata yok    | 09:44 UTC; `tests/ui-smoke.cjs`, [ui-test-results.json](ui-test-results.json); gerçek Supabase API ve WebSocket bağlantısı kullanıldı        |
| Android Hermes paketi            | Geçti                         | `npm run export:android`; 901 modül, yaklaşık 2,8 MB JS/Hermes paketi; APK değildir                                                          |
| Web paketi                       | Geçti                         | `npm run export:web`; yaklaşık 1,2 MB JS paketi                                                                                              |
| Expo Go sürüm eşleşmesi          | Geçti                         | Resmî manifest Android 58.0.2 → SDK 58; exact bağımlılıklar [expo-compatibility.json](expo-compatibility.json)                               |
| Expo bağımlılık kontrolü         | Çevrimdışı SDK kontrolü geçti | `EXPO_OFFLINE=1 npx expo install --check`; yerel çevrimiçi kontrol proxy bağlantısında tamamlanmadı; GitHub Actions çevrimiçi kontrolü geçti |
| Supabase güvenlik danışmanı      | Style bulgusu yok             | 09:36 UTC kontrolünde `db_style` için güvenlik bulgusu sıfır; diğer uygulamaların uyarıları değiştirilmedi                                   |
| Zamanlanmış işler                | Geçti                         | Son `db_style_reminders` çalışması 09:35 UTC, `db_style_push` 09:36 UTC: `succeeded`; gerçek cihaza push teslimatı doğrulanmadı              |

Web testinde Admin demo yükleme/kaldırma düğmeleri, gelir ekranı ve geçersiz tarih, finans dönemleri, müşteri keşfi, fiyat/slot üzerinden randevu ve iptal, usta günlük paneli, misafir işlem başlangıç/bitişi, işletme çalışan ekleme, dış API mesajının ekrana realtime gelmesi, çevrimdışı yazma engeli ve yeniden bağlantıda tek mesaj doğrulandı. 360 ve 414 piksel genişlikte yatay sayfa taşması kontrol edildi. Çevrimdışı test gerçek tarayıcı ağını kapatır ve işletim sistemi bağlantı olayını simüle eder; Android uçak modu testi değildir. Ekran görselleri `docs/screens` içindedir.

Test sonunda demo düğmesiyle bütün örnek işletme/işlem/finans kayıtları kaldırıldı; rapor tutarlarının sıfıra dönmesi doğrulandı. Kullanıcı Admin panelinden yeni demo yükleyebilir. Değişmez denetim geçmişi korunur.

## GitHub doğrulaması

[GitHub Actions çalışması](https://github.com/DrabornEagle/DraBornStyle/actions/runs/38129785556), uygulama kaynak commit’i `aac64597d0d3a7ab151be90d70d79890ac2895dc` için başarıyla tamamlandı: temiz `npm ci`, TypeScript, üç test grubu, çevrimiçi Expo bağımlılık kontrolü, Android ve Web paket üretimi geçti.

Migration işindeki uygulama adımı **atlanmıştır**: repository secret `SUPABASE_ACCESS_TOKEN` yoktur. Bu CI çalışması veritabanına yeniden migration uygulamamıştır. Mevcut 12 migration geliştirme sırasında mevcut Supabase projesine zaten uygulanmış ve sürümleri doğrulanmıştır.

### Devam kontrolü · 11 Ekim 2026

- Uzak `main`, kaynakları ve mevcut raporu içeren `8b531d5a82f7bb209161711c82c0ffc25633a472` commit'iyle eşleşti; çalışma dizini temizdi.
- `npm run typecheck`, üç para/tarih test grubu ve yerel çevrimdışı Expo bağımlılık kontrolü yeniden geçti. Çevrimiçi bağımlılık kontrolü ve Android/Web paket üretimi için yukarıdaki başarılı GitHub Actions adımları doğrudan tekrar sorgulandı; kod değişmediği için paket üretimi yeniden çalıştırılmadı.
- Canlı veritabanında 45 uygulama tablosunun 45'inde RLS etkin. Beş `public.db_style_*` girişinin tamamı `SECURITY INVOKER`; uygulamaya özel iki bucket yerinde. Admin yetki kaydı mevcut.
- Repodaki 12 güncel migration'ın sürüm ve adları mevcut veritabanıyla eşleşti. Ortak projenin migration geçmişinde 10 Ekim tarihli beş eski `db_style_*` sürüm kaydı da bulunuyor; bu tarihsel kayıtlar güncel dosya listesine dahil değildir. Geçmiş kayıtları silinmedi veya yeniden yazılmadı.
- `db_style_reminders` ve `db_style_push` görevleri etkin ve son çalışmaları `succeeded`. Bu sonuç gerçek Android push teslimatı anlamına gelmez.
- Güvenlik danışmanının güncel sonucunda DraBornStyle nesnelerine ait bulgu yok. Diğer uygulamaların bulgularına müdahale edilmedi.
- Uygulama işletme sayısı sıfır: test demo kayıtları kaldırılmış durumda. İlk deneme için Admin panelinden demo yüklenebilir.
- ZIP ile Termux kurulumu ve aynı cihazda `exp://127.0.0.1:8081` üzerinden Expo Go açılışı README'ye eklendi. Fiziksel Termux/Android testi yapılmış olarak raporlanmadı.

## İstenen 22 senaryo

| #   | Senaryo                      | Sonuç ve kapsam                                                                                                                |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | İşletme ve çalışan oluşturma | DB geçti; çalışan formu web ekranında da doğrulandı                                                                            |
| 2   | Hizmet, fiyat ve süre        | DB geçti; 45 dakikalık hizmet ve ücret görüntüsü kullanıldı                                                                    |
| 3   | Müşteri randevu oluşturma    | DB / HTTP / web geçti                                                                                                          |
| 4   | Çakışan iki randevu          | Gerçek HTTP yarışı ve doğrudan PostgreSQL exclusion kısıtı geçti                                                               |
| 5   | Usta başlangıç/bitiş         | DB geçti; aynı işlemi tekrar bitirme ikinci komisyon üretmedi                                                                  |
| 6   | Randevusuz misafir müşteri   | DB / web geçti; platform bedeli dahil edildi                                                                                   |
| 7   | Geçici meşgul                | DB geçti; mevcut randevu korunur                                                                                               |
| 8   | Bekleme listesi              | İptalde uygulama içi bildirim DB'de oluştu; Android push teslimatı test edilmedi                                               |
| 9   | Müşteri-usta sohbeti         | DB erişim/okundu ve gerçek WebSocket üzerinden web mesaj güncellemesi geçti                                                    |
| 10  | Konum izni var/yok           | Sunucuda açık onay, yetkili usta erişimi, izin geri alma ve geç gelen GPS isteği reddi geçti; Android izin/GPS testi yapılmadı |
| 11  | Usta kodu indirimi           | DB geçti; 350 TL − %15 + 20 TL = 317,50 TL; başka ustada kod reddedildi                                                        |
| 12  | İşlem sonunda fiyat          | DB geçti; yetkisiz usta düzenlemesi reddedildi, yetkili 300 TL + 25 TL = 325 TL                                                |
| 13  | İşletme platform bedeli      | DB geçti; yeni 25 TL kuralı eski 20 TL kayıtlarını değiştirmedi                                                                |
| 14  | Günlük/haftalık/aylık rapor  | DB'de üç tarih aralığında işlem/hizmet/ücret/onaylı tahsilat tutarları doğrulandı; aralık dışı işlem hariç kaldı               |
| 15  | Kısmi ödeme bildirimi        | DB geçti; bildirim borcu kendiliğinden azaltmadı                                                                               |
| 16  | Admin onay/red               | DB geçti; yetkisiz onay ve ikinci onay reddedildi; red borcu değiştirmedi                                                      |
| 17  | Kalan borç                   | DB geçti; 45 TL tahakkuk − 10 TL onaylı ödeme = 35 TL; kontrollü ters kayıt ayrıca doğrulandı                                  |
| 18  | Vade bildirimi               | DB'de geciken dönem bildirimi ve tekrar cron çağrısında tekilleştirme geçti                                                    |
| 19  | İşletmeler arası izolasyon   | Bağımsız mevcut Auth kimlikleriyle RLS, çapraz işletme mutation reddi, müşteri finans gizliliği ve çalışan yetki iptali geçti  |
| 20  | Bağlantı kesilip gelmesi     | DB / HTTP idempotency ve web çevrimdışı engel + yeniden gönderimde tek mesaj geçti; native bağlantı değişimi test edilmedi     |
| 21  | Android Expo Go              | SDK/bağımlılıklar ve Hermes paket üretimi geçti; fiziksel cihazda giriş/geçiş/akış testi yapılmadı                             |
| 22  | Diğer projelerin verileri    | Nesne kapsamı ve 160 tablonun başlangıç/son karşılaştırması yapıldı; aşağıdaki canlı veri sınırı geçerlidir                    |

Ek olarak ekstra saat teklifinin 15 dakikalık slot bekletmesi ve müşteri onayı, anonim mutation engeli, değişmez finans kaydı, demo kaldırırken gerçek işletme fixture'ının korunması test edildi.

## Ortak proje izolasyonu

Başlangıçtaki 160 mevcut uygulama tablosunun satır sayısı ve satır içeriği özeti 09:25 UTC'de yeniden karşılaştırıldı. **150 tablo aynı kaldı; 10 tablonun canlı içeriği değişti:**

`public.dbb_catalog_cursor`, `public.dbb_products`, `public.dbb_sync_runs`, `public.dbo_collector_runs`, `public.dbo_match_analysis`, `public.dbo_matches`, `public.dbo_odds_history`, `public.dbo_predictions`, `public.dbo_site_collectors`, `public.dbo_source_matches`.

Mevcut `dbb_catalog_every_1m`, `dbb_readiness_every_5m`, `dbo_odds_retention_hourly` işleri aktiftir. Odds toplayıcı kayıtlarında çalışma sırasında 08:55 UTC güncellemeleri görüldü. Değişimler mevcut katalog/toplayıcı faaliyetleriyle uyumludur; bu bir çıkarımdır. Canlı uygulamalar çalıştığı için bu 10 tablonun değişmediği iddia edilmez. DraBornStyle migration/test kodları bu tablolara yazmaz; verileri geri alınmadı veya müdahale edilmedi.

REST schema önbelleğini engelleyen, veritabanında bulunmayan eski `drabornstyle` şema adı API ayarından çıkarıldı. Mevcut `public`, `graphql_public`, `drabornseries` girişleri korundu. Yeni özel `db_style` şeması REST'e açılmadı. Ortak projenin genel reset, Auth temizleme veya migration geçmişini yeniden yazma işlemi yapılmadı.

## Henüz doğrulanmayan / tamamlanmayan noktalar

- Fiziksel Android Expo Go 58.0.2: v0.3.0 açılışı, giriş, ekran geçişi, düşük güçlü cihaz akıcılığı, GPS izinleri, native harita, görsel/dekont seçme ve uçak modu testi. Android yerel/uzaktan cihaz bildirimleri development build testine ayrılmıştır.
- Android uzaktan push ve arka plan konumu: Expo Go sınırları nedeniyle development build, EAS/FCM yapılandırması ve gerçek cihaz testi gerekir; sunucu kuyrukları hazırdır, teslimat doğrulanmadı.
- Yeni hesap e-posta doğrulama/SMTP teslimatı ve parola kurtarma deep link'i. Ortak projenin SMTP/redirect listesi değiştirilmedi.
- Gelecek migration'lar GitHub Actions üzerinden otomatik uygulanır. Tek proje kapsamlı `SUPABASE_ACCESS_TOKEN` secret kurulmuştur; mevcut 12 migration uygulanmış ve CI migration işi doğrulanmıştır.
- Çoklu şube yönetim ekranı, tekrar eden randevu kuralı, ziyaret sıklığına göre otomatik hatırlatma kampanyası, rota/trafik bazlı ETA, görsel/sesli sohbet sonraki sürümdedir. Mesai değişikliklerinin tarihsel raporlaması henüz sürümlü değildir.

## Yeniden çalıştırma

`npm run typecheck`, `npm test`, `npm run export:android`, `npm run export:web` yerel kod kontrolleridir. `tests/database.sql` yetkili mevcut veritabanında çalıştırılır ve kendi değişikliklerini geri alır.

`tests/ui-design.cjs` mevcut demo ile yalnız okuma yapar, command RPC'lerini test tarayıcısında durdurur ve güncel tasarım sonucu üretir. `tests/live-api.mjs` için Admin tarafından yüklenmiş etiketli demo gerekir. Yazma içeren `tests/ui-smoke.cjs` yalnız tamamen boş işletme dizini ve aktif demo bulunmayan ortamda kendi demo grubunu oluşturur. Mevcut gerçek veya demo kayıt varken başlamayı reddeder; kendi demo grubunu başarılı/başarısız testin sonunda temizlemeyi dener. Canlı işletmeler içeren üretim hesabında yazma testlerini çalıştırmayın.

UI testi öncesinde `npm run export:web`, `npx playwright install chromium` çalıştırın. Dışarıdaki özel oturum dosyasının yolunu `DB_STYLE_TEST_SESSION_FILE` olarak sağlayın ve `node tests/ui-smoke.cjs` çalıştırın. İsteğe bağlı `DB_STYLE_BROWSER_PATH` mevcut Chromium'u seçer. Oturum, parola, access/refresh token veya service-role anahtarını repoya koymayın.

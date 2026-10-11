# DraBornStyle v0.1 doğrulama raporu

11 Ekim 2026 · Mevcut Supabase projesi: `xpdiwyxnnrmyvpcqwuyb` (DraBorn-Park-Garage-Series).

Bu rapor gerçek veritabanı, HTTP API, web arayüzü ve paket üretimini birbirinden ayırır. Web ekran testleri fiziksel Android / Expo Go testi değildir. Demo içindeki finans verileri açıkça örnek olarak etiketlenir; gerçek ödeme tahsilatı yapılmadı.

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

- Fiziksel Android Expo Go 58.0.2: giriş, ekran geçişi, düşük güçlü cihaz akıcılığı, GPS izinleri, native harita, görsel/dekont seçme, yerel bildirim ve uçak modu testi.
- Android uzaktan push ve arka plan konumu: Expo Go sınırları nedeniyle development build, EAS/FCM yapılandırması ve gerçek cihaz testi gerekir; sunucu kuyrukları hazırdır, teslimat doğrulanmadı.
- Yeni hesap e-posta doğrulama/SMTP teslimatı ve parola kurtarma deep link'i. Ortak projenin SMTP/redirect listesi değiştirilmedi.
- Gelecek migration'ların GitHub Actions üzerinden otomatik uygulaması için `SUPABASE_ACCESS_TOKEN` secret gerekir. Mevcut 12 migration uygulanmıştır; CI dağıtım kimliği bu çalışma sırasında kurulmadı.
- Çoklu şube yönetim ekranı, tekrar eden randevu kuralı, ziyaret sıklığına göre otomatik hatırlatma kampanyası, rota/trafik bazlı ETA, görsel/sesli sohbet sonraki sürümdedir. Mesai değişikliklerinin tarihsel raporlaması henüz sürümlü değildir.

## Yeniden çalıştırma

`npm run typecheck`, `npm test`, `npm run export:android`, `npm run export:web` yerel kod kontrolleridir. `tests/database.sql` yetkili mevcut veritabanında çalıştırılır ve kendi değişikliklerini geri alır.

`tests/live-api.mjs` için Admin tarafından yüklenmiş etiketli demo gerekir. `tests/ui-smoke.cjs` boş dizinde Admin düğmesiyle demo yükler veya mevcut etiketli demo kullanır; gerçek işletme içeren dizinde çalışmayı reddeder. Demo kayıtları oluşturur, ekran/sonuç dosyalarını günceller ve başarılı testin sonunda Admin düğmesiyle demo kaldırır. Canlı işletmeler içeren üretim hesabında çalıştırmayın. Başarısız testten sonra Admin → Demo Verileri Kaldır kullanılabilir.

UI testi öncesinde `npm run export:web`, `npx playwright install chromium` çalıştırın. Dışarıdaki özel oturum dosyasının yolunu `DB_STYLE_TEST_SESSION_FILE` olarak sağlayın ve `node tests/ui-smoke.cjs` çalıştırın. İsteğe bağlı `DB_STYLE_BROWSER_PATH` mevcut Chromium'u seçer. Oturum, parola, access/refresh token veya service-role anahtarını repoya koymayın.

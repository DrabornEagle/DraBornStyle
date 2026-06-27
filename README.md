# DraBornStyle

DraBornStyle; berber, kuaför ve salon işletmeleri için akıllı randevu, usta takvimi, müşteri akışı, işlem/ödeme ve işletme yönetimi uygulamasıdır.

## Güncel Durum

| Durum | Sürüm | Not |
| --- | --- | --- |
| ✅ | v0.1 Final | Login, tek hesap sistemi, müşteri/işletme/usta/admin panelleri, çoklu rol yetkisi korundu. |
| ✅ | v0.2.17 Final | İşlem, ödeme, QR, indirim, platform ücret takibi ve admin başvuru/onay sistemi korundu. |
| ✅ | v0.3.0 | Randevu + Takvim + Müşteri Akışı başlatıldı ve ilk çalışan modül eklendi. |

## v0.3 Hedefi

v0.3 ana hedefi: müşteri tarafında randevu oluşturma, işletme tarafında takvimden randevu yönetme, usta tarafında günlük akışı görme ve müşterinin geliş durumunu takip etme.

## v0.3.0 Tamamlananlar

| Durum | İş |
| --- | --- |
| ✅ | `dkd_appointments` tablosu silinmeden genişletildi. |
| ✅ | Randevu kodu, müşteri adı, müşteri telefonu ve müşteri geliş durumu alanları eklendi. |
| ✅ | Müşteri akışı için `not_started`, `on_the_way`, `arrived`, `checked_in`, `late`, `no_show`, `cancelled`, `completed` durumları hazırlandı. |
| ✅ | Randevu akış geçmişi için `dkd_appointment_flow_events` tablosu eklendi. |
| ✅ | Takvim bloklama / meşgul zaman altyapısı için `dkd_appointment_availability_blocks` tablosu eklendi. |
| ✅ | RLS policy yapısı aktif edildi. |
| ✅ | Müşteri paneline “Randevu Oluştur” ekranı eklendi. |
| ✅ | İşletme paneline “Randevu & Takvim” bölümü eklendi. |
| ✅ | Usta paneline “Bugünkü Akış” randevu görünümü eklendi. |
| ✅ | `package.json` sürümü `0.3.0` yapıldı. |
| ✅ | `postinstall` sırası `v0.2` patch sonrası `v0.3` patch çalışacak şekilde güncellendi. |

## Korunan Kilit Yapılar

- v0.1 tek login/kayıt sistemi korunur.
- Müşteri otomatik varsayılan rol olarak kalır.
- İşletme ve usta yetkileri admin onaylı kalır.
- Çoklu rol kaynağı `dkd_user_role_access` olarak kalır.
- Admin test hesabı ve panel ayrımı bozulmaz.
- v0.2 işlem, ödeme, QR, indirim, admin ödeme/onay ve platform ücret sistemi korunur.

## v0.3 Test Listesi

| Durum | Test |
| --- | --- |
| ⬜ | Müşteri hesabıyla salon listesi görünüyor mu? |
| ⬜ | Müşteri salon + usta + hizmet seçip randevu talebi oluşturabiliyor mu? |
| ⬜ | Randevu işletme takviminde görünüyor mu? |
| ⬜ | İşletme randevuyu onaylayabiliyor mu? |
| ⬜ | Müşteri “Yoldayım” ve “Geldim” akışlarını güncelleyebiliyor mu? |
| ⬜ | İşletme “Geldi”, “İşlemde”, “Tamamlandı”, “Gelmedi” durumlarını işleyebiliyor mu? |
| ⬜ | Usta panelinde ustaya bağlı randevular görünüyor mu? |
| ⬜ | v0.2 İşlem & Ödeme ekranı hâlâ çalışıyor mu? |
| ⬜ | Çıkış/giriş sonrası roller ve paneller doğru yükleniyor mu? |

## Termux ZIP Kurulum

Bu projede Termux tarafında ZIP yöntemi kullanılacak. Python patch, JDK, Perl ve `/tmp` yöntemi kullanılmaz.

```bash
cd $HOME
rm -rf DraBornStyle DraBornStyle-main DraBornStyle-main.zip
pkg update -y
pkg install -y nodejs git unzip
curl -L -o DraBornStyle-main.zip https://github.com/DrabornEagle/DraBornStyle/archive/refs/heads/main.zip
unzip -o DraBornStyle-main.zip
mv DraBornStyle-main DraBornStyle
cd DraBornStyle
npm install
npm run drabornstyle_start
```

Expo açıldıktan sonra uygulamayı telefonda Expo Go ile test et.

# DraBornStyle

DraBornStyle v0.1, berber / kuaför / salon işletmeleri için mobil uygulama başlangıç sürümüdür.

## dkd_v0_1_tam_liste

| Durum | Sürüm | İş |
| --- | --- | --- |
| ✅ | v0.0.1 | GitHub repo temiz başlangıç için kontrol edildi |
| ✅ | v0.0.2 | Supabase DraBornStyle projesi bulundu |
| ✅ | v0.0.3 | Supabase çekirdek tabloları kuruldu |
| ✅ | v0.0.4 | Supabase RLS güvenlik altyapısı açıldı |
| ✅ | v0.0.5 | Kullanıcı profil / rol policy'leri kuruldu |
| ✅ | v0.0.6 | İşletme profil policy'leri kuruldu |
| ✅ | v0.0.7 | Usta / çalışan policy'leri kuruldu |
| ✅ | v0.0.8 | Hizmet / fiyat / süre policy'leri kuruldu |
| ✅ | v0.0.9 | Randevu veri tabanı ve policy'leri kuruldu |
| ✅ | v0.0.10 | İşletme ödeme raporu ve admin onay altyapısı kuruldu |
| ✅ | v0.0.11 | Logo / kapak / kullanıcı dosyaları için storage bucket kuruldu |
| ✅ | v0.0.12 | Expo / React Native v0.1 proje iskeleti eklendi |
| ✅ | v0.0.13 | Sade başlangıç ekranı eklendi |
| ✅ | v0.0.14 | Termux zip kurulumla telefonda ilk açılış testi yapıldı |
| ✅ | v0.0.15 | Supabase publishable key `.env` içine girildi ve uygulamada doğrulandı |
| ✅ | v0.0.16 | Gerçek auth ekranı bağlandı ve test edildi |
| ✅ | v0.0.17 | Rol seçimi ekranı eklendi |
| ✅ | v0.0.18 | Super Admin ayrımı kaldırıldı; Admin tek yönetim rolü olarak kilitlendi |
| ✅ | v0.0.19 | UI altyapısı ve işletme profili formu eklendi |
| ✅ | v0.0.20 | İşletme profil detay ekranı çalıştı |
| ✅ | v0.0.21 | Usta / çalışan ekleme ekranı eklendi |
| ✅ | v0.0.22 | Hizmet ekleme, hizmet fiyatı ve hizmet süresi ekranı eklendi |
| ✅ | v0.0.23 | Performans için kategori / akordeon salon paneli eklendi |
| ✅ | v0.0.24 | Tek giriş/kayıt, işletme başvurusu, usta başvurusu, admin rol onay sistemi ve mockup login ekranı eklendi |
| 🟡 | v0.0.25 | v0.1 mobil test ve düzeltme turu başladı |
| ⬜ | v0.1 | v0.1 final tamamlanacak ve v0.2 hazırlığına geçilecek |

## dkd_v0_0_25_final_test_turu

v0.0.25 yeni büyük özellik ekleme sürümü değildir. Bu adım v0.1 final öncesi son mobil test, hata düzeltme ve temizlik turudur.

Test edilecekler:

- Login mockup ekranı gerçek PNG asset ile net görünüyor mu?
- E-posta ve şifre görünmez input alanları doğru kutuların içine denk geliyor mu?
- `Giriş Yap` ve `Kayıt Ol` görünmez tıklama alanları doğru çalışıyor mu?
- Yeni kullanıcı otomatik `Müşteri` rolüyle açılıyor mu?
- Müşteri işletme başvurusu gönderebiliyor mu?
- Başvuru durumu `pending / approved / rejected` olarak görünüyor mu?
- Admin başvuruları görebiliyor, onaylayabiliyor ve reddedebiliyor mu?
- Admin kayıtlı kullanıcıyı `İşletme Sahibi` veya `Usta` olarak işaretleyebiliyor mu?
- İşletme Sahibi panelinde salon bilgisi, usta listesi, hizmet fiyatı ve hizmet süresi çalışıyor mu?
- İşletme panelinden usta yetki başvurusu admin onayına gönderilebiliyor mu?
- Usta rolü onaylandıktan sonra Usta Paneli açılıyor mu?
- Çıkış / tekrar giriş sonrası rol ve panel doğru geri geliyor mu?
- Ekranlarda taşma, okunmama, yanlış hizalama veya ciddi performans sorunu var mı?

v0.0.25 temiz geçerse `v0.1 final` kapatılacak ve sonra v0.2 yol haritasına geçilecek.

## dkd_v0_0_24_mockup_login

Login ekranı artık Barber Studio OS mockup görselini tam ekran arka plan olarak kullanır.

- Doğru kalite için gerçek PNG asset kullanılmalıdır: `src/dkd_assets/login_barber_miami.png`
- Base64/JPEG gömme yöntemi kaliteyi bozduğu için final kullanımda tercih edilmez.
- Giriş yapılmamış durumda eski kart tabanlı login ekranı yerine tam ekran mockup gösterilir.
- E-posta ve şifre alanlarının üzerine görünmez `TextInput` kutuları yerleştirildi.
- Kullanıcı yazı yazınca metin mockup üzerindeki boş kutucuklarda görünür.
- `Giriş Yap` ve `Kayıt Ol` butonlarının üzerine görünmez tıklama alanları yerleştirildi.
- `Giriş Yap` mevcut kullanıcı girişini çalıştırır.
- `Kayıt Ol` yeni kullanıcı kaydını çalıştırır.
- Giriş/kayıt yine tek tiptir; yeni kullanıcı otomatik `Müşteri` rolüyle başlar.

## dkd_v0_0_24_guncel_karar

v0.0.24 içinde giriş ve rol mantığı değiştirildi.

- Login/kayıt ekranında artık müşteri/işletme seçimi yoktur.
- Her kullanıcı tek hesapla giriş yapar veya kayıt olur.
- Yeni kullanıcı ilk açılışta otomatik `Müşteri` rolüyle başlar.
- İşletme olmak isteyen kullanıcı uygulama içinden `İşletme Başvurusu` gönderir.
- Admin başvuruyu onaylarsa kullanıcı `İşletme Sahibi` rolüne geçer ve işletme paneli açılır.
- Usta olmak isteyen kayıtlı kullanıcı için başvuru işletme paneli içinden admin onayına gönderilir.
- Admin paneli kayıtlı kullanıcıları `İşletme Sahibi` veya `Usta` olarak işaretleyebilir.
- Admin paneli işletme/usta başvurularını onaylayabilir veya reddedebilir.

## dkd_v0_0_24_supabase

Yeni tablo:

- `dkd_role_applications`

Bu tablo işletme ve usta rol başvurularını saklar.

Başvuru durumları:

- `pending`
- `approved`
- `rejected`

RLS mantığı:

- Kullanıcı kendi başvurusunu görebilir.
- İşletme sahibi kendi işletmesinden gönderilen usta başvurularını görebilir.
- Admin tüm başvuruları ve kayıtlı kullanıcıları görebilir/güncelleyebilir.

## dkd_v0_1_kilitli_kapsam

v0.1 finalde eksiksiz yapılacaklar:

- Müşteri hesabı
- İşletme hesabı
- Usta hesabı
- Admin hesabı
- Tek giriş/kayıt sistemi
- İşletme başvuru sistemi
- Usta başvuru sistemi
- Admin rol onay sistemi
- İşletme oluşturma
- İşletme profili
- İşletme adı, logo, kapak görseli altyapısı
- Adres ve konum bilgisi altyapısı
- Çalışma saatleri
- Usta / çalışan ekleme
- Hizmet ekleme
- Hizmet fiyatı
- Hizmet süresi
- Temel Supabase / backend yapısı
- Rol bazlı yetki sistemi

v0.1 rolleri:

- Admin
- İşletme Sahibi
- Usta
- Müşteri

Not: v0.1 MVP içinde Super Admin ayrımı yoktur. Tüm yönetim yetkileri tek Admin panelinde toplanır.

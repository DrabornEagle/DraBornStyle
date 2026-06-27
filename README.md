# DraBornStyle

DraBornStyle v0.1, berber / kuaför / salon işletmeleri için mobil uygulama başlangıç sürümüdür.

Bu sürümde hedef; önce uygulama tarafında temel rol sistemi, Supabase tarafında güvenli veri altyapısı ve GitHub tarafında temiz Expo projesi kurmaktır. Web tarafına v0.1 mobil temel tamamlandıktan sonra geçilecek.

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
| ✅ | v0.0.17 | Modern Miami temalı rol seçimi ekranı eklendi ve telefonda çalıştı |
| ✅ | v0.0.18 | Super Admin ayrımı kaldırıldı; Admin tek yönetim rolü olarak kilitlendi |
| ✅ | v0.0.19 | Miami UI altyapısı, modern ikonlar ve işletme profili formu eklendi |
| ✅ | v0.0.20 | Bright Miami Beach UI revizyonu ve işletme profil detay ekranı çalıştı |
| ✅ | v0.0.21 | Usta / çalışan ekleme ekranı eklendi |
| ✅ | v0.0.22 | Hizmet ekleme, hizmet fiyatı ve hizmet süresi ekranı eklendi |
| ✅ | v0.0.23 | Performans ve hesap akış testi için sade kategori/akordeon salon paneli eklendi |
| 🟡 | v0.0.24 | Barber Studio Mockup UI revizyonu ve rol bazlı yetki özeti eklendi, telefonda test edilecek |
| ⬜ | v0.0.25 | v0.1 mobil test ve düzeltme turu tamamlanacak |
| ⬜ | v0.1 | v0.1 final tamamlanacak ve v0.2 hazırlığına geçilecek |

## dkd_v0_0_24_ui_ve_yetki

Koyu Miami Night ve krem/beyaz tema yeterince profesyonel görünmediği için v0.0.24 içinde arayüz sıfırdan Barber Studio Mockup UI yapısına çekildi.

- Çok karanlık arka plan kaldırıldı.
- Göz yoran krem/beyaz ana zemin kaldırıldı.
- Modern berber/salon stüdyo hissi için dengeli koyu petrol, slate, teal ve sıcak amber renkleri kullanıldı.
- Kartlar mockup hissi veren güçlü bloklar, net başlıklar ve sade kategori listeleriyle düzenlendi.
- Ağır ikon kütüphanesi kullanılmaz; hafif badge sistemi devam eder.
- `Salon Akışını Seç` ve `Salon Kurulum Menüsü` korunur.
- `Yetki Özeti` kartı rol bazlı ekran kontrolü için devam eder.
- İşletme sahibi paneli akordeon mantığında kalır: Salon Bilgileri, Ekip / Ustalar, Hizmetler ve Fiyatlar.

## dkd_v0_0_23_ui_duzeltmesi

Kullanıcı geri bildirimiyle v0.0.23 içinde genel ekran sadeleştirildi.

- Ağır ve karmaşık uzun ekran yerine kategori/akordeon panel yapısına geçildi.
- `Rolünü seç` başlığı yerine berber/salon işine daha uygun `Salon Akışını Seç` başlığı kullanıldı.
- İşletme sahibi ekranı üç kategoriye bölündü: `Salon Bilgileri`, `Ekip / Ustalar`, `Hizmetler ve Fiyatlar`.
- Aynı anda tüm formlar açık gelmez; kullanıcı kategoriye dokununca detay açılır.
- Görsel karmaşa azaltıldı, kart sayısı ve ekrandaki açık form alanı düşürüldü.
- Tasarım daha sade, hızlı ve profesyonel salon paneli görünümüne çekildi.

## dkd_v0_0_23_test_plan

v0.0.23 hesap akışı test planı `docs/dkd_v0_0_23_account_flow_test_plan.md` dosyasındadır.

Bu test adımında kontrol edilecek roller:

- Müşteri
- İşletme Sahibi
- Usta
- Admin

## dkd_v0_1_kilitli_kapsam

v0.1 finalde eksiksiz yapılacaklar:

- Müşteri hesabı
- İşletme hesabı
- Usta hesabı
- Admin hesabı
- Rol bazlı giriş sistemi
- İşletme oluşturma
- İşletme profili
- İşletme adı, logo, kapak görseli
- Adres ve konum bilgisi
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

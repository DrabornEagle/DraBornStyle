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
| 🟡 | v0.0.21 | Usta / çalışan ekleme ekranı eklendi, telefonda test edilecek |
| ⬜ | v0.0.22 | Hizmet ekleme, hizmet fiyatı ve hizmet süresi ekranı bağlanacak |
| ⬜ | v0.0.23 | Müşteri, işletme, usta ve admin hesap akışları test edilecek |
| ⬜ | v0.0.24 | Rol bazlı yetki sistemi uygulama ekranlarıyla test edilecek |
| ⬜ | v0.0.25 | v0.1 mobil test ve düzeltme turu tamamlanacak |
| ⬜ | v0.1 | v0.1 final tamamlanacak ve v0.2 hazırlığına geçilecek |

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

## dkd_ui_karari

Genel uygulama tasarımı bright Miami Beach temalı modern profesyonel UI olacaktır.

- Ferah açık Miami gradient arka plan
- Turkuaz, pembe ve sunset turuncu vurgu renkleri
- Beyaz / cam hissi veren kart yapısı
- Berber / kuaför / salon işletmelerine vitrin hissi veren premium görünüm
- Büyük okunur başlıklar
- Modern ikon kütüphanesi: `lucide-react-native`
- Gradient desteği: `expo-linear-gradient`
- Safe area sistemi: `react-native-safe-area-context`

## dkd_surum_takip_mantigi

Her ana sürüm kendi içinde küçük ara sürümlerle takip edilir.

- v0.1 için adımlar: v0.0.1, v0.0.2, v0.0.3 ... en son v0.1
- v0.2 için adımlar: v0.1.1, v0.1.2, v0.1.3 ... en son v0.2
- v0.3 için adımlar: v0.2.1, v0.2.2, v0.2.3 ... en son v0.3

Yani listedeki Sürüm alanı görev kodu değil, geliştirme ilerleme numarasıdır.

## dkd_v0_1_kapsam

v0.1 uygulama kapsamı:

- müşteri, işletme, usta ve admin rolleri
- rol bazlı giriş yönlendirmesi
- müşteri, işletme, usta ve admin hesap akışları
- işletme oluşturma ve işletme profili altyapısı
- işletme adı, logo, kapak, adres, konum ve çalışma saatleri altyapısı
- usta / çalışan ekleme altyapısı
- hizmet, fiyat ve süre yönetimi altyapısı
- temel Supabase / backend yapısı
- rol bazlı yetki sistemi
- temel randevu tablosu
- işlem tamamlandığında 20 TL varsayılan platform hizmet bedeli altyapısı
- işletmeye göre haftalık / aylık ödeme periyodu altyapısı
- admin ödeme raporu ve onay altyapısı

# DraBornStyle v0.3 Supabase Uygulama Notu

Durum: Supabase DraBornStyle projesine v0.3 randevu + takvim + müşteri akışı altyapısı uygulandı.

## Uygulanan ana değişiklikler

- `dkd_appointments` mevcut tablo olarak korundu ve genişletildi.
- Randevu kodu alanı eklendi.
- Müşteri adı ve müşteri telefon alanları eklendi.
- Müşteri geliş akışı alanları eklendi.
- Randevu akış geçmişi için yeni event tablosu oluşturuldu.
- Takvimde meşgul / kapalı zaman blokları için yeni availability block tablosu oluşturuldu.
- Randevu listeleme ve takvim performansı için indeksler eklendi.
- Yeni v0.3 tablolarında RLS aktif edildi.

## Korunanlar

- v0.1 login, rol ve panel yapısı korunur.
- v0.2 işlem, ödeme, QR, indirim ve admin başvuru/onay sistemi korunur.
- `dkd_user_role_access` çoklu rol kaynağı olarak kalır.

## Testte kontrol edilecek akış

1. Müşteri paneli açılır.
2. Salon, usta ve hizmet seçilir.
3. Tarih ve saat girilir.
4. Randevu talebi oluşturulur.
5. İşletme panelinde Randevu & Takvim bölümü açılır.
6. İşletme talebi onaylar.
7. Müşteri Yoldayım / Geldim akışını gönderir.
8. İşletme veya usta Geldi / İşlemde / Tamamlandı durumlarını işler.

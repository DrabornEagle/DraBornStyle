# DraBornStyle v0.2.17 Admin Başvuru Düzeltmesi

## Yapıldı

- Supabase tarafında başvuru onay/reddet sırasında çıkan `record new has no field updated_at` hatası düzeltildi.
- `dkd_role_applications` tablosuna eksik `updated_at` alanı eklendi.
- Admin başvurularını veritabanından tamamen kaldırmak için güvenli RPC eklendi.

## Telefonda Uygulanacak UI Patch

Admin paneline üçüncü buton olarak `Sil` eklenecek.

Buton akışı:

1. Başvuru kartında Onayla / Reddet / Sil görünür.
2. Sil butonu RPC çağırır.
3. Başvuru listesi yenilenir.
4. Durum mesajı: `Başvuru veritabanından tamamen silindi.`

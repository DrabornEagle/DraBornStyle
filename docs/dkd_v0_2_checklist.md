# DraBornStyle v0.2 Checklist

## v0.2 Ana Hedef

DraBornStyle'ı randevu + salon yönetimi seviyesinden profesyonel işletme ödeme, platform gelir takibi, QR kaynak, usta indirimi ve işlem raporları sistemine büyütmek.

## Durum

| Durum | Adım | İş |
| --- | --- | --- |
| ✅ | v0.2.1 | Supabase DraBornStyle projesi bulundu |
| ✅ | v0.2.2 | İşletme ödeme ayarları tablosu kuruldu |
| ✅ | v0.2.3 | Tamamlanan işlem/platform ücret tablosu kuruldu |
| ✅ | v0.2.4 | İşlem tamamlama sonrası otomatik platform ücreti tetikleyicisi kuruldu |
| ✅ | v0.2.5 | Ödeme onay tablosu kuruldu |
| ✅ | v0.2.6 | QR kaynak tablosu kuruldu |
| ✅ | v0.2.7 | Usta/işletme indirim kodu tablosu kuruldu |
| ✅ | v0.2.8 | İşletme ödeme rapor view'i kuruldu |
| ✅ | v0.2.9 | v0.2 migration GitHub'a yüklendi |
| ⬜ | v0.2.10 | Uygulama içinde işlem başlat/bitir + son fiyat düzenleme ekranı bağlanacak |
| ⬜ | v0.2.11 | Business panel ödeme/borç raporu ekranı bağlanacak |
| ⬜ | v0.2.12 | Admin panel ödeme onay ekranı bağlanacak |
| ⬜ | v0.2.13 | Usta indirim kodu oluşturma/kullanma ekranı bağlanacak |
| ⬜ | v0.2.14 | QR kaynaklı müşteri/randevu akışı bağlanacak |
| ⬜ | v0.2.15 | Müşteri randevu geçmişi/favori işletme/favori usta ekranları bağlanacak |

## Supabase v0.2 Tabloları

- `dkd_business_payment_settings`
- `dkd_service_transactions`
- `dkd_business_platform_fees`
- `dkd_payment_approvals`
- `dkd_qr_sources`
- `dkd_discount_codes`

## Supabase v0.2 View

- `dkd_business_payment_report_summary`

## Otomatik İş Kuralı

`dkd_service_transactions.status` alanı `completed` olduğunda `dkd_business_platform_fees` içine otomatik platform hizmet bedeli kaydı oluşturulur.

Varsayılan platform hizmet bedeli: **20 TL**.

## Sonraki Kod Adımı

Uygulama tarafında önce şu akış bağlanacak:

1. İşleme Başla
2. Son fiyatı düzenle
3. İşlem Bitti
4. Platform ücreti otomatik oluşsun
5. Business panelde bekleyen borç görünsün

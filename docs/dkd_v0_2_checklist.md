# DraBornStyle v0.2 Checklist

## Güncel Sürüm

**v0.2.14 Final Test Adayı**

## v0.2 Ana Hedef

DraBornStyle'ı v0.1 final login/panel yapısını bozmadan; işletme ödeme, platform gelir takibi, işlem başlat/bitir, QR kaynak, usta indirimi ve admin ödeme onayı olan profesyonel salon yönetim sistemine büyütmek.

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
| ✅ | v0.2.10 | İşlem başlat/bitir + son fiyat düzenleme component'i eklendi |
| ✅ | v0.2.11 | Business panel ödeme/borç raporu altyapısı eklendi |
| ✅ | v0.2.12 | Admin ödeme onay API/panel altyapısı eklendi |
| ✅ | v0.2.13 | v0.2 modülleri tek import noktasına toplandı |
| ✅ | v0.2.14 | v0.1 final App.tsx korunarak v0.2 İşlem & Ödeme bölümü patch script ile bağlandı |
| ✅ | v0.2.15 | QR kaynak ve usta özel indirim kodu paneli eklendi |
| ✅ | v0.2.16 | Login PNG koruma ve final test scriptleri hazırlandı |
| 🟡 | v0.2.16-final-test | Telefonda final test bekleniyor |

## v0.2 Dosyaları

- `src/dkd_v0_2/dkd_transaction_panel.tsx`
- `src/dkd_v0_2/dkd_transaction_api.ts`
- `src/dkd_v0_2/use_dkd_transactions.ts`
- `src/dkd_v0_2/dkd_admin_payment_api.ts`
- `src/dkd_v0_2/dkd_admin_payment_panel.tsx`
- `src/dkd_v0_2/dkd_business_v02_tools_panel.tsx`
- `src/dkd_v0_2/index.ts`
- `scripts/dkd_apply_v02_to_app.js`
- `scripts/dkd_apply_v02_business_tools_to_app.js`
- `scripts/dkd_fix_login_layout.js`

## Korunan v0.1 Alanları

- `index.js -> App.tsx` ana giriş korunur.
- Login PNG mockup sistemi korunur.
- E-posta/şifre imleçleri App.tsx içinde şeffaf overlay olarak kalır.
- Müşteri / İşletme / Usta / Admin panel kategorileri korunur.

## Final Test Akışı

1. Uygulama login mockup ile açılır.
2. E-posta ve şifre kutuları görseldeki alanlara hizalı olur.
3. Giriş yapılır.
4. Panel kategorileri görünür.
5. İşletme Paneli açılır.
6. Salon bilgisi kaydedilir.
7. Usta eklenir.
8. Hizmet eklenir.
9. İşlem & Ödeme bölümü açılır.
10. İşleme Başla yapılır.
11. Aktif işlem seçilir.
12. Ek fiyat / indirim / not girilir.
13. İşlem Bitti yapılır.
14. Son işlemler listesinde completed görünür.
15. Platform borcu 20 TL artar.
16. QR & İndirim bölümü açılır.
17. İndirim kodu oluşturulur.
18. QR kaynak oluşturulur.

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

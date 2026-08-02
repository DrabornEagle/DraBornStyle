# DraBornStyle v0.2.17 Final

DraBornStyle; berber, kuaför ve salonların müşteriyi hızlıca sisteme almasını, işlemi tek tuşla başlatıp bitirmesini, hizmet fiyatlarını, platform bedelini, ödeme bildirimlerini, QR kaynaklarını ve özel müşteri indirimlerini yönetmesini gösteren **yerel demo uygulamasıdır**.

## Tasarım

İlk DraBornStyle tasarımındaki premium fotoğraflı görünüm geri getirildi:

- Büyük berber ve salon görselleri
- Koyu premium kart yapısı
- Pembe, mor, mavi ve turkuaz vurgu renkleri
- Usta, işletme, müşteri ve admin panellerine özel görsel hero alanları
- Basma, modal ve durum geçiş animasyonları
- Dar Android ekranlara uygun responsive düzen

## Güncel kapsam

### Korunan v0.1 omurgası

- Kayıt ve giriş
- Otomatik müşteri rolü
- `customer`, `master`, `business`, `admin`
- `dkd_user_role_access`
- Usta ve işletme başvuruları
- Admin onayı/reddi
- Rol bazlı panel yönlendirmesi
- Birden fazla rol arasında geçiş

### v0.2.17 işlem ve ödeme sistemi

- Çat kapı müşteri
- Direkt arayan müşteri
- Favori müşteri
- Randevulu kaynak seçimi
- Tek tuşla `Tıraşa / İşleme Başladım`
- Aktif işlem sırasında ustayı meşgul gösterme
- Aynı ustada ikinci aktif işlemi engelleme
- `Tıraş / İşlem Bitti`
- Son fiyat düzenleme
- Usta indirim kodu
- Net fiyat hesaplama
- Hizmet işlem kaydı
- Varsayılan ₺20 platform bedeli
- İşletme bazlı özel platform bedeli
- Hizmet fiyatı düzenleme
- İşletme borç raporu
- Ödeme bildirimi
- Admin ödeme onayı/reddi
- Ödeme bekliyor / kısmi ödeme / ödendi durumları
- QR kaynakları ve demo tarama
- İşletme, usta ve admin raporları
- AsyncStorage ile yerel kalıcılık

## Demo hesapları

Tüm hesapların şifresi `123456`:

- Müşteri: `musteri@demo.com`
- Usta: `usta@demo.com`
- İşletme: `isletme@demo.com`
- Admin: `draborneagle@gmail.com`

## ZIP yöntemiyle Expo Go testi

```bash
cd ~
rm -rf DraBornStyle DraBornStyle-main
rm -f DraBornStyle-v0.2.17.zip

pkg install -y curl unzip

curl -L "https://github.com/DrabornEagle/DraBornStyle/archive/refs/heads/main.zip" \
  -o DraBornStyle-v0.2.17.zip

unzip -q DraBornStyle-v0.2.17.zip
mv DraBornStyle-main DraBornStyle

cd DraBornStyle
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --tunnel --clear
```

Bu akışta `git pull`, Python, JDK, Perl, patch ve `/tmp` kullanılmaz.

## Veri yapısı

- v0.1 rol ve başvuru verileri: `src/v01`
- v0.2 işlem ve ödeme verileri: `src/v02`
- v0.2 başlangıç demo verileri: `src/v02/demoData.ts`
- v0.2 durum makinesi: `src/v02/state.ts`

Supabase henüz bağlı değildir. Gerçek veri entegrasyonu başladığında demo durum katmanı Supabase servisleriyle değiştirilecektir.

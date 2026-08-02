# DraBornStyle v0.4.0

DraBornStyle; berber, kuaför ve salonlar için rol bazlı giriş, işlem/ödeme takibi ve randevu–takvim–müşteri geliş akışını birleştiren Expo Go demo uygulamasıdır.

## Sürüm kimliği

- Uygulama sürümü: `0.4.0`
- Android versionCode: `1`
- Paket adı: `com.draborneagle.drabornstyle`
- Expo SDK: `57`
- Android hedef API: `36`
- Günlük test yöntemi: Expo Go
- Google Play çıktısı: Release AAB
- Cihaz kurulum çıktısı: Release APK

Release workflowları yalnızca GitHub Actions ekranından elle çalıştırılır. Bu nedenle koda yapılan normal güncellemeler APK veya AAB üretmez.

## v0.4 yenilikleri

- Google Play için `versionCode 1` sürüm düzeni
- Ayrı **DraBornStyle Release APK** workflowu
- Ayrı **DraBornStyle Release AAB** workflowu
- Kullanılmayan hassas Android izinlerinin engellenmesi
- Uygulama içi Gizlilik ve Veri merkezi
- Yerel hesap ve kullanıcı verilerini silme yolu
- Herkese açık gizlilik politikası
- Herkese açık hesap/veri silme açıklaması
- Google Play Data safety kontrol listesi
- Gizli anahtar ve servis hesabı dosyaları için Git güvenlik engelleri
- Her sürümde otomatik GitHub yedeği + lokal eşitleme komutu

## Korunan özellikler

- **v0.1:** kayıt, giriş, `dkd_user_role_access`, müşteri/usta/işletme/admin panelleri ve admin başvuru onayı
- **v0.2.17:** işlem başlat/bitir, son fiyat, işletmeye özel platform bedeli, ödeme bildirimi/onayı, QR ve indirim kodu
- **v0.3.0:** randevu oluşturma, saat çakışma kontrolü, takvim, müşteri geliş durumları ve randevuyu işleme bağlama

## Demo hesapları

Tüm demo hesaplarının parolası `123456`:

- Müşteri: `musteri@demo.com`
- Usta: `usta@demo.com`
- İşletme: `isletme@demo.com`
- Admin: `draborneagle@gmail.com`

Demo parola alanı gerçek kimlik doğrulama hizmeti değildir. Gerçek hesap parolaları kullanılmamalıdır.

## Her sürümde yedekle, eşitle ve kur

```bash
curl -fsSL https://raw.githubusercontent.com/DrabornEagle/DraBornStyle/main/scripts/dkd_backup_sync_install.sh | bash
```

Expo testi:

```bash
cd "$HOME/projects/DraBornStyle" && npx expo start -c
```

Geri alma ve ayrıntılı sürüm komutları: [RELEASE_COMMANDS.md](RELEASE_COMMANDS.md)

## Google Play belgeleri

- [Gizlilik Politikası](PRIVACY_POLICY.md)
- [Hesap ve Veri Silme](ACCOUNT_DELETION.md)
- [Google Play Kontrol Listesi](PLAY_CONSOLE_COMPLIANCE.md)

## v0.3 güvenli yedeği

v0.4 geçişinden önceki kaynak kod şu GitHub dalında korunur:

`backup/v0.3-before-v0.4`

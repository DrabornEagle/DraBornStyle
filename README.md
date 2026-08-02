# DraBornStyle v0.3.0 Final

DraBornStyle; berber, kuaför ve salonlar için rol bazlı giriş, işlem/ödeme takibi ve gerçek randevu–takvim–müşteri geliş akışını birleştiren Expo Go demo uygulamasıdır.

## Güncel kapsam

- **v0.1 korunuyor:** kayıt, giriş, `dkd_user_role_access`, müşteri/usta/işletme/admin panelleri ve admin başvuru onayı.
- **v0.2.17 korunuyor:** işlem başlat/bitir, son fiyat, işletmeye özel platform bedeli, ödeme bildirimi/onayı, QR ve indirim kodu.
- **v0.3.0 aktif:** randevu oluşturma, saat çakışma kontrolü, takvim, müşteri geliş durumları ve randevuyu işleme bağlama.

## v0.3 özellikleri

- İşletme, usta, hizmet, gün ve saat seçerek randevu oluşturma
- Otomatik randevu kodu
- Usta saat çakışma kontrolü
- Müşteri notu
- `Yoldayım → Geldim → Geldi → İşlemde → Tamamlandı` akışı
- `Gelmedi` ve `İptal` durumları
- Her durum değişikliğinde appointment event kaydı
- Usta günlük takvimi ve tek tuşla randevulu işlemi başlatma
- İşletme günlük yoğunluk görünümü
- Admin randevu/event raporu
- Randevu tamamlanınca v0.2 işlem ve platform bedeli kaydına bağlanma
- AsyncStorage ile yerel demo kalıcılığı

## Görsel düzeltme

Ana sayfadaki salon fotoğrafı korunmuştur. Yazılar artık daha güçlü karartma, yarı saydam koyu bilgi kartı, beyaz metin ve metin gölgesi üzerinde gösterilir. Yeni görsel üretilmemiştir.

## Demo hesapları

Tüm hesapların şifresi `123456`:

- Müşteri: `musteri@demo.com`
- Usta: `usta@demo.com`
- İşletme: `isletme@demo.com`
- Admin: `draborneagle@gmail.com`

## ZIP ile Expo Go testi

Termux tarafında `git pull`, Python, JDK, Perl, patch ve `/tmp` kullanılmaz.

```bash
cd ~
rm -rf DraBornStyle DraBornStyle-main
rm -f DraBornStyle-v0.3.0.zip

pkg install -y curl unzip
curl -L "https://github.com/DrabornEagle/DraBornStyle/archive/refs/heads/main.zip" -o DraBornStyle-v0.3.0.zip
unzip -q DraBornStyle-v0.3.0.zip
mv DraBornStyle-main DraBornStyle

cd DraBornStyle
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --tunnel --clear
```

## Aktif sürüm dalları

- `main`
- `release/v0.1`
- `release/v0.2`
- `release/v0.3`

Geçici çalışma ve eski arşiv dalları final yayın sırasında silinir.

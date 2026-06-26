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
| ⬜ | v0.0.14 | Termux zip kurulumla telefonda ilk açılış testi yapılacak |
| ⬜ | v0.0.15 | Supabase publishable key `.env` içine girilecek |
| ⬜ | v0.0.16 | Gerçek auth ekranı bağlanacak |
| ⬜ | v0.0.17 | Rol seçimi ekranı tam etkileşimli yapılacak |
| ⬜ | v0.0.18 | Admin / Super Admin rol ayrımı ve yetki kontrolü netleştirilecek |
| ⬜ | v0.0.19 | İşletme oluşturma ve işletme profili formu bağlanacak |
| ⬜ | v0.0.20 | İşletme adı, logo, kapak görseli, adres, konum ve çalışma saatleri bağlanacak |
| ⬜ | v0.0.21 | Usta / çalışan ekleme ekranı bağlanacak |
| ⬜ | v0.0.22 | Hizmet ekleme, hizmet fiyatı ve hizmet süresi ekranı bağlanacak |
| ⬜ | v0.0.23 | Müşteri, işletme, usta, admin ve super admin hesap akışları test edilecek |
| ⬜ | v0.0.24 | Rol bazlı yetki sistemi uygulama ekranlarıyla test edilecek |
| ⬜ | v0.0.25 | v0.1 mobil test ve düzeltme turu tamamlanacak |
| ⬜ | v0.1 | v0.1 final tamamlanacak ve v0.2 hazırlığına geçilecek |

## dkd_v0_1_kilitli_kapsam

v0.1 finalde eksiksiz yapılacaklar:

- Müşteri hesabı
- İşletme hesabı
- Usta hesabı
- Admin / Super Admin hesabı
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

- Super Admin
- Admin
- İşletme Sahibi
- Usta
- Müşteri

## dkd_surum_takip_mantigi

Her ana sürüm kendi içinde küçük ara sürümlerle takip edilir.

- v0.1 için adımlar: v0.0.1, v0.0.2, v0.0.3 ... en son v0.1
- v0.2 için adımlar: v0.1.1, v0.1.2, v0.1.3 ... en son v0.2
- v0.3 için adımlar: v0.2.1, v0.2.2, v0.2.3 ... en son v0.3

Yani listedeki Sürüm alanı görev kodu değil, geliştirme ilerleme numarasıdır.

## dkd_v0_1_kapsam

v0.1 uygulama kapsamı:

- müşteri, işletme, usta, admin ve super admin rolleri
- rol bazlı giriş yönlendirmesi
- müşteri, işletme, usta, admin ve super admin hesap akışları
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

## dkd_isimlendirme_standardi

Projede özel yazılan tablo, kolon, dosya, fonksiyon, obje, parametre ve local değişkenlerde `dkd_` standardı kullanılır.

Framework tarafından zorunlu olan `package.json`, `app.json`, React Native style property adları ve Expo config anahtarları değiştirilemez. Bu alanlar dışında özel yazdığımız isimler `dkd_` ile başlar.

## dkd_supabase_env

`.env` dosyası repoya yüklenmez. Yerelde şu şekilde oluşturulur:

```bash
EXPO_PUBLIC_DKD_SUPABASE_URL=https://nhrzoolgvqezhijesuoi.supabase.co
EXPO_PUBLIC_DKD_SUPABASE_PUBLISHABLE_KEY=BURAYA_SUPABASE_PUBLISHABLE_KEY
```

## dkd_termux_zip_kurulum

Python yok, patch yok, JDK yok, Perl yok, `/tmp` yok. Sadece zip tabanlı kurulum:

```bash
pkg update -y
pkg install -y nodejs-lts curl unzip
mkdir -p $HOME/DrabornEagle $HOME/dkd_archives
cd $HOME/dkd_archives
curl -L -o dkd_drabornstyle_main.zip https://github.com/DrabornEagle/DraBornStyle/archive/refs/heads/main.zip
rm -rf $HOME/DrabornEagle/DraBornStyle
unzip -q dkd_drabornstyle_main.zip -d $HOME/DrabornEagle
mv $HOME/DrabornEagle/DraBornStyle-main $HOME/DrabornEagle/DraBornStyle
cd $HOME/DrabornEagle/DraBornStyle
cp .env.example .env
npm install
npm run dkd_start -- --lan
```

Not: Termux üzerinde `--tunnel` ngrok kurulumu isteyebilir ve bazı cihazlarda hata verebilir. İlk test için `--lan` kullanılacak.

## dkd_komutlar

```bash
npm run dkd_start
npm run dkd_android
npm run dkd_web
npm run dkd_typecheck
```

## dkd_surum_yol_haritasi

- v0.1: mobil temel altyapı, roller, işletme profili, usta ekibi, hizmet fiyat/süre, ilk randevu tabanı
- v0.2: usta takvimi, işlem başlat / bitir, çat kapı müşteri ve meşgul durumu
- v0.3: müşteri randevu akışı, boşluk talebi ve müsaitlik
- v0.4: usta ile müşteri iletişimi, foto/model referansı ve gecikme notu
- v0.5: randevu penceresiyle sınırlı geliş takibi
- v0.6: harita, yakın işletmeler, puan/yorum ve keşif
- v0.7: işletme kazanç raporları, usta performansı ve ödeme bildirimi
- v0.8: admin paneli, ödeme onayı ve platform hizmet bedeli kontrolü
- v1.0: stabil mobil MVP

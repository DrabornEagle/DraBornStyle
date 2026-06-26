# DraBornStyle

DraBornStyle v0.1, berber / kuaför / salon işletmeleri için mobil uygulama başlangıç sürümüdür.

Bu sürümde hedef; önce uygulama tarafında temel rol sistemi, Supabase tarafında güvenli veri altyapısı ve GitHub tarafında temiz Expo projesi kurmaktır. Web tarafına v0.1 mobil temel tamamlandıktan sonra geçilecek.

## dkd_v0_1_tam_liste

| Durum | Kod | İş |
| --- | --- | --- |
| ✅ | dkd_001 | GitHub repo temiz başlangıç için kontrol edildi |
| ✅ | dkd_002 | Supabase DraBornStyle projesi bulundu |
| ✅ | dkd_003 | Supabase çekirdek tabloları kuruldu |
| ✅ | dkd_004 | Supabase RLS güvenlik altyapısı açıldı |
| ✅ | dkd_005 | Kullanıcı profil / rol policy'leri kuruldu |
| ✅ | dkd_006 | İşletme profil policy'leri kuruldu |
| ✅ | dkd_007 | Usta / çalışan policy'leri kuruldu |
| ✅ | dkd_008 | Hizmet / fiyat / süre policy'leri kuruldu |
| ✅ | dkd_009 | Randevu veri tabanı ve policy'leri kuruldu |
| ✅ | dkd_010 | İşletme ödeme raporu ve admin onay altyapısı kuruldu |
| ✅ | dkd_011 | Logo / kapak / kullanıcı dosyaları için storage bucket kuruldu |
| ✅ | dkd_012 | Expo / React Native v0.1 proje iskeleti eklendi |
| ✅ | dkd_013 | Rol seçimi ön ekranı eklendi |
| ✅ | dkd_014 | Müşteri paneli v0.1 ön görünümü eklendi |
| ✅ | dkd_015 | İşletme paneli v0.1 ön görünümü eklendi |
| ✅ | dkd_016 | Usta paneli v0.1 ön görünümü eklendi |
| ✅ | dkd_017 | Admin paneli v0.1 ön görünümü eklendi |
| ⬜ | dkd_018 | Termux zip kurulumla telefonda ilk açılış testi yapılacak |
| ⬜ | dkd_019 | Supabase publishable key `.env` içine girilecek |
| ⬜ | dkd_020 | Gerçek auth ekranı bağlanacak |
| ⬜ | dkd_021 | İşletme profili formu bağlanacak |
| ⬜ | dkd_022 | Usta / çalışan ekleme ekranı bağlanacak |
| ⬜ | dkd_023 | Hizmet / fiyat / süre ekleme ekranı bağlanacak |
| ⬜ | dkd_024 | Temel randevu oluşturma ekranı bağlanacak |
| ⬜ | dkd_025 | v0.1 mobil test ve düzeltme turu tamamlanacak |

## dkd_v0_1_kapsam

v0.1 uygulama kapsamı:

- müşteri, işletme, usta ve admin rolleri
- rol bazlı giriş yönlendirmesi
- işletme profili altyapısı
- logo, kapak, adres, konum ve çalışma saatleri altyapısı
- usta / çalışan ekleme altyapısı
- hizmet, fiyat ve süre yönetimi altyapısı
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
mkdir -p $HOME/dkd_projects $HOME/dkd_archives
cd $HOME/dkd_archives
curl -L -o dkd_drabornstyle_main.zip https://github.com/DrabornEagle/DraBornStyle/archive/refs/heads/main.zip
rm -rf $HOME/dkd_projects/DraBornStyle
unzip -q dkd_drabornstyle_main.zip -d $HOME/dkd_projects
mv $HOME/dkd_projects/DraBornStyle-main $HOME/dkd_projects/DraBornStyle
cd $HOME/dkd_projects/DraBornStyle
cp .env.example .env
npm install
npm run dkd_start -- --tunnel
```

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

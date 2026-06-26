# DraBornStyle

DraBornStyle v0.1, berber/kuaför/salon tarafı için mobil uygulama başlangıç sürümüdür. Bu repo önce mobil uygulama için hazırlanır; web ve senkron paneller sonraki sürümlerde aynı Supabase altyapısı üzerinden genişletilir.

## dkd_v0_1_hedefi

v0.1 hedefi; müşteri, işletme, usta ve admin rollerinin temel hesabını, işletme profilini, usta ekip kaydını, hizmet fiyat/süre yönetimini ve ilk randevu veri tabanını kurmaktır.

## dkd_v0_1_checklist

| Durum | Kod | İş |
| --- | --- | --- |
| ✅ | dkd_001 | Supabase projesi bulundu: DraBornStyle |
| ✅ | dkd_002 | GitHub repo bulundu: DrabornEagle/DraBornStyle |
| ✅ | dkd_003 | v0.1 Supabase core schema uygulandı |
| ✅ | dkd_004 | RLS güvenlik politikaları eklendi |
| ✅ | dkd_005 | Security helper fonksiyonları private şemaya taşındı |
| ✅ | dkd_006 | Expo/React Native başlangıç dosyaları repo içine eklendi |
| ⬜ | dkd_007 | Supabase publishable env değerleri Termux tarafında girilecek |
| ⬜ | dkd_008 | Expo Go ile ilk mobil test yapılacak |
| ⬜ | dkd_009 | Rol seçimi ekranı kodlanacak |
| ⬜ | dkd_010 | İşletme profil oluşturma ekranı kodlanacak |
| ⬜ | dkd_011 | Hizmet fiyat/süre ekranı kodlanacak |
| ⬜ | dkd_012 | Usta ekleme/listeleme ekranı kodlanacak |
| ⬜ | dkd_013 | Basit randevu oluşturma akışı kodlanacak |
| ⬜ | dkd_014 | v0.1 mobil test ve düzeltme turu yapılacak |

## dkd_isimlendirme_standardi

Projede özel yazılan tablo, kolon, dosya, fonksiyon, obje, parametre ve local değişkenlerde `dkd_` standardı kullanılır. JavaScript/TypeScript tarafında custom nesneler `dkd_`, Supabase tablo/kolonları `dkd_`, dokümantasyon başlıkları da mümkün olduğunca `dkd_` standardındadır.

Framework tarafından zorunlu olan `package.json`, `app.json`, React Native style property adları ve Expo config anahtarları değiştirilemez. Bu alanlar dışında özel yazdığımız isimler `dkd_` ile başlar.

## dkd_termux_zip_kurulum

Aşağıdaki komutlar Python, JDK, Perl, patch ve `/tmp` kullanmadan zip üzerinden kurulum içindir.

```bash
pkg update -y
pkg install -y nodejs-lts curl unzip
mkdir -p $HOME/dkd_projects
cd $HOME/dkd_projects
curl -L -o dkd_drabornstyle_main.zip https://github.com/DrabornEagle/DraBornStyle/archive/refs/heads/main.zip
unzip -o dkd_drabornstyle_main.zip
cd DraBornStyle-main
cp .env.example .env
npm install
npm run dkd_start
```

## dkd_supabase_env

`.env` içine şu değerler girilecek:

```bash
EXPO_PUBLIC_DKD_SUPABASE_URL=https://gpyociwsefappbhvloby.supabase.co
EXPO_PUBLIC_DKD_SUPABASE_PUBLISHABLE_KEY=BURAYA_SUPABASE_PUBLISHABLE_KEY
```

## dkd_roadmap

- v0.1: Hesaplar, roller, işletme profili, usta ekibi, hizmet fiyat/süre, ilk randevu tabanı.
- v0.2: Usta paneli ve takvim görünümü.
- v0.3: Randevu akışı, müsaitlik ve boşluk talebi.
- v0.4: İşleme başla/bitti, çat kapı müşteri ve canlı usta durumu.
- v0.5: Usta-müşteri iletişimi, foto/model referansı ve gecikme notu.
- v0.6: Randevu penceresiyle sınırlı geliş takibi.
- v0.7: Harita, yakın işletmeler, puan/yorum ve müşteri keşif ekranları.
- v0.8: İşletme gelir raporları, usta performans ve ödeme bildirimi.
- v0.9: Admin paneli, platform hizmet bedeli ve ödeme onayı.
- v1.0: Mobil MVP stabil sürüm.

# DraBornStyle v0.0.23 — Hesap Akışları Test Planı

Bu adımın amacı, v0.1 final öncesinde Müşteri, İşletme Sahibi, Usta ve Admin rollerinin temel hesap akışlarının doğru çalıştığını test etmektir.

## Test öncesi durum

- Uygulama Expo Go ile açılmalı.
- Supabase `.env` durumu ekranda `Bağlantı bilgileri hazır` görünmeli.
- Giriş / kayıt ekranı çalışmalı.
- Rol seçimi Supabase `dkd_user_profiles` tablosuna kayıt atmalı.
- İşletme sahibi rolünde işletme, usta ve hizmet kayıtları Supabase'e yazılmalı.

## Test 1 — Müşteri hesabı

1. Yeni bir e-posta ile kayıt ol veya mevcut hesapla giriş yap.
2. Rol olarak `Müşteri` seç.
3. Ekranda `Seçili rol: Müşteri` görünmeli.
4. Çıkış yapıp tekrar giriş yap.
5. Rol tekrar `Müşteri` olarak yüklenmeli.

Beklenen sonuç:

- `dkd_user_profiles` içinde kullanıcı rolü `customer` olarak görünür.
- Oturum kapat/aç sonrası rol korunur.

## Test 2 — İşletme hesabı

1. Hesapla giriş yap.
2. Rol olarak `İşletme Sahibi` seç.
3. İşletme profili formunu doldur.
4. `İşletmeyi Oluştur` butonuna bas.
5. Usta / çalışan ekle.
6. Hizmet ekle.
7. Çıkış yapıp tekrar giriş yap.
8. İşletme, ekip ve hizmet listesi tekrar görünmeli.

Beklenen sonuç:

- `dkd_user_profiles` rolü `business` olur.
- `dkd_business_profiles` içinde işletme kaydı oluşur.
- `dkd_master_profiles` içinde işletmeye bağlı usta kaydı oluşur.
- `dkd_services` içinde işletmeye bağlı hizmet kaydı oluşur.

## Test 3 — Usta hesabı

1. Hesapla giriş yap.
2. Rol olarak `Usta` seç.
3. Ekranda `Seçili rol: Usta` görünmeli.
4. Çıkış yapıp tekrar giriş yap.
5. Rol tekrar `Usta` olarak yüklenmeli.

Beklenen sonuç:

- `dkd_user_profiles` içinde rol `master` olur.
- v0.1 içinde usta paneli temel rol doğrulaması tamamlanır.
- Detaylı usta takvimi v0.2 kapsamına kalır.

## Test 4 — Admin hesabı

1. Hesapla giriş yap.
2. Rol olarak `Admin` seç.
3. Ekranda `Seçili rol: Admin` görünmeli.
4. Çıkış yapıp tekrar giriş yap.
5. Rol tekrar `Admin` olarak yüklenmeli.

Beklenen sonuç:

- `dkd_user_profiles` içinde rol `admin` olur.
- v0.1 içinde Admin tek yönetim rolüdür.
- Super Admin ayrımı yoktur.

## Test 5 — Oturum kalıcılığı

1. Giriş yap.
2. Rol seç.
3. Uygulamayı kapat.
4. Expo Go üzerinden tekrar aç.
5. Hesap ve rol bilgisi görünmeli.

Beklenen sonuç:

- Supabase Auth oturumu AsyncStorage ile korunur.
- Kullanıcı yeniden giriş yapmadan aktif hesap olarak görünür.

## Test 6 — Hata kontrolleri

Aşağıdaki denemelerde uygulama kullanıcıya açıklayıcı mesaj göstermeli:

- Boş e-posta ile giriş.
- 6 karakterden kısa şifre.
- İşletme adı boşken işletme oluşturma.
- İşletme kaydı olmadan usta ekleme.
- İşletme kaydı olmadan hizmet ekleme.
- Fiyat alanı boşken hizmet ekleme.
- Süre alanı boşken hizmet ekleme.

## v0.0.23 tamamlanma kriteri

v0.0.23 tamamlandı sayılması için:

- Müşteri rolü kaydedilip tekrar yüklenmeli.
- İşletme rolü kaydedilmeli.
- İşletme profili oluşturulmalı.
- Usta / çalışan eklenmeli.
- Hizmet fiyat ve süreyle eklenmeli.
- Usta rolü kaydedilip tekrar yüklenmeli.
- Admin rolü kaydedilip tekrar yüklenmeli.
- Çıkış / tekrar giriş akışı çalışmalı.

Bu kriterler geçerse v0.0.24 rol bazlı yetki sistemi test adımına geçilir.

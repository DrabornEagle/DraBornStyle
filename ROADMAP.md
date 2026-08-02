# DraBornStyle Geliştirme Yol Haritası

Durum anahtarı:

- `[x]` Yapıldı ve v0.1 içinde aktif
- `[ ]` Henüz yapılmadı; ilgili sürüm geldiğinde geliştirilecek

## v0.1 Final — Temel Giriş ve Panel Omurgası

- [x] `index.js → App.tsx` ana giriş yapısı
- [x] Modern giriş ekranı
- [x] Kullanıcı kayıt ekranı
- [x] E-posta ve şifre ile demo giriş
- [x] Kayıt doğrulamaları
- [x] Kayıt olan kullanıcıya otomatik müşteri rolü
- [x] `customer` rolü
- [x] `business` rolü
- [x] `master` rolü
- [x] `admin` rolü
- [x] `dkd_user_role_access` erişim modeli
- [x] Müşteri paneli
- [x] Usta paneli
- [x] İşletme paneli
- [x] Admin paneli
- [x] Rol bazlı doğru panele yönlendirme
- [x] Birden fazla rol arasında panel değiştirme
- [x] Usta rol başvurusu
- [x] İşletme sahibi rol başvurusu
- [x] Başvurunun bekleyen durumunda tutulması
- [x] Admin başvuru listesi
- [x] Admin başvuru onayı
- [x] Admin başvuru reddi
- [x] Onay sonrası rol erişiminin açılması
- [x] Admin kullanıcı araması
- [x] Admin tarafından usta rolü ekleme/kaldırma
- [x] Admin tarafından işletme rolü ekleme/kaldırma
- [x] Müşteri rolünün temel rol olarak korunması
- [x] Admin test hesabı `draborneagle@gmail.com`
- [x] Demo müşteri hesabı
- [x] Demo usta hesabı
- [x] Demo işletme hesabı
- [x] Bekleyen başvurulu demo kullanıcı
- [x] Yerel demo veri kalıcılığı
- [x] Oturum kapatma
- [x] Demo verilerini admin panelinden sıfırlama
- [x] Usta temel çalışma durumu: uygun / meşgul / çevrimdışı
- [x] Usta paneli v0.2 işlem araçları için hazır iskelet
- [x] İşletme paneli ekip/hizmet/rapor araçları için hazır iskelet
- [x] Sonraki sürüm özelliklerinin v0.1’de kilitli gösterilmesi
- [x] Dar Android ekranları için responsive yerleşim
- [x] Safe-area uyumu
- [x] Buton animasyonu ve dokunsal geri bildirim
- [x] TypeScript/TSX sözdizimi testi
- [x] Rol ve başvuru durum makinesi testleri
- [ ] Kullanıcının kendi Android cihazında son görsel onay testi

## v0.2.17 Final — İşlem, Ödeme, QR ve İndirim

- [ ] İşlem başlatma
- [ ] İşlem bitirme
- [ ] Son fiyat düzenleme
- [ ] Hizmet işlem kaydı
- [ ] Varsayılan işlem başına 20 TL platform bedeli
- [ ] İşletme bazlı özel platform bedeli
- [ ] İşletme ödeme raporu
- [ ] İşletme ödeme bildirimi
- [ ] Admin ödeme onayı
- [ ] Ödeme bekliyor / kısmi ödeme / ödendi durumları
- [ ] QR kaynakları
- [ ] QR müşteri ve işlem akışı
- [ ] Usta indirim kodu
- [ ] Özel müşteri indirimi
- [ ] İşletme ve admin rapor altyapısı
- [ ] v0.2 içeriğine uygun yeni demo veriler

## v0.3.0 — Randevu, Takvim ve Müşteri Akışı

- [ ] İşletme seçimi
- [ ] Usta seçimi
- [ ] Hizmet seçimi
- [ ] Uygun saat seçimi
- [ ] Randevu oluşturma
- [ ] Randevu kodu
- [ ] Randevu event kayıtları
- [ ] Usta takvimi
- [ ] Usta meşguliyet takibi
- [ ] Yoldayım
- [ ] Geldim
- [ ] Geldi
- [ ] İşlemde
- [ ] Tamamlandı
- [ ] Gelmedi
- [ ] İptal
- [ ] Randevu ile v0.2 işlem akışının bağlanması
- [ ] Çat kapı müşterinin randevu/işlem akışına dahil edilmesi
- [ ] v0.3 içeriğine uygun yeni demo veriler

## v0.4 — Canlı Usta ve Çat Kapı Akışı

- [ ] Ustanın anlık durum görünümü
- [ ] Tahmini bitiş süresi
- [ ] Meşgule al butonu
- [ ] Hızlı çat kapı müşteri ekleme
- [ ] Favori/bilinen müşteri hızlı seçimi
- [ ] Tek tuş işlem başlatma sadeleştirmesi
- [ ] İşletme içi anlık yoğunluk

## v0.5 — Bildirim ve Ödeme Disiplini

- [ ] Ödeme günü bildirimi
- [ ] Ödeme bekleniyor uyarısı
- [ ] Haftalık ödeme döngüsü
- [ ] Aylık ödeme döngüsü
- [ ] Ödeme günü seçimi
- [ ] Kısmi ödeme
- [ ] Geciken ödeme takibi
- [ ] Randevu hatırlatması

## v0.6 — Web Senkron Başlangıcı

- [ ] Web randevu ekranı
- [ ] İşletme tanıtım sayfası
- [ ] Web hizmet/fiyat listesi
- [ ] Web usta seçimi
- [ ] Mobil ile ortak Supabase verisi
- [ ] İşletme paylaşım bağlantısı

## v0.7 — Sadakat ve Özel Müşteri

- [ ] Usta davet linki
- [ ] Usta özel indirim kodu
- [ ] Favori müşteri listesi
- [ ] Müşteri işlem geçmişi
- [ ] Sadakat sistemi

## v0.8 — Gelişmiş Rapor ve Analiz

- [ ] Usta performansı
- [ ] Hizmet bazlı kazanç
- [ ] Yoğun saatler
- [ ] Randevulu/randevusuz oranı
- [ ] İptal/gelmedi oranı
- [ ] Platform gelir tahmini
- [ ] İşletme ödeme geçmişi

## v0.9 — Pazaryeri ve Keşfetme

- [ ] Yakındaki işletmeler
- [ ] Harita ve konum
- [ ] Hizmet/fiyat karşılaştırma
- [ ] Usta profili
- [ ] Puan ve yorum
- [ ] Kampanyalı hizmetler

## v1.0 — Stabil MVP

- [ ] Stabil dört rol ve dört panel
- [ ] Stabil randevu/takvim
- [ ] Stabil çat kapı/işlem akışı
- [ ] Stabil platform bedeli ve ödeme takibi
- [ ] Stabil QR/indirim
- [ ] Temel bildirim ve raporlar
- [ ] Google Play’e hazır mobil uygulama

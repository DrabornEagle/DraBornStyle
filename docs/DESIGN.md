# DraBornStyle v0.3.0 · Mockup uygulaması

Gönderilen on görselin fotoğraf, neon ışık, cam panel ve bölüm hiyerarşisi çalışan React Native bileşenlerine taşındı. Önceki kodla çizilmiş Miami sahnesi kaldırıldı. Ekran görüntüsü bir düğme/kartın yerine kullanılmıyor; bütün arayüz öğeleri gerçek veri ve mevcut işlemlerle çalışıyor.

## Ekran eşleştirmesi

| Referans           | Uygulamadaki karşılığı                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------- |
| 01-52738           | Admin: altı gösterge, işletme gelir tablosu, günlük gelir ve platform uyarıları           |
| 02-52737           | Randevu: hizmet/usta, aylık takvim, uygun/dolu saatler ve fiyat özeti                     |
| 03-52735, 05-52734 | İşletme: göstergeler, gelir/doluluk, yoğun saatler, hizmetler ve çalışan performansı      |
| 04-52736           | Randevu ayrıntısı: usta, saat, ödeme özeti, konum ve sohbet                               |
| 06-52731           | Keşfet: arama/şehir, öne çıkan işletme, yatay işletme/usta kartları ve gerçek boş saatler |
| 07-52732           | Usta: beş durum, tıraş başlatma, günlük akış ve hızlı hizmetler                           |
| 08-52733           | Yönetim: çalışan/takvim sekmeleri, haftalık zaman çizelgesi ve hizmet atama matrisi       |
| 09-52730           | Sohbet: kişi/randevu bilgisi, neon balonlar, sabit mesaj alanı ve hızlı cevaplar          |
| 10-52729           | Karşılama/giriş: salon fotoğrafı, makas markası, rol açıklamaları ve sade giriş/kayıt     |

Yerleşim 360, 414, 864 ve 1120 pikselde kontrol edilir. Geniş ekranlarda grafikler, hizmetler ve takvim yan yana; telefonda okunabilirliği korumak için alt alta yerleşir. Yatay listeler bilerek kaydırılır. Alt menü aktif ekran grubunu da gösterir: sohbet içinde Sohbet, rezervasyon içinde Randevular seçilidir.

## Görsel sistemi

Koyu zemin `#040b18`, magenta `#ff39d0`, mor `#af5dff`, turkuaz `#32d9ff`, sıcak altın `#ffb65f`. Ana düğmeler mor → pembe → turuncu. İnce neon çerçeveler, hafif gölge, büyük beyaz başlıklar ve gerçek salon/usta fotoğrafları kullanılır. Marka yazısının Style bölümü Allura el yazısı fontuyla çizilir; font uygulamaya gömülüdür ve çevrimdışı yüklenir. Lisans ve font geçmişi `assets/fonts` içindedir.

Kart girişleri ve düğme etkileşimleri animasyonludur. Hareket azaltma tercihinde ve uygulama arka plandayken animasyonlar durur.

## Üretilen proje varlıkları

Yerleşik görsel üretimi kullanıldı; CLI/API anahtarı kullanılmadı. Nihai dosyalar:

- `assets/art/neon-salon.webp`: 1024 × 1536, yaklaşık 100 KB.
- `assets/art/neon-logo.webp`: 320 × 320, gerçek alfa şeffaflığı, yaklaşık 22 KB.

Üretim yönergelerinin özeti:

1. Salon arka planı — `precise-object-edit`: 01/03/06 mockuplarını referans al; yalnızca fotoğraf arka planını üret. Lüks karanlık berber salonu, sıcak altın aynalar, mor/pembe Miami gün batımı, gerçek cam yansımaları, palmiye ve şehir silueti. Üst bölüm fotoğraf ağırlıklı; alt bölüm metin ve kartlar için koyu. İnsan, arayüz, yazı, düğme ve filigran ekleme. Çizim/clipart görünümü kullanma.
2. Makas markası — `background-extraction`: 01/07 mockuplarındaki makas/D işaretini referans al. Pembe–mor–turkuaz neon makas/D ve küçük altın yıldız; temiz merkezlenmiş işaret. Gerçek şeffaf zemin; metin, kart, başka logo veya filigran yok.

Diğer salon/usta fotoğrafları mevcut proje varlıklarından korunur; işletme kendine ait görsel yüklediğinde onun gerçek kaydı gösterilir.

## Bilerek korunmuş doğruluk sınırları

Mockuplardaki örnek fiyat, puan, mesafe, kazanç ve randevular sabit veri olarak kopyalanmadı. Gerçek kayıtta yorum yoksa “Yeni işletme” gösterilir. Yakınlık hesaplanmadığı için sahte kilometre yazılmaz. Google/telefon kimlik sağlayıcıları yapılandırılmadığı için çalışmayan giriş düğmeleri eklenmedi; çalışan e-posta giriş/kayıt/sıfırlama akışları korundu.

Yönetim çizelgesi kayıtlı randevuları seçili güne ve ilgili ustaya yerleştirir; boş gün için sahte örnek blok eklemez. Gelir grafikleri gerçek kuruş toplamlarını kullanır; doluluk ayrı yüzde göstergesidir.

Bu, farklı ekran boyutlarına ve gerçek verilere uyarlanan mockup uygulamasıdır; tüm çözünürlüklerde piksel-piksel aynı görüntü iddiası değildir. Fiziksel Android ve işletim sistemi izin/klavye/harita testleri ayrıca yapılmalıdır. Güncel kanıt: `ui-design-results.json` ve `TEST-REPORT.md`.

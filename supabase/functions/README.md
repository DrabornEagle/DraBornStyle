# Sunucu iş akışları

v0.1 işlemleri PostgreSQL transaction/RPC fonksiyonlarıyla çalışır. Push gönderimi uygulamaya özel pg_cron + pg_net kuyruğundadır; istemciye service-role anahtarı verilmez. Edge Function zorunlu değildir.

İleride harita sağlayıcısı ile rota bazlı ETA, ses/görsel mesaj işleme veya banka entegrasyonu eklenirse bu dizinde uygulamaya özel Edge Functions kullanılabilir. Mevcut projenin başka uygulamalara ait işlevlerini değiştirmeyin.

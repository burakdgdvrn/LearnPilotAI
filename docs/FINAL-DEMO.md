# Final demo: gerçek inference şartı

Bu projenin final demosunda runtime sırasında gerçek Nebius NVIDIA inference kullanılması bir teslim koşuludur.
Mock geliştirmeyi açar; final hackathon şartını karşılamaz. Bu doküman bağımsız bir yarışma kural doğrulaması değildir; ekibin belirtilen teslim koşulunu uygular.

## Anahtar geldiğinde AI sahibi
1. Nebius program onayını ve hesap erişimini doğrular; anahtarı .env.local/deployment secret olarak saklar.
2. Hesapta erişilebilir uygun modeli seçer; NEBIUS_MODEL değerini doldurur. Model adı veya erişimi bu scaffold tarafından varsayılmaz.
3. AI_PROVIDER=nebius, HACKATHON_FINAL=true, NEBIUS_API_KEY ve NEBIUS_BASE_URL ayarlar.
4. npm run ai:verify çalıştırır. Bu komut gerçek chat/completions isteği yapar ve kredi tüketebilir; mock ile geçmez.
5. Başarılı çıktının tarih/model/provider bilgisini PR'a ekler. Anahtar/prompt/hassas veri eklemez.
6. Modelin çalıştığı Nebius NVIDIA altyapısını Nebius konsolu/servis dokümanı veya hesap kanıtıyla teyit eder. API metin cevabı tek başına GPU üreticisini ispatlamaz.

## Tüm ekip
- Backend gerçek sağlayıcıyı @/server/ai üzerinden çağıran kullanıcı akışını bağlar. CLI kontrolü tek başına final ürün entegrasyonu değildir.
- Auth/kota ve giriş doğrulaması tamamlanmadan ücretli inference endpoint'i halka açılmaz.
- Ürün UI'sı gerçek/mock durumunu doğru yansıtır. Statik başlangıç sayfası inference demosu sayılmaz.
- Final ortamında iki değişken de açıkça ayarlanır. HACKATHON_FINAL true olduğunda runtime factory mock'u reddeder.
- Sağlayıcı hatası veya eksik anahtarda işlem hata verir; sessiz fallback olmaz.
- Final ortamında yeni bir inference kontrolü ve kullanıcı akışı provası yapılır. Build/unit/health başarısı canlı inference yerine geçmez.

## Şu anki durum
- Provider adaptörü, final mod koruması ve canlı kontrol komutu hazır.
- Testler ağ fixture'ları kullanır; gerçek Nebius/NVIDIA inference doğrulanmadı.
- Anahtar, model erişimi, donanım kanıtı ve tam kullanıcı akışı entegrasyonu bekleniyor.

API referansı: [Nebius OpenAPI](https://api.tokenfactory.nebius.com/docs).

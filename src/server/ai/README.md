# AI sağlayıcı sınırı
Ekip: Koltuk 4 — İclal, Çağrı; görev başına tek yürütücü.
Uygulama sunucusu public giriş noktası: @/server/ai. types.ts saf provider sözleşmesidir.
Durum: Mock fixture, Nebius chat/completions adaptörü, 30 saniye timeout, 128 token sınırı ve final mod guard hazır.
Provider factory CLI/test için ayrı; istemci bileşenlerinden hiçbir server dosyası import edilmez.
POST /api/learning/plan yalnızca geliştirme mock preview'ı için public girişi kullanır. Nebius/final modunda API 503 döner ve provider oluşturmaz; auth/kota anlaşması öncesi gerçek inference'a açılmaz. AI adaptörü ve final guard bu görevde değişmez.

## Modlar
- Varsayılan mock: ağ yok; mocked=true, metinde MOCK etiketi.
- nebius: NEBIUS_API_KEY, NEBIUS_MODEL ve HTTPS base URL; gerçek server-side istek.
- Final: AI_PROVIDER=nebius + HACKATHON_FINAL=true. Mock veya eksik config hata verir.
- Ağ, HTTP veya boş/bozuk cevapta fallback yok; upstream gövde hata mesajına eklenmez.

.env.local dosyasını hazırlayıp npm run ai:verify çalıştırın. Anahtar basılmaz; yalnızca provider/model/tarih ve başarı döner.
Bu canlı komut kredi tüketebilir; unit testler yalnızca fixture kullanır.
NVIDIA altyapı kanıtı ve final kullanıcı akışı için docs/FINAL-DEMO.md izlenir.
Henüz gerçek inference doğrulanmadı. Model seçimi veya hesap erişimi varsayılmadı.
Referans: https://api.tokenfactory.nebius.com/docs

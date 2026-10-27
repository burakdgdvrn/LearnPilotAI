# API sözleşmesi — v0.2 geliştirme

Makine sözleşmesi: [openapi.yaml](openapi.yaml). Saf DTO'lar: src/contracts/health.ts ve src/contracts/learning.ts.
GET /api/health ve aşağıdaki geliştirme öğrenme planı endpoint'i uygulanmıştır. Auth ve ücretli inference akışı hazır değildir.

## GET /api/health

Auth gerektirmeyen, yan etkisiz liveness endpoint'i. HTTP 200, application/json, Cache-Control: no-store.

```json
{
  "status": "ok",
  "service": "learnpilotai",
  "ai": {
    "provider": "mock",
    "configurationValid": true,
    "finalMode": false,
    "inferenceVerified": false
  }
}
```

provider: mock | nebius | invalid. Yapılandırma hatasında invalid ve configurationValid=false döner.
configurationValid yalnızca yerel ayarların doğruluğudur; anahtarın geçerliliğini, model erişimini, DB/auth durumunu veya GPU çalıştığını doğrulamaz.
inferenceVerified bu endpoint'te her zaman false. Config hatasında da status=ok ve 200 kalır; bu readiness endpoint'i değildir.

## POST /api/learning/plan

Başlangıç akışı için auth gerektirmeyen, veri saklamayan geliştirme fixture'ı. Yalnızca geçerli mock yapılandırmasında çalışır; Nebius/final modunda 503 verir, ücretli/ağ çağrısı yapmaz. Üretime hazır kişiselleştirilmiş plan veya final demo değildir.

İstek: Content-Type: application/json (charset parametresi kabul edilir), en fazla 4096 UTF-8 bayt. Nesne tam olarak topic ve level alanlarını içermelidir; ek alanlar reddedilir. topic ham değeri 1–120 Unicode kod noktası olmalıdır; kontrol/format karakterleri kabul edilmez. Baş/son boşluklar kırpılır ve sonuç boş olamaz. level: beginner | intermediate | advanced.

```json
{ "topic": "Kesirler", "level": "beginner" }
```

HTTP 200, application/json, Cache-Control: no-store:

```json
{
  "plan": {
    "id": "mock-initial-plan",
    "goal": { "topic": "Kesirler", "level": "beginner" },
    "steps": [
      { "id": "foundation", "title": "[MOCK] Temeller: Kesirler", "objective": "beginner seviyesi için temel kavramları gözden geçir." },
      { "id": "practice", "title": "[MOCK] Alıştırma: Kesirler", "objective": "beginner seviyesinde bir örnek üzerinde çalış." },
      { "id": "review", "title": "[MOCK] Tekrar: Kesirler", "objective": "Öğrendiklerini kendi sözlerinle özetle." }
    ]
  },
  "preview": "[MOCK — no inference] Learning preview for: {\"topic\":\"Kesirler\",\"level\":\"beginner\"}",
  "ai": { "provider": "mock", "mocked": true, "inferenceVerified": false }
}
```

Plan üç sabit fixture adımıdır; learning-engine sınırından gelir. AI preview yalnızca @/server/ai public girişinden alınır. Kimlikler fixture kimlikleridir, kalıcı kaynak veya kullanıcı kimliği değildir. İstemci preview/title metnini düz metin olarak göstermeli, MOCK durumunu gizlememelidir. Seviye girdisi kaydedilir; pedagojik uyarlama/algoritma iddiası yoktur.

İşleyicinin tüm yanıtlarında no-store ve güvenli hata zarfı kullanılır:

| HTTP | error.code | Durum |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Bozuk/boş JSON, geçersiz UTF-8, yanlış alan/tip/seviye/konu |
| 413 | PAYLOAD_TOO_LARGE | Okunan gövde 4096 baytı aşar; Content-Length'e güvenilmez |
| 415 | UNSUPPORTED_MEDIA_TYPE | application/json dışında veya eksik Content-Type |
| 503 | LEARNING_PLAN_UNAVAILABLE | Geçersiz config, Nebius/final modu, AI fixture hatası veya mock olmayan sonuç |
| 500 | INTERNAL_ERROR | Beklenmeyen plan oluşturma hatası |

Örnek: `{ "error": { "code": "VALIDATION_ERROR", "message": "Konu ve seviye girdisini kontrol edin." } }`.
Hata mesajları sabittir; girdiyi, exception/stack, config veya upstream gövdesini yansıtmaz. Hata durumunda mock'a geçiş yapılmaz.

## Henüz uygulanmayan sınırlar

Kalıcı plan, ilerleme/tekrar algoritmaları, auth ve gerçek AI içerik üretimi yoktur. Backend/DB/AI sahipleri kimlik doğrulama, kota/rate limit, hata ve çıktı sözleşmesinde anlaşmadan bu endpoint gerçek sağlayıcıya açılmamalıdır. Final mock yasağı korunur; final kullanıcı akışı ayrı entegrasyon bekler.

## Değişiklik
Backend docs/API.md, OpenAPI ve DTO'ları aynı PR'da günceller.
Frontend, DB/auth, AI ve learning sahiplerinden etkilenenler incelemeye katılır.

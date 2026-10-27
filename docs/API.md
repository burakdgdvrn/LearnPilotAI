# API sözleşmesi — v0 başlangıç

Makine sözleşmesi: [openapi.yaml](openapi.yaml). İstemci ve sunucu DTO'su: src/contracts/health.ts.
Şu anda yalnızca GET /api/health uygulanmıştır. İş endpoint'leri veya auth hazır varsayılmamalıdır.

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

## Henüz uygulanmayan sınırlar

src/contracts/learning.ts yalnızca önerilen domain tiplerini taşır; aktif HTTP sözleşmesi değildir.
Learning plan, ilerleme, AI içerik üretimi ve auth endpoint'lerinin yöntemi/URL'si henüz sabitlenmedi.
Bunları tüketmeden önce backend ilgili sahiplerle request/response, auth, hata ve kota sözleşmesini kesinleştirir.

İleride hata zarfı için öneri:
`{ "error": { "code": "VALIDATION_ERROR", "message": "Safe public message" } }`.
Bu bir öneridir; mevcut endpoint'in hata davranışı olarak sunulamaz.
Gelecek üretim endpoint'leri giriş doğrulaması, kullanıcı yetkisi, kota/rate limit, timeout ve güvenli hata eşlemesi gerektirir.
Upstream hata gövdesi veya kimlik bilgisi istemciye verilmez.

## Değişiklik
Backend docs/API.md, OpenAPI ve DTO'ları aynı PR'da günceller.
Frontend, DB/auth, AI ve learning sahiplerinden etkilenenler incelemeye katılır.

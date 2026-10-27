# Backend / API
Sahip: Koltuk 2. app/api rotaları ince HTTP adaptörleri; iş orkestrasyonu burada.
Durum: GET /api/health yan etkisiz liveness uygular. Auth ve iş endpoint'leri yok.
Sözleşme: docs/API.md, docs/openapi.yaml, src/contracts/health.ts.
Sonraki teslim: DB/auth sahibiyle oturum/erişim; AI/learning sahipleriyle giriş/çıktı ve hata sözleşmeleri.
Paid endpoint öncesi auth, kota, doğrulama ve güvenli hata mesajları gerekir.
Sağlık 200 sonucu AI/DB readiness veya final inference kanıtı sayılmaz.

# Backend / API
Ekip: Koltuk 2 — Mete, Burak, Asude; görev başına tek yürütücü. app/api rotaları ince HTTP adaptörleri; iş orkestrasyonu burada.
Durum: GET /api/health yan etkisiz liveness; POST /api/learning/plan açıkça etiketli geliştirme fixture'ı uygular. Auth ve ücretli inference yok.
Sözleşme: docs/API.md, docs/openapi.yaml, src/contracts/health.ts ve learning.ts.
Plan isteği JSON, en fazla 4096 bayt, topic (ham değer 1–120 Unicode kod noktası; kontrol/format karakteri yok; kırpılmış sonuç boş olamaz) ve level enum'udur. Ek alanlar reddedilir. İşleyici gövdeyi akış sırasında sınırlar; hatalar sabit mesajlı JSON ve no-store döner.
Rota AI public girişini ve learning-engine fixture'ını enjekte eder; postLearningPlan orkestrasyonu bağımlılık enjeksiyonu ile ağsız test edilir. Fixture hatasında 503; beklenmeyen plan hatasında 500; hata ayrıntısı veya girdi yansıtılmaz.
Nebius/final/geçersiz config 503 verir; provider oluşturulmaz, ücretli çağrı/fallback yoktur. Bu kapı auth/kota sözleşmesi tamamlanmadan kaldırılmamalıdır. Plan kimlikleri kalıcı değildir.
Sonraki teslim: DB/auth sahibiyle oturum/erişim; AI/learning sahipleriyle giriş/çıktı ve hata sözleşmeleri.
Paid endpoint öncesi auth, kota, doğrulama ve güvenli hata mesajları gerekir.
Sağlık 200 sonucu AI/DB readiness veya final inference kanıtı sayılmaz.

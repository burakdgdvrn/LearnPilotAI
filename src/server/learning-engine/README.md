# Learning engine
Ekip: Koltuk 5 — Burak; görev başına tek yürütücü.
Durum: server-only public index ve saf createInitialPlanFixture girdiden üç sabit MOCK adımı üretir. Bu geliştirme fixture'ıdır; uyarlamalı öğrenme algoritması değildir. Plan/step kimlikleri sabittir; veri saklanmaz.
POST /api/learning/plan bu public sınırı kullanır. Girdi backend tarafından doğrulanır; domain/HTTP DTO'ları src/contracts/learning.ts içindedir. Saf fixture dosyası ağsız birim testleri için doğrudan import edilebilir.
AI preview backend tarafından @/server/ai üzerinden alınır; learning modülü provider veya DB çağırmaz. Nebius/final modunda API bu fixture'a erişmeden 503 döner.
Sonraki teslim: hedef/seviye girdileri, plan adımları, ilerleme/tekrar kuralları ve anlamlı birim testleri.
Kuralları mümkün olduğunca saf fonksiyonlar yapın. Provider çağrısı AI, veri kalıcılığı DB alanında kalır.
DTO değişikliğini backend, frontend, DB ve AI ile koordine edin.

# Doğrulama — 27 Ekim 2026

Yerel ortam: Windows, Node.js 24.18.0, npm 11.16.0.

- ESLint: başarılı, son kontrol uyarısız.
- Rota tipleri ve TypeScript: başarılı.
- 5 test: başarılı. Geliştirme fixture etiketi, final mod koruması, gerçek provider istek biçimi, HTTP/ağ/bozuk cevapta fallback olmaması ve sağlıkta gizlilik/liveness kapsamları.
- Production build: başarılı (Next.js 16.4.3, Webpack, Tailwind PostCSS).
- Production smoke: ana sayfa HTTP 200 ve GET /api/health sözleşmesi/cache başlığı başarılı.
- npm run ai:verify varsayılan mock modda beklenen şekilde exit 1: mock gerçek inference kanıtı kabul edilmedi.
- Paket kurulumu npm audit özeti: 0 vulnerability (kurulum anındaki kayıt).
- Gerçek Nebius anahtarı/model erişimi bulunmadığından canlı NVIDIA inference çalıştırılmadı.

CI aynı check + smoke komutlarını Node 24/Linux üzerinde çalıştıracak. Uzak CI sonucu henüz doğrulanmadı.
Sağlık kontrolü auth, DB veya gerçek inference readiness testi değildir.

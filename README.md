# LearnPilotAI

Beş kişilik hackathon ekibi için ortak proje başlangıcı. Mevcut repo ilk incelemede boştu; önceki kaynak veya mimari değiştirilmedi. Ayrıntı: [ilk inceleme](docs/REPOSITORY-INSPECTION.md).

## Hızlı başlangıç

Node.js 24 ve npm kullanın. .nvmrc sürümü belirtir. Kilit dosyasını koruyun.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell'de kopyalama: `Copy-Item .env.example .env.local`.
[Uygulama](http://localhost:3000), [sağlık](http://localhost:3000/api/health).

Varsayılan mod mock'tur, anahtar gerektirmez. Ana sayfa başlangıç ekranıdır; henüz öğrenme planı, giriş veya inference arayüzü yoktur. Sağlık endpoint'i ücretli çağrı yapmaz ve gerçek inference başarısını kanıtlamaz.

## Komutlar

| Komut | İşlev |
| --- | --- |
| npm run dev | Geliştirme sunucusu |
| npm run lint | ESLint |
| npm run typecheck | Rota tiplerini üret + TypeScript |
| npm test | Provider ve final mod sınır testleri; ağ kullanmaz |
| npm run build | Production build |
| npm run check | Lint + tip + test + build |
| npm run smoke | Build sonrası geçici production sunucusunda ana sayfa ve health kontrolü |
| npm run ai:verify | Gerçek Nebius çağrısı; mock modda başarısız, kredi tüketebilir |

## Yapı ve sahiplik

| Alan | Yol | Sorumlu |
| --- | --- | --- |
| Frontend | src/frontend, src/app sayfaları | Koltuk 1 (tek UI sahibi) |
| Backend / API | src/server/api, src/app/api | Koltuk 2 |
| Database / Auth | src/server/db | Koltuk 3 |
| AI | src/server/ai | Koltuk 4 |
| Learning engine | src/server/learning-engine | Koltuk 5 |
| Ortak DTO ve sözleşme | src/contracts, docs/API.md | Backend koordine eder, etkilenen sahipler inceler |

İsim atamaları ve ilk işler: [TEAM](docs/TEAM.md). Agent talimatları: [AGENTS](AGENTS.md).
[API sözleşmesi](docs/API.md), [OpenAPI](docs/openapi.yaml).

## Mock ve final hackathon ayrımı

- `AI_PROVIDER=mock`: deterministik fixture, gerçek model/GPU çağrısı yok.
- `AI_PROVIDER=nebius`: server-side gerçek API adaptörü; anahtar ve hesapta erişilebilir model gerekir. Hatalarda mock'a dönmez.
- Final runtime'da ayrıca `HACKATHON_FINAL=true` zorunlu. Bu mod mock seçimini reddeder.
- Final demo için Nebius üzerinde **gerçek NVIDIA inference** çalışmalı. Sağlık, build ve fixture testlerinin geçmesi bunun yerine geçmez.
- Anahtar henüz sağlanmadığından bu başlangıçta canlı inference doğrulandığı iddia edilmez.
- [Final demo kontrol listesi](docs/FINAL-DEMO.md) hesap/model/donanım kanıtını ve uygulama akışındaki son entegrasyonu tarif eder.

DB/auth sağlayıcısı, şema ve öğrenme algoritmaları bilinçli olarak seçilmedi. Henüz kullanıcı verisi saklanmaz, auth uygulanmaz ve ücretli inference için halka açık endpoint yoktur.

## Ekip iş akışı

1. Alan sahibini atayın, küçük görevleri issue'lara ayırın.
2. main güncelken kendi alanınızın dalını açın; ortak DTO'ları önce kararlaştırın.
3. Modülünüzü ve modül README'sini birlikte güncelleyin.
4. Kontrolleri çalıştırın, PR açın; ilgili sahip incelemeden merge etmeyin.
5. Son entegrasyon ve demo provası beş kişi birlikte yapılır.

.github/pull_request_template.md değişiklik bilgisini toplar. CI anahtar gerektirmeden check ve smoke çalıştırır. Branch koruması ve gerçek kullanıcılara CODEOWNERS ataması repo yöneticisi tarafından ayrıca yapılmalıdır.

Repo başlangıçta boştu. Kullanıcı onayıyla main yalnızca boş başlangıç commit'iyle oluşturuldu; iskelet setup/shared-foundation-pr dalından PR ile incelenir. İlk setup/shared-foundation dalı korunur. [İnceleme ve başlangıç kararı](docs/REPOSITORY-INSPECTION.md).

Derleyici: bu başlangıçta geliştirme ve production için Webpack, Tailwind için PostCSS kullanılır. Yerel Turbopack CSS alt işlemi hatası nedeniyle bu yol seçildi; sürümler kilit dosyasındadır.

# LearnPilotAI — tüm ekip ve agent'lar için talimatlar

## Önce oku
1. README.md, docs/TEAM.md, docs/API.md ve çalışacağın modülün README.md dosyasını oku.
2. Git durumunu ve mevcut kodu incele. Başkasının değişikliğini silme, resetleme veya yeniden scaffold etme.
3. Tek görevlik dal kullan: feat/frontend-*, feat/api-*, feat/db-*, feat/ai-*, feat/learning-*.
4. Alan ekipleri README.md ve docs/TEAM.md içinde aynıdır: frontend Mete/Asude; backend Mete/Burak/Asude; DB/auth ve AI İclal/Çağrı; learning Burak. GitHub hesabı veya ekip lideri uydurmayın.
5. Her görev için alan ekibinden tek yürütücü belirleyin. Ortak alanlarda da görev başına tek yürütücü vardır; aynı dosyayı paralel düzenlemeyin. Alan dışı değişiklikte ilgili ekiple sözleşme ve dosya sınırlarını kararlaştırın; PR incelemesini bu ekipten isteyin.

## Ortak sınırlar
- src/app yönlendirme/kompozisyon; frontend sahibi sayfaları, backend sahibi app/api rotalarını yönetir.
- src/frontend yalnızca UI. src/server altını client bileşenlerine import etme.
- Sunucu AI giriş noktası @/server/ai; provider-factory CLI/test iç dikişidir.
- src/contracts saf TypeScript DTO'larıdır; DB, UI, env veya provider bağımlılığı içermez.
- API değişikliğinde önce docs/API.md + docs/openapi.yaml + ilgili DTO'yu güncelle.
- Yeni paid inference endpoint'i eklemeden kimlik doğrulama, kota, girdi doğrulama ve hata eşleme üzerinde backend/DB/AI sahipleri anlaşmalı.
- DB/auth, frontend, learning algoritmaları veya tam AI ürün akışı bu başlangıç görevinin kapsamına girmez.
- İlk öğrenme planı endpoint'i yalnızca açıkça etiketli geliştirme fixture'ıdır; Nebius/final modunda 503 döner. Auth/kota anlaşması olmadan ücretli inference'a bağlamayın.

## AI ve gizli değerler
- Mock yalnızca geliştirme fixture'ıdır. Mock çıktısını gerçek AI veya final demo başarısı diye sunma.
- Final runtime: AI_PROVIDER=nebius ve HACKATHON_FINAL=true zorunlu. Mock yasak; config, ağ, yetki veya model hatasında mock fallback ekleme.
- Final demo Nebius üzerinde gerçek NVIDIA inference içermeli; yalnızca build veya test fixture'ı yeterli değil.
- NEBIUS_API_KEY hiçbir client/public değişkende, logda, committe, ekranda veya PR metninde bulunmamalı.
- Anahtar ve hesap erişimi yoksa gerçek inference doğrulandı iddiasında bulunma. Donanım kanıtı için docs/FINAL-DEMO.md izlenir.

## Bitirme koşulları
- Davranış/kurulum/sözleşme değiştiğinde ilgili modül README'sini güncel duruma göre düzelt.
- README'ye her küçük commit için günlük ekleme; tarihçe Git ve PR'dadır.
- npm run check ve npm run smoke çalıştır; anlamlı başarısızlıkları PR'da belirt.
- AI değişikliğinde mocksuz hata davranışını ve final mod korumasını koru.
- PR: alan, sözleşme etkisi, test kanıtı, mock/real durumu ve kalan işleri yaz.
- main'e doğrudan push, force push veya otomatik merge yapma.

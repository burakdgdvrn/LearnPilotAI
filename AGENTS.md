# LearnPilotAI — tüm ekip ve agent'lar için talimatlar

## Önce oku
1. README.md, docs/TEAM.md, docs/API.md ve çalışacağın modülün README.md dosyasını oku.
2. Git durumunu ve mevcut kodu incele. Başkasının değişikliğini silme, resetleme veya yeniden scaffold etme.
3. Tek görevlik dal kullan: feat/frontend-*, feat/api-*, feat/db-*, feat/ai-*, feat/learning-*.
4. Her modülün tek sahibi vardır. docs/TEAM.md içindeki koltukları gerçek ekip üyeleriyle eşleştirin; isim uydurmayın.
5. Sahibi olmadığın alanda değişiklik gerekiyorsa önce ilgili sahibiyle sözleşme ve dosya sınırlarını kararlaştır.

## Ortak sınırlar
- src/app yönlendirme/kompozisyon; frontend sahibi sayfaları, backend sahibi app/api rotalarını yönetir.
- src/frontend yalnızca UI. src/server altını client bileşenlerine import etme.
- Sunucu AI giriş noktası @/server/ai; provider-factory CLI/test iç dikişidir.
- src/contracts saf TypeScript DTO'larıdır; DB, UI, env veya provider bağımlılığı içermez.
- API değişikliğinde önce docs/API.md + docs/openapi.yaml + ilgili DTO'yu güncelle.
- Yeni paid inference endpoint'i eklemeden kimlik doğrulama, kota, girdi doğrulama ve hata eşleme üzerinde backend/DB/AI sahipleri anlaşmalı.
- DB/auth, frontend, learning algoritmaları veya tam AI ürün akışı bu başlangıç görevinin kapsamına girmez.

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

# Beş kişilik koordinasyon

Her satıra bir gerçek ekip üyesi/GitHub kullanıcı adı atayın. Bilinen tek karar: arayüz tek kişide kalacak. Koltuklar gerçek kişi ataması iddiası değildir.

| Koltuk | Tek sahip | Dosyalar / kararlar | İlk teslim | Bağımlılık |
| --- | --- | --- | --- | --- |
| 1 | Frontend — atanacak | frontend ve app sayfaları/layout/styles/public | DTO'larla çalışan UI, yükleme/hata/boş durumları | 2 ile API; 5 ile öğrenme durumu |
| 2 | Backend — atanacak | server/api, app/api, contracts, API dokümanı | Girdi doğrulama, hata sözleşmesi, endpoint orkestrasyonu | 3 auth; 4 inference; 5 planlama |
| 3 | DB/Auth — atanacak | server/db, gelecek şema/migration/auth | Sağlayıcı kararı, veri modeli, auth oturumu, migration planı | 2 ile kimlik/erişim sözleşmesi |
| 4 | AI — atanacak | server/ai, verify script ve AI testleri | Nebius erişimi, model seçimi, gerçek inference ve hata yönetimi | 2 orkestrasyon; 5 prompt/veri biçimi |
| 5 | Learning engine — atanacak | server/learning-engine | Saf öğrenme/ilerleme kuralları ve birim testleri | 4 içerik; 3 kalıcılık; 1 sunum |

## Ortak dosyalar
- Backend sözleşme değişikliğini koordine eder. Alan sahipleri kendi modüllerini değiştirir.
- Frontend app sayfalarının; backend app/api'nin sahibidir. Aynı dosyada paralel düzenleme yapmayın.
- package.json, kilit dosyası, root config, AGENTS ve workflow değişikliklerini bir PR sahibinde toplayın.
- Modül dışı değişiklik için önce ilgili sahibiyle anlaşın. Sahip olmak tek başına merge yetkisi anlamına gelmez.
- Gerçek kullanıcılar atanana kadar CODEOWNERS içine sahte hesap yazmayın.

## Senkronizasyon
Her işe başlarken ve PR açarken: değişen sözleşme, engel, test sonucu ve bir sonraki teslimi paylaşın.
Frontend geliştirmede açıkça etiketlenmiş fixture kullanabilir; AI sahibi gerçek inference'ı ayrı doğrular.
Kırıcı DTO/API değişikliği önce doküman PR'ında kararlaştırılır; tüketicilerle birlikte uygulanır.
Merge öncesi ilgili modül sahibi incelemesi ve CI gerekir; repo yöneticisi bu kuralları GitHub branch protection'da etkinleştirir.

## Son ortak adım
Beş kişi birlikte: auth → API → learning → Nebius → UI akışını bağlar, hataları dener, final modu açar ve gerçek NVIDIA inference kanıtıyla demo provası yapar.

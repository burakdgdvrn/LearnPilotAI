# Frontend
Ekip: Koltuk 1 — Mete, Asude; her görev/dosya için tek yürütücü belirlenir.
Alan: src/frontend, src/app sayfaları/layout/styles ve public; API rotaları backend'e ait.
Durum: Ana sayfada Türkçe, responsive başlangıç planı demosu ve health bağlantısı hazır. Konu, seviye ve örnek konu düğmeleriyle POST /api/learning/plan çağrılır; üç adım ve MOCK etiketi gösterilir. Login/chat, gerçek AI veya ilerleme kaydı yoktur.
UI saf DTO'ları src/contracts üzerinden kullanır. server import'ları client koduna girmez.
foundation-overview.tsx sunucu kompozisyonu; learning-plan-demo.tsx client formudur. Sözleşme değişmez; API/auth/AI modülleri bu görevde genişletilmez.
Form ham konuda 1–120 Unicode kod noktası, kırpıldıktan sonra boş olmama ve kontrol/format karakteri yasağı uygular; sunucu doğrulaması belirleyicidir. Yüklenirken alan/düğmeler devre dışıdır, çift istek engellenir. İstek 15 saniye sonra zaman aşımına uğrar. Konu/seviye değişince önceki plan ve hata temizlenir.
Boş başlangıç, yükleme, başarı, istemci doğrulama, HTTP ve ağ hataları görünürdür. Hatalar sabit UI mesajlarıdır; sunucu gövdesi/exception yansıtılmaz. Nebius/final 503 yanıtı hata olarak gösterilir; client mock fallback eklenmez. Sonuçtaki mock bilgisi kontrol edilir; plan/preview metin olarak render edilir.
Etiketli native form kontrolleri, hata odağı/aria-invalid, role=alert, aria-live/aria-busy ve klavye focus stilleri kullanılır. Başarıda odak sonuç başlığına taşınır; dar ekranda plan görünür olur. Fixture hedeflerindeki seviye adı UI'da Türkçe gösterilir; ham preview ayrı details alanında korunur. npm run dev ile / adresinde örnek konu seçip plan oluşturun; boş/uzun konu ve sunucu kapalıyken yeniden denemeyi kontrol edin.
Sonraki teslim: backend/learning ekibiyle gerçek plan ve ilerleme ekranı sözleşmesi. Gerçek inference öncesi auth/kota anlaşması ve ayrı doğrulama gerekir.
Davranış ve kullanım değişirse bu README güncellenir; commit geçmişi buraya kopyalanmaz.

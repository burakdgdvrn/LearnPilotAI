/**
 * AI Modülü — Yanıt Yardımcı Araçları
 * Kapsam: src/server/ai  |  Ekip: İclal, Çağrı
 *
 * Gerçek LLM bağlandığında ham metin yanıtını güvenle ayrıştırmak için
 * kullanılan hata toleranslı yardımcı fonksiyonlar.
 */

import type { StudyPlan } from "./types";

// ─── Sabitler ────────────────────────────────────────────────────────────────

/** Herhangi bir ayrıştırma hatasında döndürülecek güvenli varsayılan plan. */
const FALLBACK_PLAN: StudyPlan = {
  generatedAt: new Date().toISOString(),
  studentId: "unknown",
  weak_topics: [],
  priority_reason:
    "Plan oluşturulurken bir sorun yaşandı. Lütfen öğretmeninizle iletişime geçin.",
  teacher_review_required: true,
  sessions: [
    {
      date: getTodayPlusDays(1),
      topic: "Genel Tekrar",
      durationMinutes: 30,
      activityType: "review",
      note: "Bir sonraki planınız hazırlanana kadar genel tekrar yapın.",
    },
  ],
  _meta: {
    provider: "mock",
    disclaimer:
      "Bu plan bir ayrıştırma hatası nedeniyle oluşturulmuş varsayılan içeriktir.",
  },
};

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────

/** Bugüne n gün ekleyerek YYYY-MM-DD biçiminde tarih döndürür. */
function getTodayPlusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0]!;
}

/**
 * Ham LLM metin yanıtını temizleyip güvenle JSON.parse yapar.
 *
 * Desteklenen temizleme adımları:
 * 1. Başına/sonuna gelen ```json ... ``` veya ``` ... ``` bloklarını çıkarır.
 * 2. Başında/sonunda kalan boşlukları kırpar.
 * 3. JSON.parse ile nesneye dönüştürür.
 * 4. Gerekli alanların varlığını doğrular (temel şema kontrolü).
 *
 * @param text - LLM'den gelen ham metin yanıtı
 * @returns Ayrıştırılmış StudyPlan ya da hata durumunda FALLBACK_PLAN
 */
export function parseAIResponse(text: string): StudyPlan {
  try {
    if (!text || typeof text !== "string") {
      console.warn("[parseAIResponse] Boş veya geçersiz metin alındı.");
      return { ...FALLBACK_PLAN, generatedAt: new Date().toISOString() };
    }

    // Adım 1: Markdown kod bloklarını temizle
    // Hem ```json\n...\n``` hem de ```\n...\n``` kalıplarını yakalar
    let cleaned = text
      .replace(/^```(?:json)?\s*/i, "")  // baştaki ``` veya ```json
      .replace(/\s*```$/i, "")           // sondaki ```
      .trim();

    // Adım 2: Baştaki/sondaki olası açıklama metnini atla,
    // ilk { karakterinden itibaren JSON bölümünü çıkar
    const jsonStartIndex = cleaned.indexOf("{");
    const jsonEndIndex = cleaned.lastIndexOf("}");

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      console.warn("[parseAIResponse] Yanıtta JSON nesnesi bulunamadı.");
      return { ...FALLBACK_PLAN, generatedAt: new Date().toISOString() };
    }

    cleaned = cleaned.slice(jsonStartIndex, jsonEndIndex + 1);

    // Adım 3: JSON ayrıştır
    const parsed: unknown = JSON.parse(cleaned);

    // Adım 4: Temel şema doğrulaması
    if (!isValidStudyPlan(parsed)) {
      console.warn(
        "[parseAIResponse] Ayrıştırılan nesne StudyPlan şemasına uymuyor.",
        parsed
      );
      return { ...FALLBACK_PLAN, generatedAt: new Date().toISOString() };
    }

    return parsed;
  } catch (error) {
    console.error("[parseAIResponse] JSON ayrıştırma hatası:", error);
    return { ...FALLBACK_PLAN, generatedAt: new Date().toISOString() };
  }
}

/**
 * Ayrıştırılmış nesnenin StudyPlan arayüzüne uyduğunu kontrol eder.
 * Yalnızca zorunlu alanların varlığını ve temel tiplerini doğrular.
 */
function isValidStudyPlan(obj: unknown): obj is StudyPlan {
  if (!obj || typeof obj !== "object") return false;

  const plan = obj as Record<string, unknown>;

  const requiredStringFields = [
    "generatedAt",
    "studentId",
    "priority_reason",
  ] as const;

  for (const field of requiredStringFields) {
    if (typeof plan[field] !== "string" || plan[field] === "") {
      console.warn(`[isValidStudyPlan] Eksik veya geçersiz alan: ${field}`);
      return false;
    }
  }

  if (!Array.isArray(plan["weak_topics"])) {
    console.warn("[isValidStudyPlan] weak_topics bir dizi olmalı.");
    return false;
  }

  if (typeof plan["teacher_review_required"] !== "boolean") {
    console.warn("[isValidStudyPlan] teacher_review_required boolean olmalı.");
    return false;
  }

  if (!Array.isArray(plan["sessions"]) || plan["sessions"].length === 0) {
    console.warn(
      "[isValidStudyPlan] sessions en az bir oturum içeren dizi olmalı."
    );
    return false;
  }

  if (!plan["_meta"] || typeof plan["_meta"] !== "object") {
    console.warn("[isValidStudyPlan] _meta nesnesi eksik.");
    return false;
  }

  return true;
}

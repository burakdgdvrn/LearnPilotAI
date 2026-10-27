/**
 * AI Modülü — Mock Çalışma Planı Servisi
 * Kapsam: src/server/ai  |  Ekip: İclal, Çağrı
 *
 * Gerçek Nebius API anahtarı olmadan Frontend ve Backend ekiplerinin
 * bloklanmaması için deterministik, tip-güvenli bir mock servis.
 *
 * UYARI:
 * - Bu dosya yalnızca AI_PROVIDER=mock modunda çalışır.
 * - Mock çıktısını gerçek AI veya final demo başarısı olarak sunmayın.
 * - Final runtime'da (HACKATHON_FINAL=true) bu servis 503 döndürür.
 *
 * @see src/server/ai/types.ts     — Tip tanımları
 * @see src/server/ai/prompts.ts   — Gerçek model için sistem promptu
 * @see src/server/ai/utils.ts     — LLM yanıt ayrıştırıcı
 */

import type {
  StudentData,
  StudyPlan,
  StudySession,
  TestResult,
} from "./types";

// ─── Sabitler ────────────────────────────────────────────────────────────────

/** Başarı eşiği: bu puanın altı "başarısız" sayılır. */
const PASS_THRESHOLD = 60;

/** Simüle edilen API gecikmesi (ms). */
const MOCK_DELAY_MS = 2000;

/** Mock modda _meta.disclaimer değeri. */
const MOCK_DISCLAIMER =
  "Bu plan geliştirme amaçlı bir mock fixture'dır. " +
  "Gerçek AI inference içermez. Final modda 503 döner.";

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────

/** Bugüne n gün ekleyerek YYYY-MM-DD biçiminde tarih döndürür. */
function addDays(baseDate: Date, n: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0]!;
}

/**
 * Son iki test sonucunun ikisinin de başarısız olup olmadığını kontrol eder.
 * testResults en az 2 elemanlı olmalı; en sona göre değerlendirir.
 */
function hasConsecutiveFailures(results: TestResult[]): boolean {
  if (results.length < 2) return false;
  const last = results[results.length - 1]!;
  const secondLast = results[results.length - 2]!;
  return last.score < PASS_THRESHOLD && secondLast.score < PASS_THRESHOLD;
}

/**
 * %60 altı puan alan konuları zayıf konu olarak döndürür.
 * Aynı konu birden fazla testte geçiyorsa en düşük skoru baz alır.
 */
function detectWeakTopics(results: TestResult[]): string[] {
  const subjectMinScore = new Map<string, number>();

  for (const result of results) {
    const existing = subjectMinScore.get(result.subject);
    if (existing === undefined || result.score < existing) {
      subjectMinScore.set(result.subject, result.score);
    }
  }

  const weak: string[] = [];
  for (const [subject, score] of subjectMinScore.entries()) {
    if (score < PASS_THRESHOLD) {
      weak.push(subject);
    }
  }

  // En düşük puanlıdan en yükseğe sırala
  return weak.sort((a, b) => {
    const aScore = subjectMinScore.get(a)!;
    const bScore = subjectMinScore.get(b)!;
    return aScore - bScore;
  });
}

/**
 * teacher_review_required bayrağını belirler.
 *
 * true koşulları:
 * - Son iki test art arda başarısız (< %60), VEYA
 * - 3 veya daha fazla zayıf konu, VEYA
 * - Herhangi bir konuda %40 altı puan
 */
function requiresTeacherReview(
  results: TestResult[],
  weakTopics: string[]
): boolean {
  if (hasConsecutiveFailures(results)) return true;
  if (weakTopics.length >= 3) return true;
  if (results.some((r) => r.score < 40)) return true;
  return false;
}

/**
 * priority_reason metnini Türkçe olarak oluşturur.
 * Zayıf konuları ve genel durumu özetler.
 */
function buildPriorityReason(
  weakTopics: string[],
  teacherReview: boolean
): string {
  if (weakTopics.length === 0) {
    return (
      "Tüm konularda başarılı bir performans göstermektesin! " +
      "Bu plan mevcut bilgilerini pekiştirmeye ve sınav hazırlığına odaklanıyor."
    );
  }

  const topTwo = weakTopics.slice(0, 2).join(" ve ");
  const extra =
    teacherReview
      ? " Gelişimin için öğretmen desteği önerilmektedir."
      : " Düzenli çalışmayla bu konularda hızla ilerleme kaydedebilirsin.";

  return (
    `${topTwo} konularında ek çalışmaya ihtiyaç duyulmaktadır. ` +
    `Bu plan öncelikli olarak bu alanlara odaklanmaktadır.` +
    extra
  );
}

/**
 * Çalışma oturumlarını oluşturur.
 *
 * Kurallar:
 * - 7 günlük plan; sadece studyDaysPerWeek kadar gün aktif.
 * - Günlük süre dailyMinutesAvailable'ı aşmaz.
 * - Zayıf konular önceliklidir (%60 session).
 * - Son 2 oturum test_prep olarak atanır.
 */
function buildSessions(data: StudentData, weakTopics: string[]): StudySession[] {
  const { schedule, testResults } = data;
  const { studyDaysPerWeek, dailyMinutesAvailable } = schedule;

  const sessions: StudySession[] = [];
  const today = new Date();

  // Aktif çalışma günlerini haftaya yay (0=Paz...6=Cmt)
  // Basit dağılım: ilk studyDaysPerWeek günü seç (7 günde)
  const activeDayOffsets: number[] = [];
  const step = 7 / studyDaysPerWeek;
  for (let i = 0; i < studyDaysPerWeek; i++) {
    activeDayOffsets.push(Math.round(i * step) + 1); // +1: bugünden sonra başla
  }

  // Tüm konu listesi: önce zayıflar, sonra diğerleri
  const allSubjects = [
    ...weakTopics,
    ...testResults
      .map((r) => r.subject)
      .filter((s) => !weakTopics.includes(s))
      .filter((s, i, arr) => arr.indexOf(s) === i), // tekrarsız
  ];

  if (allSubjects.length === 0) {
    allSubjects.push("Genel Tekrar");
  }

  let topicIndex = 0;
  const totalSessions = activeDayOffsets.length;

  for (let i = 0; i < totalSessions; i++) {
    const dayOffset = activeDayOffsets[i]!;
    const sessionDate = addDays(today, dayOffset);

    // Son 2 oturum test hazırlığı
    const isLastTwo = i >= totalSessions - 2;
    const activityType: StudySession["activityType"] = isLastTwo
      ? "test_prep"
      : weakTopics.includes(allSubjects[topicIndex % allSubjects.length]!)
      ? "practice"
      : "review";

    const topic = isLastTwo
      ? "Genel Tekrar ve Sınav Hazırlığı"
      : allSubjects[topicIndex % allSubjects.length]!;

    // Oturum süresini günlük limite sığdır (20–90 dk arası)
    const rawDuration = Math.min(dailyMinutesAvailable, 60);
    const durationMinutes = Math.max(20, Math.min(90, rawDuration));

    const note = buildSessionNote(topic, activityType, weakTopics);

    sessions.push({
      date: sessionDate,
      topic,
      durationMinutes,
      activityType,
      note,
    });

    if (!isLastTwo) topicIndex++;
  }

  return sessions;
}

/** Oturuma özel kısa ipucu üretir. */
function buildSessionNote(
  topic: string,
  activityType: StudySession["activityType"],
  weakTopics: string[]
): string {
  if (activityType === "test_prep") {
    return "Geçmiş sorular üzerinden pratik yaparak kendini sınav ortamına hazırla.";
  }
  if (weakTopics.includes(topic)) {
    return `${topic} konusunda temel kavramları önce gözden geçir, ardından örnek sorular çöz.`;
  }
  if (activityType === "review") {
    return `${topic} konusunu pekiştirmek için hızlı tekrar yap.`;
  }
  return `${topic} konusuna odaklanarak yeni kavramları öğren.`;
}

// ─── Ana Servis Fonksiyonu ───────────────────────────────────────────────────

/**
 * Öğrenci verisine göre adaptif bir çalışma planı üretir.
 *
 * Mock modu: gerçek bir API çağrısı yapmaz, sadece mantıksal hesaplama yapar
 * ve 2 saniye gecikmeyle sonuç döndürür.
 *
 * @param studentData - Öğrencinin test sonuçları ve program tercihleri
 * @returns Promise<StudyPlan> — Üretilen çalışma planı
 * @throws Giriş verisi geçersizse hata fırlatır
 */
export async function generateStudyPlan(
  studentData: StudentData
): Promise<StudyPlan> {
  // Temel girdi doğrulaması
  if (!studentData.studentId || !studentData.testResults) {
    throw new Error(
      "[generateStudyPlan] Geçersiz girdi: studentId ve testResults zorunludur."
    );
  }

  // Gerçek API gecikmesini simüle et
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const { studentId, testResults } = studentData;

  // 1. Zayıf konuları tespit et
  const weakTopics = detectWeakTopics(testResults);

  // 2. Öğretmen onayı gerekli mi?
  const teacherReviewRequired = requiresTeacherReview(testResults, weakTopics);

  // 3. Öncelik açıklaması
  const priorityReason = buildPriorityReason(weakTopics, teacherReviewRequired);

  // 4. Oturumları oluştur
  const sessions = buildSessions(studentData, weakTopics);

  const plan: StudyPlan = {
    generatedAt: new Date().toISOString(),
    studentId,
    weak_topics: weakTopics,
    priority_reason: priorityReason,
    teacher_review_required: teacherReviewRequired,
    sessions,
    _meta: {
      provider: "mock",
      modelVersion: "mock-v1.0",
      disclaimer: MOCK_DISCLAIMER,
    },
  };

  return plan;
}

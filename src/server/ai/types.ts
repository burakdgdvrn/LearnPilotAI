/**
 * AI Modülü — Tip Tanımları
 * Kapsam: src/server/ai  |  Ekip: İclal, Çağrı
 *
 * Bu dosya yalnızca saf TypeScript DTO'larıdır.
 * DB, UI, env veya provider bağımlılığı içermez.
 */

// ─── Mevcut provider arayüzleri (korunuyor) ──────────────────────────────────

export interface AIRequest { prompt: string; }
export interface AIResult {
  provider: "mock" | "nebius";
  model: string;
  text: string;
  mocked: boolean;
}
export interface AIProvider { generate(request: AIRequest): Promise<AIResult>; }

// ─── Girdi: Öğrenci Test Verisi ──────────────────────────────────────────────

/** Tek bir test sonucunu temsil eder. */
export interface TestResult {
  /** Testin yapıldığı konu (ör. "Kesirler", "Denklemler") */
  subject: string;
  /** 0–100 arası ham puan */
  score: number;
  /** Testin yapıldığı tarih (ISO 8601) */
  date: string;
  /** Toplam soru sayısı */
  totalQuestions: number;
  /** Doğru cevap sayısı */
  correctAnswers: number;
}

/** Öğrencinin mevcut ders yükü ve tercih bilgileri. */
export interface StudentSchedule {
  /** Haftada kaç gün çalışmak istiyor (1–7) */
  studyDaysPerWeek: number;
  /** Günde kaç dakika çalışabilir */
  dailyMinutesAvailable: number;
  /** Tercih ettiği çalışma saati */
  preferredTimeOfDay?: "morning" | "afternoon" | "evening";
}

/** generateStudyPlan fonksiyonuna iletilen öğrenci girdi paketi. */
export interface StudentData {
  /** Benzersiz öğrenci kimliği */
  studentId: string;
  /** Öğrencinin adı (UI gösterimi için) */
  name: string;
  /** Sınıf/seviye bilgisi (ör. "5th grade", "beginner", "intermediate") */
  grade: string;
  /** Kronolojik sırayla test sonuçları listesi */
  testResults: TestResult[];
  /** Çalışma programı tercihleri */
  schedule: StudentSchedule;
  /** İsteğe bağlı: öğretmen tarafından girilmiş ek bağlam notu */
  teacherNote?: string;
}

// ─── Çıktı: AI'ın Ürettiği Çalışma Planı ────────────────────────────────────

/** Tek bir çalışma oturumunu temsil eder. */
export interface StudySession {
  /** Oturumun tarihi (ISO 8601, YYYY-MM-DD) */
  date: string;
  /** Çalışılacak konu */
  topic: string;
  /** Oturum süresi (dakika) */
  durationMinutes: number;
  /** Aktivite türü */
  activityType: "practice" | "review" | "new_concept" | "test_prep";
  /** Bu oturuma özgü not veya ipucu */
  note?: string;
}

/** AI'ın ürettiği tam çalışma planı. */
export interface StudyPlan {
  /** Planın oluşturulduğu zaman damgası (ISO 8601) */
  generatedAt: string;
  /** Hangi öğrenci için üretildi */
  studentId: string;
  /**
   * Zayıf olduğu tespit edilen konular.
   * Öğretmen incelemesi ve kaynak yönlendirme için kullanılır.
   */
  weak_topics: string[];
  /**
   * Neden bu önceliklendirmenin yapıldığına dair kısa açıklama.
   * Öğretmen ve öğrenciye gösterilir.
   */
  priority_reason: string;
  /**
   * true → plan öğretmene gönderilmeli, onay beklenmeli.
   * Kural: öğrencinin son iki testi art arda başarısızsa true olur
   * (başarı eşiği: %60 altı).
   */
  teacher_review_required: boolean;
  /**
   * Planlanan çalışma oturumları listesi.
   * Tarih sırasıyla düzenlenmiş, günlük süre sınırına uygun.
   */
  sessions: StudySession[];
  /** Plan üretim modu; gerçek çıktıda "nebius" veya "openai" gelir. */
  _meta: {
    provider: "mock" | "nebius" | "openai";
    modelVersion?: string;
    disclaimer?: string;
  };
}

// ─── Hata Tipi ───────────────────────────────────────────────────────────────

/** AI servisi hata yanıtı. */
export interface AIServiceError {
  code:
    | "INVALID_INPUT"
    | "PARSE_ERROR"
    | "PROVIDER_ERROR"
    | "FINAL_MODE_BLOCKED"
    | "UNKNOWN";
  message: string;
  details?: unknown;
}

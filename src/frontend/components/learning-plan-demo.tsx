"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { InitialLearningPlanRequest, InitialLearningPlanResponse } from "@/contracts/learning";

const levels = { beginner: "Başlangıç", intermediate: "Orta", advanced: "İleri" };
const examples = ["Kesirler", "Python döngüleri", "İngilizce zamanlar"];

export function LearningPlanDemo() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<InitialLearningPlanRequest["level"]>("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicError, setTopicError] = useState(false);
  const [result, setResult] = useState<InitialLearningPlanResponse | null>(null);
  const topicInput = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const pending = useRef(false);
  const topicLength = Array.from(topic).length;

  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  function clearFeedback() {
    setError(null);
    setTopicError(false);
    setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    clearFeedback();
    if (!topic.trim() || topicLength > 120 || /[\p{Cc}\p{Cf}]/u.test(topic)) {
      setTopicError(true);
      setError("1–120 karakterlik bir konu yaz. Yalnızca boşluk veya kontrol karakteri kullanma.");
      topicInput.current?.focus();
      return;
    }

    pending.current = true;
    setLoading(true);
    try {
      const body: InitialLearningPlanRequest = { topic, level };
      const response = await fetch("/api/learning/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        // Show fixed UI messages, never an upstream body or exception.
        setError(response.status === 503
          ? "Örnek plan şu anda kullanılamıyor. Bu demo yalnızca mock geliştirme modunda çalışır."
          : response.status === 400 || response.status === 413
            ? "Konu ve seviye girdisini kontrol edip tekrar dene."
            : "Plan oluşturulamadı. Biraz sonra tekrar dene.");
        return;
      }
      const data = await response.json() as InitialLearningPlanResponse;
      if (data.ai?.provider !== "mock" || data.ai.mocked !== true || data.ai.inferenceVerified !== false
        || !data.plan?.goal || typeof data.plan.goal.topic !== "string"
        || !["beginner", "intermediate", "advanced"].includes(data.plan.goal.level)
        || !Array.isArray(data.plan.steps) || data.plan.steps.length !== 3
        || !data.plan.steps.every(step => typeof step.id === "string" && typeof step.title === "string" && typeof step.objective === "string")
        || typeof data.preview !== "string") {
        setError("Beklenen örnek plan alınamadı. Tekrar dene.");
        return;
      }
      setResult(data);
    } catch {
      setError("Sunucuya ulaşılamadı veya istek zaman aşımına uğradı. Bağlantını kontrol edip tekrar dene.");
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
      <form onSubmit={submit} noValidate className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold tracking-widest text-indigo-700">01 / KONUNU BELİRLE</p>
          <h2 className="text-xl font-bold text-slate-900">Nereden başlayalım?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Bir konu seç, başlangıç planının nasıl göründüğünü dene.</p>
        </div>
        <fieldset disabled={loading} className="min-w-0 space-y-6 disabled:opacity-60">
          <legend className="sr-only">Öğrenme hedefi</legend>
          <div>
            <label htmlFor="topic" className="mb-2 block text-sm font-semibold text-slate-800">Öğrenmek istediğin konu</label>
            <input id="topic" name="topic" ref={topicInput} value={topic}
              onChange={event => { setTopic(event.target.value); clearFeedback(); }}
              placeholder="Örn. Kesirler" autoComplete="off" required
              aria-invalid={topicError} aria-describedby={`topic-hint${topicError ? " plan-error" : ""}`}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 aria-invalid:border-red-500" />
            <div id="topic-hint" className="mt-2 flex justify-between gap-2 text-xs text-slate-500">
              <span>Kısa ve belirli bir konu yaz.</span>
              <span className={topicLength > 120 ? "font-semibold text-red-700" : ""}>{topicLength}/120</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Örnek konular">
              {examples.map(example => (
                <button key={example} type="button" onClick={() => { setTopic(example); clearFeedback(); topicInput.current?.focus(); }}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  {example}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="level" className="mb-2 block text-sm font-semibold text-slate-800">Mevcut seviyen</label>
            <select id="level" name="level" value={level}
              onChange={event => { setLevel(event.target.value as InitialLearningPlanRequest["level"]); clearFeedback(); }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
              {Object.entries(levels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-700 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 disabled:cursor-wait">
            {loading ? "Plan hazırlanıyor…" : "Plan oluştur"}
            <span aria-hidden="true">{loading ? "…" : "→"}</span>
          </button>
        </fieldset>
        {error && <p id="plan-error" role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>}
        <p className="mt-4 text-xs leading-5 text-slate-500">Hesap gerekmez. Plan ve ilerleme kaydedilmez.</p>
      </form>

      <section aria-label="Öğrenme planın" aria-live="polite" aria-atomic="true" aria-busy={loading}
        className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-xs font-bold tracking-widest text-indigo-700">02 / İLK ADIMLARINI GÖR</p>
        {result ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 ref={resultHeading} tabIndex={-1} className="break-words rounded text-2xl font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">{result.plan.goal.topic}</h2>
                <p className="mt-2 text-sm text-slate-500">{levels[result.plan.goal.level]} seviyesi · 3 örnek adım</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">MOCK · Örnek plan</span>
            </div>
            <ol className="mt-7 space-y-3">
              {result.plan.steps.map((step, index) => (
                <li key={step.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.objective.replace(result.plan.goal.level, levels[result.plan.goal.level])}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm leading-6 text-slate-500">Bu üç adım sabit geliştirme verisidir. Gerçek AI üretimi veya kişiselleştirilmiş öğrenme önerisi değildir.</p>
            <details className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <summary className="cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">Mock önizleme metni</summary>
              <p className="mt-3 break-words rounded-xl bg-slate-50 p-4 leading-6">{result.preview}</p>
            </details>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900">{loading ? "İlk adımların hazırlanıyor" : "Planın burada görünecek"}</h2>
            <div className="mt-7 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <span aria-hidden="true" className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-indigo-600 shadow-sm ${loading ? "motion-safe:animate-pulse" : ""}`}>↗</span>
              <p className="max-w-xs font-semibold text-slate-700">{loading ? "Kısa bir süre bekle…" : "Küçük bir başlangıç, üç net adım."}</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{loading ? "Konu ve seviyen örnek plan akışına gönderiliyor." : "Konunu ve seviyeni seçip “Plan oluştur” düğmesine bas. Temeller, alıştırma ve tekrar adımlarını gör."}</p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

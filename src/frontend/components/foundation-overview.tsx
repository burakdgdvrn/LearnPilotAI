import Link from "next/link";
import { LearningPlanDemo } from "./learning-plan-demo";

export function FoundationOverview() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <Link href="/" aria-label="LearnPilotAI ana sayfa" className="flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-700 text-sm font-bold text-white">LP</span>
          <span className="text-sm font-bold tracking-wider text-slate-900">LEARNPILOTAI</span>
        </Link>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">Geliştirme demosu</span>
      </header>
      <div className="pb-8 pt-10 sm:pb-10 sm:pt-14">
        <p className="mb-3 text-xs font-bold tracking-widest text-indigo-700">ÖĞRENMEYE BİR YERDEN BAŞLA</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">Bir konu seç. İlk adımını gör.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Merak ettiğin konuyu yaz, seviyeni seç ve üç adımlık örnek öğrenme planını keşfet.</p>
      </div>
      <aside aria-label="Demo hakkında" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
        <span className="shrink-0 font-bold">MOCK</span>
        <p>Bu uygulamalı örnek geliştirme verisi kullanır. Gerçek AI çağrısı yapmaz ve planını kaydetmez.</p>
      </aside>
      <LearningPlanDemo />
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs leading-5 text-slate-500">
        <p>LearnPilotAI · İlk öğrenme akışı</p>
        <a className="rounded underline underline-offset-4 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600" href="/api/health">Uygulama sağlık durumu</a>
      </footer>
    </main>
  );
}

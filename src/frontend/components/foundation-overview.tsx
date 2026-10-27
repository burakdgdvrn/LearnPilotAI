const areas = ["Frontend", "Backend / API", "Database / Auth", "AI", "Learning Engine"];
export function FoundationOverview() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16 sm:py-24">
      <p className="mb-5 text-sm font-bold tracking-widest text-indigo-700">LEARNPILOTAI</p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Öğrenme yolculuğunu birlikte tasarlıyoruz.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Beş kişilik ekibimiz için ortak başlangıç hazır. Öğrenme planları, kimlik doğrulama ve kişiselleştirme modülleri geliştirme aşamasında.</p>
      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-amber-950">Geliştirme başlangıcı</h2>
        <p className="mt-2 leading-7 text-amber-900">Mock AI yalnızca geliştirme içindir. Final hackathon demosunda gerçek Nebius üzerinde NVIDIA inference çalıştırılması ve doğrulanması gerekir. Bu ekran çalışan bir AI bağlantısı iddiası taşımaz.</p>
      </div>
      <section className="mt-10" aria-labelledby="areas">
        <h2 id="areas" className="text-xl font-semibold">Beş alan, her alanda tek sorumlu</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">{areas.map((area, index) => (
          <li key={area} className="rounded-xl border border-slate-200 bg-white p-5"><span className="mr-3 text-indigo-600">{String(index + 1).padStart(2, "0")}</span>{area}</li>
        ))}</ul>
      </section>
      <a className="mt-10 inline-block rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-700" href="/api/health">Uygulama sağlık durumunu görüntüle</a>
    </main>
  );
}

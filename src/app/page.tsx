export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
        Temel kurulum
      </p>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        Dijiy
        <span className="block text-accent">Dijital İpek Yolu</span>
      </h1>
      <p className="text-lg leading-8 text-muted">
        Kumaştan sisteme. Anadolu tekstil mirasını tasarım, üretim ve pazar yeri
        katmanlarıyla birleştiren platformun uygulama temeli hazır.
      </p>
      <a
        href="/api/health"
        className="w-fit rounded-full border border-current/20 px-5 py-2 font-mono text-sm text-muted transition-colors hover:text-foreground"
      >
        Sistem durumu →
      </a>
    </main>
  );
}

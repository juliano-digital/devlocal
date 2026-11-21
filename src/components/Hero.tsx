export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero hero-parallax" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-primary-light)' }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-white/20" />
        <div className="absolute top-2/3 right-1/3 w-3 h-3 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-white/15" />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="gsap-fade-up mb-6">
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'var(--color-primary-light)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              🚀 Soluções digitais para o seu negócio local
            </span>
          </div>

          {/* Headline */}
          <h1
            className="gsap-fade-up font-extrabold text-white mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
            }}
          >
            Pare de perder clientes para os{' '}
            <span style={{ color: 'var(--color-secondary)' }}>marketplaces</span>.{' '}
            Tenha seu canal de vendas próprio.
          </h1>

          {/* Subheadline */}
          <p
            className="gsap-fade-up mb-8 md:mb-10"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: '1.6',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '560px',
            }}
          >
            Criamos sites, aplicativos de delivery e sistemas de agendamento 
            que transformam seu negócio local em uma máquina de vendas — 
            sem taxas abusivas de iFood ou Rappi.
          </p>

          {/* CTAs */}
          <div className="gsap-fade-up flex flex-col sm:flex-row gap-4">
            <a href="#contato" className="btn-secondary text-center justify-center">
              <span>Agendar Demonstração Grátis</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
            <a
              href="#soluções"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white border-2 transition-all duration-300 hover:bg-white/10"
              style={{
                fontFamily: 'var(--font-display)',
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              Ver Soluções
            </a>
          </div>

          {/* Engagement indicators */}
          <div className="gsap-fade-up mt-12 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
              </div>
              <span className="text-sm text-white/70" style={{ fontFamily: 'var(--font-body)' }}>
                Atendimento direto
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>
              </div>
              <span className="text-sm text-white/70 ml-1" style={{ fontFamily: 'var(--font-body)' }}>
                Projeto sob medida
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
    </section>
  );
}

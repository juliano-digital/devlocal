export default function Engagement() {
  const steps = [
    {
      number: '01',
      title: 'Conte sobre seu negócio',
      description: 'Compartilhe seus objetivos, desafios e como você atende seus clientes hoje.',
    },
    {
      number: '02',
      title: 'Descubra a melhor solução',
      description: 'Vamos apontar quais recursos fazem sentido para o seu momento e orçamento.',
    },
    {
      number: '03',
      title: 'Receba o próximo passo',
      description: 'Saia da conversa com um direcionamento claro para tirar seu projeto do papel.',
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge badge-primary mb-4 inline-block">Comece por aqui</span>
          <h2
            className="gsap-fade-up mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--color-text)',
              lineHeight: '1.15',
            }}
          >
            Seu próximo projeto{' '}
            <span style={{ color: 'var(--color-primary)' }}>começa com uma conversa</span>
          </h2>
          <p
            className="gsap-fade-up"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'var(--color-text-muted)',
              lineHeight: '1.6',
            }}
          >
            Sem compromisso: entenda as possibilidades antes de decidir o que contratar.
          </p>
        </div>

        <div className="gsap-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <article
              key={step.number}
              className="card-hover p-6 md:p-8 rounded-2xl border"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
                style={{
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                }}
              >
                {step.number}
              </span>
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  lineHeight: '1.7',
                }}
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#contato" className="btn-primary">
            Conversar sobre meu projeto
          </a>
        </div>
      </div>
    </section>
  );
}

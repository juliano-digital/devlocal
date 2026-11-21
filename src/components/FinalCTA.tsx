import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ESTADOS_BRASIL = [
  { uf: 'AC', id: 12 }, { uf: 'AL', id: 27 }, { uf: 'AP', id: 16 }, { uf: 'AM', id: 13 },
  { uf: 'BA', id: 29 }, { uf: 'CE', id: 23 }, { uf: 'DF', id: 53 }, { uf: 'ES', id: 32 },
  { uf: 'GO', id: 52 }, { uf: 'MA', id: 21 }, { uf: 'MT', id: 51 }, { uf: 'MS', id: 50 },
  { uf: 'MG', id: 31 }, { uf: 'PA', id: 15 }, { uf: 'PB', id: 25 }, { uf: 'PR', id: 41 },
  { uf: 'PE', id: 26 }, { uf: 'PI', id: 22 }, { uf: 'RJ', id: 33 }, { uf: 'RN', id: 24 },
  { uf: 'RS', id: 43 }, { uf: 'RO', id: 11 }, { uf: 'RR', id: 14 }, { uf: 'SC', id: 42 },
  { uf: 'SP', id: 35 }, { uf: 'SE', id: 28 }, { uf: 'TO', id: 17 },
];

type Cidade = {
  id: number;
  nome: string;
};

export default function FinalCTA() {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    phone: '',
    state: '',
    city: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cities, setCities] = useState<Cidade[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityError, setCityError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.state) {
      setCities([]);
      setCityError(null);
      return;
    }

    const controller = new AbortController();
    const loadCities = async () => {
      setLoadingCities(true);
      setCityError(null);

      try {
        const state = ESTADOS_BRASIL.find((estado) => estado.uf === formData.state);
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state?.id ?? formData.state}/municipios`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar as cidades.');
        }

        const data: Cidade[] = await response.json();
        setCities(data.map((city) => ({ id: city.id, nome: city.nome })).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setCities([]);
        setCityError('Não foi possível carregar as cidades. Selecione o estado novamente.');
      } finally {
        if (!controller.signal.aborted) setLoadingCities(false);
      }
    };

    loadCities();
    return () => controller.abort();
  }, [formData.state]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, state: e.target.value, city: '' });
    setCities([]);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, city: e.target.value });
  };

  // Máscara do WhatsApp: permite apenas dígitos, formata como 00 000000000 (max 11 dígitos)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // remove tudo que não é dígito
    if (value.length > 11) value = value.slice(0, 11); // tranca em 11 dígitos (DDD + número)

    let masked = value;
    if (value.length > 2) {
      masked = value.slice(0, 2) + ' ' + value.slice(2);
    }

    setFormData({ ...formData, phone: masked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase.from('leads').insert([
        {
          name: formData.name,
          business: formData.business,
          phone: formData.phone,
          state: formData.state,
          city: formData.city,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      try {
        const { error: emailError } = await supabase.functions.invoke('send-lead-notification', {
          body: formData,
        });

        if (emailError) throw emailError;
      } catch (error: unknown) {
        console.error('O lead foi salvo, mas a notificação por e-mail falhou:', error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido.';
      setSaveError(`Erro ao salvar lead. Tente novamente. ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="contato" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0">
        <div
          className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--color-primary-light)' }}
        />
        <div
          className="absolute bottom-10 left-10 w-80 h-80 rounded-full opacity-5"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <span
                className="badge mb-6 inline-block"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'var(--color-primary-light)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                🎯 Comece agora
              </span>
              <h2
                className="gsap-fade-up mb-4"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  fontWeight: 800,
                  color: 'var(--color-text-inverse)',
                  lineHeight: '1.15',
                }}
              >
                Pronto para transformar seu negócio?
              </h2>
              <p
                className="gsap-fade-up mb-8"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: '1.6',
                }}
              >
                Agende uma demonstração gratuita e descubra como podemos aumentar suas vendas, 
                reduzir custos e fidelizar seus clientes com tecnologia sob medida.
              </p>

              {/* Benefits List */}
              <div className="space-y-4">
                {[
                  'Demonstração 100% gratuita e sem compromisso',
                  'Orçamento personalizado em até 24h',
                  'Suporte dedicado do início ao fim',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--color-success)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Form */}
            <div className="gsap-fade-up">
              {submitted ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'var(--color-primary-light)' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                    }}
                  >
                    Recebemos sua mensagem!
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Formulário enviado com sucesso. Em breve, um membro da nossa equipe entrará em contato.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl p-6 md:p-8"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <h3
                    className="mb-6"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.375rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                    }}
                  >
                    Agende sua demonstração grátis
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        Seu nome
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-border)',
                          fontFamily: 'var(--font-body)',
                        }}
                        placeholder="Como podemos te chamar?"
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        Nome do negócio
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={160}
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-body)' }}
                        placeholder="Ex: Pizzaria do João"
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={14}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-body)' }}
                        placeholder="00 000000000"
                      />
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        Estado
                      </label>
                      <select
                        required
                        value={formData.state}
                        onChange={handleStateChange}
                        className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-body)' }}
                      >
                        <option value="">Selecione o estado</option>
                        {ESTADOS_BRASIL.map((estado) => (
                          <option key={estado.uf} value={estado.uf}>
                            {estado.uf}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        Cidade
                      </label>
                      <select
                        required
                        value={formData.city}
                        onChange={handleCityChange}
                        disabled={!formData.state || loadingCities}
                        className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-body)' }}
                      >
                        <option value="">
                          {!formData.state
                            ? 'Selecione o estado primeiro'
                            : loadingCities
                              ? 'Carregando cidades...'
                              : 'Selecione a cidade'}
                        </option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.nome}>
                            {city.nome}
                          </option>
                        ))}
                      </select>
                      {cityError && (
                        <p
                          className="mt-1.5 text-xs"
                          style={{ color: '#B91C1C', fontFamily: 'var(--font-body)' }}
                        >
                          {cityError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block mb-1.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        O que precisa?
                      </label>
                      <textarea
                        required
                        maxLength={2000}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                        style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-body)' }}
                        rows={3}
                        placeholder="Conte um pouco sobre seu negócio..."
                      />
                    </div>

                    {saveError && (
                      <p
                        className="text-center mt-3 text-sm text-red-600 font-medium"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        ⚠️ {saveError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className={`btn-secondary w-full justify-center mt-2 ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                      style={{ padding: '14px 24px' }}
                    >
                      {saving ? (
                        <span>Enviando...</span>
                      ) : (
                        <>
                          <span>Quero minha demonstração grátis</span>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>

                    {submitted && (
                      <p
                        className="text-center mt-3 text-sm text-green-600 font-medium"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        ✅ Sua solicitação foi enviada com sucesso! Entraremos em contato em breve pelo WhatsApp.
                      </p>
                    )}

                    <p
                      className="text-center mt-3 text-sm text-gray-500"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      🔒 Seus dados estão seguros. Não enviamos spam.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Lead {
  id: string;
  name: string;
  business: string;
  phone: string;
  state: string;
  city: string;
  message: string;
  created_at: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isAdmin = user?.app_metadata?.role === 'admin';
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const searchPhoneDigits = searchTerm.replace(/\D/g, '');
  const filteredLeads = normalizedSearchTerm
    ? leads.filter((lead) => {
        const searchableText = normalizeSearchText(
          `${lead.name} ${lead.business} ${lead.phone} ${lead.state} ${lead.city} ${lead.message} ${formatCreatedAt(lead.created_at)}`
        );
        const phoneDigits = lead.phone.replace(/\D/g, '');

        return (
          searchableText.includes(normalizedSearchTerm) ||
          (searchPhoneDigits.length > 0 && phoneDigits.includes(searchPhoneDigits))
        );
      })
    : leads;

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(`Não foi possível verificar sua sessão: ${sessionError.message}`);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchLeads = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('id, name, business, phone, state, city, message, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLeads(data ?? []);
    } catch (fetchError: unknown) {
      setError(`Não foi possível carregar as solicitações: ${getErrorMessage(fetchError)}`);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void fetchLeads();
    } else {
      setLeads([]);
      setLoading(false);
    }
  }, [fetchLeads, isAdmin]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setLoginError(`Não foi possível entrar: ${signInError.message}`);
    } catch (signInError: unknown) {
      setLoginError(`Não foi possível entrar: ${getErrorMessage(signInError)}`);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(`Não foi possível sair: ${signOutError.message}`);
    } catch (signOutError: unknown) {
      setError(`Não foi possível sair: ${getErrorMessage(signOutError)}`);
    }
  }

  async function deleteLead(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return;

    setDeletingId(id);
    setError(null);
    try {
      const { error: deleteError } = await supabase.from('leads').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setLeads((currentLeads) => currentLeads.filter((lead) => lead.id !== id));
    } catch (deleteError: unknown) {
      setError(`Não foi possível excluir a solicitação: ${getErrorMessage(deleteError)}`);
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
        <p className="text-white">Verificando acesso...</p>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #16213e 100%)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <Link to="/" className="text-sm font-semibold no-underline" style={{ color: 'var(--color-primary)' }}>
            ← Voltar ao site
          </Link>
          <span
            className="badge mt-6 mb-4"
            style={{ backgroundColor: 'rgba(247, 127, 0, 0.12)', color: 'var(--color-secondary)' }}
          >
            Área reservada
          </span>
          <h1 className="mb-2 text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            Acessar solicitações
          </h1>
          <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Entre com a conta administrativa para visualizar os formulários recebidos.
          </p>

          {!user ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              {loginError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {loginError}
                </p>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <div>
              <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Esta conta não tem permissão administrativa para acessar as solicitações.
              </p>
              <button type="button" onClick={handleLogout} className="btn-outline w-full justify-center">
                Sair
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen py-10 md:py-14"
      style={{ backgroundColor: 'var(--color-bg-alt)', fontFamily: 'var(--font-body)' }}
    >
      <div className="container-custom max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-2xl p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between md:p-8"
          style={{ background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, #1D3557 100%)' }}
        >
          <div>
            <Link to="/" className="text-sm no-underline" style={{ color: 'var(--color-primary-light)' }}>
              ← Voltar ao site
            </Link>
            <span className="badge mt-4 mb-3" style={{ backgroundColor: 'rgba(247, 127, 0, 0.18)', color: '#FCBF49' }}>
              Área reservada
            </span>
            <h1 className="text-2xl font-bold md:text-3xl">Solicitações recebidas</h1>
            <p className="mt-2 text-sm text-white/70">Acompanhe os formulários enviados pelo site.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void fetchLeads()}
              disabled={loading}
              className="btn-secondary justify-center disabled:cursor-not-allowed disabled:opacity-60"
              style={{ padding: '10px 18px', fontSize: '14px' }}
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline justify-center"
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', padding: '10px 18px', fontSize: '14px' }}
            >
              Sair
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Formulários enviados</h2>
          <span className="badge badge-primary">
            {normalizedSearchTerm
              ? `${filteredLeads.length} de ${leads.length} solicitações`
              : `${leads.length} ${leads.length === 1 ? 'solicitação' : 'solicitações'}`}
          </span>
        </div>

        {loading && leads.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm" style={{ color: 'var(--color-text-muted)' }}>
            Carregando solicitações...
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm" style={{ color: 'var(--color-text-muted)' }}>
            Nenhum formulário recebido ainda.
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="lead-search" className="sr-only">
                Buscar solicitações
              </label>
              <div className="relative flex-1">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  id="lead-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nome, negócio, WhatsApp, cidade, estado ou mensagem..."
                  className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="btn-outline justify-center"
                  style={{ padding: '10px 18px', fontSize: '14px' }}
                >
                  Limpar busca
                </button>
              )}
            </div>

            {filteredLeads.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm" style={{ color: 'var(--color-text-muted)' }}>
                Nenhuma solicitação encontrada para “{searchTerm}”.
              </div>
            ) : (
              <>
            <div className="hidden overflow-x-auto rounded-2xl border bg-white shadow-sm md:block" style={{ borderColor: 'var(--color-border)' }}>
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-alt)' }}>
                    {['Nome', 'Negócio', 'WhatsApp', 'Localização', 'Mensagem', 'Recebido em', 'Ação'].map((heading) => (
                      <th key={heading} className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-600">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="align-top hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">{lead.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{lead.business}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{lead.phone}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{lead.city}, {lead.state}</td>
                      <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-4 text-sm text-gray-600">{lead.message || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">{formatCreatedAt(lead.created_at)}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void deleteLead(lead.id)}
                          disabled={deletingId === lead.id}
                          className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingId === lead.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-4 md:hidden">
              {filteredLeads.map((lead) => (
                <article key={lead.id} className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{lead.name}</h3>
                      <p className="text-sm text-gray-600">{lead.business}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteLead(lead.id)}
                      disabled={deletingId === lead.id}
                      className="text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      {deletingId === lead.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="inline font-semibold text-gray-700">WhatsApp: </dt><dd className="inline text-gray-600">{lead.phone}</dd></div>
                    <div><dt className="inline font-semibold text-gray-700">Cidade/estado: </dt><dd className="inline text-gray-600">{lead.city}, {lead.state}</dd></div>
                    <div><dt className="inline font-semibold text-gray-700">Recebido em: </dt><dd className="inline text-gray-600">{formatCreatedAt(lead.created_at)}</dd></div>
                    <div>
                      <dt className="font-semibold text-gray-700">Mensagem</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-gray-600">{lead.message || '—'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

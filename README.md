# portfolio
Landing Page Design System

## Notificações de leads pelo Hostinger Mail API

O formulário continua gravando os leads no Supabase e, em seguida, chama a Edge Function `send-lead-notification` para enviar os detalhes do pedido por e-mail. O token do Hostinger Mail API fica somente no servidor; não use variáveis `VITE_*` para credenciais.

Antes de usar, crie um token do **Mail API** em Hostinger > Agentic Mail > API access, com permissão para enviar mensagens. Esse token é diferente do token da Hostinger API. Configure também o ID de recurso da caixa postal autorizada e o endereço que receberá os leads.

Para desenvolvimento local, copie `supabase/functions/.env.example` para `supabase/functions/.env` e preencha os três valores. O `.env` é ignorado pelo Git.

Para publicar no projeto Supabase configurado:

```sh
supabase secrets set --env-file supabase/functions/.env
supabase functions deploy send-lead-notification
```

O destinatário `LEAD_NOTIFICATION_EMAIL` precisa ser preenchido antes do envio. A função só aceita chamadas do domínio `https://devlocal.appmodelo.com` e de origens locais de desenvolvimento.

## Formulário e área administrativa

O formulário da página inicial salva no Supabase os campos `name`, `business`, `phone`, `state`, `city` e `message`. O schema da tabela `public.leads`, incluindo as políticas RLS, está em [`supabase/schema.sql`](./supabase/schema.sql). Execute o arquivo no SQL Editor do projeto Supabase antes de receber solicitações; o script recria as políticas da tabela para remover permissões antigas mais amplas.

As variáveis públicas de conexão usadas pelo frontend ficam em `.env.local` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`). Esse arquivo é ignorado pelo Git. A chave `anon`/publishable é destinada ao frontend; nunca coloque a chave `service_role` em variáveis `VITE_*` ou no navegador.

A área reservada está em `/admin` e usa autenticação de e-mail e senha do Supabase. Crie a conta administrativa em **Authentication > Users** e, no painel da conta, atribua `{"role":"admin"}` aos **App Metadata** do usuário. O papel também é verificado pela política RLS antes de permitir a leitura ou exclusão de solicitações. Não atribua esse papel em User Metadata, que pode ser alterado pelo próprio usuário.

Se preferir, atribua o papel pelo SQL Editor (substitua o e-mail):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'seu-email@exemplo.com';
```

Saia e entre novamente em `/admin` para renovar a sessão depois de atribuir o papel.

# Elastiquality

Plataforma portuguesa que conecta clientes a prestadores de serviços locais.

## 🚀 Tecnologias

- **React Native** com Expo (Web + iOS + Android)
- **TypeScript**
- **Supabase** (Backend, Autenticação e Banco de Dados)
- **React Native Paper** (UI Components)
- **React Navigation** (Navegação)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase (gratuita)
- Expo CLI (instalado automaticamente)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd elastiquality
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais do Supabase

### Variáveis de ambiente

```env
EXPO_PUBLIC_SUPABASE_URL=https://...supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_STRIPE_SUCCESS_URL=http://localhost:19006/checkout/sucesso
EXPO_PUBLIC_STRIPE_CANCEL_URL=http://localhost:19006/checkout/cancelado
EXPO_PUBLIC_PUSH_ENABLED=true
```

Durante o desenvolvimento, pode apontar os URLs para `localhost`. Em produção utilize o domínio oficial.

## 🗄️ Configuração do Banco de Dados

Execute os scripts SQL no Supabase (veja `database/schema.sql`)

## 💳 Pagamentos com Stripe

1. Defina as variáveis de ambiente do frontend (`.env`):
   ```
   EXPO_PUBLIC_STRIPE_SUCCESS_URL=https://seu-dominio/checkout/sucesso
   EXPO_PUBLIC_STRIPE_CANCEL_URL=https://seu-dominio/checkout/cancelado
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
   > Em desenvolvimento, pode usar `expo start --web` e apontar para o `localhost`.

2. Registe os segredos no Supabase (usando o token `supabase login`):
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_... --project-ref <seu-project-ref>
   ```

3. Desploy das funções Edge:
   ```bash
   npx supabase functions deploy stripe-create-checkout --project-ref <seu-project-ref>
   npx supabase functions deploy stripe-webhook --project-ref <seu-project-ref>
npx supabase functions deploy notify-message --project-ref <seu-project-ref>
   ```

4. Configure o webhook na dashboard da Stripe apontando para:
   ```
   https://<seu-project-ref>.functions.supabase.co/stripe-webhook
   ```
   Selecione o evento `checkout.session.completed`.

O fluxo de compra dentro do app redireciona para o Stripe Checkout; após confirmação, o webhook credita as moedas e regista a transação no Supabase.

## 🔔 Chat e Notificações

### Push notifications (Expo)
1. Adicione as variáveis ao `.env`:
   ```
   EXPO_PUBLIC_PUSH_ENABLED=true
   ```
2. Registe os tokens no Supabase executando o app (os dispositivos móveis pedem permissão no primeiro login).
3. Para enviar push a partir das Edge Functions, configure:
   ```bash
   npx supabase secrets set EXPO_ACCESS_TOKEN=<expo-access-token> --project-ref <seu-project-ref>
   ```

### Email via Resend
1. Crie uma API key no [Resend](https://resend.com/).
2. Registe o segredo:
   ```bash
   npx supabase secrets set RESEND_API_KEY=<key> --project-ref <seu-project-ref>
   ```

### Deploy das funções de chat/notificação
```bash
npx supabase functions deploy notify-message --project-ref <seu-project-ref>
```

### Estrutura do chat
- `conversations`, `conversation_participants`, `messages` guardam as trocas entre cliente e profissional.
- `device_tokens` armazena os tokens Expo para push notifications.
- `notifications` permite histórico e leitura de mensagens importantes no app.

## 🎯 Como Executar

### Web
```bash
npm run web
```

### Android
```bash
npm run android
```

### iOS (apenas no macOS)
```bash
npm run ios
```

## 📱 Funcionalidades

### Para Clientes
- ✅ Cadastro e login
- ✅ Solicitar serviços
- ✅ Receber orçamentos
- ✅ Comparar profissionais
- ✅ Avaliar serviços

### Para Profissionais
- ✅ Cadastro e login
- ✅ Comprar créditos/moedas
- ✅ Visualizar leads
- ✅ Enviar propostas
- ✅ Gerenciar perfil

## 💰 Sistema de Créditos

- Profissionais compram créditos (1 moeda = €1.00)
- Cada lead tem um custo em moedas
- Créditos expiram em 3 meses
- Pacotes disponíveis:
  - 50 moedas por €90.00
  - 100 moedas por €80.00

## 🎨 Cores da Marca

As cores são baseadas no logo do Elastiquality:
- Primário: `#2f61a6`
- Secundário: `#94b2db`
- Fundo: `#FFFFFF`
- Superfície: `#F5F7FA`
- Texto: `#3b3435`
- Texto Secundário: `#6b6566`
- Texto Claro: `#FFFFFF`

Todas estão definidas em `src/theme/colors.ts` e já são reutilizadas pelo app, chat e landing page (`src/screens/web/LandingPage.tsx`).

## 📄 Estrutura Relevante

```
src/
  constants/categories.ts   # Grupos de serviços e regiões
  services/
    chat.ts                 # Conversas e mensagens (Supabase)
    notifications.ts        # Push/Email
  screens/
    web/LandingPage.tsx     # Home institucional web
    chat/                   # Lista e conversa
    client/                 # Fluxos do cliente
    professional/           # Fluxos do profissional
```

## 📄 Licença

Propriedade de Elastiquality © 2025


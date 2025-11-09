# Guia de Configuração - Elastiquality

## 📋 Pré-requisitos

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Git** - [Download](https://git-scm.com/)
3. **Conta Supabase** (gratuita) - [Criar conta](https://supabase.com/)
4. **Editor de código** (recomendado: VS Code)

## 🚀 Passo a Passo

### 1. Clonar e Instalar Dependências

```bash
cd elastiquality
npm install
```

### 2. Configurar Supabase

#### 2.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/)
2. Clique em "Start your project"
3. Crie uma nova organização (se necessário)
4. Crie um novo projeto:
   - Nome: `elastiquality`
   - Database Password: (escolha uma senha forte)
   - Region: `Europe West (London)` ou mais próxima de Portugal

#### 2.2. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)

#### 2.3. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e adicione suas credenciais:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

#### 2.4. Criar Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo do arquivo `database/schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (pode levar alguns segundos)

### 3. Executar a Aplicação

#### Web (Desenvolvimento)
```bash
npm run web
```
A aplicação abrirá em `http://localhost:8081`

#### Android
```bash
npm run android
```
Requer Android Studio e emulador configurado

#### iOS (apenas macOS)
```bash
npm run ios
```
Requer Xcode instalado

## 🧪 Testar a Aplicação

### Criar Conta de Teste

1. Execute a aplicação
2. Clique em "Não tem conta? Cadastre-se"
3. Preencha os dados:
   - Nome: Seu nome
   - Email: seu@email.com
   - Senha: mínimo 6 caracteres
   - Tipo: Cliente ou Profissional
4. Clique em "Cadastrar"

### Testar Fluxo do Cliente

1. Faça login como cliente
2. Clique no botão "+" (FAB)
3. Preencha o formulário de novo serviço
4. Publique o pedido

### Testar Fluxo do Profissional

1. Faça login como profissional
2. Veja as oportunidades disponíveis
3. Clique em "Comprar Créditos"
4. Selecione um pacote (simulação)

## 🎨 Adicionar Logo

1. Coloque o arquivo `logo.png` na pasta `assets/images/`
2. O logo será usado automaticamente na tela de login

## 🔧 Configurações Adicionais

### Habilitar Autenticação por Email

No Supabase:
1. Vá em **Authentication** → **Settings**
2. Em **Auth Providers**, habilite **Email**
3. Configure:
   - Enable Email Confirmations: ✅ (recomendado)
   - Secure Email Change: ✅

### Configurar Storage para Fotos

1. No Supabase, vá em **Storage**
2. Crie os buckets:
   - `service-photos` (imagens submetidas pelos clientes)
   - `portfolio-images` (galeria dos profissionais)
   - `chat-uploads` (anexos compartilhados no chat)
3. Configure as políticas de acesso:
   - Upload: apenas usuários autenticados
   - Download: público

### Configurar Notificações Push (Expo + FCM/APNs)

1. No Firebase Console, crie um projeto ou reutilize um existente.
2. Gere os ficheiros de configuração:
   - Android: `google-services.json`
   - iOS: `GoogleService-Info.plist`
3. Coloque esses ficheiros na raiz do projeto (já estão no `.gitignore`).
4. No Firebase:
   - Ative **Cloud Messaging**
   - Registe o pacote Android `com.elastiquality.app`
   - Registe o bundle iOS `com.elastiquality.app`
5. No Expo:
   - Certifique-se de que o plugin `expo-notifications` está configurado (já incluído em `app.json`).
   - Para builds de produção, carregue as credenciais APNs/FCM com `expo credentials:manager`.
6. Após login no app, confirme que um token aparece na tabela `device_tokens` do Supabase.

### Configurar Pagamentos (Stripe)

1. Crie conta em [stripe.com](https://stripe.com/)
2. Obtenha as chaves de API (Test mode)
3. Adicione ao `.env`:
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📱 Build para Produção

### Web
```bash
npm run build:web
```

### Android APK
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## 🐛 Resolução de Problemas

### Erro: "Supabase URL not configured"
- Verifique se o arquivo `.env` existe
- Confirme que as variáveis começam com `EXPO_PUBLIC_`
- Reinicie o servidor de desenvolvimento

### Erro: "Table does not exist"
- Execute o script `database/schema.sql` no Supabase
- Verifique se todas as tabelas foram criadas

### Erro ao instalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### App não carrega no Android
```bash
npm start -- --clear
```

## 📞 Suporte

Para dúvidas ou problemas:
- Email: suporte@elastiquality.pt
- Documentação: [docs.elastiquality.pt](https://docs.elastiquality.pt)

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env` no Git
- Use variáveis de ambiente diferentes para produção
- Mantenha as chaves de API seguras
- Habilite RLS (Row Level Security) no Supabase

## 📚 Próximos Passos

Após configurar:
1. ✅ Testar todos os fluxos
2. ✅ Adicionar logo e cores personalizadas
3. ✅ Configurar notificações push
4. ✅ Integrar gateway de pagamento
5. ✅ Configurar analytics
6. ✅ Preparar para produção


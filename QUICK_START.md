# 🚀 Guia Rápido - Elastiquality

## ⚠️ IMPORTANTE: Configurar Supabase PRIMEIRO

Antes de executar a aplicação, você **DEVE** configurar o Supabase. Caso contrário, verá erros de "Invalid Supabase URL".

## 📋 Passo a Passo

### 1️⃣ Criar Projeto no Supabase

1. Acesse: https://supabase.com/
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Preencha:
   - **Name**: elastiquality
   - **Database Password**: (crie uma senha forte e guarde)
   - **Region**: Europe West (London) - mais próximo de Portugal
   - **Pricing Plan**: Free (para começar)
6. Clique em "Create new project"
7. Aguarde 2-3 minutos enquanto o projeto é criado

### 2️⃣ Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá:
   - **Project URL**: algo como `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: uma chave longa começando com `eyJ...`

### 3️⃣ Configurar Variáveis de Ambiente

1. Na pasta do projeto, copie o arquivo `.env.example`:
   ```bash
   copy .env.example .env
   ```

2. Abra o arquivo `.env` e cole suas credenciais:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Salve o arquivo

### 4️⃣ Criar Tabelas no Banco de Dados

1. No Supabase, vá em **SQL Editor** (ícone de banco de dados)
2. Clique em "New query"
3. Abra o arquivo `database/schema.sql` do projeto
4. Copie TODO o conteúdo
5. Cole no SQL Editor do Supabase
6. Clique em "Run" (ou pressione Ctrl+Enter)
7. Aguarde a execução (pode levar 10-20 segundos)
8. Você deve ver "Success. No rows returned"

### 5️⃣ Verificar Tabelas Criadas

1. No Supabase, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ users
   - ✅ professionals
   - ✅ service_requests
   - ✅ leads
   - ✅ unlocked_leads
   - ✅ proposals
   - ✅ reviews
   - ✅ credit_packages
   - ✅ credit_transactions
   - ✅ credit_purchases

### 6️⃣ Executar a Aplicação

Agora sim, você pode executar:

```bash
npm run web
```

A aplicação abrirá em: http://localhost:8081

## ✅ Testar a Aplicação

### Criar Conta de Cliente

1. Na tela de login, clique em "Criar conta"
2. Preencha:
   - Nome: João Silva
   - Email: joao@example.com
   - Senha: 123456
   - Confirmar senha: 123456
   - Tipo: **Cliente**
3. Clique em "Registrar"
4. Faça login com as credenciais

### Criar Pedido de Serviço

1. Na tela inicial do cliente, clique no botão "+" (canto inferior direito)
2. Preencha:
   - Título: Pintura de sala
   - Categoria: Pintura
   - Descrição: Preciso pintar uma sala de 20m²
   - Localização: Lisboa
   - Orçamento: 500
3. Clique em "Criar Pedido"

### Criar Conta de Profissional

1. Faça logout
2. Clique em "Criar conta"
3. Preencha:
   - Nome: Maria Santos
   - Email: maria@example.com
   - Senha: 123456
   - Confirmar senha: 123456
   - Tipo: **Profissional**
4. Clique em "Registrar"
5. Faça login

### Comprar Créditos

1. Na tela inicial do profissional, clique em "Comprar Créditos"
2. Escolha um pacote
3. Clique em "Comprar" (simulação - não cobra de verdade)
4. Volte para a tela inicial

### Desbloquear Lead

1. Você verá o pedido criado pelo cliente
2. Clique em "Desbloquear Lead"
3. Os créditos serão debitados
4. Agora você pode ver os detalhes completos

## 🐛 Problemas Comuns

### Erro: "Invalid Supabase URL"

**Causa**: Arquivo `.env` não foi criado ou está incorreto

**Solução**:
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se as URLs estão corretas (sem espaços)
3. Reinicie o servidor: Ctrl+C e depois `npm run web`

### Erro: "relation does not exist"

**Causa**: Tabelas não foram criadas no banco de dados

**Solução**:
1. Vá no Supabase → SQL Editor
2. Execute o arquivo `database/schema.sql` novamente
3. Verifique se todas as tabelas foram criadas

### Erro: "new row violates row-level security policy"

**Causa**: Políticas RLS não foram criadas corretamente

**Solução**:
1. Execute o `database/schema.sql` novamente
2. Certifique-se de executar TODO o arquivo, não apenas partes

### Aplicação não carrega

**Solução**:
1. Limpe o cache: `npm start -- --clear`
2. Reinstale dependências:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Execute novamente: `npm run web`

## 📱 Testar no Mobile

### Android

```bash
npm run android
```

### iOS (macOS apenas)

```bash
npm run ios
```

### Expo Go (mais fácil)

1. Instale o app "Expo Go" no seu celular
2. Execute `npm start`
3. Escaneie o QR code que aparece no terminal

## 🎨 Cores Atualizadas

As cores foram atualizadas conforme o logo:

- **Azul Principal**: `#2f61a6`
- **Azul Médio**: `#5788ce`
- **Azul Claro**: `#94b2db`
- **Azul Muito Claro**: `#d5dfef`
- **Cinza Escuro**: `#3b3435`

## 📚 Próximos Passos

Depois de testar a aplicação básica:

1. ✅ Integrar Stripe para pagamentos reais
2. ✅ Adicionar sistema de chat
3. ✅ Implementar envio de propostas
4. ✅ Criar sistema de avaliações
5. ✅ Adicionar upload de fotos
6. ✅ Configurar notificações push

Veja `NEXT_STEPS.md` para mais detalhes.

## 💡 Dicas

- Use o **Table Editor** do Supabase para ver os dados em tempo real
- Use o **SQL Editor** para fazer queries personalizadas
- Ative o **Realtime** no Supabase para updates em tempo real
- Configure **Storage** para upload de imagens

## 📞 Precisa de Ajuda?

- Documentação Supabase: https://supabase.com/docs
- Documentação Expo: https://docs.expo.dev/
- Documentação React Native: https://reactnative.dev/

---

**Boa sorte! 🚀**


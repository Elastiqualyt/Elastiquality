# Comandos Úteis - Elastiquality

## 🚀 Desenvolvimento

### Iniciar Servidor de Desenvolvimento

```bash
# Web
npm run web

# Android
npm run android

# iOS (macOS apenas)
npm run ios

# Todos (mostra QR code)
npm start
```

### Limpar Cache

```bash
# Limpar cache do Metro Bundler
npm start -- --clear

# Limpar cache do Expo
npx expo start -c

# Limpar tudo e reinstalar
rm -rf node_modules
npm install
```

## 📦 Gerenciamento de Dependências

### Instalar Nova Dependência

```bash
# Dependência normal
npm install nome-do-pacote

# Dependência de desenvolvimento
npm install --save-dev nome-do-pacote

# Dependência específica do Expo
npx expo install nome-do-pacote
```

### Atualizar Dependências

```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar todas as dependências
npm update

# Atualizar Expo SDK
npx expo upgrade
```

### Remover Dependência

```bash
npm uninstall nome-do-pacote
```

## 🗄️ Banco de Dados (Supabase)

### Executar Migrations

```bash
# No SQL Editor do Supabase, execute:
# database/schema.sql
```

### Resetar Banco de Dados

```sql
-- No SQL Editor do Supabase
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Depois execute novamente o schema.sql
```

### Backup do Banco

No dashboard do Supabase:
1. Settings → Database
2. Database Backups
3. Download backup

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm test -- --watch

# Testes com coverage
npm test -- --coverage
```

### Criar Novo Teste

```bash
# Criar arquivo de teste
touch src/screens/__tests__/LoginScreen.test.tsx
```

## 📱 Build e Deploy

### Build para Desenvolvimento

```bash
# Android APK
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development
```

### Build para Produção

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production

# Ambos
eas build --platform all --profile production
```

### Publicar Update (OTA)

```bash
# Publicar update over-the-air
eas update --branch production --message "Descrição da atualização"
```

## 🔧 Configuração

### Configurar EAS (Expo Application Services)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar projeto
eas build:configure
```

### Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cp .env.example .env

# Editar variáveis
code .env
```

## 🐛 Debug

### Abrir DevTools

```bash
# No terminal do Expo, pressione:
j  # Abrir debugger
r  # Reload app
m  # Toggle menu
```

### Logs

```bash
# Ver logs do Android
npx react-native log-android

# Ver logs do iOS
npx react-native log-ios

# Logs do Expo
npx expo start --dev-client
```

### Inspecionar Elemento (Web)

1. Abra a aplicação web
2. Pressione F12 ou Ctrl+Shift+I
3. Use as ferramentas de desenvolvedor do navegador

## 📊 Análise de Código

### Verificar TypeScript

```bash
# Verificar erros de tipo
npx tsc --noEmit
```

### Formatar Código

```bash
# Instalar Prettier
npm install --save-dev prettier

# Formatar todos os arquivos
npx prettier --write "src/**/*.{ts,tsx}"
```

### Lint

```bash
# Instalar ESLint
npm install --save-dev eslint

# Executar lint
npx eslint src/
```

## 🔐 Segurança

### Verificar Vulnerabilidades

```bash
# Audit de segurança
npm audit

# Corrigir automaticamente
npm audit fix

# Corrigir forçadamente
npm audit fix --force
```

## 📱 Dispositivos

### Listar Dispositivos Android

```bash
adb devices
```

### Listar Simuladores iOS

```bash
xcrun simctl list devices
```

### Instalar no Dispositivo

```bash
# Android
adb install caminho/para/app.apk

# iOS (via Xcode)
# Abra o projeto no Xcode e execute
```

## 🌐 Web

### Build para Web

```bash
# Build de produção
npx expo export:web

# Servir build localmente
npx serve web-build
```

### Deploy Web

```bash
# Netlify
netlify deploy --dir=web-build --prod

# Vercel
vercel --prod

# Firebase Hosting
firebase deploy
```

## 📦 Assets

### Otimizar Imagens

```bash
# Instalar imagemin
npm install -g imagemin-cli

# Otimizar imagens
imagemin assets/images/* --out-dir=assets/images/optimized
```

### Gerar Ícones

```bash
# Gerar ícones de diferentes tamanhos
npx expo prebuild --clean
```

## 🔄 Git

### Comandos Básicos

```bash
# Status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "Descrição da mudança"

# Push
git push origin main

# Pull
git pull origin main

# Criar branch
git checkout -b nome-da-branch

# Mudar de branch
git checkout nome-da-branch

# Merge
git merge nome-da-branch
```

### Desfazer Mudanças

```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.ts

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1
```

## 📊 Performance

### Analisar Bundle

```bash
# Analisar tamanho do bundle
npx expo export --dump-sourcemap

# Visualizar bundle
npx source-map-explorer web-build/static/js/*.js
```

### Medir Performance

```bash
# React DevTools Profiler
# Instale a extensão React DevTools no navegador
```

## 🔍 Troubleshooting

### Erro: "Metro Bundler não inicia"

```bash
# Matar processos do Metro
npx react-native start --reset-cache
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Expo Go não conecta"

```bash
# Verificar se estão na mesma rede
# Reiniciar Expo
npm start -- --clear
```

### Erro: "Build falha"

```bash
# Limpar cache do Gradle (Android)
cd android
./gradlew clean
cd ..

# Limpar cache do CocoaPods (iOS)
cd ios
pod deintegrate
pod install
cd ..
```

## 📚 Documentação

### Gerar Documentação

```bash
# Instalar TypeDoc
npm install --save-dev typedoc

# Gerar docs
npx typedoc --out docs src/
```

## 🎯 Atalhos Úteis

### No Terminal do Expo

- `a` - Abrir no Android
- `i` - Abrir no iOS
- `w` - Abrir no navegador
- `r` - Reload app
- `m` - Toggle menu
- `j` - Abrir debugger
- `c` - Limpar cache
- `?` - Mostrar todos os comandos

### No VS Code

- `Ctrl+P` - Buscar arquivo
- `Ctrl+Shift+P` - Command palette
- `Ctrl+` - Terminal
- `Ctrl+B` - Toggle sidebar
- `F5` - Iniciar debug

## 📞 Ajuda

### Documentação Oficial

- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- Supabase: https://supabase.com/docs
- React Navigation: https://reactnavigation.org/

### Comunidade

- Stack Overflow: https://stackoverflow.com/questions/tagged/react-native
- Discord do Expo: https://chat.expo.dev/
- Reddit: https://reddit.com/r/reactnative

---

**Dica**: Adicione este arquivo aos favoritos para acesso rápido aos comandos mais usados!


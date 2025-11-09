# Como Adicionar o Logo ao Elastiquality

## 📍 Localização do Logo Original

O logo original estava em: `C:\elastiquality\public\logo.png`

Durante a configuração do projeto, essa pasta foi temporariamente movida e o logo foi perdido.

## 🎨 Como Adicionar o Logo

### Opção 1: Copiar Manualmente

1. Localize o arquivo `logo.png` original
2. Copie para a pasta: `C:\elastiquality\assets\images\logo.png`

### Opção 2: Via PowerShell

```powershell
# Se você ainda tiver o logo em algum lugar
Copy-Item -Path "caminho\para\logo.png" -Destination "C:\elastiquality\assets\images\logo.png"
```

## 🔧 Atualizar o Código para Usar o Logo

### 1. Tela de Login

O arquivo `src/screens/LoginScreen.tsx` já está preparado para usar o logo.

Descomente e atualize a seção do logo:

```typescript
<View style={styles.logoContainer}>
  <Image 
    source={require('../../assets/images/logo.png')} 
    style={styles.logo}
    resizeMode="contain"
  />
  <Text style={styles.title}>Elastiquality</Text>
  <Text style={styles.subtitle}>Conectando clientes a profissionais</Text>
</View>
```

Adicione o estilo:

```typescript
logo: {
  width: 150,
  height: 150,
  marginBottom: 20,
},
```

### 2. Splash Screen

Atualize o `app.json`:

```json
{
  "expo": {
    "splash": {
      "image": "./assets/images/logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#2E7D32"
    }
  }
}
```

### 3. Ícone do App

```json
{
  "expo": {
    "icon": "./assets/images/logo.png"
  }
}
```

## 🎨 Extrair Cores do Logo

Depois de adicionar o logo, você pode ajustar as cores em `src/theme/colors.ts` para corresponder exatamente às cores do logo.

### Ferramentas para Extrair Cores:

1. **Online**: 
   - https://imagecolorpicker.com/
   - https://www.canva.com/colors/color-palette-generator/

2. **Photoshop/GIMP**: Use a ferramenta conta-gotas

3. **VS Code**: Extensão "Color Picker"

### Atualizar Cores

Edite `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#SUA_COR_PRINCIPAL',      // Cor principal do logo
  primaryDark: '#SUA_COR_ESCURA',     // Versão mais escura
  primaryLight: '#SUA_COR_CLARA',     // Versão mais clara
  secondary: '#SUA_COR_SECUNDARIA',   // Cor de destaque
  // ... resto das cores
};
```

## 📱 Formatos Recomendados

### Logo Principal
- **Formato**: PNG com transparência
- **Tamanho**: 512x512px ou maior
- **Resolução**: 72 DPI mínimo

### Ícone do App
- **iOS**: 1024x1024px
- **Android**: 512x512px
- **Formato**: PNG

### Splash Screen
- **Tamanho**: 1242x2436px (para melhor qualidade)
- **Formato**: PNG

## 🔄 Regenerar Assets

Depois de adicionar o logo, regenere os assets do Expo:

```bash
npx expo prebuild --clean
```

## ✅ Verificar se Funcionou

1. Reinicie o servidor de desenvolvimento:
```bash
npm run web
```

2. Verifique se o logo aparece na tela de login

3. Para mobile, teste no emulador ou dispositivo físico

## 🎨 Exemplo de Implementação Completa

### LoginScreen.tsx

```typescript
import { Image } from 'react-native';

// No componente
<View style={styles.logoContainer}>
  <Image 
    source={require('../../assets/images/logo.png')} 
    style={styles.logo}
    resizeMode="contain"
  />
  <Text style={styles.title}>Elastiquality</Text>
  <Text style={styles.subtitle}>Conectando clientes a profissionais</Text>
</View>

// Nos estilos
const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
```

## 🐛 Problemas Comuns

### Logo não aparece

1. **Verifique o caminho**: Certifique-se de que o arquivo está em `assets/images/logo.png`
2. **Reinicie o servidor**: Pare (Ctrl+C) e inicie novamente (`npm run web`)
3. **Limpe o cache**: `npm start -- --clear`

### Logo aparece distorcido

- Use `resizeMode="contain"` para manter proporções
- Ajuste `width` e `height` no estilo

### Logo muito grande/pequeno

Ajuste os valores de `width` e `height` no estilo:

```typescript
logo: {
  width: 200,  // Aumente ou diminua
  height: 200, // Aumente ou diminua
  marginBottom: 20,
},
```

## 📞 Precisa de Ajuda?

Se o logo original foi perdido, você pode:

1. Recriar o logo usando as cores da marca
2. Usar um logo temporário até ter o definitivo
3. Contratar um designer para criar um novo logo

## 🎨 Ferramentas para Criar Logo

- **Canva**: https://www.canva.com/
- **Figma**: https://www.figma.com/
- **Adobe Express**: https://www.adobe.com/express/
- **LogoMaker**: https://www.logomaker.com/

---

**Nota**: O logo é um elemento importante da identidade visual. Certifique-se de usar uma versão de alta qualidade para melhor apresentação em todos os dispositivos.


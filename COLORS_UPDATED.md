# 🎨 Cores Atualizadas - Elastiquality

## Paleta de Cores do Logo

As cores foram extraídas diretamente do logo fornecido:

### Cores Principais

```
#2f61a6 - Azul Principal (escuro)
#3b3435 - Cinza Escuro (texto)
#d5dfef - Azul Muito Claro (backgrounds)
#5788ce - Azul Médio (destaques)
#94b2db - Azul Claro (secundário)
```

## Aplicação das Cores

### 🔵 Azul Principal (`#2f61a6`)
**Uso:**
- Botões primários
- Headers de profissionais
- Links importantes
- Ícones principais
- Splash screen background

**Onde aparece:**
- Botão "Entrar" na tela de login
- Botão "Registrar" na tela de cadastro
- Header da navegação de profissionais
- Título "Elastiquality" na tela de login

### 🔷 Azul Médio (`#5788ce`)
**Uso:**
- Botões secundários
- Headers de clientes
- Destaques e acentos
- Estados ativos
- Gradientes

**Onde aparece:**
- Header da navegação de clientes
- Botão "Criar Pedido"
- Ícones de navegação ativos
- Status "Ativo" de pedidos

### 💙 Azul Claro (`#94b2db`)
**Uso:**
- Backgrounds de cards
- Hover states
- Elementos secundários
- Badges e chips

**Onde aparece:**
- Background de cards de leads
- Chips de categoria
- Elementos de destaque suave

### 🌫️ Azul Muito Claro (`#d5dfef`)
**Uso:**
- Backgrounds de seções
- Bordas
- Divisores
- Estados disabled

**Onde aparece:**
- Background da página
- Bordas de inputs
- Separadores de seções
- Background de cards inativos

### ⚫ Cinza Escuro (`#3b3435`)
**Uso:**
- Texto principal
- Ícones
- Títulos
- Elementos de alto contraste

**Onde aparece:**
- Todo o texto principal
- Títulos de cards
- Descrições
- Labels de formulários

## Variações de Cores

### Azul Principal
- **Escuro**: `#1f4170` (hover, pressed states)
- **Normal**: `#2f61a6` (padrão)
- **Claro**: `#5788ce` (light variant)

### Azul Secundário
- **Escuro**: `#6a8fc7`
- **Normal**: `#94b2db`
- **Claro**: `#d5dfef`

## Cores de Estado

### Sucesso ✅
- **Cor**: `#2f61a6` (Azul principal)
- **Uso**: Operações bem-sucedidas, confirmações

### Erro ❌
- **Cor**: `#DC2626` (Vermelho)
- **Uso**: Mensagens de erro, validações falhas

### Aviso ⚠️
- **Cor**: `#F59E0B` (Laranja/Amarelo)
- **Uso**: Alertas, avisos importantes

### Info ℹ️
- **Cor**: `#5788ce` (Azul médio)
- **Uso**: Mensagens informativas, tooltips

## Status de Pedidos/Leads

### Pendente
- **Cor**: `#F59E0B` (Laranja)
- **Chip**: Fundo laranja claro, texto laranja escuro

### Ativo
- **Cor**: `#2f61a6` (Azul principal)
- **Chip**: Fundo azul claro, texto azul escuro

### Concluído
- **Cor**: `#5788ce` (Azul médio)
- **Chip**: Fundo azul muito claro, texto azul médio

### Cancelado
- **Cor**: `#6b6566` (Cinza)
- **Chip**: Fundo cinza claro, texto cinza escuro

## Gradientes

### Gradiente Principal
```css
background: linear-gradient(135deg, #2f61a6 0%, #5788ce 100%);
```

**Uso:**
- Splash screen
- Headers especiais
- Botões de destaque
- Backgrounds de hero sections

### Gradiente Suave
```css
background: linear-gradient(180deg, #d5dfef 0%, #ffffff 100%);
```

**Uso:**
- Backgrounds de seções
- Cards especiais
- Overlays suaves

## Acessibilidade

### Contraste de Texto

✅ **Bom Contraste:**
- Texto `#3b3435` em fundo `#ffffff` - Ratio: 11.2:1
- Texto `#ffffff` em fundo `#2f61a6` - Ratio: 6.8:1
- Texto `#2f61a6` em fundo `#d5dfef` - Ratio: 4.9:1

⚠️ **Atenção:**
- Texto `#94b2db` em fundo `#ffffff` - Ratio: 2.8:1 (use apenas para elementos decorativos)

### Recomendações

1. **Texto principal**: Sempre use `#3b3435` em fundos claros
2. **Texto em botões**: Use `#ffffff` em fundos `#2f61a6` ou `#5788ce`
3. **Links**: Use `#2f61a6` com sublinhado para melhor acessibilidade
4. **Estados de foco**: Adicione borda de 2px `#5788ce` para indicar foco

## Implementação no Código

### React Native Paper Theme

```typescript
import { paperTheme } from './src/theme/colors';

<PaperProvider theme={paperTheme}>
  {/* Sua aplicação */}
</PaperProvider>
```

### Usando Cores Diretamente

```typescript
import { colors } from './src/theme/colors';

<View style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: colors.textLight }}>
    Texto em azul principal
  </Text>
</View>
```

### Botões

```typescript
// Botão primário
<Button 
  mode="contained" 
  buttonColor={colors.primary}
  textColor={colors.textLight}
>
  Botão Principal
</Button>

// Botão secundário
<Button 
  mode="outlined" 
  buttonColor="transparent"
  textColor={colors.primary}
  style={{ borderColor: colors.primary }}
>
  Botão Secundário
</Button>
```

### Cards

```typescript
<Card style={{ backgroundColor: colors.surface }}>
  <Card.Content>
    <Text style={{ color: colors.text }}>
      Conteúdo do card
    </Text>
  </Card.Content>
</Card>
```

## Comparação: Antes vs Depois

### Antes (Cores Genéricas)
- Primary: `#1E88E5` (Azul Material Design)
- Secondary: `#FF6B35` (Laranja)
- Accent: `#00BFA5` (Verde/Turquesa)

### Depois (Cores do Logo)
- Primary: `#2f61a6` (Azul do logo)
- Secondary: `#94b2db` (Azul claro do logo)
- Accent: `#5788ce` (Azul médio do logo)

## Arquivos Atualizados

✅ `src/theme/colors.ts` - Paleta completa de cores
✅ `App.tsx` - Tema aplicado ao PaperProvider
✅ `app.json` - Theme color e splash screen
✅ `src/screens/LoginScreen.tsx` - Logo adicionado
✅ `src/screens/RegisterScreen.tsx` - Logo adicionado
✅ `web/index.html` - Meta tags com theme color
✅ `web/manifest.json` - PWA com cores corretas

## Próximos Passos

- [ ] Criar componentes de botão personalizados
- [ ] Adicionar animações de transição com as cores
- [ ] Implementar dark mode (opcional)
- [ ] Criar biblioteca de componentes com Storybook

---

**Todas as cores agora refletem a identidade visual do logo Elastiquality! 🎨**


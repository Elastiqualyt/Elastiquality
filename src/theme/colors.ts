// Cores extraídas do logo do Elastiquality
// Paleta: #2f61a6, #3b3435, #d5dfef, #5788ce, #94b2db

export const colors = {
  // Cores principais do logo
  primary: '#2f61a6',        // Azul principal (escuro)
  primaryDark: '#1f4170',    // Azul mais escuro
  primaryLight: '#5788ce',   // Azul médio

  secondary: '#94b2db',      // Azul claro
  secondaryDark: '#6a8fc7',  // Azul claro escurecido
  secondaryLight: '#d5dfef', // Azul muito claro / cinza azulado

  accent: '#5788ce',         // Azul médio para destaques
  accentDark: '#3d6aaf',     // Azul médio escurecido
  accentLight: '#7fa3d9',    // Azul médio clareado

  // Backgrounds
  background: '#FFFFFF',
  backgroundLight: '#F8FAFC',
  surface: '#F5F7FA',
  surfaceLight: '#d5dfef',   // Azul muito claro do logo

  // Textos
  text: '#3b3435',           // Cinza escuro do logo
  textSecondary: '#6b6566',  // Cinza médio
  textLight: '#FFFFFF',
  textDisabled: '#9E9E9E',

  // Estados de feedback
  error: '#DC2626',
  errorDark: '#B91C1C',
  errorLight: '#EF4444',

  success: '#2f61a6',        // Usando azul principal para sucesso
  successDark: '#1f4170',
  successLight: '#5788ce',

  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',

  info: '#5788ce',           // Azul médio
  infoDark: '#2f61a6',
  infoLight: '#94b2db',

  // Bordas e divisores
  border: '#d5dfef',         // Azul muito claro
  borderLight: '#E5EAF0',
  divider: '#c5cfe0',

  // Cores específicas da plataforma
  client: '#5788ce',         // Azul médio para clientes
  clientDark: '#3d6aaf',
  clientLight: '#94b2db',

  professional: '#2f61a6',   // Azul principal para profissionais
  professionalDark: '#1f4170',
  professionalLight: '#5788ce',

  // Estados de pedidos/leads
  pending: '#F59E0B',        // Amarelo/Laranja - Pendente
  active: '#2f61a6',         // Azul principal - Ativo
  completed: '#5788ce',      // Azul médio - Concluído
  cancelled: '#6b6566',      // Cinza - Cancelado

  // Estados de UI
  disabled: '#9E9E9E',
  placeholder: '#a0a8b5',
  overlay: 'rgba(59, 52, 53, 0.5)',
  shadow: 'rgba(47, 97, 166, 0.1)',

  // Gradientes
  gradientStart: '#2f61a6',
  gradientEnd: '#5788ce',
};

// Tema para React Native Paper
import { MD3LightTheme, MD3Theme } from 'react-native-paper';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    onSurfaceDisabled: colors.disabled,
    error: colors.error,
    outline: colors.border,
    inversePrimary: colors.primaryLight,
    inverseSurface: colors.primaryDark,
    inverseOnSurface: colors.textLight,
    surfaceVariant: colors.surfaceLight,
    surfaceDisabled: colors.disabled,
  },
};


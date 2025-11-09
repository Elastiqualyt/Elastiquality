import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { paperTheme } from './src/theme/colors';
import { Platform } from 'react-native';
import { LandingPage } from './src/screens/web/LandingPage';

export default function App() {
  const isWeb = Platform.OS === 'web';
  const [showApp, setShowApp] = useState(!isWeb);

  return (
    <PaperProvider theme={paperTheme}>
      {showApp ? (
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      ) : (
        <LandingPage onEnterApp={() => setShowApp(true)} />
      )}
    </PaperProvider>
  );
}

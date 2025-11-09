import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Client Screens
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { NewServiceRequestScreen } from '../screens/client/NewServiceRequestScreen';
import { ServiceRequestDetailScreen } from '../screens/client/ServiceRequestDetailScreen';
import { ReviewScreen } from '../screens/client/ReviewScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

// Professional Screens
import { ProfessionalHomeScreen } from '../screens/professional/ProfessionalHomeScreen';
import { BuyCreditsScreen } from '../screens/professional/BuyCreditsScreen';
import { LeadDetailScreen } from '../screens/professional/LeadDetailScreen';
import { SendProposalScreen } from '../screens/professional/SendProposalScreen';
import { ManageProfileScreen } from '../screens/professional/ManageProfileScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ChatConversationScreen } from '../screens/chat/ChatConversationScreen';
import { CheckoutStatusScreen } from '../screens/professional/CheckoutStatusScreen';
import { TransactionHistoryScreen } from '../screens/professional/TransactionHistoryScreen';
import { ProfileScreen } from '../screens/professional/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textLight,
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Criar Conta' }}
    />
  </Stack.Navigator>
);

const ClientStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textLight,
    }}
  >
    <Stack.Screen
      name="ClientHome"
      component={ClientHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="NewServiceRequest"
      component={NewServiceRequestScreen}
      options={{ title: 'Novo Pedido' }}
    />
    <Stack.Screen
      name="ServiceRequestDetail"
      component={ServiceRequestDetailScreen}
      options={{ title: 'Detalhes do Pedido' }}
    />
    <Stack.Screen
      name="Review"
      component={ReviewScreen}
      options={{ title: 'Avaliar Profissional' }}
    />
    <Stack.Screen
      name="ProfessionalProfile"
      component={ProfileScreen}
      options={{ title: 'Perfil do Profissional' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notificações' }}
    />
  </Stack.Navigator>
);

const ClientChatStack = () => (
  <ChatStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textLight,
    }}
  >
    <ChatStack.Screen
      name="ChatList"
      component={ChatListScreen}
      options={{ title: 'Mensagens' }}
      initialParams={{ conversationRoute: 'ChatConversation' }}
    />
    <ChatStack.Screen
      name="ChatConversation"
      component={ChatConversationScreen}
      options={{ title: 'Conversa' }}
    />
  </ChatStack.Navigator>
);

const ClientTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textLight,
    }}
  >
    <Tab.Screen
      name="ClientStack"
      component={ClientStack}
      options={{
        title: 'Início',
        tabBarLabel: 'Início',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="ClientChat"
      component={ClientChatStack}
      options={{
        title: 'Mensagens',
        tabBarLabel: 'Mensagens',
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

const ProfessionalStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.professional },
      headerTintColor: colors.textLight,
    }}
  >
    <Stack.Screen
      name="ProfessionalHome"
      component={ProfessionalHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="BuyCredits"
      component={BuyCreditsScreen}
      options={{ title: 'Comprar Créditos' }}
    />
    <Stack.Screen
      name="LeadDetail"
      component={LeadDetailScreen}
      options={{ title: 'Detalhes do Lead' }}
    />
    <Stack.Screen
      name="SendProposal"
      component={SendProposalScreen}
      options={{ title: 'Enviar Proposta' }}
    />
    <Stack.Screen
      name="ManageProfile"
      component={ManageProfileScreen}
      options={{ title: 'Gerir Perfil' }}
    />
    <Stack.Screen
      name="ProfessionalProfile"
      component={ProfileScreen}
      options={{ title: 'Meu Perfil Público' }}
    />
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={{ title: 'Histórico de Créditos' }}
    />
    <Stack.Screen
      name="CheckoutStatus"
      component={CheckoutStatusScreen}
      options={{ title: 'Compra de Créditos' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notificações' }}
    />
  </Stack.Navigator>
);

const ProfessionalChatStack = () => (
  <ChatStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.professional },
      headerTintColor: colors.textLight,
    }}
  >
    <ChatStack.Screen
      name="ProChatList"
      component={ChatListScreen}
      options={{ title: 'Mensagens' }}
      initialParams={{ conversationRoute: 'ProChatConversation' }}
    />
    <ChatStack.Screen
      name="ProChatConversation"
      component={ChatConversationScreen}
      options={{ title: 'Conversa' }}
    />
  </ChatStack.Navigator>
);

const ProfessionalTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.professional,
      tabBarInactiveTintColor: colors.textSecondary,
      headerStyle: { backgroundColor: colors.professional },
      headerTintColor: colors.textLight,
    }}
  >
    <Tab.Screen
      name="ProfessionalStack"
      component={ProfessionalStack}
      options={{
        title: 'Oportunidades',
        tabBarLabel: 'Oportunidades',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="ProfessionalChat"
      component={ProfessionalChatStack}
      options={{
        title: 'Mensagens',
        tabBarLabel: 'Mensagens',
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      ProfessionalStack: {
        screens: {
          CheckoutStatus: 'checkout/:status',
        },
      },
    },
  },
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {!user ? (
        <AuthStack />
      ) : user.userType === 'client' ? (
        <ClientTabs />
      ) : (
        <ProfessionalTabs />
      )}
    </NavigationContainer>
  );
};


import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';

export interface NotifyMessagePayload {
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  contentPreview: string;
}

export interface NotifyLeadPayload {
  professionalId: string;
  category: string;
  location: string;
  leadId: string;
  serviceRequestId: string;
}

export interface NotifyProposalPayload {
  clientId: string;
  professionalName: string;
  serviceTitle: string;
  serviceRequestId: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async (userId: string) => {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão de notificações não concedida.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Padrão',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const pushToken = (await Notifications.getExpoPushTokenAsync()).data;

  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id: userId,
        token: pushToken,
        platform: Platform.OS,
      },
      {
        onConflict: 'user_id,token',
      },
    );

  if (error) {
    console.warn('Não foi possível registar o token de push:', error);
  }

  return pushToken;
};

const notifyEvent = async ({
  recipientId,
  title,
  body,
  type,
  data,
}: {
  recipientId: string;
  title: string;
  body: string;
  type: 'chat' | 'leads' | 'proposals' | string;
  data?: Record<string, unknown>;
}) => {
  try {
    const { error } = await supabase.functions.invoke('notify-event', {
      body: {
        recipientId,
        title,
        body,
        type,
        data,
      },
    });

    if (error) {
      console.warn('Erro ao solicitar notificação:', error);
    }
  } catch (err) {
    console.warn('Não foi possível invocar notify-event:', err);
  }
};

export const notifyMessage = async (payload: NotifyMessagePayload) => {
  await notifyEvent({
    recipientId: payload.recipientId,
    title: `${payload.senderName} enviou uma nova mensagem`,
    body: payload.contentPreview,
    type: 'chat',
    data: {
      conversationId: payload.conversationId,
    },
  });
};

export const notifyLeadAvailable = async (payload: NotifyLeadPayload) => {
  await notifyEvent({
    recipientId: payload.professionalId,
    title: 'Novo pedido disponível',
    body: `${payload.category} em ${payload.location}`,
    type: 'leads',
    data: {
      leadId: payload.leadId,
      serviceRequestId: payload.serviceRequestId,
      category: payload.category,
    },
  });
};

export const notifyProposalSubmitted = async (payload: NotifyProposalPayload) => {
  await notifyEvent({
    recipientId: payload.clientId,
    title: `${payload.professionalName} enviou uma proposta`,
    body: `Veja os detalhes para o pedido "${payload.serviceTitle}".`,
    type: 'proposals',
    data: {
      serviceRequestId: payload.serviceRequestId,
    },
  });
};


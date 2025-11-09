import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, List, Switch, Text } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

type NotificationPreferences = {
  chat: boolean;
  leads: boolean;
  proposals: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  chat: true,
  leads: true,
  proposals: true,
};

export const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data?.notification_preferences) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...data.notification_preferences,
        });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (err: any) {
      console.error('Erro ao carregar preferências de notificação:', err);
      setError(err.message || 'Não foi possível carregar as preferências.');
    } finally {
      setLoading(false);
    }
  };

  const persistPreferences = async (next: NotificationPreferences) => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('users')
        .update({ notification_preferences: next })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPreferences(next);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao atualizar preferências de notificação:', err);
      setError(err.message || 'Não foi possível atualizar as preferências.');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    const next = { ...preferences, [key]: !preferences[key] };
    persistPreferences(next);
  };

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Notificações Push</Text>
          <Text style={styles.subtitle}>
            Ajuste os tipos de alertas que gostaria de receber. Pode alterar estas preferências a qualquer momento.
          </Text>

          {loading ? (
            <ActivityIndicator animating color={colors.primary} style={styles.loader} />
          ) : (
            <>
              <List.Section>
                <List.Item
                  title="Mensagens"
                  description="Receber alertas quando chegar uma nova mensagem no chat."
                  right={() => (
                    <Switch
                      value={preferences.chat}
                      disabled={saving}
                      onValueChange={() => togglePreference('chat')}
                    />
                  )}
                />
                <List.Item
                  title="Novos pedidos"
                  description="Receber alertas quando surgir um novo lead na sua categoria."
                  right={() => (
                    <Switch
                      value={preferences.leads}
                      disabled={saving}
                      onValueChange={() => togglePreference('leads')}
                    />
                  )}
                />
                <List.Item
                  title="Propostas"
                  description="Receber alertas quando um profissional enviar uma proposta para o seu pedido."
                  right={() => (
                    <Switch
                      value={preferences.proposals}
                      disabled={saving}
                      onValueChange={() => togglePreference('proposals')}
                    />
                  )}
                />
              </List.Section>

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {saving ? <Text style={styles.saving}>A guardar alterações...</Text> : null}
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
  saving: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NotificationsScreen;


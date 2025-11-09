import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';

interface SendProposalScreenProps {
  navigation: any;
  route: {
    params: {
      leadId: string;
      serviceRequestId: string;
    };
  };
}

export const SendProposalScreen: React.FC<SendProposalScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { leadId, serviceRequestId } = route.params;

  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user?.id) {
      setError('Sessão inválida. Faça login novamente.');
      return;
    }

    if (!price || !description.trim()) {
      setError('Informe pelo menos o valor e uma descrição da proposta.');
      return;
    }

    const parsedPrice = Number(price.replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Informe um valor válido para a proposta.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: requestStatus, error: requestError } = await supabase
        .from('service_requests')
        .select('status, client_id, title')
        .eq('id', serviceRequestId)
        .maybeSingle();

      if (requestError) throw requestError;
      if (!requestStatus) {
        throw new Error('Pedido não encontrado ou já removido.');
      }

      if (requestStatus.status !== 'pending') {
        throw new Error('Este pedido já não aceita novas propostas.');
      }

      const { error: insertError } = await supabase.from('proposals').insert({
        service_request_id: serviceRequestId,
        professional_id: user.id,
        price: parsedPrice,
        description: description.trim(),
        estimated_duration: estimatedDuration ? estimatedDuration.trim() : null,
        status: 'pending',
      });

      if (insertError) throw insertError;

      await notifyProposalSubmitted({
        clientId: requestStatus.client_id,
        professionalName: user.name,
        serviceTitle: requestStatus.title,
        serviceRequestId,
      });

      alert('Proposta enviada com sucesso!');
      navigation.navigate('LeadDetail', { leadId, serviceRequestId, refresh: Date.now() });
    } catch (insertErr: any) {
      console.error('Erro ao enviar proposta:', insertErr);
      setError(insertErr.message || 'Erro inesperado ao enviar proposta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>Enviar proposta</Text>
            <Text style={styles.subtitle}>
              Apresente o seu orçamento ao cliente. O contato será feito diretamente entre vocês após o envio.
            </Text>

            <TextInput
              label="Valor da proposta (€)"
              value={price}
              onChangeText={setPrice}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder="Ex.: 120"
            />

            <TextInput
              label="Descrição detalhada"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              placeholder="Explique como pretende executar o serviço, materiais, etapas e condições."
            />

            <TextInput
              label="Prazo estimado (opcional)"
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              mode="outlined"
              style={styles.input}
              placeholder="Ex.: 3 dias úteis"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.secondary}
            >
              Enviar proposta
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    elevation: 3,
    borderRadius: 16,
  },
  cardContent: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  error: {
    color: colors.error,
  },
});



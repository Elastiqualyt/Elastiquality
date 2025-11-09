import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Menu } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { ALL_SERVICES, getServiceGroup } from '../../constants/categories';
import { LocationPicker } from '../../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../../services/locations';
import { ImagePicker, ImagePickerItem } from '../../components/ImagePicker';
import { uploadServiceImage } from '../../services/storage';
import { notifyLeadAvailable } from '../../services/notifications';

export const NewServiceRequestScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [photos, setPhotos] = useState<ImagePickerItem[]>([]);

  const handleSubmit = async () => {
    const locationLabel = formatLocationSelection(locationSelection);

    if (!title || !category || !description || !locationLabel) {
      setError('Por favor, preencha todos os campos obrigatórios');
      if (!locationLabel) {
        setLocationError('Selecione a localização através do autocomplete.');
      }
      return;
    }

    setLoading(true);
    setError('');
    setLocationError(null);

    try {
      const uploadedPhotos: string[] = [];
      if (photos.length > 0) {
        if (!user?.id) {
          throw new Error('Sessão inválida. Faça login novamente.');
        }

        for (const photo of photos) {
          const upload = await uploadServiceImage(user.id, photo.uri);
          uploadedPhotos.push(upload.publicUrl);
        }
      }

      // Criar pedido de serviço
      const { data: serviceRequest, error: requestError } = await supabase
        .from('service_requests')
        .insert({
          client_id: user?.id,
          title,
          category,
          description,
          location: locationLabel,
          budget: budget ? parseFloat(budget) : null,
          status: 'pending',
          photos: uploadedPhotos,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Criar lead automaticamente
      const leadCost = calculateLeadCost(category);
      const { data: leadRecord, error: leadError } = await supabase
        .from('leads')
        .insert({
          service_request_id: serviceRequest.id,
          category,
          cost: leadCost,
          location: locationLabel,
          description: `${title} - ${description.substring(0, 100)}`,
        })
        .select('id')
        .single();

      if (leadError) throw leadError;

      const { data: professionals } = await supabase
        .from('professionals')
        .select('id, categories')
        .contains('categories', [category]);

      if (professionals && professionals.length > 0) {
        await Promise.all(
          professionals.map((professional) =>
            notifyLeadAvailable({
              professionalId: professional.id,
              category,
              location: locationLabel,
              leadId: leadRecord.id,
              serviceRequestId: serviceRequest.id,
            }),
          ),
        );
      }

      alert('Pedido criado com sucesso! Aguarde propostas dos profissionais.');
      setLocationSelection({});
      setLocationError(null);
      setPhotos([]);
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const calculateLeadCost = (service: string): number => {
    const group = getServiceGroup(service);
    const baseByGroup: Record<string, number> = {
      'Serviços de Construção e Remodelação': 45,
      'Serviços Domésticos': 12,
      'Serviços de Limpeza': 14,
      'Serviços de Tecnologia e Informática': 25,
      'Serviço Automóvel': 30,
      'Beleza e Estética': 18,
      'Serviços de Saúde e Bem-Estar': 28,
      'Serviços de Transporte e Logística': 35,
      Educação: 15,
      'Eventos e Festas': 32,
      'Serviços Administrativos e Financeiros': 40,
      'Serviços Criativos e Design': 30,
      'Serviços de Costura/Alfaiataria/Modista': 16,
    };

    return group ? baseByGroup[group.name] ?? 15 : 15;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Novo Pedido de Serviço</Text>
            <Text style={styles.subtitle}>
              Descreva o serviço que precisa e receba orçamentos de profissionais qualificados
            </Text>

            <TextInput
              label="Título do serviço *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: Pintura de sala e quarto"
            />

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.input}
                  contentStyle={styles.menuButton}
                >
                  {category || 'Selecione o serviço *'}
                </Button>
              }
            >
              {ALL_SERVICES.map((service) => (
                <Menu.Item
                  key={service}
                  onPress={() => {
                    setCategory(service);
                    setMenuVisible(false);
                  }}
                  title={service}
                />
              ))}
            </Menu>

            <TextInput
              label="Descrição detalhada *"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              placeholder="Descreva o serviço em detalhes: o que precisa, quando, requisitos especiais, etc."
            />

            <LocationPicker
              value={locationSelection}
              onChange={(selection) => {
                setLocationSelection(selection);
                setLocationError(null);
              }}
              error={locationError || undefined}
              style={styles.locationPicker}
              requiredLevel="parish"
              caption="Selecione distrito, concelho e freguesia do serviço."
            />

            <TextInput
              label="Orçamento estimado (€)"
              value={budget}
              onChangeText={setBudget}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder="Opcional"
            />

            <ImagePicker
              title="Fotos do pedido"
              subtitle="Adicione imagens para ajudar os profissionais a entenderem melhor o serviço."
              images={photos}
              onChange={setPhotos}
              maxImages={5}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.primary}
            >
              Publicar Pedido
            </Button>

            <Text style={styles.infoText}>
              * Campos obrigatórios
            </Text>
            <Text style={styles.infoText}>
              ℹ️ Não há custo para solicitar orçamentos. Os profissionais interessados entrarão em contato.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  locationPicker: {
    marginBottom: 16,
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});


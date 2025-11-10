import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { colors } from '../../theme/colors';
import { ALL_SERVICES } from '../../constants/categories';
import { ImagePicker, ImagePickerItem } from '../../components/ImagePicker';
import { uploadAvatarImage, uploadPortfolioImage } from '../../services/storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePickerLib from 'expo-image-picker';

const MAX_PORTFOLIO_ITEMS = 10;

export const ManageProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<ImagePickerItem[]>([]);
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('professionals')
        .select('categories, regions, description, portfolio, credits, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        const storedServices: string[] = Array.isArray(data.categories) ? data.categories : [];
        const validServices = storedServices.filter((service) => ALL_SERVICES.includes(service));
        setSelectedServices(validServices);
        setSelectedRegions(Array.isArray(data.regions) ? data.regions : []);
        setDescription(data.description || '');
        const portfolioList: string[] = Array.isArray(data.portfolio) ? data.portfolio : [];
        setPortfolioItems(portfolioList.map((uri) => ({ uri, local: false })));
        setCredits(data.credits ?? 0);
        setAvatarUrl(data.avatar_url ?? null);
        setAvatarPreview(data.avatar_url ?? null);
        setNewAvatarUri(null);
        setRemoveAvatar(false);
      }
  const handleSelectAvatar = async () => {
    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisa conceder acesso às fotos para escolher um avatar. Verifique as permissões nas definições do dispositivo.',
      );
      return;
    }

    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.uri) {
      setAvatarPreview(asset.uri);
      setNewAvatarUri(asset.uri);
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setNewAvatarUri(null);
    if (avatarUrl) {
      setRemoveAvatar(true);
    }
  };

      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar perfil profissional:', err);
      setError(err.message || 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleSave = async () => {
    if (!user?.id) return;

    if (selectedServices.length === 0) {
      setError('Defina pelo menos uma categoria na opção "Gerir categorias".');
      return;
    }

    if (selectedRegions.length === 0) {
      setError('Adicione pelo menos uma zona de atendimento em "Gerir zonas de atendimento".');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (portfolioItems.length > MAX_PORTFOLIO_ITEMS) {
        throw new Error(`Limite máximo de ${MAX_PORTFOLIO_ITEMS} itens de portfólio atingido.`);
      }

      const existingPortfolio = portfolioItems.filter((item) => !item.local).map((item) => item.uri);
      const newImages = portfolioItems.filter((item) => item.local);

      const uploadedImages: string[] = [];
      for (const image of newImages) {
        const upload = await uploadPortfolioImage(user.id, image.uri);
        uploadedImages.push(upload.publicUrl);
      }

      const finalPortfolio = [...existingPortfolio, ...uploadedImages];
      let finalAvatarUrl = avatarUrl ?? null;

      if (removeAvatar) {
        finalAvatarUrl = null;
      }

      if (newAvatarUri) {
        const avatarUpload = await uploadAvatarImage(user.id, newAvatarUri);
        finalAvatarUrl = avatarUpload.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          categories: selectedServices,
          regions: selectedRegions,
          description: description || null,
          portfolio: finalPortfolio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPortfolioItems(finalPortfolio.map((uri) => ({ uri, local: false })));
      setAvatarUrl(finalAvatarUrl);
      setAvatarPreview(finalAvatarUrl);
      setNewAvatarUri(null);
      setRemoveAvatar(false);
      alert('Descrição e portfólio atualizados com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil profissional:', err);
      setError(err.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ gap: 16 }}>
          <Text style={styles.title}>Gestão do Perfil Profissional</Text>

          {loading ? (
            <Text style={styles.loading}>A carregar dados...</Text>
          ) : (
            <>
              <View style={styles.avatarSection}>
                {avatarPreview ? (
                  <Avatar.Image size={96} source={{ uri: avatarPreview }} />
                ) : (
                  <Avatar.Icon size={96} icon="account" />
                )}
                <View style={styles.avatarActions}>
                  <Button
                    mode="outlined"
                    onPress={handleSelectAvatar}
                    textColor={colors.professional}
                    style={styles.sectionButton}
                  >
                    Alterar avatar
                  </Button>
                  {avatarPreview || avatarUrl ? (
                    <Button mode="text" onPress={handleRemoveAvatar} textColor={colors.error}>
                      Remover avatar
                    </Button>
                  ) : null}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados pessoais</Text>
                <Text style={styles.sectionSubtitle}>
                  Mantenha os seus dados de contacto atualizados para facilitar a comunicação com clientes.
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('EditProfile')}
                  textColor={colors.professional}
                  style={styles.sectionButton}
                >
                  Editar dados pessoais
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categorias de atuação</Text>
                <Text style={styles.sectionSubtitle}>
                  Estas categorias definem os leads que serão sugeridos para si.
                </Text>
                <View style={styles.chipGroup}>
                  {selectedServices.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma categoria definida.</Text>
                  ) : (
                    selectedServices.map((service) => (
                      <Chip key={service} style={styles.chipSelected} textStyle={styles.chipTextSelected}>
                        {service}
                      </Chip>
                    ))
                  )}
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ManageCategories')}
                  textColor={colors.professional}
                  style={styles.sectionButton}
                >
                  Gerir categorias
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zonas de atendimento</Text>
                <Text style={styles.sectionSubtitle}>
                  Reveja as localizações onde está disponível para prestar serviços.
                </Text>
                <View style={styles.chipGroup}>
                  {selectedRegions.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma zona de atendimento definida.</Text>
                  ) : (
                    selectedRegions.map((region) => (
                      <Chip key={region} mode="outlined" style={styles.regionChip}>
                        {region}
                      </Chip>
                    ))
                  )}
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ManageRegions')}
                  textColor={colors.professional}
                  style={styles.sectionButton}
                >
                  Gerir zonas de atendimento
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrição profissional</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={5}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Fale sobre a sua experiência, certificações e diferenciais."
                  style={styles.textInput}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Portfólio</Text>
                <Text style={styles.sectionSubtitle}>
                  Adicione imagens recentes dos seus trabalhos (máximo de {MAX_PORTFOLIO_ITEMS} itens).
                </Text>
                <ImagePicker
                  images={portfolioItems}
                  onChange={setPortfolioItems}
                  maxImages={MAX_PORTFOLIO_ITEMS}
                  title=""
                  subtitle=""
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Créditos disponíveis</Text>
                <Text style={styles.creditsValue}>{credits} moedas</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('BuyCredits')}
                  textColor={colors.professional}
                  style={styles.buyCreditsButton}
                >
                  Comprar mais créditos
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ProfessionalProfile')}
                  textColor={colors.professional}
                  style={styles.viewProfileButton}
                >
                  Ver perfil público
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Notifications')}
                  textColor={colors.professional}
                  style={styles.viewProfileButton}
                >
                  Preferências de notificações
                </Button>
              </View>

              {error ? <HelperText type="error">{error}</HelperText> : null}

              <View style={styles.saveRow}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  buttonColor={colors.professional}
                  style={styles.saveButton}
                >
                  Guardar descrição e portfólio
                </Button>
              </View>
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
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  loading: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarActions: {
    gap: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipSelected: {
    backgroundColor: colors.professional,
  },
  chipTextSelected: {
    color: colors.textLight,
  },
  regionChip: {
    borderColor: colors.professional,
  },
  textInput: {
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  creditsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.professional,
  },
  buyCreditsButton: {
    alignSelf: 'flex-start',
  },
  viewProfileButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 12,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveRow: {
    alignItems: 'flex-start',
  },
  sectionButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
});



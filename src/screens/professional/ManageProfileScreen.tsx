import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, TextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { colors } from '../../theme/colors';
import { SERVICE_CATEGORY_GROUPS, ALL_SERVICES } from '../../constants/categories';
import { LocationPicker } from '../../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../../services/locations';
import { ImagePicker, ImagePickerItem } from '../../components/ImagePicker';
import { uploadPortfolioImage } from '../../services/storage';

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
  const [serviceAreaSelection, setServiceAreaSelection] = useState<LocationSelection>({});
  const [serviceAreaError, setServiceAreaError] = useState<string | null>(null);

  const sortedGroups = useMemo(
    () => SERVICE_CATEGORY_GROUPS.map((group) => ({ name: group.name, services: [...group.services] })),
    [],
  );

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('professionals')
        .select('categories, regions, description, portfolio, credits')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        const storedServices: string[] = Array.isArray(data.categories) ? data.categories : [];
        const validServices = storedServices.filter((service) => ALL_SERVICES.includes(service));
        setSelectedServices(validServices);
        setSelectedRegions(data.regions || []);
        setDescription(data.description || '');
        const portfolioList: string[] = Array.isArray(data.portfolio) ? data.portfolio : [];
        setPortfolioItems(portfolioList.map((uri) => ({ uri, local: false })));
        setCredits(data.credits ?? 0);
      }
    } catch (err: any) {
      console.error('Erro ao carregar perfil profissional:', err);
      setError(err.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((entry) => entry !== serviceName) : [...prev, serviceName],
    );
  };

  const handleRemoveServiceArea = (region: string) => {
    setSelectedRegions((prev) => prev.filter((item) => item !== region));
  };

  const handleAddServiceArea = () => {
    const label = formatLocationSelection(serviceAreaSelection);

    if (!serviceAreaSelection.districtId) {
      setServiceAreaError('Selecione pelo menos o distrito.');
      return;
    }

    if (!label) {
      setServiceAreaError('Seleção incompleta. Escolha distrito, concelho e freguesia se disponível.');
      return;
    }

    if (selectedRegions.includes(label)) {
      setServiceAreaError('Esta zona de atendimento já foi adicionada.');
      return;
    }

    setSelectedRegions((prev) => [...prev, label]);
    setServiceAreaSelection({});
    setServiceAreaError(null);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (selectedServices.length === 0) {
      setError('Selecione pelo menos um serviço.');
      return;
    }

    if (selectedRegions.length === 0) {
      setError('Selecione pelo menos uma zona de atendimento.');
      setServiceAreaError('Adicione pelo menos uma zona de atendimento.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setServiceAreaError(null);

      if (portfolioItems.length > MAX_PORTFOLIO_ITEMS) {
        throw new Error(`Limite máximo de ${MAX_PORTFOLIO_ITEMS} itens de portfólio atingido.`);
      }

      const existingPortfolio = portfolioItems.filter((item) => !item.local).map((item) => item.uri);
      const newImages = portfolioItems.filter((item) => item.local);

      const uploadedImages = [];
      for (const image of newImages) {
        const upload = await uploadPortfolioImage(user.id, image.uri);
        uploadedImages.push(upload.publicUrl);
      }

      const finalPortfolio = [...existingPortfolio, ...uploadedImages];

      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          categories: selectedServices,
          regions: selectedRegions,
          description: description || null,
          portfolio: finalPortfolio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert('Perfil atualizado com sucesso!');
      setPortfolioItems(finalPortfolio.map((uri) => ({ uri, local: false })));
      navigation.goBack();
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
          <Text style={styles.title}>Gerenciar Perfil Profissional</Text>

          {loading ? (
            <Text style={styles.loading}>A carregar dados...</Text>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Categorias de atuação</Text>
                <Text style={styles.sectionSubtitle}>Selecione os serviços que oferece</Text>
                <View style={styles.serviceGroups}>
                  {sortedGroups.map((group) => (
                    <View key={group.name} style={styles.groupBlock}>
                      <Text style={styles.groupTitle}>{group.name}</Text>
                      <View style={styles.chipGroup}>
                        {group.services.map((service) => (
                          <Chip
                            key={service}
                            selected={selectedServices.includes(service)}
                            onPress={() => toggleService(service)}
                            style={selectedServices.includes(service) ? styles.chipSelected : styles.chip}
                            textStyle={selectedServices.includes(service) ? styles.chipTextSelected : undefined}
                          >
                            {service}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zonas de atendimento</Text>
                <Text style={styles.sectionSubtitle}>
                  Utilize a pesquisa para localizar freguesias, concelhos ou distritos onde atua.
                </Text>
                <LocationPicker
                  value={serviceAreaSelection}
                  onChange={(selection) => {
                    setServiceAreaSelection(selection);
                    setServiceAreaError(null);
                  }}
                  error={serviceAreaError || undefined}
                  requiredLevel="district"
                  caption="Selecione um distrito, podendo detalhar até ao concelho ou freguesia."
                />
                <Button
                  mode="outlined"
                  icon="map-marker-plus"
                  onPress={handleAddServiceArea}
                  style={styles.addAreaButton}
                  textColor={colors.professional}
                >
                  Adicionar zona
                </Button>
                <HelperText type="info">
                  Toque numa zona adicionada para removê-la. Adicione quantas forem necessárias.
                </HelperText>
                <View style={styles.chipGroup}>
                  {selectedRegions.length === 0 ? (
                    <Text style={styles.emptyText}>Ainda não adicionou zonas de atendimento.</Text>
                  ) : (
                    selectedRegions.map((region) => (
                      <Chip
                        key={region}
                        onPress={() => handleRemoveServiceArea(region)}
                        mode="outlined"
                        style={styles.regionChip}
                      >
                        {region}
                      </Chip>
                    ))
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrição profissional</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={5}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Fale sobre sua experiência, certificações e diferenciais."
                  style={styles.textInput}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Portfólio</Text>
                <Text style={styles.sectionSubtitle}>
                  Adicione imagens dos seus trabalhos (até {MAX_PORTFOLIO_ITEMS}). Toque numa imagem para removê-la.
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
                  Ver avaliações públicas
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Notifications')}
                  textColor={colors.professional}
                  style={styles.viewProfileButton}
                >
                  Configurar notificações
                </Button>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                buttonColor={colors.professional}
                style={styles.saveButton}
              >
                Guardar alterações
              </Button>
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
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceGroups: {
    gap: 16,
  },
  chip: {
    borderColor: colors.border,
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
  addAreaButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    marginTop: 12,
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
  error: {
    color: colors.error,
  },
});



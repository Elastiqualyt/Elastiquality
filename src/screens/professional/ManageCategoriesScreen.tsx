import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { colors } from '../../theme/colors';
import { SERVICE_CATEGORY_GROUPS } from '../../constants/categories';
import { ALL_SERVICES } from '../../constants/categories';

export const ManageCategoriesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categoryGroups = useMemo(
    () => SERVICE_CATEGORY_GROUPS.map((group) => ({ name: group.name, services: [...group.services] })),
    [],
  );

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('professionals')
          .select('categories')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const categories: string[] = Array.isArray(data?.categories) ? data?.categories : [];
        const valid = categories.filter((entry) => ALL_SERVICES.includes(entry));
        setSelectedCategories(valid);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao carregar categorias:', err);
        setError(err.message || 'Não foi possível carregar as categorias.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [user?.id]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((entry) => entry !== category) : [...prev, category],
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (selectedCategories.length === 0) {
      setError('Selecione pelo menos uma categoria de atuação.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          categories: selectedCategories,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert('Categorias atualizadas com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      console.error('Erro ao atualizar categorias:', err);
      setError(err.message || 'Não foi possível atualizar as categorias.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ gap: 16 }}>
          <Text style={styles.title}>Categorias de atuação</Text>
          <Text style={styles.subtitle}>
            Selecione os serviços que deseja oferecer. Estas categorias serão utilizadas para sugerir leads
            relevantes.
          </Text>

          {loading ? (
            <Text style={styles.loading}>A carregar categorias...</Text>
          ) : (
            <>
              <View style={styles.groupsContainer}>
                {categoryGroups.map((group) => (
                  <View key={group.name} style={styles.groupBlock}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    <View style={styles.chipGroup}>
                      {group.services.map((service) => (
                        <Chip
                          key={service}
                          selected={selectedCategories.includes(service)}
                          onPress={() => toggleCategory(service)}
                          style={selectedCategories.includes(service) ? styles.chipSelected : styles.chip}
                          textStyle={selectedCategories.includes(service) ? styles.chipTextSelected : undefined}
                        >
                          {service}
                        </Chip>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              {error ? <HelperText type="error">{error}</HelperText> : null}
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.saveButton}
                buttonColor={colors.professional}
              >
                Guardar categorias
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
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loading: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  groupsContainer: {
    gap: 16,
  },
  groupBlock: {
    gap: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  saveButton: {
    borderRadius: 12,
  },
});

export default ManageCategoriesScreen;


import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, List, Text } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { RatingStars } from '../../components/RatingStars';
import { listProfessionalReviews, getProfessionalReviewSummary } from '../../services/reviews';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

interface ProfileScreenRouteParams {
  professionalId?: string;
  professionalName?: string;
}

interface ProfileScreenProps {
  route: RouteProp<{ params: ProfileScreenRouteParams }, 'params'>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const { user } = useAuth();
  const professionalId = route.params?.professionalId ?? user?.id;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [reviews, setReviews] = useState<
    Array<{
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: string;
      clientName?: string;
    }>
  >([]);

  useEffect(() => {
    const load = async () => {
      if (!professionalId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [{ data: professionalData, error: professionalError }, summaryResult, reviewResult] = await Promise.all([
          supabase
            .from('professionals')
            .select('avatar_url, description, categories, regions, credits, portfolio')
            .eq('id', professionalId)
            .maybeSingle(),
          getProfessionalReviewSummary(professionalId),
          listProfessionalReviews(professionalId),
        ]);

        if (professionalError) throw professionalError;

        if (professionalData) {
          setAvatarUrl(professionalData.avatar_url ?? null);
          setDescription(professionalData.description ?? null);
          setCategories(Array.isArray(professionalData.categories) ? professionalData.categories : []);
          setRegions(Array.isArray(professionalData.regions) ? professionalData.regions : []);
          setCredits(professionalData.credits ?? 0);
          setPortfolio(Array.isArray(professionalData.portfolio) ? professionalData.portfolio : []);
        }

        setSummary(summaryResult);
        setReviews(
          reviewResult.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            clientName: review.client?.name,
          })),
        );
      } catch (error) {
        console.error('Erro ao carregar avaliações do profissional:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [professionalId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={colors.professional} />
        <Text style={styles.loaderText}>A carregar avaliações...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.headerRow}>
            {avatarUrl ? (
              <Avatar.Image size={80} source={{ uri: avatarUrl }} />
            ) : (
              <Avatar.Icon size={80} icon="account" />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>{route.params?.professionalName || user?.name || 'Profissional'}</Text>
              <Text style={styles.creditsLabel}>Saldo atual: {credits} moedas</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <RatingStars rating={summary.average} size={30} />
            <Text style={styles.averageText}>{summary.average.toFixed(1)} / 5</Text>
          </View>
          <Text style={styles.totalReviews}>{summary.count} avaliações registradas</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>Categorias de atuação</Text>
          <View style={styles.chipGroup}>
            {categories.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma categoria informada.</Text>
            ) : (
              categories.map((category) => (
                <Chip key={category} mode="outlined" style={styles.infoChip}>
                  {category}
                </Chip>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Zonas de atendimento</Text>
          <View style={styles.chipGroup}>
            {regions.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma região informada.</Text>
            ) : (
              regions.map((region) => (
                <Chip key={region} mode="outlined" style={styles.infoChip}>
                  {region}
                </Chip>
              ))
            )}
          </View>
        </Card.Content>
      </Card>

      {portfolio.length > 0 ? (
        <Card style={styles.infoCard}>
          <Card.Content style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>Portfólio</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioRow}>
              {portfolio.map((item) => (
                <Avatar.Image
                  key={item}
                  size={72}
                  source={{ uri: item }}
                  style={styles.portfolioImage}
                />
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      ) : null}

      <Card style={styles.reviewsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Avaliações recentes</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não existem avaliações para este profissional.</Text>
          ) : (
            reviews.map((review) => (
              <List.Item
                key={review.id}
                title={() => (
                  <View style={styles.reviewHeader}>
                    <RatingStars rating={review.rating} size={22} />
                    <Text style={styles.reviewClient}>{review.clientName || 'Cliente'}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('pt-PT', { dateStyle: 'medium' })}
                    </Text>
                  </View>
                )}
                description={review.comment || 'Sem comentários adicionais.'}
                descriptionNumberOfLines={4}
              />
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
    gap: 16,
  },
  summaryCard: {
    borderRadius: 16,
    elevation: 2,
  },
  summaryContent: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  creditsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.professional,
  },
  totalReviews: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.text,
  },
  infoCard: {
    borderRadius: 16,
    elevation: 1,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    borderColor: colors.border,
  },
  reviewsCard: {
    borderRadius: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewClient: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  portfolioRow: {
    gap: 12,
  },
  portfolioImage: {
    backgroundColor: colors.surfaceLight,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loaderText: {
    color: colors.textSecondary,
  },
});

export default ProfileScreen;


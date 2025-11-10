import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button, Avatar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { Lead, Professional } from '../../types';
import { supabase } from '../../config/supabase';

export const ProfessionalHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const mapLead = useCallback((row: any): Lead => {
    return {
      id: row.id,
      serviceRequestId: row.service_request_id,
      category: row.category,
      cost: row.cost,
      location: row.location,
      description: row.description,
      createdAt: row.created_at,
    };
  }, []);

  const loadProfessionalData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [{ data: userRow, error: userError }, { data: professionalRow, error: professionalError }] =
        await Promise.all([
          supabase.from('users').select('*').eq('id', user.id).single(),
          supabase.from('professionals').select('*').eq('id', user.id).single(),
        ]);

      if (userError) throw userError;
      if (professionalError && professionalError.code !== 'PGRST116') {
        // PGRST116 = Row not found; tratamos mais abaixo
        throw professionalError;
      }

      if (!userRow) {
        setProfessional(null);
        return;
      }

      const combined: Professional = {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        phone: userRow.phone ?? undefined,
        userType: userRow.user_type || 'professional',
        createdAt: userRow.created_at,
        categories: professionalRow?.categories || [],
        regions: professionalRow?.regions || [],
        credits: professionalRow?.credits ?? 0,
        rating: Number(professionalRow?.rating ?? 0),
        reviewCount: professionalRow?.review_count ?? 0,
        portfolio: professionalRow?.portfolio ?? undefined,
        description: professionalRow?.description ?? undefined,
        avatarUrl: professionalRow?.avatar_url ?? null,
      };

      setProfessional(combined);
    } catch (error) {
      console.error('Erro ao carregar dados do profissional:', error);
    }
  }, [user?.id]);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLeads((data || []).map(mapLead));
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  }, [mapLead]);

  useEffect(() => {
    loadProfessionalData();
    loadLeads();
  }, [loadLeads, loadProfessionalData]);

  const handleUnlockLead = async (lead: Lead) => {
    if (!professional || professional.credits < lead.cost) {
      alert('Créditos insuficientes. Compre mais créditos para desbloquear este lead.');
      navigation.navigate('BuyCredits');
      return;
    }

    try {
      // Desbloquear lead e debitar créditos
      const { error } = await supabase.rpc('unlock_lead', {
        lead_id: lead.id,
        professional_id: user?.id,
        cost: lead.cost,
      });

      if (error) throw error;

      alert('Lead desbloqueado com sucesso!');
      navigation.navigate('LeadDetail', { leadId: lead.id });
      loadProfessionalData();
    } catch (error: any) {
      alert(error.message || 'Erro ao desbloquear lead');
    }
  };

  const renderLead = ({ item }: { item: Lead }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip style={styles.categoryChip}>{item.category}</Chip>
          <Chip
            icon="coin"
            style={styles.costChip}
            textStyle={{ color: colors.textLight, fontWeight: 'bold' }}
          >
            {item.cost} moedas
          </Chip>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Button
          mode="contained"
          onPress={() => handleUnlockLead(item)}
          style={styles.unlockButton}
          buttonColor={colors.secondary}
        >
          Desbloquear Lead
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {professional?.avatarUrl ? (
            <Avatar.Image size={64} source={{ uri: professional.avatarUrl }} />
          ) : (
            <Avatar.Icon size={64} icon="account" />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
            <View style={styles.creditsContainer}>
              <Text style={styles.creditsLabel}>Seus créditos:</Text>
              <Text style={styles.creditsValue}>{professional?.credits || 0} moedas</Text>
            </View>
          </View>
        </View>
        <View style={styles.creditsContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ProfessionalDashboard')}
            style={styles.dashboardButton}
            textColor={colors.textLight}
          >
            Ver Dashboard
          </Button>
        </View>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('BuyCredits')}
          style={styles.buyButton}
          textColor={colors.textLight}
        >
          Comprar Créditos
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('EditProfile')}
          style={styles.editProfileButton}
          textColor={colors.textLight}
        >
          Editar dados pessoais
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ManageProfile')}
          style={styles.manageButton}
          buttonColor={colors.textLight}
          textColor={colors.professional}
        >
          Gerir Perfil
        </Button>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Oportunidades Disponíveis</Text>
        {leads.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma oportunidade disponível no momento</Text>
          </View>
        ) : (
          <FlatList
            data={leads}
            renderItem={renderLead}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadLeads}
                tintColor={colors.professional}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.professional,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  creditsLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginRight: 8,
  },
  creditsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  buyButton: {
    borderColor: colors.textLight,
  },
  editProfileButton: {
    borderColor: colors.textLight,
    marginTop: 8,
  },
  manageButton: {
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: colors.primary,
  },
  costChip: {
    backgroundColor: colors.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  unlockButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dashboardButton: {
    borderColor: colors.textLight,
  },
});


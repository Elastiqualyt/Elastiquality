import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, Chip, Button } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';

export const ClientHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const mapServiceRequest = useCallback((row: any): ServiceRequest => {
    return {
      id: row.id,
      clientId: row.client_id,
      category: row.category,
      title: row.title,
      description: row.description,
      location: row.location,
      budget: row.budget ?? undefined,
      photos: row.photos ?? undefined,
      status: row.status,
      completedAt: row.completed_at ?? null,
      createdAt: row.created_at,
    };
  }, []);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []).map(mapServiceRequest));
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [mapServiceRequest, user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'active':
        return colors.info;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando';
      case 'active':
        return 'Ativo';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ServiceRequestDetail', { requestId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Chip
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: colors.textLight }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('pt-PT')}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
        <Text style={styles.subtitle}>Seus pedidos de serviço</Text>
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditProfile')}
            textColor={colors.textLight}
            style={styles.headerButton}
          >
            Editar perfil
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Notifications')}
            textColor={colors.textLight}
            style={styles.headerButton}
          >
            Preferências de notificações
          </Button>
        </View>
      </View>

      {requests.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não tem pedidos</Text>
          <Text style={styles.emptySubtext}>
            Clique no botão abaixo para solicitar um serviço
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor={colors.primary} />
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewServiceRequest')}
        color={colors.textLight}
      />
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
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  actionButtons: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerButton: {
    borderColor: colors.textLight,
  },
});


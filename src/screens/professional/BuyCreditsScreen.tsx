import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Platform } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { CreditPackage } from '../../types';
import { supabase } from '../../config/supabase';
import { startCheckout } from '../../services/stripe';
import * as Linking from 'expo-linking';

export const BuyCreditsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('active', true)
        .order('credits', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildReturnUrl = (path: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${path}`;
      }
      return `https://elastiquality.pt${path}`;
    }

    return Linking.createURL(path);
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user?.id) {
      alert('Sessão inválida. Faça login novamente.');
      return;
    }

    setPurchasing(pkg.id);

    try {
      const successUrl =
        process.env.EXPO_PUBLIC_STRIPE_SUCCESS_URL || buildReturnUrl('/checkout/success');
      const cancelUrl =
        process.env.EXPO_PUBLIC_STRIPE_CANCEL_URL || buildReturnUrl('/checkout/cancelled');

      const checkoutUrl = await startCheckout({
          packageId: pkg.id,
          successUrl,
          cancelUrl,
      });

      if (Platform.OS === 'web') {
        window.location.href = checkoutUrl;
      } else {
        const canOpen = await Linking.canOpenURL(checkoutUrl);
        if (!canOpen) {
          throw new Error('Não foi possível abrir a página de pagamento.');
        }
        await Linking.openURL(checkoutUrl);
      }
    } catch (err: any) {
      console.error('Erro ao iniciar pagamento Stripe:', err);
      alert(err.message || 'Erro ao iniciar pagamento.');
    } finally {
      setPurchasing(null);
    }
  };

  const renderPackage = ({ item }: { item: CreditPackage }) => {
    const pricePerCredit = item.price / item.credits;
    const hasDiscount = item.discount && item.discount > 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          {hasDiscount && (
            <Chip
              style={styles.discountChip}
              textStyle={{ color: colors.textLight, fontWeight: 'bold' }}
            >
              -{item.discount}% DESCONTO
            </Chip>
          )}
          
          <Text style={styles.packageName}>{item.name}</Text>
          
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsAmount}>{item.credits}</Text>
            <Text style={styles.creditsLabel}>moedas</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceSymbol}>€</Text>
            <Text style={styles.priceAmount}>{item.price.toFixed(2)}</Text>
          </View>

          <Text style={styles.pricePerCredit}>
            €{pricePerCredit.toFixed(2)} por moeda
          </Text>

          <Button
            mode="contained"
            onPress={() => handlePurchase(item)}
            loading={purchasing === item.id}
            disabled={purchasing !== null}
            style={styles.buyButton}
            buttonColor={colors.secondary}
          >
            Comprar Agora
          </Button>

          <Text style={styles.expiryInfo}>
            Válido por 3 meses após a compra. Pagamento seguro via Stripe Checkout.
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comprar Créditos</Text>
        <Text style={styles.headerSubtitle}>
          Use créditos para desbloquear leads e enviar propostas
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>Como funciona?</Text>
            <Text style={styles.infoText}>
              • Cada lead tem um custo em moedas{'\n'}
              • O custo varia por categoria e demanda{'\n'}
              • Créditos expiram em 3 meses{'\n'}
              • Pagamento seguro com cartão ou carteira digital
            </Text>
          </Card.Content>
        </Card>

        <FlatList
          data={packages}
          renderItem={renderPackage}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.packagesList}
        />

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('TransactionHistory')}
          textColor={colors.professional}
          style={styles.historyButton}
        >
          Ver histórico de compras
        </Button>

        <Card style={styles.paymentMethodsCard}>
          <Card.Content>
            <Text style={styles.paymentTitle}>Métodos de pagamento aceitos:</Text>
            <Text style={styles.paymentMethods}>
              💳 Cartão de Crédito/Débito{'\n'}
              📱 Apple Pay{'\n'}
              📱 Google Pay
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: colors.info + '20',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  packagesList: {
    gap: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  historyButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  discountChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.error,
    marginBottom: 12,
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  creditsAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  creditsLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricePerCredit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buyButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  expiryInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  paymentMethodsCard: {
    marginTop: 8,
    backgroundColor: colors.surface,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  paymentMethods: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});


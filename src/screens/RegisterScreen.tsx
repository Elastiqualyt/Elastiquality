import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, Card, RadioButton, HelperText } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { UserType } from '../types';
import { LocationPicker } from '../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../services/locations';

export const RegisterScreen = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [phone, setPhone] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (phone.trim().length > 0 && !/^\d{9}$/.test(phone.trim())) {
      setError('O telemóvel deve conter 9 dígitos numéricos');
      return;
    }

    let locationPayload:
      | {
          districtId: string;
          municipalityId: string;
          parishId: string;
          label: string;
        }
      | undefined;

    if (userType === 'client') {
      if (!locationSelection.parishId || !locationSelection.municipalityId || !locationSelection.districtId) {
        setLocationError('Selecione distrito, concelho e freguesia.');
        setError('Informe uma localização válida.');
        return;
      }

      const label = formatLocationSelection(locationSelection);
      if (!label) {
        setLocationError('Seleção inválida. Escolha novamente a freguesia.');
        setError('Informe uma localização válida.');
        return;
      }

      locationPayload = {
        districtId: locationSelection.districtId,
        municipalityId: locationSelection.municipalityId,
        parishId: locationSelection.parishId,
        label,
      };
    }

    setLoading(true);
    setError('');
    setLocationError(null);

    try {
      await signUp({
        email: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
        phone: phone.trim(),
        userType,
        location: locationPayload,
      });
      navigation.navigate('Login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Criar Conta</Text>

            <TextInput
              label="Nome"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Apelido"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              label="Telemóvel (9 dígitos)"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={9}
            />

            {userType === 'client' ? (
              <View style={styles.locationSection}>
                <Text style={styles.label}>Localização</Text>
                <LocationPicker
                  value={locationSelection}
                  onChange={(selection) => {
                    setLocationSelection(selection);
                    setLocationError(null);
                  }}
                  requiredLevel="parish"
                  caption="Selecione distrito, concelho e freguesia."
                  error={locationError || undefined}
                />
                {locationError ? <HelperText type="error">{locationError}</HelperText> : null}
              </View>
            ) : null}

            <Text style={styles.label}>Tipo de conta:</Text>
            <RadioButton.Group onValueChange={value => setUserType(value as UserType)} value={userType}>
              <View style={styles.radioContainer}>
                <RadioButton.Item label="Cliente" value="client" />
                <RadioButton.Item label="Profissional" value="professional" />
              </View>
            </RadioButton.Group>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.primary}
            >
              Cadastrar
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              Já tem conta? Faça login
            </Button>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  card: {
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  locationSection: {
    marginBottom: 16,
    gap: 8,
  },
  radioContainer: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
});


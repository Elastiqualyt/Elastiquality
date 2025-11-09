import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { colors } from '../theme/colors';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUserContext } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
        setProfileError(null);
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
        setProfileError(err.message || 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    if (!name.trim()) {
      setProfileError('Informe o seu nome.');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);

      const cleanPhone = phone.trim();

      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          phone: cleanPhone.length > 0 ? cleanPhone : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      updateUserContext({
        name: name.trim(),
        phone: cleanPhone.length > 0 ? cleanPhone : undefined,
      });

      setProfileSuccess('Perfil atualizado com sucesso.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setProfileError(err.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Senha atualizada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao atualizar senha:', err);
      setPasswordError(err.message || 'Não foi possível atualizar a senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ gap: 16 }}>
          <Text style={styles.title}>Editar Perfil</Text>

          {loading ? (
            <Text style={styles.loading}>A carregar dados...</Text>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações pessoais</Text>
                <TextInput
                  label="Nome"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={email}
                  editable={false}
                  style={styles.input}
                  right={<TextInput.Affix text="não editável" />}
                />
                <TextInput
                  label="Telemóvel (opcional)"
                  mode="outlined"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                {profileError ? <HelperText type="error">{profileError}</HelperText> : null}
                {profileSuccess ? <HelperText type="info">{profileSuccess}</HelperText> : null}
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={savingProfile}
                  disabled={savingProfile}
                  style={styles.primaryButton}
                >
                  Guardar alterações
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alterar senha</Text>
                <TextInput
                  label="Nova senha"
                  mode="outlined"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                />
                <TextInput
                  label="Confirmar nova senha"
                  mode="outlined"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
                {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
                {passwordSuccess ? <HelperText type="info">{passwordSuccess}</HelperText> : null}
                <Button
                  mode="outlined"
                  onPress={handleChangePassword}
                  loading={savingPassword}
                  disabled={savingPassword}
                  style={styles.secondaryButton}
                  textColor={colors.primary}
                >
                  Atualizar senha
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
    elevation: 2,
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
});

export default EditProfileScreen;


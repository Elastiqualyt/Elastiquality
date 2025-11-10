import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Dialog, HelperText, List, Portal, Text, TextInput } from 'react-native-paper';
import { colors } from '../theme/colors';
import {
  LocationOption,
  LocationSelection,
  formatLocationSelection,
  searchDistricts,
  searchParishesWithParents,
} from '../services/locations';
import { ensureLocationsSeeded } from '../services/locationSync';

interface LocationPickerProps {
  value: LocationSelection;
  onChange: (selection: LocationSelection) => void;
  error?: string;
  style?: any;
  mode?: 'parish' | 'district';
  label?: string;
  caption?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  error,
  style,
  mode = 'parish',
  label,
  caption,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncAttempted, setSyncAttempted] = useState(false);

  const resolvedValue = useMemo<LocationSelection>(() => value ?? {}, [value]);

  const helper = error ?? caption ?? undefined;
  const helperType = error ? 'error' : 'info';

  const displayValue = useMemo(() => {
    if (mode === 'district') {
      return resolvedValue.districtName ?? '';
    }
    return formatLocationSelection(resolvedValue);
  }, [mode, resolvedValue]);

  const inputLabel =
    label ?? (mode === 'district' ? 'Distrito de atendimento' : 'Freguesia, Concelho e Distrito');

  const closeDialog = () => {
    setDialogVisible(false);
    setQuery('');
    setOptions([]);
    setDialogError(null);
  };

  const handleOpenDialog = () => {
    setQuery('');
    setOptions([]);
    setDialogError(null);
    setDialogVisible(true);
    if (!syncAttempted) {
      setSyncing(true);
      ensureLocationsSeeded()
        .catch((err: any) => {
          console.error('Erro a sincronizar localizações:', err);
          setDialogError(err.message || 'Não foi possível sincronizar os dados de localização.');
        })
        .finally(() => {
          setSyncing(false);
          setSyncAttempted(true);
        });
    }
  };

  const fetchOptions = useCallback(async () => {
    if (!dialogVisible) return;

    try {
      setLoading(true);
      setDialogError(null);

      let results: LocationOption[] = [];
      if (mode === 'district') {
        results = await searchDistricts(query);
      } else {
        const parishResults = await searchParishesWithParents(query);
        results = parishResults.map((item) => ({
          id: item.parishId,
          name: item.parishName,
          municipalityId: item.municipalityId,
          municipalityName: item.municipalityName,
          districtId: item.districtId,
          districtName: item.districtName,
        }));
      }

      setOptions(results);
    } catch (err: any) {
      console.error('Erro ao carregar localizações:', err);
      setDialogError(err.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [dialogVisible, mode, query]);

  useEffect(() => {
    if (!dialogVisible) return;

    const debounce = setTimeout(() => {
      fetchOptions();
    }, 200);

    return () => clearTimeout(debounce);
  }, [dialogVisible, query, fetchOptions]);

  const handleSelectOption = (option: any) => {
    if (mode === 'district') {
      onChange({
        districtId: option.id,
        districtName: option.name,
        municipalityId: undefined,
        municipalityName: undefined,
        parishId: undefined,
        parishName: undefined,
      });
    } else {
      onChange({
        districtId: option.districtId,
        districtName: option.districtName,
        municipalityId: option.municipalityId,
        municipalityName: option.municipalityName,
        parishId: option.id,
        parishName: option.name,
      });
    }
    closeDialog();
  };

  const clearSelection = () => {
    onChange({});
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <TextInput
          mode="outlined"
          label={inputLabel}
          value={displayValue}
          editable={false}
          right={
            displayValue
              ? <TextInput.Icon icon="close" onPress={clearSelection} forceTextInputFocus={false} />
              : undefined
          }
          style={styles.input}
          pointerEvents="none"
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleOpenDialog}
          android_ripple={Platform.OS === 'android' ? { color: colors.overlay } : undefined}
        />
      </View>

      {helper ? (
        <HelperText type={helperType as 'error' | 'info'} visible>
          {helper}
        </HelperText>
      ) : null}

      {mode === 'parish' ? (
        <>
          <Text style={styles.previewLabel}>Resumo selecionado</Text>
          <Text style={styles.previewValue}>{displayValue || 'Nenhuma seleção feita.'}</Text>
        </>
      ) : null}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>
            {mode === 'district' ? 'Selecionar distrito' : 'Selecionar freguesia'}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogDescription}>
              {mode === 'district'
                ? 'Pesquise pelo distrito de atendimento.'
                : 'Pesquise pela freguesia. O concelho e distrito serão preenchidos automaticamente.'}
            </Text>
            <TextInput
              mode="outlined"
              label="Pesquisar"
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={styles.searchInput}
              placeholder="Digite para filtrar"
            />
            {dialogError ? <HelperText type="error">{dialogError}</HelperText> : null}
            {loading || syncing ? (
              <View style={styles.loader}>
                <ActivityIndicator animating color={colors.primary} />
                <Text style={styles.loaderText}>
                  {syncing ? 'A sincronizar dados de localização...' : 'A carregar opções...'}
                </Text>
              </View>
            ) : (
              <View style={styles.listWrapper}>
                {options.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
                ) : (
                  options.map((option: any) => (
                    <List.Item
                      key={option.id}
                      title={
                        mode === 'district'
                          ? option.name
                          : `${option.name} (${option.municipalityName})`
                      }
                      description={mode === 'district' ? undefined : option.districtName}
                      onPress={() => handleSelectOption(option)}
                      left={(props) => <List.Icon {...props} icon="map-marker" />}
                    />
                  ))
                )}
              </View>
            )}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.background,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewValue: {
    fontSize: 14,
    color: colors.text,
  },
  dialogContent: {
    gap: 12,
  },
  dialogDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchInput: {
    backgroundColor: colors.background,
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loaderText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listWrapper: {
    maxHeight: 320,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default LocationPicker;


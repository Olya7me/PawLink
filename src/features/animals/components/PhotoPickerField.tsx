import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { colors, radii, spacing, typography } from '@/theme';

import { MAX_ANIMAL_PHOTOS } from '../constants';
import type { LocalPhoto } from '../utils/photos';

type PhotoPickerFieldProps = {
  photos: LocalPhoto[];
  error?: string;
  onAdd: () => void;
  onRemove: (id: string) => void;
};

export function PhotoPickerField({ photos, error, onAdd, onRemove }: PhotoPickerFieldProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {t('animals.fields.photos')} ({photos.length}/{MAX_ANIMAL_PHOTOS})
      </Text>
      <Text style={styles.hint}>{t('animals.fields.photosHint')}</Text>
      <View style={styles.row}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.thumbWrap}>
            <Image source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('animals.fields.removePhoto')}
              onPress={() => onRemove(photo.id)}
              style={styles.remove}
            >
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>
      {photos.length < MAX_ANIMAL_PHOTOS ? (
        <Button
          label={t('animals.fields.addPhotos')}
          variant="secondary"
          onPress={onAdd}
          style={styles.addButton}
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumbWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.danger,
    fontSize: typography.size.sm,
  },
});

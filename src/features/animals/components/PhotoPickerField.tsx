import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/components/Button';
import { InlineMessage } from '@/shared/components/InlineMessage';

import { MAX_ANIMAL_PHOTOS } from '../constants';
import type { LocalPhoto } from '../utils/photos';
import { styles } from './PhotoPickerField.styles';

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
      {error ? <InlineMessage message={error} style={styles.error} /> : null}
    </View>
  );
}

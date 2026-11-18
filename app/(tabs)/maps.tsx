import { AnimalMap } from '@/features/maps';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/(tabs)/_maps.styles';

export default function MapsScreen() {
  return (
    <Screen padded={false} edges={['top', 'left', 'right']} style={styles.screen}>
      <AnimalMap />
    </Screen>
  );
}

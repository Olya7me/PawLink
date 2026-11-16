import { AnimalFeed } from '@/features/animals';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_index.styles';

export default function FeedScreen() {
  return (
    <Screen style={styles.screen}>
      <AnimalFeed />
    </Screen>
  );
}

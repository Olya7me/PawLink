import { StyleSheet } from 'react-native';

import { AnimalFeed } from '@/features/animals';
import { Screen } from '@/shared/components/Screen';

export default function FeedScreen() {
  return (
    <Screen style={styles.screen}>
      <AnimalFeed />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

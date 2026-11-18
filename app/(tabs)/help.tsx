import { HelpHub } from '@/features/faq';
import { Screen } from '@/shared/components/Screen';

import { styles } from '@/app-styles/(tabs)/_help.styles';

export default function HelpScreen() {
  return (
    <Screen padded={false} edges={['top', 'left', 'right']} style={styles.screen}>
      <HelpHub />
    </Screen>
  );
}

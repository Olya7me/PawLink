import { HelpFaq } from '@/features/faq';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_help.styles';

export default function HelpScreen() {
  return (
    <Screen padded={false} edges={['top', 'left', 'right']} style={styles.screen}>
      <HelpFaq />
    </Screen>
  );
}

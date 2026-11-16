import { MyActivity } from '@/features/activity';
import { Screen } from '@/shared/components/Screen';

import { styles } from './_activity.styles';

export default function ActivityScreen() {
  return (
    <Screen padded={false} edges={['top', 'left', 'right']} style={styles.screen}>
      <MyActivity />
    </Screen>
  );
}

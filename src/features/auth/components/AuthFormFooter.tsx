import { Link, type Href } from 'expo-router';
import { Text, View } from 'react-native';

import { styles } from './AuthFormFooter.styles';

type AuthFormFooterProps = {
  prompt: string;
  linkLabel: string;
  href: Href;
};

export function AuthFormFooter({ prompt, linkLabel, href }: AuthFormFooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{prompt}</Text>
      <Link href={href} style={styles.linkInline}>
        {linkLabel}
      </Link>
    </View>
  );
}

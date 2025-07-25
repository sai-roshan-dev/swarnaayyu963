import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useTextSize } from '@/context/TextSettingsContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { textSize } = useTextSize();

  // Map textSize to fontSize multiplier
  const sizeMap = {
    Small: 0.85,
    Medium: 1,
    Large: 1.2,
  };
  const scale = sizeMap[textSize] || 1;

  // Dynamic font sizes
  const fontSizes = {
    default: 16 * scale,
    defaultSemiBold: 16 * scale,
    title: 32 * scale,
    subtitle: 20 * scale,
    link: 16 * scale,
  };

  return (
    <Text
      style={[
        { color },
        type === 'default' && { fontSize: fontSizes.default, lineHeight: 24 * scale },
        type === 'title' && { fontSize: fontSizes.title, fontWeight: 'bold', lineHeight: 32 * scale },
        type === 'defaultSemiBold' && { fontSize: fontSizes.defaultSemiBold, lineHeight: 24 * scale, fontWeight: '600' },
        type === 'subtitle' && { fontSize: fontSizes.subtitle, fontWeight: 'bold' },
        type === 'link' && { fontSize: fontSizes.link, lineHeight: 30 * scale, color: '#0a7ea4' },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

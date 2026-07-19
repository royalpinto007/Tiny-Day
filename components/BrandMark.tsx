import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface Props {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function BrandMark({ size = 48, style }: Props) {
  return (
    <Image
      accessibilityLabel="Tiny Day logo"
      resizeMode="contain"
      source={require('../assets/logo-mark.png')}
      style={[{ width: size, height: size }, style]}
    />
  );
}

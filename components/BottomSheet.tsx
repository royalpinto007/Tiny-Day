import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const y = useSharedValue(400);

  useEffect(() => {
    y.value = withTiming(visible ? 0 : 400, { duration: t.reduceMotion ? 0 : 220 });
  }, [visible, t.reduceMotion, y]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Dismiss" style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoider}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            sheetStyle,
            {
              backgroundColor: t.colors.bg,
              borderTopLeftRadius: t.radius.lg + 4,
              borderTopRightRadius: t.radius.lg + 4,
              paddingHorizontal: t.spacing.xl,
              paddingTop: t.spacing.md,
              paddingBottom: insets.bottom + t.spacing.xl,
            },
          ]}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.colors.faint,
              marginBottom: t.spacing.lg,
            }}
          />
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 2 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,26,24,0.4)' },
  avoider: { flex: 1, justifyContent: 'flex-end' },
});

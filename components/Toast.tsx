import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Text } from './Text';

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ToastContext = createContext<{ show: (t: ToastState) => void }>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const show = useCallback((next: ToastState) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(next);
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          entering={t.reduceMotion ? undefined : FadeInDown.duration(180)}
          exiting={t.reduceMotion ? undefined : FadeOutDown.duration(180)}
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: t.spacing.lg,
            right: t.spacing.lg,
            bottom: insets.bottom + 88,
            backgroundColor: t.colors.toastBg,
            borderRadius: t.radius.md,
            paddingHorizontal: t.spacing.lg,
            paddingVertical: t.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="taskTitle" color={t.colors.toastText}>✓ {toast.message}</Text>
          </View>
          {toast.actionLabel && (
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => {
                toast.onAction?.();
                setToast(null);
              }}
            >
              <Text variant="bodyBold" color={t.colors.terra}>{toast.actionLabel}</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

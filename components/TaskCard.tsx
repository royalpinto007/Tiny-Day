import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme, MIN_TOUCH } from '../theme';
import { Card } from './Card';
import { Text } from './Text';
import { CategoryChip, PriorityChip } from './chips';
import { CATEGORY_LABEL, durationLabel, Task } from '../lib/types';

interface Props {
  task: Task;
  onPress?: () => void;
  onToggleComplete?: () => void;
  compact?: boolean;
}

export function TaskCard({ task, onPress, onToggleComplete, compact }: Props) {
  const t = useTheme();
  const c = t.colors;
  const done = task.status === 'completed';
  return (
    <Card style={{ padding: compact ? t.spacing.md : t.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={done ? `Mark ${task.name} as not done` : `Complete ${task.name}`}
          hitSlop={8}
          onPress={() => {
            onToggleComplete?.();
          }}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: done ? 0 : 1.5,
            borderColor: c.borderStrong,
            backgroundColor: done ? c.sage : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {done && <Text variant="bodyBold" color={c.onSage}>✓</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${task.name}, ${durationLabel(task.durationMin)}, ${CATEGORY_LABEL[task.category]}`}
          onPress={onPress}
          style={{ flex: 1, minHeight: MIN_TOUCH, justifyContent: 'center' }}
        >
          <Text
            variant="cardTitle"
            color={done ? c.faint : c.ink}
            style={done ? { textDecorationLine: 'line-through' } : undefined}
            numberOfLines={2}
          >
            {task.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <PriorityChip priority={task.priority} />
            <CategoryChip category={task.category} />
            <Text variant="caption" color={c.sub}>
              {durationLabel(task.durationMin)} · {task.flexibility === 'fixed' ? 'Fixed' : 'Flexible'}
            </Text>
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

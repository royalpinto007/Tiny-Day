import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';
import {
  Category, CATEGORY_LABEL, Priority, PRIORITY_GLYPH, PRIORITY_LABEL,
  STATUS_GLYPH, STATUS_LABEL, TaskStatus,
} from '../lib/types';

function ChipShell({ bg, borderColor, children, style }: {
  bg: string; borderColor?: string; children: React.ReactNode; style?: ViewStyle;
}) {
  const t = useTheme();
  return (
    <View
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: bg,
        borderRadius: t.radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: borderColor ? 1 : 0,
        borderColor,
      }, style]}
    >
      {children}
    </View>
  );
}

export function PriorityChip({ priority, style }: { priority: Priority; style?: ViewStyle }) {
  const t = useTheme();
  const c = t.colors;
  const map = {
    must: { bg: c.mustFill, text: c.mustText, border: undefined },
    should: { bg: c.shouldFill, text: c.shouldText, border: undefined },
    optional: { bg: c.optionalFill, text: c.optionalText, border: c.borderStrong },
  }[priority];
  return (
    <ChipShell bg={map.bg} borderColor={map.border} style={style}>
      <Text
        variant="bodyBold"
        color={map.text}
        style={{ fontSize: 12 }}
        accessibilityLabel={`Priority: ${PRIORITY_LABEL[priority]}`}
      >
        {PRIORITY_GLYPH[priority]} {PRIORITY_LABEL[priority]}
      </Text>
    </ChipShell>
  );
}

export function StatusChip({ status, style }: { status: TaskStatus; style?: ViewStyle }) {
  const t = useTheme();
  const c = t.colors;
  const map: Record<TaskStatus, { bg: string; text: string; border?: string }> = {
    not_started: { bg: c.optionalFill, text: c.optionalText, border: c.borderStrong },
    in_progress: { bg: c.shouldFill, text: c.shouldText },
    completed: { bg: c.successFill, text: c.successText },
    missed: { bg: c.mustFill, text: c.mustText },
    rescheduled: { bg: c.beige, text: t.dark ? c.sub : '#8A6A3F' },
    skipped: { bg: c.surfaceAlt, text: c.sub },
    waiting: { bg: c.surfaceAlt, text: c.sub },
    overdue: { bg: c.dangerFill, text: c.dangerText },
  };
  const m = map[status];
  return (
    <ChipShell bg={m.bg} borderColor={m.border} style={style}>
      <Text variant="bodyBold" color={m.text} style={{ fontSize: 12 }}>
        {STATUS_GLYPH[status] ? `${STATUS_GLYPH[status]} ` : ''}{STATUS_LABEL[status]}
      </Text>
    </ChipShell>
  );
}

export function CategoryChip({ category, style }: { category: Category; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <ChipShell bg={t.colors.beige} style={style}>
      <Text variant="body" color={t.dark ? t.colors.sub : t.colors.ink} style={{ fontSize: 12 }}>
        {CATEGORY_LABEL[category]}
      </Text>
    </ChipShell>
  );
}

export function PlainChip({ label, selected, style }: { label: string; selected?: boolean; style?: ViewStyle }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <ChipShell
      bg={selected ? c.sage : c.surface}
      borderColor={selected ? undefined : c.borderStrong}
      style={style}
    >
      <Text variant="bodyBold" color={selected ? c.onSage : c.sub} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </ChipShell>
  );
}

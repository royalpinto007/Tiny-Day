import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';
import { TabletShell } from '../../components/TabletShell';
import { useIsTablet } from '../../theme';

export default function TabsLayout() {
  const isTablet = useIsTablet();
  return (
    <Tabs
      tabBar={(props) => (isTablet ? <TabletShell {...props} /> : <TabBar {...props} />)}
      screenOptions={{ headerShown: false, tabBarPosition: isTablet ? 'left' : 'bottom' }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
      <Tabs.Screen name="room" options={{ title: 'Room' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

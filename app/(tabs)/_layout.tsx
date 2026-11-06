import Tabs, { type BottomTabBarProps } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui/TabBar';

// Outside the component: an inline tabBar function and options object are new on every render.
const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;
const screenOptions = { headerShown: false };

export default function TabLayout() {
  return (
    <Tabs tabBar={renderTabBar} screenOptions={screenOptions}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workout" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

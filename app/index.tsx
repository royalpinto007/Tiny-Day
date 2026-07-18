import { Redirect } from 'expo-router';
import { useSettings } from '../lib/store/settings';

export default function Index() {
  const onboarded = useSettings((s) => s.onboarded);
  return <Redirect href={onboarded ? '/(tabs)/today' : '/onboarding'} />;
}

import { Text } from 'react-native';
import { Redirect, Slot } from 'expo-router';

import { useAuth } from '@/utils/ctx';
import { useContext } from 'react';

export default function AppLayout() {
  const { session } = useAuth()
  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return <Slot />;
}

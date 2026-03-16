import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { ActivityIndicator, View } from 'react-native';

/** Navigateur racine — bascule entre Auth et App selon l'état de connexion. */
export function RootNavigator() {
  const { isAuthenticated, restore } = useAuthStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    restore().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <Toast />
    </>
  );
}

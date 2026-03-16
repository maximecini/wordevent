import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/auth.store';
import { login, loginFacebook } from '../../api/endpoints/auth.api';

WebBrowser.maybeCompleteAuthSession();

const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';
const EXPO_REDIRECT_URI = 'https://auth.expo.io/@jaxouu-expo/wordevent';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/** Écran de connexion — email/password + Google, Apple, Facebook. */
export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const storeLogin = useAuthStore((s) => s.login);

  const [, facebookResponse, promptFacebook] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    redirectUri: EXPO_REDIRECT_URI,
  });

  useEffect(() => {
    if (facebookResponse?.type === 'success') {
      const accessToken = facebookResponse.params?.access_token;
      if (accessToken) handleOAuth(() => loginFacebook(accessToken));
    }
  }, [facebookResponse]);

  async function handleOAuth(apiCall: () => Promise<{ accessToken: string; refreshToken: string }>) {
    try {
      const tokens = await apiCall();
      await storeLogin(tokens);
    } catch {
      Alert.alert('Erreur', 'Connexion impossible');
    }
  }

  async function handleLogin() {
    console.log('[Login] tentative avec:', email);
    console.log('[Login] API URL:', process.env.EXPO_PUBLIC_API_URL);
    try {
      const tokens = await login({ email, password });
      console.log('[Login] succès, tokens reçus:', tokens);
      await storeLogin(tokens);
      console.log('[Login] storeLogin terminé');
    } catch (e: any) {
      console.log('[Login] erreur complète:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        isAxiosError: e?.isAxiosError,
        stack: e?.stack?.split('\n').slice(0, 3).join(' | '),
      });
      Alert.alert('Erreur', 'Identifiants incorrects');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>wordevent</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={styles.separator}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>ou</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.socialButtonDisabled} disabled>
        <Text style={styles.socialTextDisabled}>Continuer avec Google (bientôt)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButtonDisabled} disabled>
        <Text style={styles.socialTextDisabled}>Continuer avec Apple (bientôt)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={() => promptFacebook()}>
        <Text style={styles.socialText}>Continuer avec Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  socialButton: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14,
    alignItems: 'center', marginBottom: 12,
  },
  socialText: { fontWeight: '600', color: '#111' },
  socialButtonDisabled: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 14,
    alignItems: 'center', marginBottom: 12, backgroundColor: '#fafafa',
  },
  socialTextDisabled: { fontWeight: '600', color: '#bbb' },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: '#ddd' },
  separatorText: { marginHorizontal: 12, color: '#999', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', color: '#666' },
});

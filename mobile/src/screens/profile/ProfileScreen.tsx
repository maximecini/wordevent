import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/auth.store';

/** Écran profil — affiche les infos de l'utilisateur connecté et permet la déconnexion. */
export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  email: { fontSize: 16, color: '#666', marginBottom: 32 },
  button: { backgroundColor: '#000', borderRadius: 8, padding: 14, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

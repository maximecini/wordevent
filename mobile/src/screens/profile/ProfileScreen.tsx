import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/auth.store';

/** Écran profil — affiche les infos de l'utilisateur connecté et permet la déconnexion. */
export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  email: { fontSize: 15, color: '#64748B', marginBottom: 4 },
  role: { fontSize: 13, color: '#94A3B8', marginBottom: 40 },
  logoutBtn: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
  },
  logoutText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
});

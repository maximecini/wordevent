import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

/** Écran invitations — à implémenter. */
export function InvitationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Invitations</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#94A3B8', fontSize: 16 },
});

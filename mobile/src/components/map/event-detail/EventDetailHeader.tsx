import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { EventResponse } from '../../../types/event.types';
import { getCategoryConfig } from '../../../utils/event-category.utils';

type Props = {
  event: EventResponse;
};

/** En-tête visuel du détail événement : image catégorie + gradient + titre + badges. */
export function EventDetailHeader({ event }: Props) {
  const config = getCategoryConfig(event.category);
  const isPrivate = event.visibility === 'PRIVATE';

  return (
    <ImageBackground source={config.image} style={styles.image} resizeMode="cover">
      <View style={styles.gradient}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: config.color }]}>
            <Text style={styles.badgeText}>{config.emoji} {config.label}</Text>
          </View>
          <View style={[styles.badge, isPrivate ? styles.badgePrivate : styles.badgePublic]}>
            <Text style={styles.badgeText}>{isPrivate ? '🔒 Privé' : '🌍 Public'}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden' },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgePublic:  { backgroundColor: 'rgba(37,99,235,0.7)' },
  badgePrivate: { backgroundColor: 'rgba(109,40,217,0.7)' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 26 },
});

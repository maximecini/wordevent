import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { EventResponse } from '../../../types/event.types';
import { EventDetailHeader } from './EventDetailHeader';
import { EventDetailInfo } from './EventDetailInfo';

type Props = {
  event: EventResponse | null;
  onClose: () => void;
};

/** BottomSheet affichant le détail complet d'un événement sélectionné. */
export function EventDetailSheet({ event, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (event) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [event]);

  const handleChange = useCallback((index: number) => {
    if (index === -1) onClose();
  }, [onClose]);

  if (!event) return null;

  const isFull = event.participantCount >= event.capacity;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={['55%', '85%']}
      enablePanDownToClose
      onClose={onClose}
      onChange={handleChange}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EventDetailHeader event={event} />
        <EventDetailInfo event={event} />

        <TouchableOpacity
          style={[styles.actionBtn, (isFull && !event.isParticipant) && styles.actionDisabled]}
          disabled={isFull && !event.isParticipant}
        >
          <Text style={styles.actionText}>
            {event.isParticipant ? '👋 Quitter' : isFull ? 'Complet' : '✅ Rejoindre'}
          </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#fff', borderRadius: 20 },
  handle: { backgroundColor: '#CBD5E1', width: 40 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 16 },
  actionBtn: { backgroundColor: '#0F172A', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  actionDisabled: { backgroundColor: '#CBD5E1' },
  actionText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  spacer: { height: 8 },
});

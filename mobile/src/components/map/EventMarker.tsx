import { ClipOp, PaintStyle, Skia, useImage } from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import { Marker } from 'react-native-maps';
import { EventResponse } from '../../types/event.types';
import { getCategoryConfig } from '../../utils/event-category.utils';

type Props = {
  event: EventResponse;
  onSelect: (event: EventResponse) => void;
};

const TOTAL   = 112;
const CENTER  = TOTAL / 2;
const OUTER_R = 48;
const INNER_R = 40;
const BORDER  = 3;
const ANCHOR_Y = (CENTER + OUTER_R) / TOTAL;

function useMarkerUri(source: ImageSourcePropType, color: string, isFull: boolean): string | null {
  const skiaImage = useImage(source as number);
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (!skiaImage) return;

    const surface = Skia.Surface.Make(TOTAL, TOTAL);
    if (!surface) return;

    const cvs = surface.getCanvas();
    cvs.clear(Skia.Color('transparent'));

    const bgPaint = Skia.Paint();
    bgPaint.setColor(Skia.Color('white'));
    cvs.drawCircle(CENTER, CENTER, OUTER_R, bgPaint);

    const clipPath = Skia.Path.Make();
    clipPath.addCircle(CENTER, CENTER, INNER_R);
    cvs.save();
    cvs.clipPath(clipPath, ClipOp.Intersect, true);
    const imgPaint = Skia.Paint();
    if (isFull) imgPaint.setAlphaf(0.35);
    const src = Skia.XYWHRect(0, 0, skiaImage.width(), skiaImage.height());
    const dst = Skia.XYWHRect(CENTER - INNER_R, CENTER - INNER_R, INNER_R * 2, INNER_R * 2);
    cvs.drawImageRect(skiaImage, src, dst, imgPaint);
    cvs.restore();

    const ringPaint = Skia.Paint();
    ringPaint.setColor(Skia.Color(color));
    ringPaint.setStyle(PaintStyle.Stroke);
    ringPaint.setStrokeWidth(BORDER);
    cvs.drawCircle(CENTER, CENTER, OUTER_R - BORDER / 2, ringPaint);

    setUri(`data:image/png;base64,${surface.makeImageSnapshot().encodeToBase64()}`);
  }, [skiaImage, color, isFull]);

  return uri;
}

/** Marqueur circulaire dessiné via Skia — évite le bug de clipping Android. */
export function EventMarker({ event, onSelect }: Props) {
  const config      = getCategoryConfig(event.category);
  const isFull      = event.participantCount >= event.capacity;
  const borderColor = isFull ? '#94A3B8' : config.color;
  const markerUri   = useMarkerUri(config.image, borderColor, isFull);
  const handlePress = useCallback(() => onSelect(event), [event, onSelect]);

  if (!markerUri) return null;

  return (
    <Marker
      coordinate={{ latitude: event.lat, longitude: event.lng }}
      onPress={handlePress}
      image={{ uri: markerUri }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    />
  );
}

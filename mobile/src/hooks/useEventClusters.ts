import { useMemo } from 'react';
import Supercluster, { ClusterFeature, PointFeature } from 'supercluster';
import { Region } from 'react-native-maps';
import { EventResponse } from '../types/event.types';

export type EventPoint = PointFeature<{ event: EventResponse }>;
export type EventCluster = ClusterFeature<{ point_count: number }>;
export type ClusterItem = EventPoint | EventCluster;

const CLUSTER_RADIUS = 60;

function toGeoJsonPoint(event: EventResponse): EventPoint {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [event.lng, event.lat] },
    properties: { event },
  };
}

function regionToBBox(region: Region): [number, number, number, number] {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
  return [
    longitude - longitudeDelta / 2,
    latitude - latitudeDelta / 2,
    longitude + longitudeDelta / 2,
    latitude + latitudeDelta / 2,
  ];
}

function deltaToZoom(latitudeDelta: number): number {
  return Math.round(Math.log2(360 / latitudeDelta));
}

/**
 * Calcule les clusters à partir des événements du store et de la région courante.
 * Logique pure — pas d'effet de bord.
 *
 * @param events - Liste des événements à regrouper
 * @param region - Région courante de la MapView
 * @returns Tableau de clusters et de marqueurs individuels
 */
export function useEventClusters(events: EventResponse[], region: Region): ClusterItem[] {
  const supercluster = useMemo(() => {
    const sc = new Supercluster<{ event: EventResponse }>({ radius: CLUSTER_RADIUS, maxZoom: 20 });
    sc.load(events.map(toGeoJsonPoint));
    return sc;
  }, [events]);

  return useMemo(() => {
    const bbox = regionToBBox(region);
    const zoom = deltaToZoom(region.latitudeDelta);
    const clusters = supercluster.getClusters(bbox, zoom) as ClusterItem[];
    console.log(`[${Date.now()}][useEventClusters] zoom=${zoom} bbox=${JSON.stringify(bbox)} → ${clusters.length} items`);
    return clusters;
  }, [supercluster, region]);
}

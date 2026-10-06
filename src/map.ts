import * as L from "leaflet";
import { CONFIG } from "./config";
import type { TrackPoint } from "./types";

export function initializeMap(
  containerId: string,
  startPoint: TrackPoint,
): L.Map {
  const map = L.map(containerId).setView(
    [startPoint.latitude, startPoint.longitude],
    CONFIG.map.defaultZoom,
  );

  L.tileLayer(CONFIG.map.tileLayerUrl, {
    maxZoom: CONFIG.map.maxZoom,
    attribution: CONFIG.map.attribution,
  }).addTo(map);

  return map;
}

export function renderTrack(map: L.Map, trackData: TrackPoint[]): void {
  const bounds: L.LatLngExpression[] = [];

  for (let i = 0; i < trackData.length - 1; i++) {
    const p1 = trackData[i];
    const p2 = trackData[i + 1];

    // Strongly type the tuple for Leaflet
    const segmentLatLngs: [number, number][] = [
      [p1.latitude, p1.longitude],
      [p2.latitude, p2.longitude],
    ];

    bounds.push(segmentLatLngs[0], segmentLatLngs[1]);

    const isUnpaved = p2.unpaved > 0;
    const style = isUnpaved ? CONFIG.styles.unpaved : CONFIG.styles.paved;

    L.polyline(segmentLatLngs, style).addTo(map);
  }

  if (bounds.length > 0) {
    map.fitBounds(bounds as L.LatLngBoundsExpression);
  }
}

import * as L from "leaflet";
import { CONFIG } from "../config";
import { Store } from "../store";
import type { TrackPoint, AppState } from "../types";

export class MapView {
  private map: L.Map;
  private hoverMarker: L.CircleMarker;

  constructor(
    containerId: string,
    trackData: TrackPoint[],
    private store: Store<AppState>,
  ) {
    const startPoint = trackData[0];
    this.map = L.map(containerId).setView(
      [startPoint.latitude, startPoint.longitude],
      CONFIG.map.defaultZoom,
    );

    L.tileLayer(CONFIG.map.tileLayerUrl, {
      maxZoom: CONFIG.map.maxZoom,
      attribution: CONFIG.map.attribution,
    }).addTo(this.map);

    // Persistent highlight marker instance
    this.hoverMarker = L.circleMarker([0, 0], {
      radius: 7,
      color: "#ff0000",
      fillColor: "#ffffff",
      fillOpacity: 0.9,
      weight: 3,
    });

    this.renderTrackSegments(trackData);

    // Subscribe to state changes
    this.store.subscribe((state) => this.onStateChange(state));
  }

  private renderTrackSegments(trackData: TrackPoint[]): void {
    const bounds: L.LatLngExpression[] = [];

    for (let i = 0; i < trackData.length - 1; i++) {
      const p1 = trackData[i];
      const p2 = trackData[i + 1];
      const segmentLatLngs: [number, number][] = [
        [p1.latitude, p1.longitude],
        [p2.latitude, p2.longitude],
      ];

      bounds.push(segmentLatLngs[0], segmentLatLngs[1]);

      const isUnpaved = p2.unpaved > 0;
      const style = isUnpaved ? CONFIG.styles.unpaved : CONFIG.styles.paved;
      const polyline = L.polyline(segmentLatLngs, style).addTo(this.map);

      // User interactions dispatch actions to the central store
      polyline.on("mouseover", () => this.store.set({ activePoint: p2 }));
      polyline.on("mouseout", () => this.store.set({ activePoint: null }));
    }

    if (bounds.length > 0) {
      this.map.fitBounds(bounds as L.LatLngBoundsExpression);
    }
  }

  private onStateChange(state: AppState): void {
    const { activePoint } = state;

    if (!activePoint) {
      if (this.map.hasLayer(this.hoverMarker)) {
        this.map.removeLayer(this.hoverMarker);
      }
      return;
    }

    this.hoverMarker.setLatLng([activePoint.latitude, activePoint.longitude]);
    if (!this.map.hasLayer(this.hoverMarker)) {
      this.hoverMarker.addTo(this.map);
    }
  }
}

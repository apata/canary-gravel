export interface TrackPoint {
  distanceOnTrack: number;
  elevation: number;
  latitude: number;
  longitude: number;
  unpaved: number;
  segment: number;
  xGlobal: number;
  elevSmooth: number;
}

export interface AppState {
  activePoint: TrackPoint | null;
}

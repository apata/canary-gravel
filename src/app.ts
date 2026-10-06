import "leaflet/dist/leaflet.css";
import { Store } from "./store";
import { MapView } from "./components/map-view";
import { ElevationView } from "./components/elevation-view";
import type { TrackPoint, AppState } from "./types";

declare const track: TrackPoint[];

document.addEventListener("DOMContentLoaded", () => {
  if (
    typeof track === "undefined" ||
    !Array.isArray(track) ||
    track.length === 0
  ) {
    console.error("Track data is missing or empty.");
    return;
  }

  const store = new Store<AppState>({ activePoint: null });

  new MapView("map", track, store);
  new ElevationView("elevation-container", track, store);
});

import { initializeMap, renderTrack } from "./map";
import { renderElevationProfile } from "./elevation";
import type { TrackPoint } from "./types";

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

  const mapInstance = initializeMap("map", track[0]);
  renderTrack(mapInstance, track);
  renderElevationProfile("elevation-container", track);
});

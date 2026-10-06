import { CONFIG } from "./config";
import type { TrackPoint } from "./types";

export function renderElevationProfile(
  containerId: string,
  trackData: TrackPoint[],
): void {
  const container = document.getElementById(containerId);
  if (!container || trackData.length === 0) return;

  const svgWidth = 1000;
  const svgHeight = 150;
  const yPadding = 20;

  const elevations = trackData.map((t) => t.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);

  const minDist = trackData[0].distanceOnTrack;
  const maxDist = trackData[trackData.length - 1].distanceOnTrack;

  const elevRange = maxElev - minElev || 1;
  const distRange = maxDist - minDist || 1;
  const usableHeight = svgHeight - yPadding * 2;

  const points = trackData.map((p) => {
    const x = ((p.distanceOnTrack - minDist) / distRange) * svgWidth;
    const y =
      svgHeight -
      yPadding -
      ((p.elevation - minElev) / elevRange) * usableHeight;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");
  const polygonPoints = `${polylinePoints} ${svgWidth},${svgHeight} 0,${svgHeight}`;

  const { fill, stroke, strokeWidth, opacity } = CONFIG.styles.elevation;

  container.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block;">
            <polygon points="${polygonPoints}" fill="${fill}" opacity="${opacity}" />
            <polyline points="${polylinePoints}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />
        </svg>
    `;
}

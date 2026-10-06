import { CONFIG } from "../config";
import { Store } from "../store";
import type { TrackPoint, AppState } from "../types";

interface ComputedPoint {
  point: TrackPoint;
  x: number;
  y: number;
}

export class ElevationView {
  private container: HTMLElement;
  private computedPoints: ComputedPoint[] = [];
  private hoverLine!: SVGLineElement;
  private svgElement!: SVGSVGElement;

  private readonly svgWidth = 1000;
  private readonly svgHeight = 150;

  constructor(
    containerId: string,
    trackData: TrackPoint[],
    private store: Store<AppState>,
  ) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found`);
    this.container = el;

    this.calculateCoordinates(trackData);
    this.render();
    this.attachEvents();

    // Subscribe to state changes
    this.store.subscribe((state) => this.onStateChange(state));
  }

  private calculateCoordinates(trackData: TrackPoint[]): void {
    const yPadding = 20;
    const elevations = trackData.map((t) => t.elevation);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);

    const minDist = trackData[0].distanceOnTrack;
    const maxDist = trackData[trackData.length - 1].distanceOnTrack;

    const elevRange = maxElev - minElev || 1;
    const distRange = maxDist - minDist || 1;
    const usableHeight = this.svgHeight - yPadding * 2;

    this.computedPoints = trackData.map((p) => ({
      point: p,
      x: ((p.distanceOnTrack - minDist) / distRange) * this.svgWidth,
      y:
        this.svgHeight -
        yPadding -
        ((p.elevation - minElev) / elevRange) * usableHeight,
    }));
  }

  private render(): void {
    const polylinePoints = this.computedPoints
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
    const polygonPoints = `${polylinePoints} ${this.svgWidth},${this.svgHeight} 0,${this.svgHeight}`;
    const { fill, stroke, strokeWidth, opacity } = CONFIG.styles.elevation;

    this.container.innerHTML = `
            <svg viewBox="0 0 ${this.svgWidth} ${this.svgHeight}" preserveAspectRatio="none" style="width: 100%; height: 100%; display: block; cursor: crosshair;">
                <polygon points="${polygonPoints}" fill="${fill}" opacity="${opacity}" />
                <polyline points="${polylinePoints}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />
                <line id="elev-hover-line" x1="0" y1="0" x2="0" y2="${this.svgHeight}" stroke="#ff0000" stroke-width="1.5" stroke-dasharray="4,4" style="display: none;" />
                <circle id="elev-hover-dot" r="5" fill="#ff0000" stroke="#ffffff" stroke-width="2" style="display: none;" />
            </svg>
        `;

    this.svgElement = this.container.querySelector("svg")!;
    this.hoverLine = this.container.querySelector("#elev-hover-line")!;
  }

  private attachEvents(): void {
    this.svgElement.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = this.svgElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const targetSvgX =
        Math.max(0, Math.min(1, mouseX / rect.width)) * this.svgWidth;

      // Find nearest point
      let closest = this.computedPoints[0];
      let minDiff = Math.abs(this.computedPoints[0].x - targetSvgX);

      for (let i = 1; i < this.computedPoints.length; i++) {
        const diff = Math.abs(this.computedPoints[i].x - targetSvgX);
        if (diff < minDiff) {
          minDiff = diff;
          closest = this.computedPoints[i];
        }
      }

      this.store.set({ activePoint: closest.point });
    });

    this.svgElement.addEventListener("mouseleave", () => {
      this.store.set({ activePoint: null });
    });
  }

  private onStateChange(state: AppState): void {
    const { activePoint } = state;

    if (!activePoint) {
      this.hoverLine.style.display = "none";
      return;
    }

    const match = this.computedPoints.find((p) => p.point === activePoint);
    if (match) {
      this.hoverLine.setAttribute("x1", match.x.toString());
      this.hoverLine.setAttribute("x2", match.x.toString());
      this.hoverLine.style.display = "block";
    }
  }
}

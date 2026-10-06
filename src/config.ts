export const CONFIG = {
  map: {
    tileLayerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    defaultZoom: 15,
    attribution: "© OpenStreetMap",
  },
  styles: {
    paved: { color: "blue", weight: 5 },
    unpaved: { color: "#8B4513", weight: 5 },
    elevation: {
      fill: "#e0f3ff",
      stroke: "#0056b3",
      strokeWidth: 3,
      opacity: 0.6,
    },
  },
};

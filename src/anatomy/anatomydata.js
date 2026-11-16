
import {
  ANATOMY_STRUCTURES,
  ANATOMY_BY_KEY,
  SYSTEMS,
  ATTRIBUTION,
  modelUrl,
} from "open-anatomy-3d";

export {
  ANATOMY_STRUCTURES,
  ANATOMY_BY_KEY,
  SYSTEMS,
  ATTRIBUTION,
  modelUrl,
};

export const SYSTEM_LABELS = {
  skin: "Skin",
  skeleton: "Skeleton",
  muscles: "Muscles",
  organs: "Organs",
  vessels: "Blood vessels",
  nerves: "Nervous system",
};

export const SYSTEM_COLORS = {
  skin: "#d8a17e",
  skeleton: "#e7dfc9",
  muscles: "#d66b70",
  organs: "#ed7777",
  vessels: "#e45e72",
  nerves: "#e9c66b",
};

export const SYSTEM_KEYS = [
  "skin",
  "skeleton",
  "muscles",
  "organs",
  "vessels",
  "nerves",
];

export const getStructure = (key) => ANATOMY_BY_KEY[key] ?? null;

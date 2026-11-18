import {
  ANATOMY_BY_KEY,
  ATTRIBUTION,
  SYSTEMS as MODEL_SYSTEMS,
  SYSTEM_LABELS,
  structuresFor,
} from "open-anatomy-3d";

export { ATTRIBUTION, ANATOMY_BY_KEY, structuresFor };

export const SYSTEMS = [
  { id: "all", label: "Full body" },
  ...MODEL_SYSTEMS.map((id) => ({ id, label: SYSTEM_LABELS[id] })),
];

export const PARTS = Object.fromEntries(
  Object.entries(ANATOMY_BY_KEY).map(([id, structure]) => [
    id,
    {
      id,
      name: structure.label,
      group: structure.system,
      systems: [structure.system],
      color: structure.color,
      summary: `${structure.label} is part of the ${structure.category} system. Select it in the 3D atlas to examine its position in the body.`,
    },
  ])
);

export const PART_LIST = Object.values(PARTS);

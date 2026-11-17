
export const FLAGSHIP_MODELS = [
  {
    id: "dna",
    name: "DNA Double Helix",
    shortName: "DNA",
    category: "Molecular Biology",
    description:
      "Explore the structure responsible for storing hereditary information.",
    structureSource: "RCSB PDB",
    structureId: "1BNA",
    structureFormat: "pdb",
    structureUrl:
      "https://files.rcsb.org/download/1BNA.pdb",
    sourceUrl:
      "https://www.rcsb.org/structure/1BNA",
    status: "ready",
    scientificStatus: "experimental",
    modes: [
      "structure",
      "components",
      "microscopic",
      "mechanism",
    ],
  },

  {
    id: "rna-polymerase",
    name: "RNA Polymerase",
    shortName: "RNA Polymerase",
    category: "Molecular Biology",
    status: "planned",
  },

  {
    id: "ribosome",
    name: "Ribosome",
    shortName: "Ribosome",
    category: "Molecular Biology",
    status: "planned",
  },

  {
    id: "atp-synthase",
    name: "ATP Synthase",
    shortName: "ATP Synthase",
    category: "Molecular Biology",
    status: "planned",
  },

  {
    id: "hemoglobin",
    name: "Hemoglobin",
    shortName: "Hemoglobin",
    category: "Molecular Biology",
    status: "planned",
  },
];

export function getFlagshipModel(modelId) {
  return FLAGSHIP_MODELS.find(
    (model) => model.id === modelId
  );
}

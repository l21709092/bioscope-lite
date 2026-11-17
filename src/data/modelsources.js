
export const MODEL_SOURCES = {
  rcsb: {
    id: "rcsb",
    name: "RCSB Protein Data Bank",
    type: "molecular",
    searchEnabled: true,
    formats: ["cif", "bcif", "pdb"],
    license: "CC0",
  },

  alphafold: {
    id: "alphafold",
    name: "AlphaFold Database",
    type: "predicted-protein",
    searchEnabled: true,
    formats: ["cif", "pdb"],
    license: "CC-BY-4.0",
  },

  pubchem: {
    id: "pubchem",
    name: "PubChem",
    type: "chemical",
    searchEnabled: true,
    formats: ["sdf", "mol"],
    license: "Check individual record/source",
  },

  nih3d: {
    id: "nih3d",
    name: "NIH 3D",
    type: "biomedical-mesh",
    searchEnabled: false,
    formats: ["glb", "gltf", "stl", "x3d"],
    license: "Check individual model",
  },
};

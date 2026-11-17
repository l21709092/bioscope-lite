
const LEARNING_CONTENT = {
  dna: {
    title: "DNA — Deoxyribonucleic Acid",
    description:
      "DNA stores hereditary information in living organisms. Its double-stranded structure consists of two complementary nucleotide chains.",
    function:
      "DNA provides the instructions used for growth, development, functioning and reproduction.",
    concepts: [
      "Complementary base pairing",
      "DNA replication",
      "Transcription",
      "Mutations",
      "Chromosomes",
    ],
  },

  rna: {
    title: "RNA — Ribonucleic Acid",
    description:
      "RNA is a nucleic acid involved in gene expression and protein synthesis. Different RNA molecules perform different cellular roles.",
    function:
      "RNA helps transfer, interpret and regulate genetic information.",
    concepts: [
      "Messenger RNA",
      "Transfer RNA",
      "Ribosomal RNA",
      "RNA processing",
      "Gene expression",
    ],
  },

  proteins: {
    title: "Proteins",
    description:
      "Proteins are biological macromolecules made from amino acid chains that fold into specific three-dimensional structures.",
    function:
      "Proteins perform structural, transport, signalling, immune and catalytic functions.",
    concepts: [
      "Amino acids",
      "Protein folding",
      "Protein domains",
      "Primary structure",
      "Quaternary structure",
    ],
  },

  enzymes: {
    title: "Enzymes",
    description:
      "Enzymes are biological catalysts that accelerate chemical reactions by lowering activation energy.",
    function:
      "Enzymes help regulate and accelerate the chemical reactions necessary for life.",
    concepts: [
      "Active sites",
      "Substrate binding",
      "Activation energy",
      "Enzyme inhibition",
      "Catalysis",
    ],
  },

  complexes: {
    title: "Molecular Complexes",
    description:
      "Molecular complexes are assemblies of multiple interacting biological molecules that work together.",
    function:
      "They perform coordinated processes such as protein synthesis, energy conversion and gene regulation.",
    concepts: [
      "Ribosomes",
      "ATP synthase",
      "Spliceosomes",
      "Nucleosomes",
      "Protein interactions",
    ],
  },

  metabolites: {
    title: "Metabolites",
    description:
      "Metabolites are small molecules produced, transformed or consumed during cellular chemical reactions.",
    function:
      "They participate in energy production, biosynthesis and metabolic regulation.",
    concepts: [
      "ATP",
      "Glucose",
      "Amino acids",
      "Nucleotides",
      "Coenzymes",
    ],
  },
};

export default function MolecularLearningPanel({ model }) {
  const content = LEARNING_CONTENT[model?.category] || {
    title: "Molecular structure",
    description:
      "Explore this structure and its biological context using the available scientific information.",
    function:
      "The precise biological role depends on the identity and context of this structure.",
    concepts: [
      "Molecular structure",
      "Biological interactions",
      "Structure and function",
    ],
  };

  return (
    <section className="molecular-learning-panel">
      <span className="learning-eyebrow">
        BIOLOGY LEARNING PANEL
      </span>

      <h2>{content.title}</h2>

      <h3>Overview</h3>
      <p>{content.description}</p>

      <h3>Biological function</h3>
      <p>{content.function}</p>

      <h3>Related concepts</h3>

      <div className="learning-concepts">
        {content.concepts.map((concept) => (
          <span key={concept}>{concept}</span>
        ))}
      </div>

      <p className="learning-disclaimer">
        General educational information. Consult the original
        structure database record for structure-specific details.
      </p>
    </section>
  );
}

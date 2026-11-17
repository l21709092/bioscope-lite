
export const DNA_MECHANISM = {
  id: "dna-unwinding",
  title: "DNA Unwinding and Replication",
  description:
    "Explore how DNA strands separate and provide templates for complementary DNA synthesis.",

  stages: [
    {
      id: 1,
      title: "Double Helix",
      description:
        "DNA exists as two complementary strands arranged in a double helix.",
      action: "show-helix",
    },

    {
      id: 2,
      title: "Helix Unwinding",
      description:
        "Helicase helps unwind the DNA double helix by disrupting interactions between complementary base pairs.",
      action: "unwind",
    },

    {
      id: 3,
      title: "Strand Separation",
      description:
        "The two DNA strands separate and expose their nucleotide sequences.",
      action: "separate-strands",
    },

    {
      id: 4,
      title: "Complementary Pairing",
      description:
        "DNA polymerases add complementary nucleotides using each original strand as a template.",
      action: "pair-nucleotides",
    },

    {
      id: 5,
      title: "New DNA Molecules",
      description:
        "Replication produces two DNA molecules, each containing one original strand and one newly synthesised strand.",
      action: "complete-replication",
    },
  ],
};


export const DNA_COMPONENTS = [
  {
    id: "strand-a",
    name: "DNA Strand A",
    group: "Backbone",
    description:
      "One of the two antiparallel nucleotide strands forming the DNA double helix.",
    function:
      "Carries a sequence of nucleotides that pairs with the complementary strand.",
    detailLevel: 1,
  },

  {
    id: "strand-b",
    name: "DNA Strand B",
    group: "Backbone",
    description:
      "The complementary nucleotide strand running in the opposite direction.",
    function:
      "Provides the complementary sequence used in DNA replication and information storage.",
    detailLevel: 1,
  },

  {
    id: "sugar-phosphate",
    name: "Sugar-Phosphate Backbone",
    group: "Backbone",
    description:
      "The repeating deoxyribose sugar and phosphate arrangement along the outside of DNA.",
    function:
      "Provides structural support and connects adjacent nucleotides.",
    detailLevel: 2,
  },

  {
    id: "adenine",
    name: "Adenine (A)",
    group: "Nitrogenous Bases",
    description:
      "A purine nitrogenous base found in DNA.",
    function:
      "Pairs with thymine through two hydrogen bonds in standard Watson-Crick base pairing.",
    detailLevel: 2,
  },

  {
    id: "thymine",
    name: "Thymine (T)",
    group: "Nitrogenous Bases",
    description:
      "A pyrimidine nitrogenous base found in DNA.",
    function:
      "Pairs with adenine through two hydrogen bonds.",
    detailLevel: 2,
  },

  {
    id: "guanine",
    name: "Guanine (G)",
    group: "Nitrogenous Bases",
    description:
      "A purine nitrogenous base found in DNA.",
    function:
      "Pairs with cytosine through three hydrogen bonds.",
    detailLevel: 2,
  },

  {
    id: "cytosine",
    name: "Cytosine (C)",
    group: "Nitrogenous Bases",
    description:
      "A pyrimidine nitrogenous base found in DNA.",
    function:
      "Pairs with guanine through three hydrogen bonds.",
    detailLevel: 2,
  },

  {
    id: "hydrogen-bonds",
    name: "Hydrogen Bonds",
    group: "Interactions",
    description:
      "Non-covalent interactions between complementary DNA bases.",
    function:
      "Help stabilise the double helix while allowing the strands to separate when needed.",
    detailLevel: 3,
  },

  {
    id: "nucleotide",
    name: "Nucleotide",
    group: "Building Blocks",
    description:
      "The basic building block of a DNA strand, consisting of a phosphate group, deoxyribose sugar and nitrogenous base.",
    function:
      "Nucleotides join together to form the DNA polymer.",
    detailLevel: 3,
  },
];

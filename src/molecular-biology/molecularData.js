export const dnaComponents = [
  {
    id: "backbone",
    name: "Sugar-phosphate backbone",
    short: "The two outside rails",
    simple: "Sugar and phosphate groups alternate to form the strong outside rails of each DNA strand.",
    function: "The backbone holds each DNA strand together and keeps its bases in a stable order.",
    properties: "Alternating deoxyribose sugars and phosphate groups; neighboring nucleotides are joined by phosphodiester bonds. The two strands run in opposite directions.",
    science: "Each strand has deoxyribose sugars linked by phosphodiester bonds between the 3′ hydroxyl and 5′ phosphate groups. The strands run antiparallel."
  },
  {
    id: "adenine",
    name: "Adenine (A)",
    short: "Pairs with thymine",
    simple: "Adenine is one of DNA’s four letter-like bases. It pairs with thymine.",
    function: "Adenine is one of the information-carrying bases in DNA and pairs with thymine on the opposite strand.",
    properties: "A purine base with two joined rings. In DNA, it forms two hydrogen bonds with thymine.",
    science: "Adenine is a purine nucleobase. In canonical B-DNA it forms two hydrogen bonds with thymine."
  },
  {
    id: "thymine",
    name: "Thymine (T)",
    short: "Pairs with adenine",
    simple: "Thymine pairs with adenine across the middle of the DNA ladder.",
    function: "Thymine is one of DNA’s four information-carrying bases and pairs with adenine.",
    properties: "A pyrimidine base with one ring. It forms two hydrogen bonds with adenine in a standard DNA base pair.",
    science: "Thymine is a pyrimidine nucleobase. Its Watson–Crick edge pairs with adenine through two hydrogen bonds."
  },
  {
    id: "guanine",
    name: "Guanine (G)",
    short: "Pairs with cytosine",
    simple: "Guanine pairs with cytosine. Together, the pairs hold the two DNA strands together.",
    function: "Guanine is one of DNA’s four information-carrying bases and pairs with cytosine.",
    properties: "A purine base with two joined rings. In a standard DNA base pair, it forms three hydrogen bonds with cytosine.",
    science: "Guanine is a purine nucleobase. In canonical B-DNA it forms three hydrogen bonds with cytosine."
  },
  {
    id: "cytosine",
    name: "Cytosine (C)",
    short: "Pairs with guanine",
    simple: "Cytosine pairs with guanine, matching the shape and bonding pattern on the other strand.",
    function: "Cytosine is one of DNA’s four information-carrying bases and pairs with guanine.",
    properties: "A pyrimidine base with one ring. It forms three hydrogen bonds with guanine in a standard DNA base pair.",
    science: "Cytosine is a pyrimidine nucleobase. Its Watson–Crick edge pairs with guanine through three hydrogen bonds."
  },
  {
    id: "hydrogenBonds",
    name: "Hydrogen bonds",
    short: "Weak links between bases",
    simple: "Small attractions between matching bases help hold the strands together while still letting them separate.",
    function: "These attractions help matching bases recognize each other and stabilize the two-strand DNA ladder.",
    properties: "A–T pairs have two and G–C pairs have three hydrogen bonds. These are weaker than the covalent bonds in each backbone, so strands can separate when needed.",
    science: "Watson–Crick A–T pairs have two and G–C pairs have three hydrogen bonds. The displayed connectors are inferred from the deposited atom coordinates."
  },
  {
    id: "nucleotide",
    name: "Nucleotide",
    short: "One DNA building block",
    simple: "A nucleotide combines one sugar, one phosphate and one base—the three parts needed to add a letter to a strand.",
    function: "Nucleotides are the repeating building blocks that form DNA and carry its base sequence.",
    properties: "Each DNA nucleotide contains deoxyribose sugar, a phosphate group and one base: A, T, G or C.",
    science: "A DNA nucleotide contains 2′-deoxyribose, a phosphate group and one of four nucleobases. Neighboring nucleotides are joined in the strand backbone."
  },
  {
    id: "basePair",
    name: "Complementary base pair",
    short: "A matching rung",
    simple: "Each rung has one matching pair: A with T, or G with C.",
    function: "Complementary pairing lets each DNA strand act as a pattern for copying the other strand.",
    properties: "A pairs with T and G pairs with C. Each pair combines one larger purine with one smaller pyrimidine, keeping the helix close to a consistent width.",
    science: "Watson–Crick complementarity pairs a purine with a pyrimidine, maintaining a nearly uniform helix width."
  }
];

export const dnaLearningSections = [
  {
    title: "DNA is a twisted ladder",
    label: "The double helix",
    simple: "Imagine a ladder twisted into a spiral. The two outside rails are sugar and phosphate; the rungs are pairs of bases.",
    science: "DNA is usually a double-stranded, right-handed B-form helix. Its sugar-phosphate backbones are on the outside and paired bases stack inside.",
    check: "Which parts form the outside rails of the DNA ladder?",
    options: ["Sugar and phosphate", "A and T bases", "Hydrogen bonds only"],
    correct: 0
  },
  {
    title: "Four bases carry the sequence",
    label: "A, T, G and C",
    simple: "DNA uses four chemical letters: A, T, G and C. Their order stores information, like letters in a recipe.",
    science: "The nucleobases are adenine, thymine, guanine and cytosine. Each is attached to deoxyribose to form a nucleoside; adding phosphate makes a nucleotide.",
    check: "Which four letters are used in DNA?",
    options: ["A, T, G and C", "A, U, G and C", "A, T, U and G"],
    correct: 0
  },
  {
    title: "Bases pair by a pattern",
    label: "Complementary pairing",
    simple: "A fits with T, and G fits with C. If you know one strand, you can work out its partner.",
    science: "Watson–Crick base pairing is A–T and G–C. Hydrogen bonding and base stacking both contribute to duplex stability.",
    check: "What is the complementary DNA sequence for A-G-T-C?",
    options: ["T-C-A-G", "A-G-T-C", "U-C-A-G"],
    correct: 0
  },
  {
    title: "DNA can be copied",
    label: "Replication",
    simple: "The strands unzip. Each old strand helps guide a new matching strand, like using each half of a zip as a pattern.",
    science: "DNA replication is semiconservative. Primase makes RNA primers, and DNA polymerases extend new DNA 5′ to 3′ from those primers.",
    check: "Why does each original DNA strand matter during copying?",
    options: ["It acts as a template for a complementary strand", "It turns directly into protein", "It becomes a ribosome"],
    correct: 0
  },
  {
    title: "DNA instructions can be used",
    label: "From DNA to protein",
    simple: "A cell first copies a gene into RNA. A ribosome reads the RNA message and joins amino acids into a protein.",
    science: "RNA polymerase transcribes DNA into RNA. During translation, ribosomal RNA and proteins form the ribosome, tRNAs decode mRNA codons, and peptide bonds link amino acids.",
    check: "Which molecule carries a copied gene message to a ribosome?",
    options: ["Messenger RNA", "A second DNA backbone", "A phospholipid"],
    correct: 0
  }
];

export const structureCards = [
  { id: "dna", name: "DNA double helix", category: "Nucleic acid", description: "Explore the deposited B-DNA structure, complementary bases and inferred hydrogen-bond contacts.", accent: "#6f8eff" },
  { id: "rna", name: "RNA", category: "Nucleic acid", description: "See a single-stranded RNA schematic with a hairpin and learn how RNA differs from DNA.", accent: "#62d6be" },
  { id: "ribosome", name: "Ribosome", category: "Molecular machine", description: "Explore the large and small subunits, mRNA path and tRNA positions during translation.", accent: "#eaa965" },
  { id: "atp", name: "ATP synthase", category: "Molecular machine", description: "Follow the rotating rotor and stationary stator that couple a proton gradient to ATP production.", accent: "#ca89ec" },
  { id: "membrane", name: "Cell membrane", category: "Cell structure", description: "Inspect a phospholipid bilayer and its hydrophilic heads and hydrophobic tails.", accent: "#ee8193" }
];

export const molecularQuiz = [
  { topic: "DNA structure", level: "Basic", prompt: "Which DNA parts form the outside rails of the double helix?", options: ["Sugar and phosphate", "Hydrogen bonds", "A and T bases"], answer: 0, explain: "Alternating sugar and phosphate groups form each strand’s backbone." },
  { topic: "DNA structure", level: "Basic", prompt: "Which base pairs with adenine in DNA?", options: ["Thymine", "Cytosine", "Guanine"], answer: 0, explain: "In DNA, adenine pairs with thymine." },
  { topic: "DNA structure", level: "Basic", prompt: "Which base pair forms three hydrogen bonds?", options: ["Guanine–cytosine", "Adenine–thymine", "Adenine–cytosine"], answer: 0, explain: "Canonical G–C pairs form three hydrogen bonds; A–T pairs form two." },
  { topic: "DNA structure", level: "Intermediate", prompt: "What does antiparallel mean for the two DNA strands?", options: ["They run in opposite 5′ to 3′ directions", "They have identical sequences", "They contain different kinds of sugar"], answer: 0, explain: "One strand runs 5′ to 3′ while its partner runs 3′ to 5′." },
  { topic: "DNA structure", level: "Intermediate", prompt: "A nucleotide contains which three parts?", options: ["Sugar, phosphate and base", "Two bases and a protein", "Ribosome, sugar and lipid"], answer: 0, explain: "A DNA nucleotide consists of deoxyribose, phosphate and a nucleobase." },
  { topic: "Replication", level: "Basic", prompt: "During semiconservative replication, what happens to each original strand?", options: ["It guides the sequence of a new partner strand", "It is discarded immediately", "It is translated into amino acids"], answer: 0, explain: "Each parental strand serves as a template for a newly synthesized complementary strand." },
  { topic: "Replication", level: "Intermediate", prompt: "Why does DNA polymerase need a primer?", options: ["It needs an existing 3′ end to extend", "It uses a primer to unwind the helix", "It uses a primer to build amino acids"], answer: 0, explain: "DNA polymerases extend an existing strand; primase first makes a short RNA primer." },
  { topic: "Replication", level: "Advanced", prompt: "In which direction does a DNA polymerase extend a new DNA strand?", options: ["5′ to 3′", "3′ to 5′", "In both directions along the same new strand"], answer: 0, explain: "New nucleotides are added to the 3′ end, so synthesis proceeds 5′ to 3′." },
  { topic: "Transcription", level: "Basic", prompt: "Which enzyme builds an RNA transcript from a DNA template?", options: ["RNA polymerase", "DNA ligase", "ATP synthase"], answer: 0, explain: "RNA polymerase reads a DNA template strand and synthesizes a complementary RNA molecule." },
  { topic: "Transcription", level: "Intermediate", prompt: "What base is used in RNA in place of thymine?", options: ["Uracil", "Cytosine", "Guanine"], answer: 0, explain: "RNA uses uracil (U) where DNA uses thymine (T)." },
  { topic: "Translation", level: "Basic", prompt: "What does a ribosome read during translation?", options: ["mRNA codons", "DNA phosphates", "A membrane gradient"], answer: 0, explain: "The ribosome moves along mRNA and reads its codons." },
  { topic: "Translation", level: "Intermediate", prompt: "How does a tRNA help match an amino acid to an mRNA codon?", options: ["Its anticodon pairs with the codon", "It copies the DNA backbone", "It makes a hydrogen bond between DNA strands"], answer: 0, explain: "A tRNA anticodon pairs with a complementary mRNA codon and carries a particular amino acid." },
  { topic: "Molecular machines", level: "Intermediate", prompt: "What powers the rotation of ATP synthase’s rotor?", options: ["Proton flow down an electrochemical gradient", "Base pairing in DNA", "The ribosome reading a codon"], answer: 0, explain: "Protons flowing through the membrane-embedded part drive rotation, which helps the catalytic region make ATP." },
  { topic: "Cell membrane", level: "Basic", prompt: "Which part of a phospholipid faces the watery surroundings?", options: ["Its hydrophilic head", "Its hydrophobic tails", "Its peptide bond"], answer: 0, explain: "The hydrophilic head interacts with water; hydrophobic tails face inward in the bilayer." },
  { topic: "Sequence reasoning", level: "Advanced", prompt: "If a DNA template triplet is 3′-TAC-5′, which mRNA codon is made?", options: ["5′-AUG-3′", "5′-TAC-3′", "5′-UAC-3′"], answer: 0, explain: "RNA is synthesized antiparallel and complementary to the DNA template; T pairs with A, A with U, and C with G." }
];

export const flowerParts = [
  {
    id: "petal", name: "Petal", scientificName: "Petal (corolla)", classification: "Corolla · non-reproductive floral organ",
    color: "#d76b8a", function: "The petals form the corolla. Their color, shape and scent can help attract animal pollinators to the flower."
  },
  {
    id: "sepal", name: "Sepal", scientificName: "Sepal (calyx)", classification: "Calyx · protective floral organ",
    color: "#578960", function: "The sepals form the calyx and protect the developing flower bud. They can also support the open flower."
  },
  {
    id: "anther", name: "Anther", scientificName: "Anther", classification: "Stamen · male reproductive organ",
    color: "#c18a3d", function: "The anther contains pollen sacs. Each pollen grain carries the male gametophyte, which can deliver sperm cells to an ovule."
  },
  {
    id: "filament", name: "Filament", scientificName: "Filament", classification: "Stamen · male reproductive organ",
    color: "#e2bd78", function: "The filament is the slender stalk that holds an anther where pollen can be released and picked up by a pollinator."
  },
  {
    id: "stigma", name: "Stigma", scientificName: "Stigma", classification: "Pistil / carpel · female reproductive organ",
    color: "#9caf66", function: "The stigma is the pollen-receiving surface. Its sticky surface can trap compatible pollen grains."
  },
  {
    id: "style", name: "Style", scientificName: "Style", classification: "Pistil / carpel · female reproductive organ",
    color: "#829b5c", function: "The style connects the stigma to the ovary. A pollen tube grows through its tissue toward an ovule."
  },
  {
    id: "ovary", name: "Ovary", scientificName: "Ovary", classification: "Pistil / carpel · female reproductive organ",
    color: "#a3a94f", function: "The ovary encloses one or more ovules. After fertilization, the ovary often develops into a fruit."
  },
  {
    id: "ovule", name: "Ovule", scientificName: "Ovule", classification: "Integumented megasporangium · seed precursor",
    color: "#86b77a", function: "An ovule contains the female gametophyte, including the egg cell. After fertilization, it develops into a seed."
  },
  {
    id: "receptacle", name: "Receptacle", scientificName: "Receptacle (thalamus)", classification: "Floral axis · supporting tissue",
    color: "#607b46", function: "The receptacle is the expanded end of the flower stalk. It supports and attaches the floral organs."
  }
];

export const flowerMemoryHooks = {
  petal: "Petals pull pollinators toward the flower.",
  sepal: "Sepals shield the developing flower bud.",
  anther: "Anther = pollen factory: its sacs make pollen grains.",
  filament: "The filament holds the anther up for pollen release.",
  stigma: "Sticky Stigma catches pollen like Velcro.",
  style: "SSO: Sticky Stigma, Long Style, Round Ovary.",
  ovary: "Ovary becomes fruit after fertilization.",
  ovule: "Ovule becomes seed after fertilization.",
  receptacle: "Receptacle receives and supports the flower parts."
};

export const flowerFocusPoints = {
  petal: [1.05, 1.22, 0.32], sepal: [1.2, 0.66, 0.25],
  anther: [0.62, 2.48, 0], filament: [0.4, 1.9, 0],
  stigma: [0, 2.75, 0], style: [0.01, 2.05, 0.08],
  ovary: [0, 0.98, 0.3], ovule: [0.04, 0.91, 0.35], receptacle: [0, 0.5, 0]
};

export const pollinationPhases = [
  {
    id: "pollination", name: "Pollination", duration: 4,
    simple: "Pollen moves from an anther and lands on the sticky stigma. Wind or an animal visitor can carry it.",
    science: "Pollination is the transfer of pollen to a stigma. A pollen grain must be compatible with the flower to germinate."
  },
  {
    id: "germination", name: "Germination & tube growth", duration: 5,
    simple: "A pollen grain germinates. A tiny pollen tube grows down through the style toward an ovule in the ovary.",
    science: "The pollen tube grows through tissues of the stigma and style. It carries two sperm cells toward the female gametophyte."
  },
  {
    id: "fertilization", name: "Double fertilization", duration: 5,
    simple: "Inside an ovule, one sperm joins the egg. The other joins the central cell. These two fusions begin the seed and its food supply.",
    science: "In angiosperms, one sperm nucleus fuses with the egg to form a diploid zygote. The other fuses with the central cell nuclei, usually forming triploid endosperm."
  }
];

export const flowerQuestions = [
  { prompt: "Which flower part receives pollen?", answers: ["Stigma", "Anther", "Sepal"], correct: 0, note: "The stigma is the pollen-receiving surface at the top of the pistil." },
  { prompt: "Where are pollen grains made?", answers: ["Ovary", "Anther", "Receptacle"], correct: 1, note: "Pollen sacs inside anthers produce pollen grains." },
  { prompt: "What grows from a germinating pollen grain?", answers: ["A pollen tube", "A new petal", "A root"], correct: 0, note: "The pollen tube grows through the style toward an ovule." },
  { prompt: "What does an ovule usually become after fertilization?", answers: ["A seed", "A sepal", "A pollen sac"], correct: 0, note: "The fertilized ovule develops into a seed; the ovary often develops into a fruit." },
  { prompt: "Why is angiosperm fertilization called double fertilization?", answers: ["Two pollen grains land on the stigma", "Two sperm cells fuse with different cells", "Two ovules grow in every flower"], correct: 1, note: "One sperm fuses with the egg; the second fuses with the central cell to start endosperm development." }
];

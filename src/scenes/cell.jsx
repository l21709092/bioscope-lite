import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowUp, BookOpen, Check, ChevronLeft, ChevronRight, Eye, EyeOff, HelpCircle, Pause, Play, RotateCcw, Tag, ZoomIn, ZoomOut } from "lucide-react";
import WBCCell3D from "./WBCCell3D";
import WBCJourney3D from "./WBCJourney3D";
import WBCProcess3D from "./WBCProcess3D";
import "./cell.css";

const wbcTypes = {
  neutrophil: {
    name: "Neutrophil", short: "Rapid responder", color: "#71d6c4",
    hook: "NEUTRO = NEUTRALISE the enemy!",
    simple: "Like a fast-moving clean-up guard, a neutrophil is often among the first defenders to arrive. It surrounds and swallows many invading microbes.",
    science: "Neutrophils are short-lived innate immune granulocytes. They migrate toward inflammatory signals and can phagocytose microbes.",
    morphology: "Medium-sized granulocyte with a segmented, usually 3–5-lobed nucleus.",
    nucleus: "Segmented into several connected lobes.",
    granules: "Numerous fine, pale granules in the cytoplasm.",
    function: "A rapid innate immune responder that can engulf and destroy microbes, especially bacteria and fungi.",
    difference: "Its segmented nucleus and fine granules distinguish it from the other types shown."
  },
  lymphocyte: {
    name: "Lymphocyte", short: "Targeted defence", color: "#9b8af5",
    hook: "LYMPH = LOCK ON to the enemy!",
    simple: "Think of B-cell antibodies as matching keys for a target. Helper T cells coordinate the response, cytotoxic T cells destroy infected cells, and memory cells help the body respond faster next time.",
    science: "B and T lymphocytes are adaptive immune cells with antigen-specific receptors. B cells can differentiate into antibody-secreting plasma cells; helper, cytotoxic and memory T-cell subsets have distinct roles.",
    morphology: "Often a large, nearly round nucleus surrounded by a narrow rim of cytoplasm.",
    nucleus: "Large, round nucleus occupying most of the cell.",
    granules: "Usually few visible granules in a small lymphocyte; some lymphocytes, such as NK cells, are granular.",
    function: "Lymphocytes include B cells, T cells and NK cells, which contribute different forms of adaptive and innate immune defence.",
    difference: "The large nucleus and scant cytoplasm are characteristic; lymphocytes are a diverse group, not one single mechanism."
  },
  monocyte: {
    name: "Monocyte", short: "Clean-up reinforcement", color: "#67b9e8",
    hook: "MONO = MOVES IN, cleans up!",
    simple: "Like a repair and clean-up crew, some monocytes leave the blood, enter tissues and become macrophages. These larger cells can eat microbes and clear debris.",
    science: "Circulating monocytes can enter tissues and differentiate into macrophages or related cells in response to local cues. Many tissue macrophages also have other developmental origins.",
    morphology: "Large cell with abundant gray-blue cytoplasm and a folded or kidney-shaped nucleus.",
    nucleus: "Indented, folded or kidney-shaped.",
    granules: "Fine azurophilic granules may be present in the abundant cytoplasm.",
    function: "Can engulf material and present antigens; after entering tissues, some monocytes can differentiate into macrophages or related cells.",
    difference: "Its large size, abundant cytoplasm and folded nucleus contrast with the compact lymphocyte."
  },
  eosinophil: {
    name: "Eosinophil", short: "Parasite defence", color: "#f3a75d",
    hook: "EOSINO = ENEMY of parasites!",
    simple: "Like a team using special packets, eosinophils release granule contents to damage some large parasites. They can also take part in allergic inflammation.",
    science: "Eosinophils are granulocytes whose secretory granules can damage certain parasites and contribute to type 2 inflammation and allergic disease.",
    morphology: "Granulocyte with a characteristic bilobed nucleus and conspicuous orange-red granules.",
    nucleus: "Typically two lobes joined by a narrow bridge.",
    granules: "Large, coarse granules that stain orange-red in common blood-smear stains.",
    function: "Contributes to defence against some parasites and participates in allergic inflammation.",
    difference: "The prominent orange-red granules and bilobed nucleus are its most recognizable features."
  },
  basophil: {
    name: "Basophil", short: "The alarm system", color: "#d77ac4",
    hook: "BASO = BLAST the alarm!",
    simple: "Like an alarm bell, basophils release histamine to warn nearby tissue. This can make blood vessels widen and become leakier during some inflammatory and allergic responses.",
    science: "Basophils are rare granulocytes that can degranulate and release histamine and other mediators, influencing vascular permeability and allergic inflammation.",
    morphology: "Rare granulocyte with coarse, dark blue-purple granules that can partly obscure the nucleus.",
    nucleus: "Usually bilobed or S-shaped, though granules may obscure its outline.",
    granules: "Large, coarse, dark granules containing inflammatory mediators such as histamine.",
    function: "Releases mediators involved in allergic and inflammatory responses.",
    difference: "Its coarse dark granules often obscure the nucleus; basophils are not typically described as phagocytes."
  }
};

const cellOrder = ["neutrophil", "lymphocyte", "monocyte", "eosinophil", "basophil"];
const structureInfo = {
  membrane: {
    name: "Cell membrane",
    function: "Boundary and selective interface",
    description: "A flexible outer boundary that helps the cell sense its surroundings.",
    science: "The phospholipid bilayer and its proteins regulate transport, adhesion and signalling."
  },
  cytoplasm: {
    name: "Cytoplasm",
    function: "Interior space for cellular activity",
    description: "The gel-like inside of the cell, where its parts are held.",
    science: "Cytosol and organelles occupy the space between the plasma membrane and nucleus; its volume differs among WBC types."
  },
  nucleus: {
    name: "Nucleus",
    function: "Stores the cell's genetic material",
    description: "The control room that holds the cell's genetic instructions. Its shape is a clue to the cell type.",
    science: "The nucleus contains genomic DNA; its lobulation and chromatin pattern are characteristic morphology features."
  },
  granules: {
    name: "Granules",
    function: "Specialized contents for cell-specific roles",
    description: "Tiny storage packets. Some cells use them to release helpful chemicals; different WBCs have different granules.",
    science: "Granules are membrane-bound secretory or lysosomal compartments. Their abundance and contents vary by cell type; not all WBCs are granulocytes."
  },
  lysosomes: {
    name: "Lysosomes",
    function: "Digest material inside the cell after it has been engulfed.",
    description: "Small digestive sacs that join with a phagosome and help break down a swallowed microbe.",
    science: "Acidic, enzyme-rich vesicles fuse with phagosomes and other endosomal compartments to digest their contents."
  },
  antigenReceptors: {
    name: "B-cell receptors",
    function: "Recognize a matching antigen and help activate a B cell.",
    description: "Matching sensors on a B cell's surface. When the right antigen fits, the B cell can receive an activation signal.",
    science: "Membrane-bound immunoglobulin receptors bind specific antigen and signal with associated proteins."
  }
};

const commonStructureKeys = ["membrane", "cytoplasm", "nucleus", "granules", "lysosomes"];

const demoStages = {
  neutrophil: [
    "An infected tissue and immune cells release chemical signals that form a gradient. Bacteria do not attract neutrophils like magnets.",
    "Selectins help the neutrophil slow down and roll along the vessel lining.",
    "Activated integrins grip adhesion molecules on the endothelial surface for firm attachment.",
    "The neutrophil changes shape and squeezes between endothelial cells into the tissue.",
    "It follows a chemical gradient from infected tissue and immune signals toward the microbes.",
    "It recognizes, surrounds and engulfs a bacterium in a phagosome; lysosomes help digest it."
  ],
  lymphocyte: [
    "A B cell with a matching receptor recognizes an antigen. B cells and T cells have different jobs.",
    "Signals activate the matching B cell and it multiplies.",
    "Some activated B cells become plasma cells that release antibodies.",
    "Antibodies bind matching antigens; this does not mean every lymphocyte attacks bacteria directly.",
    "Helper T cells coordinate the response, cytotoxic T cells kill infected cells, and memory B and T cells help the body respond faster next time. These are distinct lymphocyte jobs."
  ],
  monocyte: [
    "A monocyte travels in blood and responds to signals near changed or inflamed tissue.",
    "It crosses the vessel lining and enters the tissue. This movement is called diapedesis.",
    "Local signals can help some monocytes differentiate into macrophages.",
    "Macrophages can engulf microbes and clear dead cells and debris."
  ],
  eosinophil: [
    "An eosinophil recognizes cues associated with a large parasite that is difficult to engulf whole.",
    "It moves close and attaches to the parasite's surface.",
    "It releases granule contents onto the attached parasite.",
    "Granule proteins can damage some parasites. Eosinophils also participate in allergic inflammation."
  ],
  basophil: [
    "An activated basophil responds to immune signals, including some allergic triggers.",
    "Its granules move toward the cell surface.",
    "Degranulation releases histamine and other inflammatory mediators.",
    "Histamine acts like an alarm: nearby vessels can widen and become more permeable."
  ]
};

const demoStageTitles = {
  neutrophil: ["Detect", "Roll", "Grab", "Squeeze", "Follow", "Engulf & digest"],
  lymphocyte: ["Recognize", "Activate", "Make antibodies", "Bind target", "T cells & memory"],
  monocyte: ["Travel in blood", "Enter tissue", "Become macrophage", "Clear debris"],
  eosinophil: ["Recognize parasite", "Attach", "Release granules", "Damage parasite"],
  basophil: ["Activate", "Move granules", "Release histamine", "Vessel response"]
};

const journeyStages = [
  { title: "Infection alarm", cue: "ALARM", detail: "Bacteria enter tissue. Nearby cells and immune responses release signals that spread outward like a scent trail." },
  { title: "Slow and roll", cue: "ROLL", detail: "Brief sticky contacts slow the neutrophil so it can roll along the vessel lining, like a ball brushing past a rough wall." },
  { title: "Grab and hold", cue: "GRAB", detail: "Stronger handholds help the neutrophil stop at the right place on the vessel wall." },
  { title: "Squeeze into tissue", cue: "SQUEEZE", detail: "The neutrophil changes shape and squeezes through a small gap between the vessel-lining cells." },
  { title: "Follow chemical signals", cue: "FOLLOW", detail: "The neutrophil follows a trail of stronger chemical signals toward infected tissue; the bacteria do not pull it like magnets." },
  { title: "Engulf and digest", cue: "EAT → DESTROY", detail: "The neutrophil stretches its edge around a bacterium and seals it inside a small pouch. Digestive sacs join the pouch and help break the microbe down." }
];

const quizQuestions = [
  { id: "segmented-nucleus", topic: "Cell identification", subtopic: "Morphology", level: "Basic", prompt: "Which white blood cell often has a nucleus with several connected lobes?", options: ["Neutrophil", "Lymphocyte", "Basophil", "Monocyte"], correctOptionId: "a", explanation: "A neutrophil usually has a segmented nucleus with about three to five lobes." },
  { id: "granulocytes", topic: "Cell identification", subtopic: "Cell structures", level: "Intermediate", prompt: "Which group includes the three granulocytes in this module?", options: ["Neutrophil, eosinophil and basophil", "Lymphocyte, monocyte and neutrophil", "B cell, T cell and monocyte", "Monocyte, eosinophil and lymphocyte"], correctOptionId: "a", explanation: "Neutrophils, eosinophils and basophils are granulocytes, named for their cytoplasmic granules." },
  { id: "innate-response", topic: "Immune response", subtopic: "Innate immunity", level: "Basic", prompt: "Which cell is often among the first defenders to arrive during many bacterial infections?", options: ["Neutrophil", "Memory B cell", "Eosinophil", "Basophil"], correctOptionId: "a", explanation: "Neutrophils are rapid innate responders and can engulf many microbes." },
  { id: "phagocytosis", topic: "Immune response", subtopic: "Phagocytosis", level: "Basic", prompt: "What happens during phagocytosis?", options: ["A cell surrounds and takes material inside", "An antibody becomes a bacterium", "A cell releases oxygen into blood", "A vessel closes permanently"], correctOptionId: "a", explanation: "During phagocytosis, a cell membrane surrounds material and encloses it in a vesicle called a phagosome." },
  { id: "chemotaxis", topic: "Immune response", subtopic: "Chemotaxis", level: "Intermediate", prompt: "What guides a neutrophil toward an infection site?", options: ["A chemical gradient made by infected tissue and immune responses", "Bacteria pulling it like magnets", "Random movement only", "A direct connection between the cell and the skin"], correctOptionId: "a", explanation: "Signals from infected tissue and immune responses form chemical gradients. Neutrophils can move toward stronger signals." },
  { id: "diapedesis", topic: "Immune response", subtopic: "Diapedesis", level: "Intermediate", prompt: "What is diapedesis?", options: ["A white blood cell squeezing through a vessel wall", "An antibody binding an antigen", "A bacterium splitting in two", "A nucleus dividing into lobes"], correctOptionId: "a", explanation: "Diapedesis is the passage of a blood cell through the vessel lining into tissue." },
  { id: "b-cell", topic: "Lymphocytes", subtopic: "Antibodies", level: "Basic", prompt: "Which lymphocyte can become a plasma cell and release antibodies?", options: ["B cell", "Neutrophil", "Basophil", "Monocyte"], correctOptionId: "a", explanation: "Activated B cells can differentiate into plasma cells, which secrete antibodies." },
  { id: "helper-t", topic: "Lymphocytes", subtopic: "T-cell roles", level: "Intermediate", prompt: "What is a key role of helper T cells?", options: ["Coordinate parts of an immune response", "Release histamine from dark granules", "Become red blood cells", "Engulf every bacterium directly"], correctOptionId: "a", explanation: "Helper T cells coordinate immune responses by communicating with other immune cells." },
  { id: "cytotoxic-t", topic: "Lymphocytes", subtopic: "T-cell roles", level: "Intermediate", prompt: "Which T-cell type can kill infected body cells?", options: ["Cytotoxic T cell", "Helper T cell", "Plasma cell", "Regulatory granule"], correctOptionId: "a", explanation: "Cytotoxic T cells can recognize and kill infected cells. They are distinct from helper T cells." },
  { id: "memory-cells", topic: "Lymphocytes", subtopic: "Immune memory", level: "Advanced", prompt: "How can memory B and T cells help during a later encounter with a familiar target?", options: ["They can support a faster, more effective response", "They turn into bacteria", "They stop all inflammation forever", "They make every cell produce histamine"], correctOptionId: "a", explanation: "Memory lymphocytes remain after an immune response and can help the body respond more effectively on a future encounter." },
  { id: "monocyte-macrophage", topic: "Cell identification", subtopic: "Monocytes", level: "Intermediate", prompt: "What can some monocytes become after entering tissue?", options: ["Macrophages", "Antibodies", "Endothelial cells", "Eosinophils"], correctOptionId: "a", explanation: "Some monocytes that enter tissues can differentiate into macrophages. Many tissue macrophages also have other developmental origins." },
  { id: "parasites", topic: "Cell identification", subtopic: "Parasite defence", level: "Basic", prompt: "Which cell helps defend against some large parasites and also participates in allergy?", options: ["Eosinophil", "Lymphocyte", "Monocyte", "Neutrophil"], correctOptionId: "a", explanation: "Eosinophils can release granule contents that damage some parasites and also participate in allergic inflammation." },
  { id: "histamine", topic: "Inflammation", subtopic: "Basophils", level: "Basic", prompt: "What does histamine released by basophils help do during some inflammatory responses?", options: ["Act as an alarm that can make nearby vessels more permeable", "Digest DNA inside the nucleus", "Turn an antibody into a T cell", "Seal every vessel shut"], correctOptionId: "a", explanation: "Histamine is an inflammatory signal. It can widen nearby blood vessels and make them more permeable." },
  { id: "innate-adaptive", topic: "Immune response", subtopic: "Innate and adaptive", level: "Advanced", prompt: "Which statement best compares innate and adaptive immunity?", options: ["Innate defenses respond quickly; adaptive lymphocytes can recognize specific targets and form memory", "Only adaptive immunity uses cells", "Innate immunity always makes antibodies", "They are two names for one cell"], correctOptionId: "a", explanation: "Innate defenses act rapidly in broad ways. B and T lymphocytes provide targeted adaptive functions, and some form immune memory." },
  { id: "scenario-alarm", topic: "Inflammation", subtopic: "Cell functions", level: "Advanced", prompt: "During an allergic response, a rare granulocyte releases histamine and nearby vessels become leakier. Which cell best fits?", options: ["Basophil", "Eosinophil", "Neutrophil", "Monocyte"], correctOptionId: "a", explanation: "Basophils can degranulate and release histamine, which affects nearby blood vessels during allergic and inflammatory responses." }
].map((question, questionIndex) => {
  const correctIndex = [0, 2, 1, 3, 2, 1, 0, 3, 1, 2, 3, 0, 2, 1, 3][questionIndex];
  const answers = [...question.options.slice(1)];
  answers.splice(correctIndex, 0, question.options[0]);
  return {
    ...question,
    correctOptionId: String.fromCharCode(97 + correctIndex),
    options: answers.map((text, index) => ({ id: String.fromCharCode(97 + index), text }))
  };
});

const visualModelOrder = ["eosinophil", "monocyte", "basophil", "neutrophil", "lymphocyte"];

export default function WBCWorkspace({ active = true }) {
  const [activePanel, setActivePanel] = useState("squad");
  const [activeType, setActiveType] = useState("neutrophil");
  const [selectedStructure, setSelectedStructure] = useState("nucleus");
  const [hoveredStructure, setHoveredStructure] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [learningDepth, setLearningDepth] = useState("understand");
  const [cutaway, setCutaway] = useState(false);
  const [demoType, setDemoType] = useState("neutrophil");
  const [demoElapsed, setDemoElapsed] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [journeyElapsed, setJourneyElapsed] = useState(0);
  const [journeyPlaying, setJourneyPlaying] = useState(false);
  const [journeySpeed, setJourneySpeed] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [compareTypes, setCompareTypes] = useState(["neutrophil", "lymphocyte"]);
  const [activityMode, setActivityMode] = useState("name-function");
  const [activityCard, setActivityCard] = useState(0);
  const [activityFeedback, setActivityFeedback] = useState(null);
  const [activityScore, setActivityScore] = useState(0);
  const [sequenceOrder, setSequenceOrder] = useState(["FOLLOW", "ALARM", "EAT", "ROLL", "DESTROY", "SQUEEZE", "GRAB"]);
  const [sequenceFeedback, setSequenceFeedback] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizResponses, setQuizResponses] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStartedAt, setQuizStartedAt] = useState(() => new Date().toISOString());
  const controlsRef = useRef(null);
  const journeyElapsedRef = useRef(journeyElapsed);
  const demoElapsedRef = useRef(demoElapsed);

  const setJourneyTime = value => {
    const next = typeof value === "function" ? value(journeyElapsedRef.current) : value;
    journeyElapsedRef.current = next;
    setJourneyElapsed(next);
  };
  const setDemoTime = value => {
    const next = typeof value === "function" ? value(demoElapsedRef.current) : value;
    demoElapsedRef.current = next;
    setDemoElapsed(next);
  };

  const demoStage = Math.min(demoStages[demoType].length - 1, Math.floor(demoElapsed / 3.2));
  const demoProgress = Math.min(1, demoElapsed / 3.2 - demoStage);
  const demoFinished = demoElapsed >= demoStages[demoType].length * 3.2;
  const structure = structureInfo[hoveredStructure || selectedStructure];
  const structureKeys = activeType === "lymphocyte" ? [...commonStructureKeys, "antigenReceptors"] : commonStructureKeys;
  const journeyDurations = [8, 8, 8, 8, 8, 10];
  const journeyDuration = journeyDurations.reduce((total, duration) => total + duration, 0);
  let journeyStage = 0;
  let journeyStart = 0;
  while (journeyStage < journeyDurations.length - 1 && journeyElapsed >= journeyStart + journeyDurations[journeyStage]) {
    journeyStart += journeyDurations[journeyStage];
    journeyStage += 1;
  }
  const journeyProgress = Math.min(1, Math.max(0, (journeyElapsed - journeyStart) / journeyDurations[journeyStage]));
  const activeQuizQuestion = quizQuestions[quizIndex];
  const quizScore = Object.values(quizResponses).filter(response => response.isCorrect).length;
  const quizTopicResults = Object.values(quizQuestions.reduce((groups, question) => {
    const group = groups[question.topic] || { topic: question.topic, correct: 0, total: 0 };
    group.total += 1;
    if (quizResponses[question.id]?.isCorrect) group.correct += 1;
    groups[question.topic] = group;
    return groups;
  }, {}));

  useEffect(() => {
    if (!active || !journeyPlaying) return undefined;
    let elapsed = journeyElapsedRef.current;
    const timer = window.setInterval(() => {
      elapsed = Math.min(journeyDuration, elapsed + 0.05 * journeySpeed);
      journeyElapsedRef.current = elapsed;
      setJourneyElapsed(elapsed);
      if (elapsed >= journeyDuration) {
        window.clearInterval(timer);
        setJourneyPlaying(false);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [active, journeyPlaying, journeySpeed, journeyDuration]);

  useEffect(() => {
    if (!active || !demoPlaying) return undefined;
    let elapsed = demoElapsedRef.current;
    const duration = demoStages[demoType].length * 3.2;
    const timer = window.setInterval(() => {
      elapsed = Math.min(duration, elapsed + 0.05 * demoSpeed);
      demoElapsedRef.current = elapsed;
      setDemoElapsed(elapsed);
      if (elapsed >= duration) {
        window.clearInterval(timer);
        setDemoPlaying(false);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [active, demoPlaying, demoSpeed, demoType]);

  useEffect(() => () => { document.body.style.cursor = "auto"; }, []);

  const reportHover = useCallback(id => setHoveredStructure(id), []);

  const chooseCell = type => {
    setActiveType(type);
    setSelectedStructure("nucleus");
    setHoveredStructure(null);
  };

  const chooseDemo = id => {
    setDemoType(id);
    setDemoTime(0);
    setDemoPlaying(false);
  };

  const moveDemoStage = direction => {
    setDemoPlaying(false);
    setDemoTime(Math.max(0, Math.min((demoStages[demoType].length - 1) * 3.2, (demoStage + direction) * 3.2)));
  };

  const moveJourneyStage = direction => {
    setJourneyPlaying(false);
    const next = Math.max(0, Math.min(journeyStages.length - 1, journeyStage + direction));
    const start = journeyDurations.slice(0, next).reduce((sum, duration) => sum + duration, 0);
    setJourneyTime(start);
  };

  const replayJourneyStage = index => {
    setJourneyPlaying(false);
    setJourneyTime(journeyDurations.slice(0, index).reduce((sum, duration) => sum + duration, 0));
  };

  const playJourney = () => {
    if (journeyElapsed >= journeyDuration) setJourneyTime(0);
    setJourneyPlaying(true);
  };

  const setCompareType = (side, type) => {
    setCompareTypes(current => current.map((value, index) => index === side ? type : value));
  };

  const chooseActivity = mode => {
    setActivityMode(mode);
    setActivityCard(0);
    setActivityFeedback(null);
    setSequenceFeedback(null);
  };

  const challengeScenarios = [
    { prompt: "A bacterial infection needs a fast first responder that can swallow microbes.", answer: "neutrophil" },
    { prompt: "A matching immune cell should make antibodies that stick to a target antigen.", answer: "lymphocyte" },
    { prompt: "A blood cell enters tissue and can become a debris-clearing macrophage.", answer: "monocyte" },
    { prompt: "A large parasite is present, and a cell releases damaging granule contents.", answer: "eosinophil" },
    { prompt: "An allergic signal triggers histamine release and nearby vessel changes.", answer: "basophil" }
  ];
  const functionPrompts = [
    { prompt: "Which white blood cell can produce antibodies after becoming a plasma cell?", answer: "lymphocyte" },
    { prompt: "Which cell can leave blood and become a tissue macrophage?", answer: "monocyte" },
    { prompt: "Which cell is a rapid responder that can engulf bacteria?", answer: "neutrophil" },
    { prompt: "Which cell releases granules that can damage some parasites?", answer: "eosinophil" },
    { prompt: "Which cell can release histamine during an allergic response?", answer: "basophil" }
  ];
  const visualClues = [
    { prompt: "Which model shows a segmented, multi-lobed nucleus?", answer: "neutrophil" },
    { prompt: "Which model has a large round nucleus and a thin rim of cytoplasm?", answer: "lymphocyte" },
    { prompt: "Which model has abundant cytoplasm and a kidney-shaped nucleus?", answer: "monocyte" },
    { prompt: "Which model has a bilobed nucleus and prominent orange granules?", answer: "eosinophil" },
    { prompt: "Which model has dark granules that partly hide its nucleus?", answer: "basophil" }
  ];
  const activityTargetType = activityMode === "name-function" ? cellOrder[activityCard % cellOrder.length]
    : activityMode === "visual" ? visualClues[activityCard % visualClues.length].answer
      : activityMode === "function-name" ? functionPrompts[activityCard % functionPrompts.length].answer
        : challengeScenarios[activityCard % challengeScenarios.length].answer;
  const activityPrompt = activityMode === "name-function"
    ? `Which role best matches the ${wbcTypes[activityTargetType].name}?`
    : activityMode === "visual" ? visualClues[activityCard % visualClues.length].prompt
      : activityMode === "function-name" ? functionPrompts[activityCard % functionPrompts.length].prompt
        : challengeScenarios[activityCard % challengeScenarios.length].prompt;

  const checkActivity = type => {
    const correct = type === activityTargetType;
    setActivityFeedback({ correct, type, target: activityTargetType, hook: wbcTypes[activityTargetType].hook });
    if (correct) setActivityScore(score => score + 1);
  };

  const nextActivity = () => {
    setActivityCard(card => card + 1);
    setActivityFeedback(null);
  };

  const moveSequence = (index, direction) => {
    setSequenceOrder(current => {
      const nextIndex = Math.max(0, Math.min(current.length - 1, index + direction));
      if (nextIndex === index) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    setSequenceFeedback(null);
  };

  const checkSequence = () => {
    const expected = ["ALARM", "ROLL", "GRAB", "SQUEEZE", "FOLLOW", "EAT", "DESTROY"];
    setSequenceFeedback(sequenceOrder.every((stage, index) => stage === expected[index]));
  };

  const selectQuizAnswer = optionId => {
    setQuizAnswer(optionId);
    setQuizChecked(false);
  };

  const checkQuizAnswer = () => {
    if (!quizAnswer || !activeQuizQuestion) return;
    const response = {
      questionId: activeQuizQuestion.id,
      topicId: activeQuizQuestion.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      topic: activeQuizQuestion.topic,
      subtopic: activeQuizQuestion.subtopic,
      difficulty: activeQuizQuestion.level,
      selectedOptionId: quizAnswer,
      correctOptionId: activeQuizQuestion.correctOptionId,
      isCorrect: quizAnswer === activeQuizQuestion.correctOptionId,
      answeredAt: new Date().toISOString()
    };
    setQuizResponses(current => ({ ...current, [activeQuizQuestion.id]: response }));
    setQuizChecked(true);
  };

  const completeQuiz = () => {
    const record = {
      assessmentId: "cellular-immunology-v1",
      moduleId: "cellular-immunology",
      schemaVersion: 1,
      status: "complete",
      startedAt: quizStartedAt,
      completedAt: new Date().toISOString(),
      score: quizScore,
      maxScore: quizQuestions.length,
      responses: Object.values(quizResponses)
    };
    try {
      const historyKey = "bioscope.assessmentHistory.v1";
      const previous = JSON.parse(window.localStorage.getItem(historyKey) || "[]");
      window.localStorage.setItem(historyKey, JSON.stringify([...(Array.isArray(previous) ? previous : []), record]));
    } catch {
      // The in-memory result remains available if browser storage is unavailable.
    }
    setQuizComplete(true);
  };

  const nextQuizQuestion = () => {
    if (quizIndex === quizQuestions.length - 1) {
      completeQuiz();
      return;
    }
    const nextIndex = quizIndex + 1;
    const next = quizQuestions[nextIndex];
    const priorResponse = quizResponses[next.id];
    setQuizIndex(nextIndex);
    setQuizAnswer(priorResponse?.selectedOptionId || "");
    setQuizChecked(Boolean(priorResponse));
  };

  const previousQuizQuestion = () => {
    if (quizIndex === 0) return;
    const previous = quizQuestions[quizIndex - 1];
    const priorResponse = quizResponses[previous.id];
    setQuizIndex(index => index - 1);
    setQuizAnswer(priorResponse?.selectedOptionId || "");
    setQuizChecked(Boolean(priorResponse));
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizAnswer("");
    setQuizChecked(false);
    setQuizResponses({});
    setQuizComplete(false);
    setQuizStartedAt(new Date().toISOString());
  };

  const resetCamera = () => controlsRef.current?.reset();
  const zoomCamera = direction => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (direction > 0) controls.dollyIn(1.2);
    else controls.dollyOut(1.2);
    controls.update();
  };

  return (
    <main className="wbc-workspace">
      <header className="wbc-header">
        <div>
          <p className="wbc-eyebrow">BIOSCOPE LITE / IMMUNOLOGY</p>
          <h1>Cellular Immunology</h1>
          <p>Meet the cells that protect your body and watch their work unfold.</p>
        </div>
        {activePanel === "squad" && <button className={`wbc-compare-toggle ${compareMode ? "active" : ""}`} onClick={() => setCompareMode(value => !value)} aria-pressed={compareMode}>
          <Activity size={17} /> {compareMode ? "Close comparison" : "Compare cells"}
        </button>}
      </header>

      <nav className="wbc-experience-nav" aria-label="Cellular Immunology activities">
        {[
          ["squad", "Meet the WBC Squad"],
          ["journey", "Neutrophil’s Journey"],
          ["demos", "Cell demonstrations"],
          ["activities", "Recall activities"],
          ["quiz", "Knowledge quiz"]
        ].map(([id, label]) => (
          <button key={id} className={activePanel === id ? "active" : ""} onClick={() => setActivePanel(id)} aria-current={activePanel === id ? "page" : undefined}>
            {label}
          </button>
        ))}
      </nav>

      {activePanel === "squad" && <>
      <section className="wbc-experience-intro">
        <div><span className="wbc-section-label">SEE IT → UNDERSTAND IT → REMEMBER IT</span><h2>Meet the WBC Squad</h2></div>
        <p>White blood cells are your body's defenders. Each has a different shape and a different job.</p>
      </section>
      <section className="wbc-explorer" aria-label={`${wbcTypes[activeType].name} explorer`}>
        <nav className="wbc-type-selector" aria-label="Choose a white blood cell">
          <p className="wbc-section-label">CELL TYPES</p>
          {cellOrder.map(type => (
            <button key={type} className={activeType === type ? "active" : ""} onClick={() => chooseCell(type)} aria-pressed={activeType === type}>
              <span className="wbc-type-dot" style={{ background: wbcTypes[type].color }} />
              <span><strong>{wbcTypes[type].name}</strong><small>{wbcTypes[type].short}</small></span>
            </button>
          ))}
        </nav>
        <div className="wbc-cell-panel">
          <div className="wbc-cell-heading">
            <div><span className="wbc-live-dot" /> 3D CELL MODEL</div>
            <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
          </div>
          <div className="wbc-cell-stage">
            <WBCCell3D type={activeType} selectedStructure={selectedStructure} hoveredStructure={hoveredStructure} onHoverStructure={reportHover} onSelectStructure={setSelectedStructure} showLabels={showLabels} cutaway={cutaway} controlsRef={controlsRef} enabled={active} />
            <div className="wbc-view-tools" aria-label="Cell view controls">
              <button onClick={() => setCutaway(value => !value)} aria-pressed={cutaway}>
                {cutaway ? <Eye size={15} /> : <EyeOff size={15} />}{cutaway ? "Exterior" : "Cutaway"}
              </button>
              <button onClick={() => setShowLabels(value => !value)} aria-pressed={showLabels} aria-label={`${showLabels ? "Hide" : "Show"} structure labels`}>
                <Tag size={15} />{showLabels ? "Labels on" : "Labels off"}
              </button>
              <button onClick={() => zoomCamera(1)} aria-label="Zoom in"><ZoomIn size={16} /></button>
              <button onClick={() => zoomCamera(-1)} aria-label="Zoom out"><ZoomOut size={16} /></button>
              <button onClick={() => { setCutaway(false); resetCamera(); }} aria-label="Reset camera"><RotateCcw size={16} /></button>
            </div>
            <div className="wbc-viewport-caption">{wbcTypes[activeType].name.toUpperCase()} <span>·</span> {cutaway ? "CUTAWAY" : "EXTERIOR"}</div>
          </div>
          <div className="wbc-structure-keys" aria-label="Cell structures">
            {structureKeys.map(key => (
              <button key={key} className={selectedStructure === key ? "active" : ""} onClick={() => { setSelectedStructure(key); setHoveredStructure(null); }} aria-pressed={selectedStructure === key} title={`Pin ${structureInfo[key].name} in the inspector`}>
                <span className={`wbc-key-mark ${key}`} />{structureInfo[key].name}
              </button>
            ))}
          </div>
        </div>
        <aside className="wbc-cell-info" aria-live="polite">
          <p className="wbc-section-label">{wbcTypes[activeType].name.toUpperCase()}</p>
          <h2>{wbcTypes[activeType].short}</h2>
          <p className="wbc-morphology">{wbcTypes[activeType].morphology}</p>
          <div className="wbc-hook-card" style={{ "--cell-accent": wbcTypes[activeType].color }}>
            <span className="wbc-detail-kicker">MEMORY HOOK</span>
            <strong>{wbcTypes[activeType].hook}</strong>
            <small>A memory association, not a literal definition.</small>
          </div>
          <div className="wbc-depth-switch" role="group" aria-label="Choose explanation detail">
            <button className={learningDepth === "understand" ? "active" : ""} onClick={() => setLearningDepth("understand")} aria-pressed={learningDepth === "understand"}><BookOpen size={14} /> Understand it</button>
            <button className={learningDepth === "science" ? "active" : ""} onClick={() => setLearningDepth("science")} aria-pressed={learningDepth === "science"}><HelpCircle size={14} /> Science behind it</button>
          </div>
          <p className="wbc-depth-copy">{learningDepth === "understand" ? wbcTypes[activeType].simple : wbcTypes[activeType].science}</p>
          <div className="wbc-structure-detail">
            <span className="wbc-detail-kicker">SELECTED STRUCTURE</span>
            <h3>{structure.name}</h3>
            <strong>{structure.function}</strong>
            <p>{(hoveredStructure || selectedStructure) === "nucleus" ? wbcTypes[activeType].nucleus : (hoveredStructure || selectedStructure) === "granules" ? wbcTypes[activeType].granules : learningDepth === "understand" ? structure.description : structure.science}</p>
            <small>{hoveredStructure ? "Following your pointer" : "Pinned structure · hover or choose another"}</small>
          </div>
          <div className="wbc-function-note">
            <span className="wbc-detail-kicker">BIOLOGICAL ROLE</span>
            <p>{wbcTypes[activeType].function}</p>
          </div>
        </aside>
      </section>

      <section className="wbc-visual-cues" aria-label="Cell morphology cues">
        <div><span className="wbc-section-label">LOOK CLOSELY</span><h2>Shape is a clue</h2></div>
        <p>Hover over a structure to highlight and label it. Click a structure or use the list to pin it in the inspector. Use Cutaway to see the cell interior.</p>
      </section>

      {compareMode && (
        <section className="wbc-compare-panel">
          <div className="wbc-section-heading">
            <div><p className="wbc-section-label">VISUAL COMPARISON</p><h2>Compare two cell types</h2></div>
            <p>Select two cells to compare morphology and function side by side.</p>
          </div>
          <div className="wbc-compare-selectors">
            {[0, 1].map(side => (
              <div className="wbc-compare-side-selector" key={side} aria-label={`Choose ${side === 0 ? "first" : "second"} cell`}>
                {cellOrder.map(type => <button key={type} className={compareTypes[side] === type ? "active" : ""} onClick={() => setCompareType(side, type)}>{wbcTypes[type].name}</button>)}
              </div>
            ))}
          </div>
          <div className="wbc-compare-visuals">
            <WBCCell3D comparisonTypes={compareTypes} enabled={active} />
            {compareTypes.map((type, index) => <span className={`wbc-compare-label side-${index}`} key={`${type}-${index}`}><i style={{ background: wbcTypes[type].color }} />{wbcTypes[type].name}</span>)}
          </div>
          <div className="wbc-compare-table">
            {[
              ["Cell morphology", type => wbcTypes[type].morphology],
              ["Nucleus", type => wbcTypes[type].nucleus],
              ["Granules", type => wbcTypes[type].granules],
              ["Main function", type => wbcTypes[type].function],
              ["Key difference", type => wbcTypes[type].difference]
            ].map(([label, value]) => (
              <div className="wbc-compare-row" key={label}>
                <strong>{label}</strong>
                {compareTypes.map((type, index) => <p key={`${type}-${index}`}>{value(type)}</p>)}
              </div>
            ))}
          </div>
        </section>
      )}
      </>}

      {activePanel === "journey" && <section className="wbc-learning-panel wbc-journey-panel">
        <div className="wbc-section-heading">
          <div><p className="wbc-section-label">50-SECOND 3D SIMULATION · 6 STAGES</p><h2>Neutrophil’s Journey</h2></div>
          <p>From first alarm to microbe digestion.</p>
        </div>
        <div className="wbc-journey-progress" aria-label={`Stage ${journeyStage + 1} of 6`}>
          {journeyStages.map((item, index) => <button key={item.cue} className={index === journeyStage ? "current" : index < journeyStage ? "done" : ""} onClick={() => replayJourneyStage(index)} aria-label={`Replay stage ${index + 1}: ${item.title}`}><span>{index + 1}</span><small>{item.cue}</small></button>)}
        </div>
        <div className="wbc-journey-layout">
          <div className="wbc-journey-viewport" aria-label="Animated neutrophil journey through a blood vessel into tissue">
            <WBCJourney3D stage={journeyStage} progress={journeyProgress} playing={journeyPlaying} speed={journeySpeed} enabled={active} />
            <div className="wbc-journey-caption"><span className="wbc-live-dot" />LIVE 3D TISSUE SIMULATION</div>
            <div className="wbc-journey-object-legend"><span><i className="vessel" />Vessel</span><span><i className="neutro" />Neutrophil</span><span><i className="signal" />Signals</span><span><i className="bacteria" />Bacteria</span></div>
          </div>
          <aside className="wbc-journey-stage-card" aria-live="polite">
            <span className="wbc-detail-kicker">STAGE {journeyStage + 1} OF 6 · {journeyStages[journeyStage].cue}</span>
            <h3>{journeyStages[journeyStage].title}</h3>
            <p>{journeyStages[journeyStage].detail}</p>
            <div className="wbc-journey-science-note"><strong>Science behind it</strong><span>{journeyStage === 1 ? "Selectins are adhesion molecules that make brief contacts during rolling. Integrins help the cell attach more firmly in the next stage." : journeyStage === 2 ? "Integrins on the neutrophil bind adhesion molecules on endothelial cells, the cells lining the vessel." : journeyStage === 3 ? "The passage between endothelial cells is called diapedesis." : journeyStage === 4 ? "Scientists call movement guided by a chemical gradient chemotaxis. Signals from infected tissue and immune responses guide the cell." : journeyStage === 5 ? "The pouch around the swallowed microbe is a phagosome. Lysosomes carry digestive enzymes and fuse with it." : "Infected tissue and immune cells release chemical signals that form the gradient; bacteria are not magnets."}</span></div>
          </aside>
        </div>
        <div className="wbc-journey-controls">
          <button onClick={() => moveJourneyStage(-1)} disabled={journeyStage === 0}><ChevronLeft size={16} /> Previous</button>
          <button className="wbc-play-button" onClick={() => journeyPlaying ? setJourneyPlaying(false) : playJourney()}>{journeyPlaying ? <Pause size={16} /> : <Play size={16} />}{journeyPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => moveJourneyStage(1)} disabled={journeyStage === journeyStages.length - 1}><ChevronRight size={16} /> Next stage</button>
          <button onClick={() => { setJourneyPlaying(false); setJourneyTime(0); }}><RotateCcw size={15} /> Restart</button>
          <label>Speed<select value={journeySpeed} onChange={event => setJourneySpeed(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
          <span className="wbc-run-time">{Math.floor(journeyElapsed / 60)}:{String(Math.floor(journeyElapsed % 60)).padStart(2, "0")} / 0:50</span>
        </div>
        <p className="wbc-journey-footnote">A teaching simulation of leukocyte extravasation and phagocytosis. Molecular timings and shapes are simplified.</p>
      </section>}

      {activePanel === "demos" && <section className="wbc-learning-panel wbc-demo-panel">
        <div className="wbc-section-heading"><div><p className="wbc-section-label">WATCH · 3D CELL DEMONSTRATIONS</p><h2>Each defender has a different job</h2></div><p>Choose a cell and play its process step by step.</p></div>
        <div className="wbc-demo-cell-tabs" role="group" aria-label="Choose a white blood cell demonstration">
          {cellOrder.map(type => <button key={type} className={demoType === type ? "active" : ""} onClick={() => chooseDemo(type)} aria-pressed={demoType === type}><i style={{ background: wbcTypes[type].color }} />{wbcTypes[type].name}</button>)}
        </div>
        <div className="wbc-demo-layout">
          <div className="wbc-demo-viewport"><WBCProcess3D type={demoType} stage={demoStage} progress={demoProgress} playing={demoPlaying} enabled={active} />
            <div className="wbc-demo-stage-mark">{demoStageTitles[demoType][demoStage].toUpperCase()}</div>
          </div>
          <aside className="wbc-demo-explanation" aria-live="polite">
            <span className="wbc-detail-kicker">{wbcTypes[demoType].name.toUpperCase()} · STEP {demoStage + 1} OF {demoStages[demoType].length}</span>
            <h3>{demoStageTitles[demoType][demoStage]}</h3>
            <p>{demoStages[demoType][demoStage]}</p>
            <div className="wbc-hook-card compact" style={{ "--cell-accent": wbcTypes[demoType].color }}><span className="wbc-detail-kicker">REMEMBER</span><strong>{wbcTypes[demoType].hook}</strong></div>
            {demoType === "lymphocyte" && <div className="wbc-lymphocyte-roles"><strong>B cells</strong><span>make antibodies</span><strong>Helper T cells</strong><span>coordinate responses</span><strong>Cytotoxic T cells</strong><span>kill infected cells</span><strong>Memory B and T cells</strong><span>help future responses</span></div>}
            <div className="wbc-demo-level-note"><strong>Science behind it</strong><span>{wbcTypes[demoType].science}</span></div>
          </aside>
        </div>
        <div className="wbc-demo-timeline" aria-label="Demonstration stages">
          {demoStages[demoType].map((item, index) => <button key={index} className={index === demoStage ? "current" : index < demoStage ? "done" : ""} onClick={() => { setDemoPlaying(false); setDemoTime(index * 3.2); }} aria-label={`Replay ${demoStageTitles[demoType][index]}`}><span>{index + 1}</span><small>{demoStageTitles[demoType][index]}</small></button>)}
        </div>
        <div className="wbc-demo-controls">
          <button onClick={() => moveDemoStage(-1)} disabled={demoStage === 0}><ChevronLeft size={16} /> Previous</button>
          <button className="wbc-play-button" onClick={() => { if (demoFinished) setDemoTime(0); setDemoPlaying(!demoPlaying); }}>{demoPlaying ? <Pause size={16} /> : <Play size={16} />}{demoPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => moveDemoStage(1)} disabled={demoStage === demoStages[demoType].length - 1}><ChevronRight size={16} /> Next</button>
          <button onClick={() => { setDemoPlaying(false); setDemoTime(0); }}><RotateCcw size={15} /> Restart</button>
          <label>Speed<select value={demoSpeed} onChange={event => setDemoSpeed(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label>
        </div>
      </section>}

      {activePanel === "activities" && <section className="wbc-learning-panel wbc-activities-panel">
        <div className="wbc-section-heading"><div><p className="wbc-section-label">APPLY IT · RECALL LAB</p><h2>Who defends the body?</h2></div><p>Match names, functions, cell shapes and immune scenarios.</p></div>
        <div className="wbc-activity-tabs" role="group" aria-label="Choose a recall activity">
          {[["name-function", "Name to function"], ["function-name", "Function to name"], ["visual", "Visual identification"], ["sequence", "Process sequencing"], ["challenge", "WHO DEFENDS THE BODY?"]].map(([id, label]) => <button key={id} className={activityMode === id ? "active" : ""} onClick={() => chooseActivity(id)} aria-pressed={activityMode === id}>{label}</button>)}
        </div>
        {activityMode === "sequence" ? <div className="wbc-sequence-game">
          <div><span className="wbc-detail-kicker">NEUTROPHIL’S JOURNEY</span><h3>Put the stages in order</h3><p>Use the arrows to arrange the journey from alarm to microbe breakdown.</p></div>
          <ol className="wbc-sequence-list">{sequenceOrder.map((stage, index) => <li key={stage}><span className="wbc-sequence-number">{index + 1}</span><strong>{stage}</strong><div><button onClick={() => moveSequence(index, -1)} disabled={index === 0} aria-label={`Move ${stage} earlier`}><ArrowUp size={15} /></button><button onClick={() => moveSequence(index, 1)} disabled={index === sequenceOrder.length - 1} aria-label={`Move ${stage} later`}><ArrowDown size={15} /></button></div></li>)}</ol>
          <div className="wbc-activity-actions"><button className="wbc-play-button" onClick={checkSequence}><Check size={15} /> Check order</button><button onClick={() => { setSequenceOrder(["FOLLOW", "ALARM", "EAT", "ROLL", "DESTROY", "SQUEEZE", "GRAB"]); setSequenceFeedback(null); }}><RotateCcw size={15} /> Reset</button></div>
          {sequenceFeedback !== null && <div className={`wbc-activity-feedback ${sequenceFeedback ? "correct" : "review"}`} role="status"><strong>{sequenceFeedback ? "Correct order!" : "Try again"}</strong><p>ALARM → ROLL → GRAB → SQUEEZE → FOLLOW → EAT → DESTROY</p><span>Signals start the response; then the neutrophil rolls, attaches, crosses, follows cues, engulfs and digests.</span></div>}
        </div> : <div className="wbc-card-game">
          <div className="wbc-card-game-top"><span className="wbc-detail-kicker">ACTIVITY {activityCard + 1} · SCORE {activityScore}</span><button onClick={() => { setActivityScore(0); setActivityCard(0); setActivityFeedback(null); }}>Reset score</button></div>
          {activityMode === "visual" && <div className="wbc-visual-game-models"><WBCCell3D comparisonTypes={visualModelOrder} enabled={active} /><div className="wbc-model-number-row">{[1, 2, 3, 4, 5].map(number => <span key={number}>{number}</span>)}</div><small>Five models, left to right. Identify the morphology from the clue.</small></div>}
          <h3>{activityPrompt}</h3>
          {activityMode === "name-function" && <p className="wbc-activity-hint">Choose the best function for {wbcTypes[activityTargetType].name}.</p>}
          {activityMode !== "name-function" && <p className="wbc-activity-hint">Choose the white blood cell that best fits.</p>}
          <div className={`wbc-activity-options ${activityMode === "name-function" ? "function-options" : ""}`}>
            {(activityMode === "visual" ? visualModelOrder : cellOrder).map((type, index) => <button key={type} onClick={() => checkActivity(type)} disabled={Boolean(activityFeedback)} className={activityFeedback?.target === type ? "activity-correct" : activityFeedback?.type === type ? "activity-wrong" : ""}>{activityMode !== "visual" && <i style={{ background: wbcTypes[type].color }} />}<span>{activityMode === "name-function" ? wbcTypes[type].simple : activityMode === "visual" ? `Model ${index + 1}` : wbcTypes[type].name}</span></button>)}
          </div>
          {activityFeedback && <div className={`wbc-activity-feedback ${activityFeedback.correct ? "correct" : "review"}`} role="status"><strong>{activityFeedback.correct ? "That’s right!" : `The best answer is ${wbcTypes[activityFeedback.target].name}.`}</strong><p>{wbcTypes[activityFeedback.target].simple}</p><div className="wbc-feedback-hook">{activityFeedback.hook}</div><button onClick={nextActivity}>Next card <ChevronRight size={15} /></button></div>}
        </div>}
      </section>}

      {activePanel === "quiz" && <section className="wbc-learning-panel wbc-quiz-panel">
        <div className="wbc-section-heading"><div><p className="wbc-section-label">CELLULAR IMMUNOLOGY · 15 QUESTIONS</p><h2>Knowledge quiz</h2></div><p>Choose an answer, check it and read the explanation.</p></div>
        {!quizComplete ? <div className="wbc-quiz-content">
          <div className="wbc-quiz-progress" aria-label={`Question ${quizIndex + 1} of ${quizQuestions.length}`}>{quizQuestions.map((question, index) => <span key={question.id} className={quizResponses[question.id] ? quizResponses[question.id].isCorrect ? "correct" : "wrong" : index === quizIndex ? "current" : ""} />)}</div>
          <div className="wbc-quiz-meta"><span>{activeQuizQuestion.topic}</span><span>{activeQuizQuestion.subtopic}</span><span>{activeQuizQuestion.level}</span></div>
          <p className="wbc-quiz-count">Question {quizIndex + 1} of {quizQuestions.length}</p>
          <h3>{activeQuizQuestion.prompt}</h3>
          <div className="wbc-quiz-options">{activeQuizQuestion.options.map(option => <button key={option.id} className={`${quizAnswer === option.id ? "chosen" : ""} ${quizChecked && option.id === activeQuizQuestion.correctOptionId ? "answer-correct" : ""} ${quizChecked && quizAnswer === option.id && option.id !== activeQuizQuestion.correctOptionId ? "answer-wrong" : ""}`} onClick={() => selectQuizAnswer(option.id)} aria-pressed={quizAnswer === option.id}><span>{option.id.toUpperCase()}</span>{option.text}</button>)}</div>
          {quizChecked && <div className={`wbc-quiz-explanation ${quizAnswer === activeQuizQuestion.correctOptionId ? "correct" : "review"}`} role="status"><strong>{quizAnswer === activeQuizQuestion.correctOptionId ? "Correct" : "Review this one"}</strong><p>{activeQuizQuestion.explanation}</p></div>}
          <div className="wbc-quiz-actions"><button onClick={previousQuizQuestion} disabled={quizIndex === 0}><ChevronLeft size={16} /> Previous</button>{!quizChecked ? <button className="wbc-play-button" disabled={!quizAnswer} onClick={checkQuizAnswer}>Check answer</button> : <button className="wbc-play-button" onClick={nextQuizQuestion}>{quizIndex === quizQuestions.length - 1 ? "See results" : "Next question"}<ChevronRight size={16} /></button>}</div>
        </div> : <div className="wbc-quiz-results">
          <div className="wbc-quiz-score">{quizScore}<span> / {quizQuestions.length}</span></div><h3>Challenge complete</h3><p>You answered {quizScore} of {quizQuestions.length} questions correctly.</p>
          <h4>Results by topic</h4><div className="wbc-topic-results">{quizTopicResults.map(item => <div key={item.topic}><span>{item.topic}</span><strong>{item.correct} / {item.total}</strong><div><i style={{ width: `${item.total ? item.correct / item.total * 100 : 0}%` }} /></div></div>)}</div>
          <p className="wbc-assessment-saved">Assessment saved as <code>cellular-immunology</code>.</p><button className="wbc-play-button" onClick={restartQuiz}><RotateCcw size={15} /> Restart quiz</button>
        </div>}
      </section>}
    </main>
  );
}

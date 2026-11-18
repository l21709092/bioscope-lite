// Comprehensive educational dataset providing high-yield medical facts, mnemonics, and quiz questions for human organs and systems

export const ORGAN_EDUCATION = {
  heart: {
    title: "Heart",
    latinName: "Cor / Cardia",
    system: "Cardiovascular System",
    badgeColor: "#e11d48",
    icon: "Heart",
    stats: {
      weight: "250 – 350 grams (size of a closed fist)",
      location: "Middle mediastinum, 2/3 left of midline behind sternum",
      dailyOutput: "~7,500 L (~2,000 gal) through 60,000 miles of vessels",
      lifetimeBeats: "~2.8 to 3.2 billion contractions in a 75-year life",
    },
    overview: `The human heart is a hollow, four-chambered fibromuscular pump that maintains continuous unidirectional perfusion throughout systemic and pulmonary vascular beds. 

The right side (right atrium and right ventricle) receives deoxygenated blood from the vena cavae and propels it into the low-resistance pulmonary circuit for oxygenation and CO2 elimination. The left side (left atrium and left ventricle) receives freshly oxygenated pulmonary venous return and ejects it under high systolic pressure into the aorta to nourish peripheral organs and tissues.`,
    facts: [
      {
        id: "h1",
        title: "Autonomous Electrical Heartbeat",
        tag: "Electrophysiology",
        description: "The Sinoatrial (SA) node generates intrinsic action potentials without central nervous system triggers. A human heart can continue beating completely outside the body as long as it has oxygen and electrolyte bath!",
      },
      {
        id: "h2",
        title: "Tremendous Daily Kinetic Output",
        tag: "Hemodynamics",
        description: "Every day, the heart generates enough kinetic energy to drive a commercial truck 20 miles (32 km). Over a lifetime, that energy could propel a spacecraft to the moon and back.",
      },
      {
        id: "h3",
        title: "Extreme Hydraulic Pressure",
        tag: "Cardiovascular Physics",
        description: "When the muscular left ventricle contracts at peak systole, it generates sufficient fluid pressure to propel a jet of blood upwards of 30 feet (9 meters) across a room.",
      },
      {
        id: "h4",
        title: "60,000 Miles of Vascular Channels",
        tag: "Anatomy",
        description: "If all capillaries, arterioles, arteries, and veins perfused by the human heart were laid end-to-end, they would wrap around the Earth's equator more than 2.5 times.",
      },
      {
        id: "h5",
        title: "Astronomical ATP Consumption",
        tag: "Cellular Biochemistry",
        description: "The heart consumes approximately 6 kilograms of ATP (adenosine triphosphate) every 24 hours—roughly 20 times its own resting muscular weight.",
      },
    ],
    mnemonics: [
      {
        id: "hm1",
        name: "LAB RAT",
        purpose: "Atrioventricular (AV) Heart Valve Identifiers",
        phrase: "L-A-B  R-A-T",
        breakdown: [
          { letter: "L - A - B", meaning: "Left Atrium has the Bicuspid (Mitral) valve" },
          { letter: "R - A - T", meaning: "Right Atrium has the Tricuspid valve" },
        ],
        clinicalPearl: "Prevents mixing up valves during auscultation; mitral valve disease affects left-sided systemic filling pressure.",
      },
      {
        id: "hm2",
        name: "Try Before You Buy",
        purpose: "Unidirectional Blood Flow Valve Sequence",
        phrase: "TRIs are before BIs",
        breakdown: [
          { letter: "Try (Tricuspid)", meaning: "Blood hits the Tricuspid valve first on the venous right side" },
          { letter: "Buy (Bicuspid / Mitral)", meaning: "Blood hits the Bicuspid (Mitral) valve second on the arterial left side" },
        ],
        clinicalPearl: "Helps visualize blood sequence from deoxygenated venous return to oxygenated aortic ejection.",
      },
      {
        id: "hm3",
        name: "All Patients Trust Medicine",
        purpose: "Heart Auscultation Landmark Locations (2-2-4-5)",
        phrase: "A - P - T - M",
        breakdown: [
          { letter: "A (Aortic)", meaning: "Right 2nd intercostal space at sternal border" },
          { letter: "P (Pulmonic)", meaning: "Left 2nd intercostal space at sternal border" },
          { letter: "T (Tricuspid)", meaning: "Left 4th or 5th intercostal space lower sternal border" },
          { letter: "M (Mitral)", meaning: "Left 5th intercostal space in midclavicular line (apex beat)" },
        ],
        clinicalPearl: "The standard stethoscope positions to isolate heart murmurs and identify valvular stenosis or regurgitation.",
      },
    ],
    quizzes: [
      {
        id: "hq1",
        question: "Which chamber of the heart possesses the thickest muscular myocardium?",
        options: [
          "Right Atrium",
          "Right Ventricle",
          "Left Ventricle",
          "Left Atrium",
        ],
        correctIndex: 2,
        explanation: "The Left Ventricle has a muscular wall 3 times thicker than the right ventricle because it must overcome systemic vascular resistance (mean arterial pressure ~100 mmHg), whereas the right ventricle only pumps against low pulmonary resistance (~15 mmHg).",
        difficulty: "High-Yield Medical",
      },
      {
        id: "hq2",
        question: "Where is the primary physiological pacemaker of the human heart located?",
        options: [
          "Junction of superior vena cava and right atrium (SA node)",
          "Interventricular septum (Bundle of His)",
          "Apex of the left ventricle (Purkinje fibers)",
          "Coronary sinus opening in left atrium",
        ],
        correctIndex: 0,
        explanation: "The Sinoatrial (SA) node is situated subepicardially at the junction of the superior vena cava and the upper right atrium. It spontaneously depolarizes at 60–100 beats per minute.",
        difficulty: "Beginner",
      },
      {
        id: "hq3",
        question: "During which phase of the cardiac cycle do the coronary arteries receive the majority of their blood perfusion?",
        options: [
          "Rapid ventricular ejection (Systole)",
          "Ventricular Diastole (chamber relaxation)",
          "Isovolumetric contraction",
          "Atrial systole",
        ],
        correctIndex: 1,
        explanation: "During systole, contracting ventricular myocardium compresses intramyocardial coronary vessels. When the heart relaxes in diastole, aortic backflow into the Valsalva sinuses fills the coronary arteries unimpeded.",
        difficulty: "High-Yield Medical",
      },
    ],
  },

  brain: {
    title: "Brain & Brainstem",
    latinName: "Cerebrum / Encephalon",
    system: "Central Nervous System",
    badgeColor: "#f472b6",
    icon: "Brain",
    stats: {
      weight: "~1,300 – 1,400 grams (~3 lbs)",
      neurons: "~86 billion neurons + 85 billion non-neuronal glial cells",
      energyShare: "Consumes 20% of resting oxygen & 25% of glucose",
      electricalPower: "~12 to 25 watts of electrical output",
    },
    overview: `The human brain is the master control centre of the nervous system, enclosed within the cranium. It comprises the cerebrum (divided into left and right hemispheres across frontal, parietal, temporal, and occipital lobes), the cerebellum, and the brainstem (midbrain, pons, and medulla oblongata).

The brain integrates somatosensory inputs, computes complex language and cognition, directs motor plans, and regulates autonomous homeostatic parameters via endocrine cascades through the pituitary axis.`,
    facts: [
      {
        id: "b1",
        title: "Immense Energy Appetite",
        tag: "Metabolic Neuroscience",
        description: "Although the brain accounts for only ~2% of total human body mass, it consumes roughly 20% of circulating oxygen and 25% of glucose continuously, even during sleep.",
      },
      {
        id: "b2",
        title: "Brain Tissue Has No Pain Receptors",
        tag: "Neuroanatomy",
        description: "The brain parenchyma itself contains zero nociceptors (pain receptors). Neurosurgeons can perform awake craniotomies while patients talk and play instruments! Headaches arise from meninges and blood vessels.",
      },
      {
        id: "b3",
        title: "86 Billion Neuronal Superhighways",
        tag: "Neural Architecture",
        description: "There are approximately 86 billion neurons in the human brain, each with thousands of synapses, forming over 100 trillion synaptic connections—exceeding the number of stars in the Milky Way galaxy.",
      },
      {
        id: "b4",
        title: "The Glymphatic Washing Cycle",
        tag: "Neurophysiology",
        description: "During slow-wave sleep, interstitial space in the brain expands by 60%, allowing cerebrospinal fluid (CSF) to wash through and flush metabolic waste like amyloid-beta and tau proteins.",
      },
    ],
    mnemonics: [
      {
        id: "bm1",
        name: "OOOTTAFVGVAH",
        purpose: "12 Cranial Nerves in Numerical Order (CN I to CN XII)",
        phrase: "Oh Once One Takes The Anatomy Final Very Good Vacations Are Heavenly",
        breakdown: [
          { letter: "O - O - O", meaning: "I: Olfactory, II: Optic, III: Oculomotor" },
          { letter: "T - T - A", meaning: "IV: Trochlear, V: Trigeminal, VI: Abducens" },
          { letter: "F - V - G", meaning: "VII: Facial, VIII: Vestibulocochlear, IX: Glossopharyngeal" },
          { letter: "V - A - H", meaning: "X: Vagus, XI: Accessory (Spinal), XII: Hypoglossal" },
        ],
        clinicalPearl: "Indispensable for neurological exams, stroke mapping, and cranial nerve palsies.",
      },
      {
        id: "bm2",
        name: "Some Say Marry Money",
        purpose: "Cranial Nerve Functional Modality (Sensory, Motor, or Both)",
        phrase: "Some Say Marry Money But My Brother Says Big Brains Matter More",
        breakdown: [
          { letter: "S, S, M, M", meaning: "I: Sensory, II: Sensory, III: Motor, IV: Motor" },
          { letter: "B, M, B, S", meaning: "V: Both, VI: Motor, VII: Both, VIII: Sensory" },
          { letter: "B, B, M, M", meaning: "IX: Both, X: Both, XI: Motor, XII: Motor" },
        ],
        clinicalPearl: "Rapidly determines whether cranial nerve deficits involve sensory deficits, muscular weakness, or mixed modalities.",
      },
    ],
    quizzes: [
      {
        id: "bq1",
        question: "Which anatomical structure primarily coordinates voluntary muscle precision, timing, and balance?",
        options: [
          "Prefrontal Cortex",
          "Cerebellum",
          "Hippocampus",
          "Thalamus",
        ],
        correctIndex: 1,
        explanation: "The Cerebellum ('little brain') calibrates motor execution, posture, and coordination using proprioceptive feedback. Damage leads to ataxia, intention tremor, and dysmetria.",
        difficulty: "Beginner",
      },
      {
        id: "bq2",
        question: "Cerebrospinal fluid (CSF) is predominantly synthesized within the cerebral ventricles by which structure?",
        options: [
          "Choroid Plexus",
          "Arachnoid Granulations",
          "Corpus Callosum",
          "Substantia Nigra",
        ],
        correctIndex: 0,
        explanation: "The Choroid Plexus (specialized ependymal cells and capillaries) produces roughly 500 mL of CSF daily, circulating through the ventricular system into the subarachnoid space.",
        difficulty: "Intermediate",
      },
    ],
  },

  lungs: {
    title: "Lungs & Airways",
    latinName: "Pulmones",
    system: "Respiratory System",
    badgeColor: "#38bdf8",
    icon: "Wind",
    stats: {
      alveoli: "~300 to 500 million microscopic air sacs",
      surfaceArea: "70 to 100 m² (equivalent to half a tennis court)",
      restingBreaths: "12 to 20 breaths per minute (~22,000 times daily)",
      airProcessed: "~11,000 liters of atmospheric air daily",
    },
    overview: `The lungs are the principal organs of the human respiratory system, located within the thoracic cavity on either side of the heart. Air travels through the nasal passages, pharynx, larynx, and trachea, which bifurcates into the left and right primary bronchi.

Deep within each lung, bronchi branch into bronchioles and terminate in over 300 million alveoli wrapped in capillary meshes. At the thin blood-air barrier (less than 0.5 micrometers), oxygen diffuses into pulmonary capillaries while carbon dioxide diffuses into alveolar space to be exhaled.`,
    facts: [
      {
        id: "l1",
        title: "Lungs Can Float on Water",
        tag: "Physiology Trivia",
        description: "The lungs are the only human organs capable of floating on water. Even after maximum forced exhalation, residual air volume (~1.2 L) remains trapped inside alveoli, giving lungs positive buoyancy.",
      },
      {
        id: "l2",
        title: "Half a Tennis Court Inside Your Chest",
        tag: "Anatomical Architecture",
        description: "If the spherical surfaces of all 400 million alveoli were unfolded and laid flat, their gas-exchange surface area would span 75 to 100 square meters—ample to absorb oxygen within milliseconds.",
      },
      {
        id: "l3",
        title: "Anatomical Asymmetry",
        tag: "Morphology",
        description: "The right lung has 3 lobes (superior, middle, inferior) and is larger. The left lung has only 2 lobes and a concave indent called the 'cardiac notch' to leave space for the apex of the heart.",
      },
    ],
    mnemonics: [
      {
        id: "lm1",
        name: "Right has 3, Left has 2 (Heart took a bite!)",
        purpose: "Remembering Lung Lobar Anatomy",
        phrase: "Right = 3 Lobes | Left = 2 Lobes (Cardiac Notch)",
        breakdown: [
          { letter: "Right (3)", meaning: "Superior, Middle, and Inferior lobes separated by horizontal and oblique fissures" },
          { letter: "Left (2)", meaning: "Superior and Inferior lobes with cardiac notch and lingula" },
        ],
        clinicalPearl: "Aspirated foreign objects most frequently lodge in the right mainstem bronchus because it is wider, shorter, and more vertical.",
      },
      {
        id: "lm2",
        name: "RALS",
        purpose: "Relationship of Pulmonary Artery to Bronchus at Lung Hilum",
        phrase: "R-A-L-S",
        breakdown: [
          { letter: "R - A", meaning: "Right pulmonary artery is Anterior to the main bronchus" },
          { letter: "L - S", meaning: "Left pulmonary artery is Superior to the main bronchus" },
        ],
        clinicalPearl: "Vital anatomical landmark for thoracic surgeons during pulmonary lobectomy and hilar dissection.",
      },
    ],
    quizzes: [
      {
        id: "lq1",
        question: "Why do inhaled foreign bodies preferentially lodge in the right mainstem bronchus rather than the left?",
        options: [
          "The right bronchus is wider, shorter, and runs more vertically",
          "The left bronchus is completely obstructed by the aortic arch",
          "The right lung has higher negative intrapleural pressure",
          "The carina tilts airflow exclusively toward the right side",
        ],
        correctIndex: 0,
        explanation: "The right mainstem bronchus branches off the trachea at a steeper, more vertical angle (~25° vs ~45° on left), is wider, and shorter (~2.5 cm vs ~5 cm), making it the path of least resistance for aspirated items.",
        difficulty: "High-Yield Medical",
      },
      {
        id: "lq2",
        question: "Which substance produced by Type II alveolar pneumocytes prevents alveolar collapse at end-expiration?",
        options: [
          "Mucin",
          "Pulmonary Surfactant",
          "Angiotensin Converting Enzyme (ACE)",
          "Heparin",
        ],
        correctIndex: 1,
        explanation: "Pulmonary Surfactant (dipalmitoylphosphatidylcholine) disrupts hydrogen bonding in water, reducing alveolar surface tension according to the Law of Laplace and preventing atelectasis (collapse).",
        difficulty: "Intermediate",
      },
    ],
  },

  liver: {
    title: "Liver & Gallbladder",
    latinName: "Hepar",
    system: "Digestive & Metabolic System",
    badgeColor: "#b45309",
    icon: "Shield",
    stats: {
      weight: "~1.4 – 1.6 kg (heaviest internal organ)",
      bloodReserve: "Holds ~13% (1 pint) of total blood volume at any moment",
      functions: "Performs over 500 distinct vital biochemical reactions",
      bileProduction: "Synthesizes 800 to 1,000 mL of bile every single day",
    },
    overview: `The liver is the body's premier metabolic clearinghouse and chemical processing factory, nestled beneath the right diaphragm. It receives a unique dual blood supply: oxygenated arterial blood from the hepatic artery (25%) and nutrient-rich, deoxygenated venous blood from the intestines, spleen, and pancreas via the hepatic portal vein (75%).

Within microscopic hepatic lobules, hepatocytes filter toxins, synthesize plasma proteins (albumin, clotting factors), regulate lipid metabolism, convert toxic ammonia into urea, and store glucose as glycogen.`,
    facts: [
      {
        id: "liv1",
        title: "Miraculous Regenerative Capacity",
        tag: "Regenerative Biology",
        description: "The liver is the only visceral organ that can regenerate completely. Even if 75% of hepatic tissue is surgically removed or destroyed, the remaining healthy hepatocytes can restore full mass within weeks!",
      },
      {
        id: "liv2",
        title: "Massive Dual Vascular Supply",
        tag: "Hemodynamics",
        description: "The liver receives approximately 1.5 liters of blood per minute. The portal vein delivers all digested nutrients, vitamins, and oral medications directly to hepatocytes for 'first-pass metabolism'.",
      },
      {
        id: "liv3",
        title: "Synthetic Powerhouse for Coagulation",
        tag: "Hematology",
        description: "Virtually all human blood clotting factors (Factors I, II, V, VII, IX, X, XI, XII) and protein C/S are synthesized in the liver; severe liver failure leads to profound bleeding diathesis.",
      },
    ],
    mnemonics: [
      {
        id: "livm1",
        name: "PUSH DoG",
        purpose: "Major Functions of the Liver",
        phrase: "P - U - S - H   D - o - G",
        breakdown: [
          { letter: "P (Protein synthesis)", meaning: "Albumin, Fibrinogen, Clotting factors" },
          { letter: "U (Ureagenesis)", meaning: "Converts toxic Ammonia (NH3) to Urea" },
          { letter: "S (Storage)", meaning: "Stores Glycogen, Iron (Ferritin), and Vitamins A, D, B12" },
          { letter: "H (Hormone clearance)", meaning: "Clears circulating estrogens, aldosterone, cortisol" },
          { letter: "D (Detoxification)", meaning: "Metabolizes xenobiotics, alcohol, and drugs via Cytochrome P450" },
          { letter: "G (Glucose balance)", meaning: "Performs Gluconeogenesis and Glycogenolysis" },
        ],
        clinicalPearl: "Explains classic symptoms of liver cirrhosis: ascites (low albumin), jaundice (bilirubin), and hepatic encephalopathy (high ammonia).",
      },
    ],
    quizzes: [
      {
        id: "livq1",
        question: "What percentage of the liver's blood supply enters via the Hepatic Portal Vein?",
        options: [
          "Approximately 25%",
          "Approximately 50%",
          "Approximately 75%",
          "100%",
        ],
        correctIndex: 2,
        explanation: "The Hepatic Portal Vein provides approximately 75% of liver blood flow (carrying absorbed nutrients from GI tract), while the Hepatic Artery supplies the remaining 25% (oxygen-rich blood from the celiac trunk).",
        difficulty: "Intermediate",
      },
    ],
  },

  kidneys: {
    title: "Kidneys & Urinary Tract",
    latinName: "Renes",
    system: "Renal & Urinary System",
    badgeColor: "#9333ea",
    icon: "Filter",
    stats: {
      filtration: "Filters ~180 L of fluid daily (~48 gallons)",
      reabsorption: "Reabsorbs 99% of filtrate, excreting 1.5–2 L as urine",
      cardiacOutput: "Receives 20–25% of total resting cardiac output",
      nephrons: "~1 million microscopic filtering nephrons per kidney",
    },
    overview: `The kidneys are paired retroperitoneal bean-shaped organs positioned against the posterior abdominal wall (T12 to L3 vertebral level). The right kidney lies slightly lower than the left due to the liver above it.

Each kidney houses roughly one million functional units called nephrons. As arterial blood flows under high hydrostatic pressure into the glomerulus, water, electrolytes, glucose, and urea pass into Bowman's capsule. Along the proximal convoluted tubule, loop of Henle, distal tubule, and collecting duct, the body reabsorbs essential ions and water while secreting acids, drugs, and excess potassium.`,
    facts: [
      {
        id: "k1",
        title: "Stupendous Blood Perfusion",
        tag: "Hemodynamics",
        description: "Although both kidneys together make up less than 0.5% of total body weight, they receive 20% to 25% of the heart's entire cardiac output (~1.2 L/min) to continuously cleanse blood.",
      },
      {
        id: "k2",
        title: "99% Conservation Efficiency",
        tag: "Physiology",
        description: "Your nephrons filter roughly 180 liters of blood plasma daily—enough to fill a standard bathtub! However, 178.5 liters are conserved and reabsorbed back into circulation, yielding only ~1.5 L of concentrated urine.",
      },
      {
        id: "k3",
        title: "Master Blood Pressure Controller",
        tag: "Endocrinology",
        description: "Kidneys detect drops in renal perfusion and release Renin, initiating the Renin-Angiotensin-Aldosterone System (RAAS) to constrict systemic arterioles and preserve arterial pressure.",
      },
    ],
    mnemonics: [
      {
        id: "km1",
        name: "A WET BED",
        purpose: "7 Core Life-Sustaining Kidney Functions",
        phrase: "A   W - E - T   B - E - D",
        breakdown: [
          { letter: "A", meaning: "Acid-Base balance maintenance via bicarbonate reabsorption & H+ secretion" },
          { letter: "W", meaning: "Water balance regulation via Antidiuretic Hormone (ADH/Vasopressin)" },
          { letter: "E", meaning: "Erythropoietin production stimulating bone marrow to produce red blood cells" },
          { letter: "T", meaning: "Toxin & metabolic waste removal (Urea, Creatinine, Uric acid)" },
          { letter: "B", meaning: "Blood pressure regulation via Renin-Angiotensin-Aldosterone (RAAS)" },
          { letter: "E", meaning: "Electrolyte homeostasis (Na+, K+, Ca2+, Mg2+, PO4 3-)" },
          { letter: "D", meaning: "Vitamin D activation (1-alpha hydroxylase converts calcidiol to Calcitriol)" },
        ],
        clinicalPearl: "Chronic kidney disease leads to acidosis, anemia (low erythropoietin), renal osteodystrophy (low active Vitamin D), and hypertension.",
      },
    ],
    quizzes: [
      {
        id: "kq1",
        question: "Which hormone produced by peritubular capillary interstitial cells in the kidney stimulates erythrocyte (RBC) maturation?",
        options: [
          "Aldosterone",
          "Erythropoietin (EPO)",
          "Calcitonin",
          "Vasopressin",
        ],
        correctIndex: 1,
        explanation: "In response to renal tissue hypoxia, the kidneys secrete Erythropoietin (EPO), which travels to bone marrow to stimulate proerythroblast proliferation. Chronic renal failure causes normocytic anemia due to EPO deficiency.",
        difficulty: "Beginner",
      },
    ],
  },

  stomach: {
    title: "Stomach & Digestive Tract",
    latinName: "Gaster / Ventriculus",
    system: "Digestive System",
    badgeColor: "#f97316",
    icon: "Utensils",
    stats: {
      acidPH: "pH 1.5 – 2.5 (strong enough to dissolve zinc metal)",
      capacity: "50 mL empty; expands to 2 to 4 liters after a meal",
      cellTurnover: "Replaces internal mucosal lining every 3 to 5 days",
      dailyJuice: "Secretes 2 to 3 liters of gastric juice daily",
    },
    overview: `The stomach is a J-shaped muscular dilatation of the alimentary canal situated between the esophagus and duodenum in the left upper quadrant. It is divided anatomically into the cardia, fundus, body, and pyloric antrum.

The stomach wall features three distinct smooth muscle layers (longitudinal, circular, and inner oblique) that churn ingested food boluses into acidic chyme. Special parietal cells synthesize hydrochloric acid (HCl) and intrinsic factor, while chief cells secrete pepsinogen.`,
    facts: [
      {
        id: "s1",
        title: "Acid Strong Enough to Dissolve Metal",
        tag: "Biochemistry",
        description: "Gastric juice contains concentrated hydrochloric acid (pH 1.5–2.0), capable of corroding copper and zinc. To keep from digesting itself, the stomach produces an alkaline bicarbonate-mucus barrier.",
      },
      {
        id: "s2",
        title: "A Complete Tissue Renewal Every 72 Hours",
        tag: "Histology",
        description: "Due to the intense harshness of stomach acid and pepsin enzymes, your stomach sheds and regenerates approximately 500,000 epithelial cells every minute, replacing its whole lining every 3–5 days.",
      },
      {
        id: "s3",
        title: "Essential for Vitamin B12 and Survival",
        tag: "Physiology",
        description: "While the stomach is not necessary for nutrient absorption (which occurs in the small intestine), it produces Intrinsic Factor—an absolute requirement for Vitamin B12 absorption in the terminal ileum.",
      },
    ],
    mnemonics: [
      {
        id: "sm1",
        name: "PEP & CHIEF",
        purpose: "Secretory Cells of the Gastric Mucosa",
        phrase: "Chiefs drink PEPSIn, Parents make ACID & FACTOR",
        breakdown: [
          { letter: "Chief Cells", meaning: "Secrete Pepsinogen (cleaved by acid into active Pepsin to digest proteins)" },
          { letter: "Parietal Cells", meaning: "Secrete Hydrochloric Acid (HCl) and Intrinsic Factor (for B12 absorption)" },
          { letter: "G Cells", meaning: "Secrete Gastrin into bloodstream to stimulate acid production" },
        ],
        clinicalPearl: "Autoimmune destruction of parietal cells causes Pernicious Anemia due to lack of Intrinsic Factor.",
      },
    ],
    quizzes: [
      {
        id: "sq1",
        question: "Gastric parietal cells are responsible for secreting Hydrochloric Acid (HCl) and which other vital molecule?",
        options: [
          "Pepsinogen",
          "Intrinsic Factor",
          "Cholecystokinin (CCK)",
          "Bile Salts",
        ],
        correctIndex: 1,
        explanation: "Parietal cells secrete Intrinsic Factor (IF). Intrinsic factor binds Vitamin B12 in the duodenum, safeguarding it until receptor-mediated endocytosis in the terminal ileum.",
        difficulty: "Intermediate",
      },
    ],
  },

  pancreas: {
    title: "Pancreas",
    latinName: "Pancreas",
    system: "Endocrine & Exocrine System",
    badgeColor: "#eab308",
    icon: "Sparkles",
    stats: {
      composition: "95% Exocrine (digestive enzymes) + 5% Endocrine (islets)",
      dailyEnzymes: "Produces ~1.5 to 2 liters of alkaline digestive juice daily",
      isletsCount: "~1 to 2 million Islets of Langerhans scattered in tail",
    },
    overview: `The pancreas is an elongated, retroperitoneal dual-function gland positioned horizontally behind the stomach across the posterior abdominal wall.

Its exocrine portion (acinar cells) synthesizes potent digestive proenzymes (trypsinogen, chymotrypsinogen, amylase, lipase) and bicarbonate to neutralize acidic gastric chyme in the duodenum. Its endocrine portion (Islets of Langerhans) releases insulin from beta cells and glucagon from alpha cells directly into the portal circulation.`,
    facts: [
      {
        id: "p1",
        title: "Dual Identity: Gland and Digestive Factory",
        tag: "Physiology",
        description: "The pancreas is both an exocrine gland (discharging enzymes through the pancreatic duct into the duodenum) and an endocrine gland (releasing insulin and glucagon directly into blood capillaries).",
      },
      {
        id: "p2",
        title: "Enzymatic Safety Pin Mechanisms",
        tag: "Pathophysiology",
        description: "To prevent the pancreas from digesting itself, digestive enzymes are synthesized in inactive zymogen forms. If trypsinogen prematurely activates inside pancreatic tissue, acute necrotizing pancreatitis occurs.",
      },
    ],
    mnemonics: [
      {
        id: "pm1",
        name: "BAD HITS",
        purpose: "Common Etiologies of Acute Pancreatitis",
        phrase: "B - A - D   H - I - T - S",
        breakdown: [
          { letter: "B (Biliary)", meaning: "Gallstones obstructing the ampulla of Vater (most common)" },
          { letter: "A (Alcohol)", meaning: "Chronic or binge ethanol consumption" },
          { letter: "D (Drugs)", meaning: "Diuretics, didanosine, azathioprine, steroids" },
          { letter: "H (Hypertriglyceridemia)", meaning: "Serum triglycerides >1000 mg/dL or hypercalcemia" },
          { letter: "I (Idiopathic / Trauma)", meaning: "Blunt abdominal trauma or post-ERCP" },
        ],
        clinicalPearl: "Gallstones and alcohol account for over 80% of all acute pancreatitis admissions in emergency departments.",
      },
    ],
    quizzes: [
      {
        id: "pq1",
        question: "Which cell type within the pancreatic Islets of Langerhans secretes Insulin?",
        options: [
          "Alpha cells",
          "Beta cells",
          "Delta cells",
          "PP (F) cells",
        ],
        correctIndex: 1,
        explanation: "Beta cells (~65-80% of islet cells) produce and secrete Insulin. Alpha cells produce glucagon, while Delta cells secrete somatostatin.",
        difficulty: "Beginner",
      },
    ],
  },

  skeleton: {
    title: "Axial Skeleton & Spine",
    latinName: "Systema Skeletale",
    system: "Skeletal System",
    badgeColor: "#cbd5e1",
    icon: "Bone",
    stats: {
      bones: "206 bones in adult body (babies born with ~270)",
      calciumBank: "Stores 99% of total body calcium & 85% of phosphorus",
      marrowOutput: "Produces 200 billion red blood cells every day",
      strengthWeight: "Ounce for ounce, human bone is stronger than steel",
    },
    overview: `The human skeleton is the structural architectural framework of the body, categorized into the axial skeleton (cranium, vertebral column, ribs, sternum; 80 bones) and appendicular skeleton (pectoral girdles, upper limbs, pelvic girdle, lower limbs; 126 bones).

Bones protect delicate internal organs, articulate with skeletal muscles to provide biomechanical levers for movement, maintain mineral homeostasis, and house hematopoietic red bone marrow.`,
    facts: [
      {
        id: "sk1",
        title: "Bone is Constantly Remodeling",
        tag: "Osteology",
        description: "Your bones are not dead mineral deposits; they are intensely living tissue. Osteoclasts dissolve old bone and osteoblasts lay down new osteoid matrix so that you get an entirely new skeleton every 7 to 10 years!",
      },
      {
        id: "sk2",
        title: "Taller in the Morning",
        tag: "Biomechanics",
        description: "During the day, upright gravity compresses water out of the fibrocartilaginous intervertebral discs. When you wake up after lying horizontal overnight, you are up to 1 cm taller than when you went to bed!",
      },
    ],
    mnemonics: [
      {
        id: "skm1",
        name: "Breakfast at 7, Lunch at 12, Dinner at 5",
        purpose: "Number of Vertebrae in the Spine Segments",
        phrase: "7 Cervical, 12 Thoracic, 5 Lumbar",
        breakdown: [
          { letter: "7 (Breakfast)", meaning: "Cervical vertebrae (C1 to C7) in the neck" },
          { letter: "12 (Lunch)", meaning: "Thoracic vertebrae (T1 to T12) articulating with 12 pairs of ribs" },
          { letter: "5 (Dinner)", meaning: "Lumbar vertebrae (L1 to L5) bearing upper body weight" },
        ],
        clinicalPearl: "Followed by 5 fused sacral vertebrae (sacrum) and 4 fused coccygeal vertebrae (coccyx).",
      },
      {
        id: "skm2",
        name: "Some Lovers Try Positions That They Can't Handle",
        purpose: "8 Carpal Wrist Bones (Proximal to Distal, Lateral to Medial)",
        phrase: "S - L - T - P   T - T - C - H",
        breakdown: [
          { letter: "Proximal Row", meaning: "Scaphoid, Lunate, Triquetrum, Pisiform" },
          { letter: "Distal Row", meaning: "Trapezium, Trapezoid, Capitate, Hamate" },
        ],
        clinicalPearl: "Scaphoid is the most commonly fractured carpal bone; avascular necrosis is a major danger due to retrograde blood supply.",
      },
    ],
    quizzes: [
      {
        id: "skq1",
        question: "How many thoracic vertebrae articulate with the 12 pairs of ribs in humans?",
        options: [
          "7",
          "10",
          "12",
          "14",
        ],
        correctIndex: 2,
        explanation: "There are 12 Thoracic vertebrae (T1 to T12). Each thoracic vertebra possesses costal facets on its transverse processes and vertebral body that articulate with ribs.",
        difficulty: "Beginner",
      },
    ],
  },
};

// Global fallback for whole body atlas view
export const GLOBAL_ANATOMY_EDUCATION = {
  title: "Human Body Atlas",
  latinName: "Corpus Humanum",
  system: "Full System Overview",
  badgeColor: "#5eead4",
  icon: "User",
  stats: {
    totalStructures: "147 high-detail 3D anatomical structures",
    systemsCount: "7 interconnected physiological systems",
    cellCount: "~37.2 trillion cells living in metabolic synergy",
    vesselsLength: "~60,000 miles of systemic and pulmonary conduits",
  },
  overview: `The human body is an extraordinary physiological machine comprising 11 major organ systems organized in structural hierarchy: chemical molecules assemble into organelles, cells, tissues, organs, organ systems, and the living human organism.

In this interactive 3D explorer, examine the spatial relationships of visceral organs, vascular conduits, neural pathways, and the musculoskeletal frame in real-time 3D rotation, isolation, and exploded dissection.`,
  facts: [
    {
      id: "gf1",
      title: "Trillions of Coordinated Cells",
      tag: "Cell Biology",
      description: "An adult human is composed of approximately 37.2 trillion human cells, accompanied by an equal number of symbiotic microbiome bacterial cells residing predominantly in the colon.",
    },
    {
      id: "gf2",
      title: "Skin: The Largest Human Organ",
      tag: "Integumentary System",
      description: "The skin (integument) is your largest single organ, accounting for ~15% of total adult body weight and spanning roughly 2 square meters to guard against pathogens and dehydration.",
    },
    {
      id: "gf3",
      title: "Constant Cellular Replacement",
      tag: "Physiology",
      description: "Every second, your red bone marrow produces over 2 to 3 million new red blood cells to replace aging erythrocytes recycled by the spleen and liver.",
    },
  ],
  mnemonics: [
    {
      id: "gfm1",
      name: "I RUN CLUMSY",
      purpose: "11 Organ Systems of the Human Body",
      phrase: "I   R - U - N   C - L - U - M - S - Y",
      breakdown: [
        { letter: "I", meaning: "Integumentary (Skin, Hair, Nails)" },
        { letter: "R - U - N", meaning: "Respiratory, Urinary, Nervous" },
        { letter: "C - L - U", meaning: "Circulatory, Lymphatic (Immune), Urogenital (Reproductive)" },
        { letter: "M - S - Y", meaning: "Muscular, Skeletal, Endocrine (yields hormones)" },
      ],
      clinicalPearl: "Essential framing for comprehensive systems-based medical diagnosis and review of systems (ROS).",
    },
  ],
  quizzes: [
    {
      id: "gfq1",
      question: "Which of the following is the largest internal organ in the adult human body?",
      options: [
        "Brain",
        "Liver",
        "Heart",
        "Spleen",
      ],
      correctIndex: 1,
      explanation: "The Liver is the largest internal visceral organ, weighing approximately 1.5 kg (skin is the largest overall organ).",
      difficulty: "Beginner",
    },
    {
      id: "gfq2",
      question: "What is the anatomical term for lying face-downward?",
      options: [
        "Supine",
        "Prone",
        "Fowler's position",
        "Trendelenburg",
      ],
      correctIndex: 1,
      explanation: "Prone refers to lying face downward on the ventral surface; Supine means lying on the back with face upward ('Supine is on the spine').",
      difficulty: "Beginner",
    },
  ],
};

// Resolves education details for any structure or organ
export function resolveEducation(key, system) {
  if (!key) return GLOBAL_ANATOMY_EDUCATION;
  const lower = key.toLowerCase();
  
  if (/heart|cardiac|aorta|vena/.test(lower)) return ORGAN_EDUCATION.heart;
  if (/brain|cereb|pituitary|cranial/.test(lower)) return ORGAN_EDUCATION.brain;
  if (/lung|bronch|trachea|larynx/.test(lower)) return ORGAN_EDUCATION.lungs;
  if (/liver|gallbladder|biliary/.test(lower)) return ORGAN_EDUCATION.liver;
  if (/kidney|nephr|ureter|bladder|adrenal/.test(lower)) return ORGAN_EDUCATION.kidneys;
  if (/stomach|gastric|esophag|intestin|colon|appendix/.test(lower)) return ORGAN_EDUCATION.stomach;
  if (/pancreas/.test(lower)) return ORGAN_EDUCATION.pancreas;
  if (/spine|verteb|skull|rib|pelvis|bone|skeleton/.test(lower)) return ORGAN_EDUCATION.skeleton;

  // If specific structure is not a core organ preset, generate tailored high-yield details
  return {
    title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    latinName: "Structura Anatomica",
    system: system ? system.toUpperCase() : "Musculoskeletal",
    badgeColor: "#14b8a6",
    icon: "Activity",
    stats: {
      type: "Anatomical component",
      system: system || "Human Anatomy",
      status: "Integrated 3D structure",
      importance: "High-yield anatomical landmark",
    },
    overview: `This structure is a vital constituent of the ${system || "human"} anatomical network. Explore its 3D spatial alignment, relations with adjacent vascular and neural structures, and examine its anatomical boundaries.`,
    facts: [
      {
        id: "gen1",
        title: "Anatomical Precision",
        tag: "Spatial Morphology",
        description: "Mapped directly from high-resolution BodyParts3D and HuBMAP human research datasets for millimeter-accurate medical education.",
      },
      {
        id: "gen2",
        title: "Dynamic Interaction",
        tag: "Functional Anatomy",
        description: "Works synergistically with adjacent muscular, vascular, and organ layers to preserve physiological homeostasis.",
      },
    ],
    mnemonics: GLOBAL_ANATOMY_EDUCATION.mnemonics,
    quizzes: GLOBAL_ANATOMY_EDUCATION.quizzes,
  };
}

// Defines the organ groups, their constituent meshes, landmarks, and presets for the 3D Organ Studio

export const ORGAN_PRESETS = [
  {
    id: "heart",
    name: "Heart",
    latinName: "Cor",
    system: "Cardiovascular",
    color: "#e11d48",
    icon: "Heart",
    primaryKey: "heart",
    meshes: ["heart", "aorta", "vena_cava"],
    summary: "Muscular pump circulating blood through the pulmonary and systemic vascular networks.",
    cameraDistance: 2.2,
    landmarks: [
      { name: "Ascending Aorta", position: [0.03, 0.42, -0.02], role: "Distributes oxygenated blood to systemic arteries" },
      { name: "Superior Vena Cava", position: [-0.22, 0.38, -0.06], role: "Returns deoxygenated blood from upper body" },
      { name: "Right Atrium", position: [-0.28, 0.08, 0.12], role: "Receives venous return via vena cavae" },
      { name: "Right Ventricle", position: [-0.18, -0.22, 0.22], role: "Ejects blood into the pulmonary circulation" },
      { name: "Left Ventricle", position: [0.24, -0.24, 0.16], role: "High-pressure pump sending blood to the aorta" },
      { name: "Pulmonary Trunk", position: [-0.04, 0.26, 0.24], role: "Carries deoxygenated blood to the lungs" },
    ],
  },
  {
    id: "brain",
    name: "Brain",
    latinName: "Cerebrum / Encephalon",
    system: "Nervous System",
    color: "#f472b6",
    icon: "Brain",
    primaryKey: "brain",
    meshes: ["brain", "brainstem", "cerebellum", "pituitary", "cranial_nerves"],
    summary: "Central nervous system command center orchestrating cognition, sensory processing, and homeostasis.",
    cameraDistance: 2.4,
    landmarks: [
      { name: "Cerebral Cortex (Frontal/Parietal)", position: [0, 0.35, 0.08], role: "Higher cognitive functions, executive planning, and sensory integration" },
      { name: "Cerebellum", position: [0, -0.25, -0.32], role: "Coordinates voluntary motor movements, precision, and balance" },
      { name: "Brainstem (Pons & Medulla)", position: [0, -0.42, -0.04], role: "Controls vital autonomic reflexes: heart rate, respiration, and vasomotor tone" },
      { name: "Pituitary Gland", position: [0, -0.08, 0.22], role: "Master endocrine gland regulating systemic hormonal cascades" },
    ],
  },
  {
    id: "lungs",
    name: "Lungs & Airways",
    latinName: "Pulmones",
    system: "Respiratory",
    color: "#38bdf8",
    icon: "Wind",
    primaryKey: "lung_l",
    meshes: ["lung_l", "lung_r", "trachea", "bronchi", "larynx"],
    summary: "Bilateral gas exchange organs extracting oxygen from inspired air and eliminating carbon dioxide.",
    cameraDistance: 2.5,
    landmarks: [
      { name: "Trachea (Windpipe)", position: [0, 0.52, 0.04], role: "Fibrocartilaginous tube conducting air from larynx to bronchi" },
      { name: "Primary Bronchi", position: [0, 0.22, -0.02], role: "Bifurcates airflow into left and right bronchial trees" },
      { name: "Right Lung (3 Lobes)", position: [-0.34, -0.06, 0.06], role: "Superior, middle, and inferior lobes; larger volume" },
      { name: "Left Lung (2 Lobes & Cardiac Notch)", position: [0.34, -0.06, 0.06], role: "Superior and inferior lobes shaped around cardiac notch" },
    ],
  },
  {
    id: "liver",
    name: "Liver & Gallbladder",
    latinName: "Hepar",
    system: "Digestive",
    color: "#b45309",
    icon: "Shield",
    primaryKey: "liver",
    meshes: ["liver", "gallbladder"],
    summary: "Largest internal metabolic organ responsible for detoxification, bile production, and glycogen storage.",
    cameraDistance: 2.3,
    landmarks: [
      { name: "Right Hepatic Lobe", position: [-0.32, 0.04, 0.05], role: "Larger anatomical lobe containing segments V through VIII" },
      { name: "Left Hepatic Lobe", position: [0.32, -0.02, 0.08], role: "Extends across midline towards the gastric fundus" },
      { name: "Gallbladder", position: [-0.14, -0.28, 0.22], role: "Concentrates and stores bile until cholecystokinin release" },
      { name: "Porta Hepatis", position: [0.02, -0.16, -0.08], role: "Entry for hepatic portal vein, hepatic artery, and common bile duct" },
    ],
  },
  {
    id: "kidneys",
    name: "Kidneys & Urinary Tract",
    latinName: "Renes",
    system: "Urinary / Renal",
    color: "#9333ea",
    icon: "Filter",
    primaryKey: "kidney_l",
    meshes: ["kidney_l", "kidney_r", "adrenal_l", "adrenal_r", "ureter_l", "ureter_r", "bladder"],
    summary: "Paired retroperitoneal organs filtering blood, regulating blood pressure, and managing electrolyte balance.",
    cameraDistance: 2.6,
    landmarks: [
      { name: "Right Kidney", position: [-0.36, 0.14, 0.02], role: "Positioned slightly lower due to liver displacement" },
      { name: "Left Kidney", position: [0.36, 0.22, 0.02], role: "Filters ~90 L blood daily into primary filtrate" },
      { name: "Adrenal Glands", position: [0.36, 0.44, 0.04], role: "Produce aldosterone, cortisol, adrenaline, and noradrenaline" },
      { name: "Bilateral Ureters", position: [0.18, -0.12, 0.02], role: "Muscular tubes transporting urine via peristalsis" },
      { name: "Urinary Bladder", position: [0, -0.48, 0.12], role: "Distensible reservoir storing urine up to ~500-600 mL" },
    ],
  },
  {
    id: "stomach",
    name: "Stomach & Digestive Tract",
    latinName: "Gaster / Ventriculus",
    system: "Digestive",
    color: "#f97316",
    icon: "Utensils",
    primaryKey: "stomach",
    meshes: ["stomach", "esophagus", "small_intestine", "colon", "appendix", "pancreas"],
    summary: "Acidic reservoir initiating protein digestion and mechanical churning before passing chyme to intestines.",
    cameraDistance: 2.7,
    landmarks: [
      { name: "Lower Esophagus", position: [0.06, 0.52, -0.04], role: "Transports food bolus through gastroesophageal junction" },
      { name: "Gastric Fundus & Body", position: [0.24, 0.26, 0.1], role: "Parietal cells secrete HCl and intrinsic factor" },
      { name: "Pyloric Sphincter", position: [-0.08, 0.08, 0.14], role: "Regulates passage of chyme into the duodenum" },
      { name: "Small Intestine (Duodenum/Jejunum)", position: [0, -0.12, 0.16], role: "Primary site of enzymatic breakdown and nutrient absorption" },
      { name: "Large Intestine (Colon)", position: [0, -0.22, 0.08], role: "Reabsorbs water and electrolytes, houses microbiome" },
      { name: "Vermiform Appendix", position: [-0.32, -0.46, 0.18], role: "Vestigial lymphoid organ and bacterial biofilm reservoir" },
    ],
  },
  {
    id: "pancreas",
    name: "Pancreas",
    latinName: "Pancreas",
    system: "Endocrine & Digestive",
    color: "#eab308",
    icon: "Sparkles",
    primaryKey: "pancreas",
    meshes: ["pancreas", "gallbladder"],
    summary: "Dual exocrine-endocrine gland synthesizing digestive enzymes and insulin/glucagon blood sugar regulators.",
    cameraDistance: 2.2,
    landmarks: [
      { name: "Pancreatic Head", position: [-0.22, 0.02, 0.04], role: "Nestles inside the C-loop of the duodenum" },
      { name: "Pancreatic Body & Tail", position: [0.22, 0.12, -0.02], role: "Extends retroperitoneally toward the splenic hilum" },
      { name: "Islets of Langerhans", position: [0.02, 0.06, 0.02], role: "Endocrine clusters secreting insulin (beta) and glucagon (alpha)" },
    ],
  },
  {
    id: "spleen",
    name: "Spleen",
    latinName: "Lien",
    system: "Lymphatic / Immune",
    color: "#ec4899",
    icon: "ShieldAlert",
    primaryKey: "spleen",
    meshes: ["spleen"],
    summary: "Primary lymphoid filter clearing senescent erythrocytes, storing platelets, and mounting immune responses.",
    cameraDistance: 2.0,
    landmarks: [
      { name: "Red Pulp", position: [0, 0.08, 0.04], role: "Filters mechanical deformability of red blood cells, recycles iron" },
      { name: "White Pulp", position: [0, -0.08, -0.02], role: "Periarteriolar lymphoid sheaths mounting adaptive humoral immunity" },
      { name: "Splenic Hilum", position: [-0.08, 0, -0.06], role: "Vascular entry for splenic artery and vein" },
    ],
  },
  {
    id: "skeleton",
    name: "Axial Skeleton & Spine",
    latinName: "Skeleton Axiale",
    system: "Skeletal",
    color: "#cbd5e1",
    icon: "Bone",
    primaryKey: "skull",
    meshes: ["skull", "spine_cervical", "spine_thoracic", "spine_lumbar", "ribcage", "pelvis", "clavicle_l", "clavicle_r"],
    summary: "Rigid protective framework safeguarding vital viscera and articulating body posture and biomechanics.",
    cameraDistance: 3.2,
    landmarks: [
      { name: "Cranium (Skull)", position: [0, 0.82, 0.02], role: "Neurocranium protecting the brain and splanchnocranium forming the face" },
      { name: "Cervical Spine (C1-C7)", position: [0, 0.58, -0.04], role: "Supports the head with atlas (C1) and axis (C2) permitting high rotation" },
      { name: "Thoracic Cage & Ribs", position: [0, 0.22, 0.08], role: "12 pairs of ribs protecting the cardiopulmonary organs" },
      { name: "Lumbar Spine (L1-L5)", position: [0, -0.12, -0.04], role: "Massive vertebral bodies bearing upper body weight" },
      { name: "Pelvic Girdle", position: [0, -0.42, 0.04], role: "Binds the lower limbs to the axial skeleton and supports pelvic viscera" },
    ],
  },
  {
    id: "eye",
    name: "Eyes & Visual Tract",
    latinName: "Oculus",
    system: "Sensory",
    color: "#06b6d4",
    icon: "Eye",
    primaryKey: "eye_l",
    meshes: ["eye_l", "eye_r", "cranial_nerves"],
    summary: "Paired sensory phototransduction organs capturing electromagnetic wavelengths and projecting retinotopic maps.",
    cameraDistance: 1.8,
    landmarks: [
      { name: "Left Eyeball (Globe)", position: [0.18, 0.04, 0.12], role: "Cornea, lens, and retina focusing photons onto photoreceptors" },
      { name: "Right Eyeball (Globe)", position: [-0.18, 0.04, 0.12], role: "Stereoscopic binocular disparity enabling 3D depth perception" },
      { name: "Optic Nerve (CN II)", position: [0, -0.04, -0.18], role: "Axons of retinal ganglion cells projecting to optic chiasm" },
    ],
  },
];

export const ORGAN_MAP = Object.fromEntries(
  ORGAN_PRESETS.map((organ) => [organ.id, organ])
);

// Helper to determine which preset an anatomical key belongs to
export function findPresetForPart(key) {
  if (!key) return null;
  const lower = key.toLowerCase();
  for (const preset of ORGAN_PRESETS) {
    if (preset.meshes.includes(key) || preset.primaryKey === key) return preset;
  }
  // Keyword matches
  if (/heart|cardiac|aorta|vena/.test(lower)) return ORGAN_MAP["heart"];
  if (/brain|cereb|pituitary|cranial/.test(lower)) return ORGAN_MAP["brain"];
  if (/lung|bronch|trachea|larynx/.test(lower)) return ORGAN_MAP["lungs"];
  if (/liver|gallbladder|biliary/.test(lower)) return ORGAN_MAP["liver"];
  if (/kidney|nephr|ureter|bladder|adrenal/.test(lower)) return ORGAN_MAP["kidneys"];
  if (/stomach|gastric|esophag|intestin|colon|appendix/.test(lower)) return ORGAN_MAP["stomach"];
  if (/pancreas/.test(lower)) return ORGAN_MAP["pancreas"];
  if (/spleen/.test(lower)) return ORGAN_MAP["spleen"];
  if (/eye|optic|ocular/.test(lower)) return ORGAN_MAP["eye"];
  if (/spine|verteb|skull|rib|pelvis|bone|skeleton/.test(lower)) return ORGAN_MAP["skeleton"];
  return null;
}

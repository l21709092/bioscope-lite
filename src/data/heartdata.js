import * as THREE from "three";

export const BPM_MIN = 60;
export const BPM_MAX = 160;

const BLUE = new THREE.Color("#2f7bff");
const RED = new THREE.Color("#ff2a3c");

const RIGHT_ATRIUM = [-0.2, 0.14, 0.2];
const RIGHT_VENTRICLE = [-0.28, -0.16, 0.16];
const LEFT_ATRIUM = [0.2, 0.16, 0.18];
const LEFT_VENTRICLE = [0.26, -0.18, 0.14];
const RIGHT_LUNG = [-1.2, 0.02, 0.02];
const LEFT_LUNG = [1.18, 0.06, 0.02];
const AORTA_END = [0.08, -1.22, 0.05];
const VENA_START = [0.02, -1.5, 0.12];

export const CHAMBERS = {
  rightAtrium: [-0.22, 0.13, 0.1],
  rightVentricle: [-0.28, -0.16, 0.08],
  leftAtrium: [0.2, 0.15, 0.1],
  leftVentricle: [0.27, -0.16, 0.08],
  lungRight: [-1.15, 0.08, 0],
  lungLeft: [1.15, 0.1, 0],
};

export const CARDIAC_PHASES = [
  {
    id: "atrial-systole",
    label: "Atrial systole",
    start: 0,
    end: 0.12,
    simple: "The atria squeeze the last part of their blood into the relaxed ventricles. The tricuspid and mitral valves are open.",
    valves: { tricuspid: true, pulmonary: false, mitral: true, aortic: false },
  },
  {
    id: "isovolumetric-contraction",
    label: "Isovolumetric contraction",
    start: 0.12,
    end: 0.2,
    simple: "The ventricles begin to squeeze. The inlet valves close, and pressure rises while all four valves are shut.",
    valves: { tricuspid: false, pulmonary: false, mitral: false, aortic: false },
  },
  {
    id: "ventricular-ejection",
    label: "Ventricular ejection",
    start: 0.2,
    end: 0.42,
    simple: "The ventricles push blood out: the right side sends it to the lungs and the left side sends it to the body.",
    valves: { tricuspid: false, pulmonary: true, mitral: false, aortic: true },
  },
  {
    id: "isovolumetric-relaxation",
    label: "Isovolumetric relaxation",
    start: 0.42,
    end: 0.5,
    simple: "The ventricles relax. The outlet valves close, so all four valves are briefly shut as pressure falls.",
    valves: { tricuspid: false, pulmonary: false, mitral: false, aortic: false },
  },
  {
    id: "ventricular-filling",
    label: "Ventricular filling (diastole)",
    start: 0.5,
    end: 1,
    simple: "The heart relaxes. Blood returns to both atria and flows passively through the open inlet valves into the ventricles.",
    valves: { tricuspid: true, pulmonary: false, mitral: true, aortic: false },
  },
];

function curve(points) {
  return new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point)),
    false,
    "catmullrom",
    0.22
  );
}

function hold(color) {
  return () => color;
}

function shift(from, to, start, end) {
  const scratch = new THREE.Color();
  return (t) => {
    const amount = THREE.MathUtils.smoothstep(t, start, end);
    return scratch.copy(from).lerp(to, amount);
  };
}

export const VESSELS = [
  {
    id: "svc",
    name: "Superior vena cava",
    curve: curve([[0.02, 1.28, 0.16], [-0.04, 0.7, 0.2], RIGHT_ATRIUM]),
    radius: 0.045,
    glass: "#2563eb",
    colorAt: hold(BLUE),
  },
  {
    id: "ivc",
    name: "Inferior vena cava",
    curve: curve([VENA_START, [0, -0.65, 0.16], [-0.1, -0.05, 0.18], RIGHT_ATRIUM]),
    radius: 0.05,
    glass: "#2563eb",
    colorAt: hold(BLUE),
  },
  {
    id: "right-heart",
    name: "Right heart",
    curve: curve([RIGHT_ATRIUM, [-0.28, 0.02, 0.2], RIGHT_VENTRICLE]),
    radius: 0.038,
    glass: "#1d4ed8",
    colorAt: hold(BLUE),
  },
  {
    id: "pulmonary-right",
    name: "Right pulmonary artery",
    curve: curve([
      RIGHT_VENTRICLE,
      [-0.08, 0.28, 0.16],
      [-0.55, 0.46, 0.08],
      RIGHT_LUNG,
    ]),
    radius: 0.04,
    glass: "#7c3aed",
    colorAt: hold(BLUE),
  },
  {
    id: "pulmonary-left",
    name: "Left pulmonary artery",
    curve: curve([
      RIGHT_VENTRICLE,
      [-0.02, 0.34, 0.14],
      [0.55, 0.48, 0.08],
      LEFT_LUNG,
    ]),
    radius: 0.04,
    glass: "#7c3aed",
    colorAt: hold(BLUE),
  },
  {
    id: "vein-right",
    name: "Right pulmonary vein",
    curve: curve([RIGHT_LUNG, [-0.55, 0.16, 0.12], LEFT_ATRIUM]),
    radius: 0.036,
    glass: "#ef4444",
    colorAt: hold(RED),
  },
  {
    id: "vein-left",
    name: "Left pulmonary vein",
    curve: curve([LEFT_LUNG, [0.62, 0.2, 0.12], LEFT_ATRIUM]),
    radius: 0.036,
    glass: "#ef4444",
    colorAt: hold(RED),
  },
  {
    id: "left-heart",
    name: "Left heart",
    curve: curve([LEFT_ATRIUM, [0.28, 0, 0.16], LEFT_VENTRICLE]),
    radius: 0.04,
    glass: "#dc2626",
    colorAt: hold(RED),
  },
  {
    id: "aorta",
    name: "Aorta",
    curve: curve([
      LEFT_VENTRICLE,
      [0.14, 0.22, 0.14],
      [0.02, 0.66, 0.06],
      [-0.24, 0.58, -0.02],
      [-0.06, 0.15, -0.02],
      [0.05, -0.5, 0.02],
      AORTA_END,
    ]),
    radius: 0.048,
    glass: "#ff3344",
    colorAt: hold(RED),
  },
  {
    id: "body",
    name: "Systemic loop",
    curve: curve([
      AORTA_END,
      [0.9, -0.8, 0.38],
      [1.2, 0.2, 0.58],
      [0.35, 0.9, 0.62],
      [-0.75, 0.55, 0.5],
      [-1.1, -0.4, 0.32],
      [-0.28, -1.2, 0.18],
      VENA_START,
    ]),
    radius: 0.034,
    glass: "#fb7185",
    colorAt: shift(RED, BLUE, 0.5, 0.96),
  },
  {
    id: "gas-exchange-right",
    name: "Right lung capillaries",
    curve: curve([RIGHT_LUNG, [-1.42, 0.18, 0.12], [-1.5, 0.02, 0.12], [-1.37, -0.14, 0.12], RIGHT_LUNG]),
    radius: 0.018,
    glass: "#7c3aed",
    colorAt: shift(BLUE, RED, 0.08, 0.92),
  },
  {
    id: "gas-exchange-left",
    name: "Left lung capillaries",
    curve: curve([LEFT_LUNG, [1.42, 0.2, 0.12], [1.5, 0.04, 0.12], [1.36, -0.13, 0.12], LEFT_LUNG]),
    radius: 0.018,
    glass: "#7c3aed",
    colorAt: shift(BLUE, RED, 0.08, 0.92),
  },
];

// Two complete routes keep every blood cell on one physiologically ordered loop:
// body → right heart → lungs → left heart → body. The routes use opposite lungs
// so both pulmonary sides remain active without jumping between disconnected tubes.
export const FLOW_ROUTES = [
  [8, 9, 1, 2, 3, 10, 5, 7],
  [8, 9, 1, 2, 4, 11, 6, 7],
];

export function createFlowParticles(total = 260) {
  return FLOW_ROUTES.flatMap((route, routeIndex) => {
    const segments = route.map((path) => ({ path, length: VESSELS[path].curve.getLength() }));
    const length = segments.reduce((sum, segment) => sum + segment.length, 0);
    const count = Math.max(32, Math.round(total / FLOW_ROUTES.length));

    return Array.from({ length: count }, (_, index) => ({
      segments,
      length,
      distance: ((index + routeIndex * 0.5) / count) * length,
    }));
  });
}

export function sampleFlowParticle(particle) {
  let remaining = particle.distance;

  for (const segment of particle.segments) {
    if (remaining <= segment.length) {
      const t = remaining / segment.length;
      return { vessel: VESSELS[segment.path], t };
    }
    remaining -= segment.length;
  }

  const lastSegment = particle.segments.at(-1);
  return { vessel: VESSELS[lastSegment.path], t: 1 };
}

export function flowSpeed(bpm) {
  return 0.95 * (bpm / 60);
}

/**
 * One heartbeat as a fraction from 0 to 1.
 * Atrial systole leads, ventricular systole follows, then both sides refill.
 */
export function sampleCycle(elapsed, bpm) {
  const phase = (elapsed * (bpm / 60)) % 1;
  const active = CARDIAC_PHASES.find((item) => phase >= item.start && phase < item.end)
    || CARDIAC_PHASES[CARDIAC_PHASES.length - 1];
  const atrial = phase < 0.12 ? Math.sin((phase / 0.12) * Math.PI) : 0;
  const ventricular = phase >= 0.12 && phase < 0.42
    ? Math.sin(((phase - 0.12) / 0.3) * Math.PI)
    : 0;

  return {
    phase,
    atrial,
    ventricular,
    label: active.label,
    phaseId: active.id,
    simple: active.simple,
    valves: active.valves,
    ventricularPressure: Math.round(8 + ventricular * 112),
  };
}

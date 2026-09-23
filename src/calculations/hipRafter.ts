/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Hip Truss / Rafter Analysis Engine
 * 
 * Computes 3D geometry, tributary area, triangular line loading distribution,
 * shear force (SFD), bending moment (BMD), deflection, support reactions,
 * and structural design actions (M*, V*, N*, R*) for hip rafters/trusses.
 * Formulated per AS/NZS 1170.0:2002, AS 1684 / AS 1720 (Timber), and AS 4100 / ASD.
 */

export type DesignStandard = 'AS_NZS_1170' | 'ASD';

export type LoadCombinationKey =
  | 'strength_1.2G_1.5Q'
  | 'strength_1.35G'
  | 'strength_wind_down'
  | 'strength_wind_uplift'
  | 'service_G_psiQ'
  | 'service_wind';

export interface TimberSectionPreset {
  id: string;
  name: string;
  depthMm: number;
  widthMm: number;
  f_b_MPa: number; // characteristic bending strength
  f_v_MPa: number; // characteristic shear strength
  E_MPa: number;   // Young's modulus
  densityKgM3: number;
}

export const TIMBER_PRESETS: TimberSectionPreset[] = [
  { id: '190x45-mgp10', name: '190 × 45 MGP10 Pine', depthMm: 190, widthMm: 45, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
  { id: '240x45-mgp10', name: '240 × 45 MGP10 Pine', depthMm: 240, widthMm: 45, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
  { id: '290x45-mgp10', name: '290 × 45 MGP10 Pine', depthMm: 290, widthMm: 45, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
  { id: '2x190x45-mgp10', name: '2/190 × 45 (90mm) MGP10', depthMm: 190, widthMm: 90, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
  { id: '2x240x45-mgp10', name: '2/240 × 45 (90mm) MGP10', depthMm: 240, widthMm: 90, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
  { id: '2x290x45-mgp10', name: '2/290 × 45 (90mm) MGP10', depthMm: 290, widthMm: 90, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
  { id: 'lvl-200x45', name: '200 × 45 E14 LVL', depthMm: 200, widthMm: 45, f_b_MPa: 45.0, f_v_MPa: 4.5, E_MPa: 14000, densityKgM3: 600 },
  { id: 'lvl-240x45', name: '240 × 45 E14 LVL', depthMm: 240, widthMm: 45, f_b_MPa: 45.0, f_v_MPa: 4.5, E_MPa: 14000, densityKgM3: 600 },
  { id: 'lvl-300x45', name: '300 × 45 E14 LVL', depthMm: 300, widthMm: 45, f_b_MPa: 45.0, f_v_MPa: 4.5, E_MPa: 14000, densityKgM3: 600 },
  { id: 'custom', name: 'Custom Section Dimensions', depthMm: 240, widthMm: 45, f_b_MPa: 17.0, f_v_MPa: 2.4, E_MPa: 10000, densityKgM3: 500 },
];

export interface HipRafterInputs {
  /** Plan span length in X direction (m) */
  spanX: number;
  /** Plan span length in Y direction (m) */
  spanY: number;
  /** Roof pitch / slope angle in degrees (e.g. 22.5) */
  pitchDeg: number;
  /** Overhang plan length at eaves (m) */
  overhangPlan: number;

  /** Area Dead load G (kPa on plan) */
  deadLoadKPa: number;
  /** Area Live load Q (kPa on plan) */
  liveLoadKPa: number;
  /** Wind uplift pressure W_u (kPa suction, positive magnitude) */
  windUpliftKPa: number;
  /** Wind downward pressure W_d (kPa downward) */
  windDownKPa: number;

  /** Design standard */
  designStandard: DesignStandard;
  /** Selected timber preset ID */
  memberPresetId: string;
  /** Custom section depth (mm) */
  customDepthMm?: number;
  /** Custom section width (mm) */
  customWidthMm?: number;
  /** Custom Young's modulus E (MPa) */
  customEMPa?: number;
  /** Custom bending strength fb (MPa) */
  customFbMPa?: number;
  /** Custom shear strength fv (MPa) */
  customFvMPa?: number;
  /** Additional self-weight override (kN/m) if any */
  additionalSelfWeightKNm?: number;

  /** Allowable deflection limit ratio, e.g. 300 for L/300 */
  deflectionLimitRatio: number;
}

export interface HipGeometryResults {
  /** Plan span of hip rafter L_p = sqrt(spanX^2 + spanY^2) (m) */
  planLength: number;
  /** Height / Rise of ridge apex above eaves plate H = spanX * tan(pitch) (m) */
  roofRise: number;
  /** Plan angle of hip rafter to X axis in degrees */
  hipPlanAngleDeg: number;
  /** True 3D slope / rake angle of hip rafter in degrees */
  hipSlopeAngleDeg: number;
  /** True 3D length of hip rafter between supports L_true (m) */
  trueLength: number;
  /** True 3D length of eaves overhang (m) */
  trueOverhang: number;
  /** Total true length including overhang (m) */
  totalTrueLength: number;

  /** Total tributary area on plan A_trib,p (m²) */
  tributaryAreaPlan: number;
  /** Total tributary area on slope A_trib,s (m²) */
  tributaryAreaSlope: number;
  /** Maximum tributary width at apex (plan) (m) */
  maxTributaryWidthPlan: number;
  /** Maximum tributary width at apex (slope) (m) */
  maxTributaryWidthSlope: number;
}

export interface LoadCaseDistribution {
  name: string;
  codeCombo: string;
  /** Peak line load at apex w_max (kN/m along true length) */
  wPeak: number;
  /** Line load at eaves support w_0 (kN/m along true length) */
  wEaves: number;
  /** Total downward force on rafter (kN) (negative if net uplift) */
  totalLoadKN: number;
  /** Reaction at eaves support R_eaves (kN) (positive upwards) */
  rEavesKN: number;
  /** Reaction at ridge/apex support R_ridge (kN) (positive upwards) */
  rRidgeKN: number;
  /** Maximum bending moment M* (kNm) */
  maxMomentKNm: number;
  /** Location of max bending moment from eaves x_Mmax (m) */
  maxMomentLocationM: number;
  /** Maximum shear force V* (kN) */
  maxShearKN: number;
  /** Net maximum deflection under this case (mm) */
  deflectionMm: number;
}

export interface SectionProperties {
  depthMm: number;
  widthMm: number;
  areaMm2: number;
  secondMomentAreaImm4: number; // I_x (mm^4)
  sectionModulusZmm3: number;   // Z_x (mm^3)
  selfWeightKNm: number;        // kN/m
  f_b_MPa: number;
  f_v_MPa: number;
  E_MPa: number;
  bendingCapacityKNm: number;   // phi * M_n
  shearCapacityKN: number;      // phi * V_n
}

export interface HipDesignActions {
  /** Maximum governing design bending moment M* (kNm) */
  mStar: number;
  /** Governing load case for moment */
  mStarCase: string;
  /** Maximum governing design shear force V* (kN) */
  vStar: number;
  /** Governing load case for shear */
  vStarCase: string;
  /** Governing peak downward reaction at eaves support R*_eaves (kN) */
  rEavesMaxDownKN: number;
  /** Governing peak downward reaction at ridge support R*_ridge (kN) */
  rRidgeMaxDownKN: number;
  /** Governing net uplift tie-down force at eaves support (kN) (positive value = hold-down required) */
  eavesTieDownUpliftKN: number;
  /** Governing net uplift tie-down force at ridge support (kN) */
  ridgeTieDownUpliftKN: number;
  /** Axial thrust component along rafter N* (kN) */
  axialThrustKN: number;

  /** Maximum serviceability deflection (mm) */
  serviceDeflectionMm: number;
  /** Allowable deflection limit (mm) = L / ratio */
  allowableDeflectionMm: number;

  /** Utilization ratios */
  bendingUtilization: number;
  shearUtilization: number;
  deflectionUtilization: number;
  overallStatus: 'pass' | 'fail';
}

export interface HipRafterResults {
  geometry: HipGeometryResults;
  section: SectionProperties;
  governingActions: HipDesignActions;
  combinations: Record<LoadCombinationKey, LoadCaseDistribution>;
  status: 'pass' | 'fail';
}

export const DEFAULT_HIP_INPUTS: HipRafterInputs = {
  spanX: 4.0,           // 4.0m plan run in X
  spanY: 4.0,           // 4.0m plan run in Y (45 degree symmetric hip)
  pitchDeg: 22.5,       // standard 22.5° roof pitch
  overhangPlan: 0.45,   // 450mm eaves overhang

  deadLoadKPa: 0.45,    // 0.45 kPa (e.g. sheet metal + ceiling + battens)
  liveLoadKPa: 0.25,    // 0.25 kPa (roof maintenance live load)
  windUpliftKPa: 0.85,  // 0.85 kPa suction uplift
  windDownKPa: 0.35,    // 0.35 kPa downward wind

  designStandard: 'AS_NZS_1170',
  memberPresetId: '240x45-mgp10',
  deflectionLimitRatio: 300, // L/300
};

/**
 * Solves section properties and structural capacities for the chosen timber/custom member
 */
export function getSectionProperties(
  inputs: HipRafterInputs
): SectionProperties {
  const preset = TIMBER_PRESETS.find(p => p.id === inputs.memberPresetId) ?? TIMBER_PRESETS[1];

  const depthMm = inputs.memberPresetId === 'custom' && inputs.customDepthMm ? inputs.customDepthMm : preset.depthMm;
  const widthMm = inputs.memberPresetId === 'custom' && inputs.customWidthMm ? inputs.customWidthMm : preset.widthMm;
  const E_MPa = inputs.memberPresetId === 'custom' && inputs.customEMPa ? inputs.customEMPa : preset.E_MPa;
  const f_b_MPa = inputs.memberPresetId === 'custom' && inputs.customFbMPa ? inputs.customFbMPa : preset.f_b_MPa;
  const f_v_MPa = inputs.memberPresetId === 'custom' && inputs.customFvMPa ? inputs.customFvMPa : preset.f_v_MPa;

  const areaMm2 = depthMm * widthMm;
  const I_x = (widthMm * Math.pow(depthMm, 3)) / 12;
  const Z_x = (widthMm * Math.pow(depthMm, 2)) / 6;

  // Self weight: volume * density * g
  const density = preset.densityKgM3;
  const volPerM = (areaMm2 / 1e6) * 1.0;
  const selfWeightKNm = inputs.additionalSelfWeightKNm ?? (volPerM * density * 9.81) / 1000;

  // Capacity factors
  // AS 1720 / AS 1684 capacity factor phi = 0.85 for timber bending & shear (or 0.9 for LVL)
  const isLVL = preset.id.startsWith('lvl');
  const phi = isLVL ? 0.90 : 0.85;

  const bendingCapacityKNm = (phi * f_b_MPa * Z_x) / 1e6;
  // Shear capacity: tau = 1.5 * V / A <= phi * f_v => V <= (2/3) * phi * f_v * A
  const shearCapacityKN = (phi * (2 / 3) * f_v_MPa * areaMm2) / 1000;

  return {
    depthMm,
    widthMm,
    areaMm2,
    secondMomentAreaImm4: I_x,
    sectionModulusZmm3: Z_x,
    selfWeightKNm,
    f_b_MPa,
    f_v_MPa,
    E_MPa,
    bendingCapacityKNm,
    shearCapacityKN,
  };
}

/**
 * Solves 3D geometry of the hip rafter
 */
export function calculateHipGeometry(inputs: HipRafterInputs): HipGeometryResults {
  const Lx = Math.max(0.1, inputs.spanX);
  const Ly = Math.max(0.1, inputs.spanY);
  const pitchRad = (Math.max(1, Math.min(80, inputs.pitchDeg)) * Math.PI) / 180;

  // Plan length of hip rafter
  const Lp = Math.sqrt(Lx * Lx + Ly * Ly);

  // Roof rise at apex
  const H = Lx * Math.tan(pitchRad);

  // Plan angle of hip
  const hipPlanAngleRad = Math.atan2(Ly, Lx);
  const hipPlanAngleDeg = (hipPlanAngleRad * 180) / Math.PI;

  // True 3D slope / rake angle of hip rafter
  const hipSlopeAngleRad = Math.atan2(H, Lp);
  const hipSlopeAngleDeg = (hipSlopeAngleRad * 180) / Math.PI;

  // True 3D length of rafter between wall supports
  const L_true = Math.sqrt(Lp * Lp + H * H);

  // True overhang
  const oh_p = Math.max(0, inputs.overhangPlan);
  const oh_true = oh_p / Math.cos(hipSlopeAngleRad);
  const totalTrueLength = L_true + oh_true;

  // Tributary area calculation:
  // For a standard hip corner, jack rafters span in X and Y directions from walls to hip.
  // Tributary area on plan is A_trib,p = 0.5 * Lx * Ly
  const tributaryAreaPlan = 0.5 * Lx * Ly;
  const tributaryAreaSlope = tributaryAreaPlan / Math.cos(pitchRad);

  // Peak tributary width at ridge apex (perpendicular to hip rafter in plan)
  // Area = 0.5 * Lp * w_max => w_max = 2 * Area / Lp
  const maxTributaryWidthPlan = (2 * tributaryAreaPlan) / Lp;
  const maxTributaryWidthSlope = maxTributaryWidthPlan / Math.cos(pitchRad);

  return {
    planLength: Lp,
    roofRise: H,
    hipPlanAngleDeg,
    hipSlopeAngleDeg,
    trueLength: L_true,
    trueOverhang: oh_true,
    totalTrueLength,
    tributaryAreaPlan,
    tributaryAreaSlope,
    maxTributaryWidthPlan,
    maxTributaryWidthSlope,
  };
}

/**
 * Solves static mechanics for a simply supported beam with linearly varying triangular load:
 * w(x) = w_eaves + (w_peak - w_eaves) * (x / L)
 * plus rafter self-weight w_sw.
 */
export function solveTriangularBeamMechanics(
  L: number,
  wPeak: number,
  wEaves: number,
  wSW: number,
  E_MPa: number,
  I_mm4: number
): {
  totalLoadKN: number;
  rEavesKN: number;
  rRidgeKN: number;
  maxMomentKNm: number;
  maxMomentLocationM: number;
  maxShearKN: number;
  deflectionMm: number;
} {
  // Uniform portion: w_u = wEaves + wSW
  // Triangular portion varying from 0 at eaves to (wPeak - wEaves) at ridge: w_t = wPeak - wEaves
  const w_u = wEaves + wSW;
  const w_t = wPeak - wEaves;

  // Total loads
  const W_uniform = w_u * L;
  const W_tri = 0.5 * w_t * L;
  const totalLoadKN = W_uniform + W_tri;

  // Reactions taking moments about ridge (x = L):
  // R_eaves * L = W_uniform * (L / 2) + W_tri * (L / 3)
  const rEavesKN = 0.5 * W_uniform + (1 / 3) * W_tri;

  // R_ridge:
  const rRidgeKN = totalLoadKN - rEavesKN;

  // Location of zero shear / maximum moment:
  // V(x) = R_eaves - w_u * x - 0.5 * (w_t / L) * x^2 = 0
  // (w_t / (2 L)) * x^2 + w_u * x - R_eaves = 0
  let xM = L / 2;
  const a = w_t / (2 * L);
  const b = w_u;
  const c = -rEavesKN;

  if (Math.abs(a) < 1e-9) {
    // Pure uniform load
    xM = b !== 0 ? rEavesKN / b : L / 2;
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const root1 = (-b + Math.sqrt(disc)) / (2 * a);
      const root2 = (-b - Math.sqrt(disc)) / (2 * a);
      if (root1 >= 0 && root1 <= L) xM = root1;
      else if (root2 >= 0 && root2 <= L) xM = root2;
      else xM = L / 2;
    }
  }

  // Moment at xM:
  // M(x) = R_eaves * x - 0.5 * w_u * x^2 - (w_t / (6 L)) * x^3
  const computeMoment = (x: number) => {
    return rEavesKN * x - 0.5 * w_u * x * x - (w_t / (6 * L)) * Math.pow(x, 3);
  };

  const maxMomentKNm = Math.max(0, computeMoment(xM));

  // Max shear is the maximum of absolute reactions
  const maxShearKN = Math.max(Math.abs(rEavesKN), Math.abs(rRidgeKN));

  // Deflection at midpoint (close to peak):
  // delta_mid = (5 * W_uniform * L^3) / (384 * E * I) + (0.00652 * w_t * L^4) / (E * I)
  // Converting E from MPa (N/mm²) and I from mm^4 to kN*m²:
  // E * I in kN*m² = (E * 1e3 kPa) * (I * 1e-12 m^4) = E * I * 1e-9 kN*m²
  const EI_kNm2 = Math.max(1, E_MPa * I_mm4 * 1e-9);

  // Deflection for uniform load: 5 * w_u * L^4 / (384 * EI)
  // Deflection for pure triangular load: 0.00652 * w_t * L^4 / EI
  const deltaUniformM = (5 * w_u * Math.pow(L, 4)) / (384 * EI_kNm2);
  const deltaTriM = (0.00652 * w_t * Math.pow(L, 4)) / EI_kNm2;
  const deflectionMm = Math.max(0, (deltaUniformM + deltaTriM) * 1000);

  return {
    totalLoadKN,
    rEavesKN,
    rRidgeKN,
    maxMomentKNm,
    maxMomentLocationM: xM,
    maxShearKN,
    deflectionMm,
  };
}

/**
 * Main calculation routine for hip rafter / truss
 */
export function calculateHipRafter(inputs: HipRafterInputs): HipRafterResults {
  const geometry = calculateHipGeometry(inputs);
  const section = getSectionProperties(inputs);

  const L = geometry.trueLength;
  const wMaxPlan = geometry.maxTributaryWidthPlan;
  const cosSlope = Math.cos((geometry.hipSlopeAngleDeg * Math.PI) / 180);

  // Normal to rafter load multiplier: loads applied vertically act normal to rafter with factor cos(slope)
  const normFactor = cosSlope;

  // Base area loads (converted to line loads normal to rafter)
  // w_peak = AreaLoad * wMaxPlan * normFactor
  const wPeakDead = inputs.deadLoadKPa * wMaxPlan * normFactor;
  const wPeakLive = inputs.liveLoadKPa * wMaxPlan * normFactor;
  const wPeakWindDown = inputs.windDownKPa * wMaxPlan * normFactor;
  const wPeakWindUplift = inputs.windUpliftKPa * wMaxPlan * normFactor; // acts upwards

  const wSwNormal = section.selfWeightKNm * normFactor;

  // 1. Strength Combo: 1.2G + 1.5Q (Governing Gravity)
  const wPeak1_2G_1_5Q = 1.2 * wPeakDead + 1.5 * wPeakLive;
  const combo1 = solveTriangularBeamMechanics(
    L,
    wPeak1_2G_1_5Q,
    0,
    1.2 * wSwNormal,
    section.E_MPa,
    section.secondMomentAreaImm4
  );

  // 2. Strength Combo: 1.35G (Heavy dead load)
  const wPeak1_35G = 1.35 * wPeakDead;
  const combo2 = solveTriangularBeamMechanics(
    L,
    wPeak1_35G,
    0,
    1.35 * wSwNormal,
    section.E_MPa,
    section.secondMomentAreaImm4
  );

  // 3. Strength Combo: 1.2G + W_down + 0.4Q
  const wPeakWindD = 1.2 * wPeakDead + wPeakWindDown + 0.4 * wPeakLive;
  const combo3 = solveTriangularBeamMechanics(
    L,
    wPeakWindD,
    0,
    1.2 * wSwNormal,
    section.E_MPa,
    section.secondMomentAreaImm4
  );

  // 4. Strength Combo: 0.9G - W_uplift (Net Suction / Uplift hold-down)
  // Net uplift = W_uplift - 0.9G
  const wNetUpliftPeak = Math.max(0, wPeakWindUplift - 0.9 * wPeakDead);
  const wSwUplift = Math.max(0, 0.9 * wSwNormal);
  const combo4 = solveTriangularBeamMechanics(
    L,
    wNetUpliftPeak,
    0,
    -wSwUplift,
    section.E_MPa,
    section.secondMomentAreaImm4
  );

  // 5. Serviceability: G + 0.7Q (Long-term deflection)
  const wPeakService = wPeakDead + 0.7 * wPeakLive;
  const combo5 = solveTriangularBeamMechanics(
    L,
    wPeakService,
    0,
    wSwNormal,
    section.E_MPa,
    section.secondMomentAreaImm4
  );

  // 6. Serviceability: Wind deflection (W_s)
  const wPeakServiceWind = wPeakWindDown;
  const combo6 = solveTriangularBeamMechanics(
    L,
    wPeakServiceWind,
    0,
    0,
    section.E_MPa,
    section.secondMomentAreaImm4
  );

  const combinations: Record<LoadCombinationKey, LoadCaseDistribution> = {
    'strength_1.2G_1.5Q': {
      name: '1.2G + 1.5Q (Gravity Strength)',
      codeCombo: inputs.designStandard === 'AS_NZS_1170' ? 'AS/NZS 1170.0 Cl 4.2.2' : 'ASD D + L',
      wPeak: wPeak1_2G_1_5Q,
      wEaves: 0,
      ...combo1,
    },
    'strength_1.35G': {
      name: '1.35G (Permanent Action Only)',
      codeCombo: inputs.designStandard === 'AS_NZS_1170' ? 'AS/NZS 1170.0 Cl 4.2.2' : 'ASD D',
      wPeak: wPeak1_35G,
      wEaves: 0,
      ...combo2,
    },
    'strength_wind_down': {
      name: '1.2G + W_down + 0.4Q (Wind Downward)',
      codeCombo: 'AS/NZS 1170.0 (Strength)',
      wPeak: wPeakWindD,
      wEaves: 0,
      ...combo3,
    },
    'strength_wind_uplift': {
      name: '0.9G - W_uplift (Net Wind Uplift)',
      codeCombo: 'AS/NZS 1170.0 (Hold-Down / Stability)',
      wPeak: wNetUpliftPeak,
      wEaves: 0,
      ...combo4,
    },
    'service_G_psiQ': {
      name: 'G + 0.7Q (Serviceability Deflection)',
      codeCombo: 'AS/NZS 1170.0 App C',
      wPeak: wPeakService,
      wEaves: 0,
      ...combo5,
    },
    'service_wind': {
      name: 'W_s (Serviceability Wind)',
      codeCombo: 'AS/NZS 1170.2 SLS',
      wPeak: wPeakServiceWind,
      wEaves: 0,
      ...combo6,
    },
  };

  // Find governing values
  const strengthCases = [combinations['strength_1.2G_1.5Q'], combinations['strength_1.35G'], combinations['strength_wind_down']];

  let mStar = 0;
  let mStarCase = '';
  let vStar = 0;
  let vStarCase = '';
  let rEavesMaxDownKN = 0;
  let rRidgeMaxDownKN = 0;

  for (const c of strengthCases) {
    if (c.maxMomentKNm > mStar) {
      mStar = c.maxMomentKNm;
      mStarCase = c.name;
    }
    if (c.maxShearKN > vStar) {
      vStar = c.maxShearKN;
      vStarCase = c.name;
    }
    if (c.rEavesKN > rEavesMaxDownKN) {
      rEavesMaxDownKN = c.rEavesKN;
    }
    if (c.rRidgeKN > rRidgeMaxDownKN) {
      rRidgeMaxDownKN = c.rRidgeKN;
    }
  }

  // Hold-down tie-down uplift forces
  const eavesTieDownUpliftKN = Math.max(0, combinations['strength_wind_uplift'].rEavesKN);
  const ridgeTieDownUpliftKN = Math.max(0, combinations['strength_wind_uplift'].rRidgeKN);

  // Axial thrust force along rafter:
  // Component of vertical eaves reaction resolved along rafter slope:
  const sinSlope = Math.sin((geometry.hipSlopeAngleDeg * Math.PI) / 180);
  const axialThrustKN = rEavesMaxDownKN * sinSlope;

  // Deflection check
  const serviceDeflectionMm = combinations['service_G_psiQ'].deflectionMm;
  const allowableDeflectionMm = (L * 1000) / inputs.deflectionLimitRatio;

  // Utilizations
  const bendingUtilization = mStar / Math.max(0.01, section.bendingCapacityKNm);
  const shearUtilization = vStar / Math.max(0.01, section.shearCapacityKN);
  const deflectionUtilization = serviceDeflectionMm / Math.max(0.1, allowableDeflectionMm);

  const overallStatus =
    bendingUtilization <= 1.0 && shearUtilization <= 1.0 && deflectionUtilization <= 1.0
      ? 'pass'
      : 'fail';

  return {
    geometry,
    section,
    governingActions: {
      mStar,
      mStarCase,
      vStar,
      vStarCase,
      rEavesMaxDownKN,
      rRidgeMaxDownKN,
      eavesTieDownUpliftKN,
      ridgeTieDownUpliftKN,
      axialThrustKN,
      serviceDeflectionMm,
      allowableDeflectionMm,
      bendingUtilization,
      shearUtilization,
      deflectionUtilization,
      overallStatus,
    },
    combinations,
    status: overallStatus,
  };
}

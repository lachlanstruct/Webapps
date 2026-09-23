/**
 * Structural Engineering Calculation Engine:
 * Cantilever Wall / Footing Overturning Stability & Soil Bearing Pressure Checks
 * Supports:
 * 1. Working Stress Design (ASD / Serviceability)
 * 2. Australian Standards (AS/NZS 1170.0:2002 Limit State Design)
 * 3. Additional Loads (Point Loads, Lateral Loads, Moments, Surcharges)
 * 4. Soil Bearing Pressure Distribution (Middle-Third Kern, Eccentricity, q_max, q_min)
 *
 * All internal calculations use standard SI units:
 * - Dimensions: metres (m)
 * - Pressures: kilopascals (kPa == kN/m²)
 * - Unit weights: kilonewtons per cubic metre (kN/m³)
 * - Forces: kilonewtons per metre run (kN/m)
 * - Moments: kilonewton-metres per metre run (kNm/m)
 */

export type WindDirection = 'left_to_right' | 'right_to_left';
export type WallPositionPreset = 'centred' | 'left' | 'right' | 'custom';
export type DesignStandard = 'ASD' | 'AS_NZS_1170';
export type AS1170Combo = 'stability_0.9G_Wu' | 'bearing_1.2G_Wu_psiQ' | 'bearing_1.2G_1.5Q';

export type LoadActionType = 'G' | 'Q' | 'W'; // Dead (G), Live (Q), Wind (W)
export type LoadType = 'point_vertical' | 'point_horizontal' | 'moment' | 'surcharge_udl';

export interface AdditionalLoad {
  id: string;
  name: string;
  type: LoadType;
  action: LoadActionType;
  /**
   * Value of the load:
   * - point_vertical: kN/m (+ downward)
   * - point_horizontal: kN/m (+ in direction of wind)
   * - moment: kNm/m (+ in overturning direction)
   * - surcharge_udl: kPa (+ downward pressure on footing)
   */
  value: number;
  /** Horizontal position x from left edge of footing in metres (0 <= x <= B) */
  positionX?: number;
  /** Vertical height y above footing base in metres (e.g. wall top = D + z) */
  heightY?: number;
  /** For surcharge UDL: target zone on footing */
  surface?: 'heel' | 'toe' | 'full';
}

export interface OverturningInputs {
  /** Wind pressure p in kPa (kN/m²) */
  windPressure: number;
  /** Wind load / pressure multiplier coefficient C */
  windCoefficient: number;

  /** Wall height z above top of footing in metres */
  wallHeight: number;
  /** Wall thickness t in metres */
  wallThickness: number;

  /** Footing width B in metres */
  footingWidth: number;
  /** Footing depth D in metres */
  footingDepth: number;

  /** Footing concrete unit weight γ_f in kN/m³ (default: 24) */
  footingUnitWeight: number;
  /** Wall material unit weight γ_w in kN/m³ (default: 24) */
  wallUnitWeight: number;

  /** Toggle for including wall self-weight in resisting moment */
  includeWallWeight: boolean;

  /**
   * Horizontal coordinate of wall centroid x_wall (m),
   * measured from the LEFT edge of the footing (0 <= x_wall <= B).
   */
  wallCentroidX: number;

  /** Direction of applied wind force */
  windDirection: WindDirection;

  /** Optional user required minimum factor of safety ratio (e.g. 1.50 for ASD or 1.00 for AS 1170 ULS) */
  requiredRatio?: number | null;

  /** Design code standard: ASD (Working Stress) or AS_NZS_1170 (Australian Standards) */
  designStandard?: DesignStandard;

  /** Allowable soil bearing capacity in kPa (default: 150 kPa) */
  allowableBearingCapacity?: number;

  /** Additional applied loads (UDLs, point loads, moments) */
  additionalLoads?: AdditionalLoad[];

  /** Selected AS/NZS 1170 combination */
  as1170Combo?: AS1170Combo;
}

export interface BearingPressureResults {
  /** Total vertical load N (kN/m) */
  totalVerticalLoad: number;
  /** Net moment about base centerline (x = B/2) in kNm/m */
  netMomentAboutCenter: number;
  /** Eccentricity e = |M_net| / N (m) */
  eccentricity: number;
  /** Middle-third Kern limit e_kern = B / 6 (m) */
  kernLimit: number;
  /** Contact status: 'full_contact' if e <= B/6, 'tension_separation' if e > B/6, or 'overturned' if e >= B/2 */
  contactStatus: 'full_contact' | 'tension_separation' | 'overturned';
  /** Maximum soil bearing pressure q_max (kPa) */
  qMax: number;
  /** Minimum soil bearing pressure q_min (kPa, 0 if separation) */
  qMin: number;
  /** Effective bearing contact length B' (m) */
  effectiveContactWidth: number;
  /** Percentage of footing width in contact (%) */
  contactRatio: number;
  /** Allowable bearing capacity q_all (kPa) */
  allowableCapacity: number;
  /** Bearing pressure utilization ratio = q_max / q_all */
  utilizationRatio: number;
  /** Pass / Fail check for soil bearing capacity */
  bearingStatus: 'pass' | 'fail' | 'indeterminate';
}

export interface AdditionalLoadDecomposition {
  id: string;
  name: string;
  type: LoadType;
  action: LoadActionType;
  value: number;
  verticalForce: number; // kN/m (+ downward)
  horizontalForce: number; // kN/m (+ overturning)
  resistingMoment: number; // kNm/m
  overturningMoment: number; // kNm/m
  momentAboutCenter: number; // kNm/m
  leverArmToToe: number; // m
  description: string;
}

export interface StandardFactors {
  name: string;
  codeReference: string;
  factorG_stb: number; // Factor for stabilizing dead load
  factorG_dst: number; // Factor for destabilizing dead load
  factorQ: number; // Factor for live/imposed load
  factorW: number; // Factor for wind load
}

export interface WallStemDesignActions {
  /** Design Bending Moment at base of wall stem M*_wall (kNm/m) */
  mStar: number;
  /** Design Shear Force at base of wall stem V*_wall (kN/m) */
  vStar: number;
  /** Design Axial Force at base of wall stem N*_wall (kN/m) (compression) */
  nStar: number;
  /** Height of wall stem H_w (m) */
  stemHeight: number;
  /** Wall stem thickness t_w (m) */
  stemThickness: number;
  /** Critical design section description */
  criticalSection: string;
}

export interface FootingToeDesignActions {
  /** Toe projection length L_toe (m) from front face of stem to edge */
  length: number;
  /** Design Bending Moment at front face of stem M*_toe (kNm/m) (sagging - bottom steel in tension) */
  mStar: number;
  /** Design Shear Force at front face of stem V*_toe (kN/m) */
  vStar: number;
  /** Design Shear Force at critical distance d from stem face V*_toe,d (kN/m) */
  vStarAtD: number;
  /** Effective depth d used for shear (m) */
  effectiveDepthD: number;
  /** Soil bearing pressure at active toe tip q_toe (kPa) */
  qToe: number;
  /** Soil bearing pressure at stem front face q_stem_front (kPa) */
  qStemFront: number;
  /** Net upward pressure resultant on toe projection (kN/m) */
  netUpwardForce: number;
}

export interface FootingHeelDesignActions {
  /** Heel projection length L_heel (m) from back face of stem to edge */
  length: number;
  /** Design Bending Moment at back face of stem M*_heel (kNm/m) (hogging - top steel in tension) */
  mStar: number;
  /** Design Shear Force at back face of stem V*_heel (kN/m) */
  vStar: number;
  /** Downward dead load pressure on heel (footing slab weight + surcharge) (kPa) */
  downwardPressure: number;
  /** Soil bearing pressure at heel tip q_heel (kPa) */
  qHeel: number;
  /** Soil bearing pressure at stem back face q_stem_back (kPa) */
  qStemBack: number;
  /** Net downward force resultant on heel projection (kN/m) */
  netDownwardForce: number;
}

export interface FootingOverallDesignActions {
  /** Total Design Axial / Vertical Load N*_footing (kN/m) */
  nStar: number;
  /** Total Design Base Shear V*_footing (kN/m) */
  vStar: number;
  /** Peak Design Soil Bearing Pressure q*_max (kPa) */
  qStarMax: number;
  /** Design sliding friction resistance capacity phi * V_u,slide (kN/m) */
  slidingCapacity: number;
  /** Sliding factor of safety or status */
  slidingStatus: 'pass' | 'fail';
}

export interface StructuralDesignActions {
  wall: WallStemDesignActions;
  toe: FootingToeDesignActions;
  heel: FootingHeelDesignActions;
  footing: FootingOverallDesignActions;
  designStandardText: string;
}

export interface OverturningResults {
  // Wind loading
  /** Design wind pressure p_d = p * C (kPa) */
  designPressure: number;
  /** Uniform horizontal line load w = p_d * 1 m strip (kN/m) */
  lineLoad: number;
  /** Total horizontal resultant force H = w * z (kN/m) */
  horizontalForce: number;
  /** Resultant wind height above footing base = D + z / 2 (m) */
  windResultantHeightFromBase: number;

  // Overturning Moments about the active bottom toe
  /** Wall-base cantilever moment M_wall_base = w * z² / 2 (kNm/m) */
  wallBaseMoment: number;
  /** Moment generated by transferring shear H through footing depth D: M_HD = H * D (kNm/m) */
  shearTransferMoment: number;
  /** Total basic wind overturning moment M_OT_wind = H * (D + z/2) (kNm/m) */
  windOverturningMoment: number;
  /** Total overturning moment including additional loads (kNm/m) */
  overturningMoment: number;

  // Footing Self-Weight & Resistance
  /** Footing self-weight W_f = γ_f * B * D (kN/m) */
  footingWeight: number;
  /** Footing centroid lever arm to active toe = B / 2 (m) */
  footingLeverArm: number;
  /** Footing resisting moment M_R,f = W_f * (B / 2) (kNm/m) */
  footingResistingMoment: number;

  // Wall Self-Weight & Resistance
  /** Wall self-weight W_wall = γ_w * t * z (kN/m) or 0 if disabled */
  wallWeight: number;
  /** Wall centroid lever arm to active overturning toe L_wall (m) */
  wallLeverArm: number;
  /** Wall resisting moment M_R,wall = W_wall * L_wall (kNm/m) */
  wallResistingMoment: number;

  // Additional Loads Contributions
  additionalLoadsDecomposition: AdditionalLoadDecomposition[];
  additionalResistingMoment: number;
  additionalOverturningMoment: number;
  additionalVerticalLoad: number;
  additionalHorizontalForce: number;

  // Combined Stability
  /** Total resisting moment M_R (kNm/m) */
  totalResistingMoment: number;
  /** Overturning stability ratio FS = M_R / M_OT */
  overturningRatio: number | null;

  // Active Toe Coordinates
  /** Name of the active toe: 'right' (for left-to-right wind) or 'left' (for right-to-left wind) */
  activeToe: 'right' | 'left';
  /** X coordinate of the active toe measured from left edge: B or 0 */
  activeToeX: number;

  // Design Standard details
  designStandard: DesignStandard;
  standardFactors: StandardFactors;
  factoredResistingMoment: number;
  factoredOverturningMoment: number;
  designRatio: number | null;

  // Soil Bearing Pressure Analysis
  bearing: BearingPressureResults;

  // Structural Member Design Actions (M*, V*, N* for wall stem & footing)
  designActions: StructuralDesignActions;

  // Overall Pass / Fail assessment
  status: 'pass' | 'fail' | 'indeterminate';
  ratioMargin: number | null;
}

export interface ValidationIssue {
  field: keyof OverturningInputs | string;
  message: string;
}

export function validateOverturningInputs(inputs: Partial<OverturningInputs>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const {
    windPressure,
    windCoefficient,
    wallHeight,
    wallThickness,
    footingWidth,
    footingDepth,
    footingUnitWeight,
    wallUnitWeight,
    includeWallWeight,
    wallCentroidX,
    allowableBearingCapacity,
  } = inputs;

  if (windPressure !== undefined) {
    if (isNaN(windPressure) || windPressure < 0) {
      issues.push({ field: 'windPressure', message: 'Wind pressure (p) must be a non-negative number (≥ 0 kPa).' });
    }
  }

  if (windCoefficient !== undefined) {
    if (isNaN(windCoefficient) || windCoefficient < 0) {
      issues.push({ field: 'windCoefficient', message: 'Load coefficient (C) must be a non-negative number (≥ 0).' });
    }
  }

  if (wallHeight !== undefined) {
    if (isNaN(wallHeight) || wallHeight <= 0) {
      issues.push({ field: 'wallHeight', message: 'Wall height (z) must be strictly greater than 0 m.' });
    }
  }

  if (footingWidth !== undefined) {
    if (isNaN(footingWidth) || footingWidth <= 0) {
      issues.push({ field: 'footingWidth', message: 'Footing width (B) must be strictly greater than 0 m.' });
    }
  }

  if (footingDepth !== undefined) {
    if (isNaN(footingDepth) || footingDepth <= 0) {
      issues.push({ field: 'footingDepth', message: 'Footing depth (D) must be strictly greater than 0 m.' });
    }
  }

  if (footingUnitWeight !== undefined) {
    if (isNaN(footingUnitWeight) || footingUnitWeight <= 0) {
      issues.push({ field: 'footingUnitWeight', message: 'Concrete unit weight (γ_f) must be strictly greater than 0 kN/m³.' });
    }
  }

  if (includeWallWeight) {
    if (wallThickness !== undefined) {
      if (isNaN(wallThickness) || wallThickness <= 0) {
        issues.push({ field: 'wallThickness', message: 'Wall thickness (t) must be greater than 0 m when wall weight is included.' });
      } else if (footingWidth !== undefined && wallThickness > footingWidth) {
        issues.push({ field: 'wallThickness', message: `Wall thickness (${wallThickness} m) cannot exceed footing width (${footingWidth} m).` });
      }
    }

    if (wallUnitWeight !== undefined) {
      if (isNaN(wallUnitWeight) || wallUnitWeight <= 0) {
        issues.push({ field: 'wallUnitWeight', message: 'Wall unit weight (γ_w) must be strictly greater than 0 kN/m³.' });
      }
    }
  }

  if (
    wallCentroidX !== undefined &&
    footingWidth !== undefined &&
    wallThickness !== undefined &&
    footingWidth > 0 &&
    wallThickness > 0 &&
    wallThickness <= footingWidth
  ) {
    const minX = wallThickness / 2;
    const maxX = footingWidth - wallThickness / 2;
    const tolerance = 1e-6;

    if (wallCentroidX < minX - tolerance || wallCentroidX > maxX + tolerance) {
      issues.push({
        field: 'wallCentroidX',
        message: `Wall centroid (${wallCentroidX.toFixed(3)} m) must stay within footing boundaries [${minX.toFixed(3)} m, ${maxX.toFixed(3)} m].`,
      });
    }
  }

  if (allowableBearingCapacity !== undefined && allowableBearingCapacity <= 0) {
    issues.push({
      field: 'allowableBearingCapacity',
      message: 'Allowable bearing capacity must be greater than 0 kPa.',
    });
  }

  return issues;
}

export function getWallCentroidForPreset(
  preset: WallPositionPreset,
  footingWidth: number,
  wallThickness: number,
  customX?: number
): number {
  const safeB = Math.max(0.01, footingWidth);
  const safeT = Math.min(safeB, Math.max(0.001, wallThickness));

  switch (preset) {
    case 'centred':
      return safeB / 2;
    case 'left':
      return safeT / 2;
    case 'right':
      return safeB - safeT / 2;
    case 'custom':
      if (customX !== undefined) {
        const minX = safeT / 2;
        const maxX = safeB - safeT / 2;
        return Math.max(minX, Math.min(maxX, customX));
      }
      return safeB / 2;
  }
}

/**
 * Pure deterministic calculation engine for Cantilever Wall, Overturning Stability,
 * Additional Loads, Bearing Pressure, and Australian Standards (AS/NZS 1170.0).
 */
export function calculateOverturning(inputs: OverturningInputs): OverturningResults {
  const {
    windPressure,
    windCoefficient,
    wallHeight,
    wallThickness,
    footingWidth,
    footingDepth,
    footingUnitWeight,
    wallUnitWeight,
    includeWallWeight,
    wallCentroidX,
    windDirection,
    requiredRatio,
    designStandard = 'ASD',
    allowableBearingCapacity = 150,
    additionalLoads = [],
    as1170Combo = 'stability_0.9G_Wu',
  } = inputs;

  const isLeftToRight = windDirection === 'left_to_right';
  const activeToe: 'right' | 'left' = isLeftToRight ? 'right' : 'left';
  const activeToeX = isLeftToRight ? footingWidth : 0;
  const baseCenterX = footingWidth / 2;

  // 1. Wind Loading
  const designPressure = windPressure * windCoefficient;
  const lineLoad = designPressure * 1.0;
  const horizontalForce = lineLoad * wallHeight;
  const windResultantHeightFromBase = footingDepth + wallHeight / 2;

  // 2. Wind Overturning Moments about active toe
  const wallBaseMoment = (lineLoad * Math.pow(wallHeight, 2)) / 2;
  const shearTransferMoment = horizontalForce * footingDepth;
  const windOverturningMoment = horizontalForce * windResultantHeightFromBase;

  // 3. Footing Self-Weight (Dead Load G)
  const footingWeight = footingUnitWeight * footingWidth * footingDepth;
  const footingLeverArm = footingWidth / 2;
  const footingResistingMoment = footingWeight * footingLeverArm;

  // 4. Wall Self-Weight (Dead Load G)
  let wallWeight = 0;
  let wallLeverArm = 0;
  let wallResistingMoment = 0;

  if (includeWallWeight) {
    wallWeight = wallUnitWeight * wallThickness * wallHeight;
    wallLeverArm = isLeftToRight
      ? Math.max(0, footingWidth - wallCentroidX)
      : Math.max(0, wallCentroidX);
    wallResistingMoment = wallWeight * wallLeverArm;
  }

  // 5. Additional Loads Decomposition
  let additionalResistingMoment = 0;
  let additionalOverturningMoment = 0;
  let additionalVerticalLoad = 0;
  let additionalHorizontalForce = 0;
  let momentAboutCenterFromAdditional = 0;

  const additionalLoadsDecomposition: AdditionalLoadDecomposition[] = additionalLoads.map(load => {
    let verticalForce = 0;
    let horizForce = 0;
    let resistingM = 0;
    let overturningM = 0;
    let momentCenter = 0;
    let leverArm = 0;
    let desc = '';

    const posX = load.positionX ?? wallCentroidX;
    const heightY = load.heightY ?? (footingDepth + wallHeight);

    if (load.type === 'point_vertical') {
      verticalForce = load.value;
      leverArm = isLeftToRight ? Math.max(0, footingWidth - posX) : Math.max(0, posX);
      resistingM = verticalForce * leverArm;
      momentCenter = verticalForce * (baseCenterX - posX) * (isLeftToRight ? 1 : -1);
      desc = `Vertical point load ${load.value.toFixed(2)} kN/m @ x=${posX.toFixed(2)}m`;
    } else if (load.type === 'point_horizontal') {
      horizForce = load.value;
      leverArm = heightY;
      overturningM = horizForce * leverArm;
      momentCenter = overturningM;
      desc = `Lateral point load ${load.value.toFixed(2)} kN/m @ y=${heightY.toFixed(2)}m`;
    } else if (load.type === 'moment') {
      overturningM = load.value;
      momentCenter = load.value;
      desc = `Applied moment ${load.value.toFixed(2)} kNm/m`;
    } else if (load.type === 'surcharge_udl') {
      // Surcharge on footing top
      // Heel zone is opposite side of active toe
      let startX = 0;
      let endX = footingWidth;
      if (load.surface === 'heel') {
        startX = isLeftToRight ? 0 : wallCentroidX + wallThickness / 2;
        endX = isLeftToRight ? wallCentroidX - wallThickness / 2 : footingWidth;
      } else if (load.surface === 'toe') {
        startX = isLeftToRight ? wallCentroidX + wallThickness / 2 : 0;
        endX = isLeftToRight ? footingWidth : wallCentroidX - wallThickness / 2;
      }
      const surchargeWidth = Math.max(0, endX - startX);
      const surchargeCentroidX = startX + surchargeWidth / 2;
      verticalForce = load.value * surchargeWidth;
      leverArm = isLeftToRight
        ? Math.max(0, footingWidth - surchargeCentroidX)
        : Math.max(0, surchargeCentroidX);
      resistingM = verticalForce * leverArm;
      momentCenter = verticalForce * (baseCenterX - surchargeCentroidX) * (isLeftToRight ? 1 : -1);
      desc = `Surcharge ${load.value.toFixed(1)} kPa over ${surchargeWidth.toFixed(2)}m ${load.surface ?? 'heel'}`;
    }

    additionalVerticalLoad += verticalForce;
    additionalHorizontalForce += horizForce;
    additionalResistingMoment += resistingM;
    additionalOverturningMoment += overturningM;
    momentAboutCenterFromAdditional += momentCenter;

    return {
      id: load.id,
      name: load.name,
      type: load.type,
      action: load.action,
      value: load.value,
      verticalForce,
      horizontalForce: horizForce,
      resistingMoment: resistingM,
      overturningMoment: overturningM,
      momentAboutCenter: momentCenter,
      leverArmToToe: leverArm,
      description: desc,
    };
  });

  // 6. Unfactored Combined Moments (ASD / Serviceability)
  const totalResistingMoment = footingResistingMoment + wallResistingMoment + additionalResistingMoment;
  const overturningMoment = windOverturningMoment + additionalOverturningMoment;

  let overturningRatio: number | null = null;
  if (overturningMoment > 1e-9) {
    overturningRatio = totalResistingMoment / overturningMoment;
  }

  // 7. Design Standards & Load Combinations
  let standardFactors: StandardFactors = {
    name: 'Working Stress Design (ASD)',
    codeReference: 'Serviceability / Nominal (1.0G + 1.0W + 1.0Q)',
    factorG_stb: 1.0,
    factorG_dst: 1.0,
    factorQ: 1.0,
    factorW: 1.0,
  };

  let factoredResistingMoment = totalResistingMoment;
  let factoredOverturningMoment = overturningMoment;
  let designRatio = overturningRatio;

  if (designStandard === 'AS_NZS_1170') {
    if (as1170Combo === 'stability_0.9G_Wu') {
      // AS/NZS 1170.0 Table 4.1 Stability against overturning: 0.9 G + 1.0 W_u
      standardFactors = {
        name: 'AS/NZS 1170.0 Overturning Stability (ULS)',
        codeReference: 'AS/NZS 1170.0:2002 Table 4.1: 0.9G + 1.0Wu',
        factorG_stb: 0.9,
        factorG_dst: 1.2,
        factorQ: 0.0, // Conservative: no stabilizing Q
        factorW: 1.0,
      };

      // Resisting moment: 0.9 for dead loads (Footing + Wall + G additional)
      let factoredResist = (footingResistingMoment + wallResistingMoment) * 0.9;
      for (const item of additionalLoadsDecomposition) {
        if (item.action === 'G') {
          factoredResist += item.resistingMoment * 0.9;
        }
      }

      // Overturning moment: 1.0 for wind + 1.2 for any destabilizing dead load + 1.5 for destabilizing live load
      let factoredOT = windOverturningMoment * 1.0;
      for (const item of additionalLoadsDecomposition) {
        if (item.overturningMoment > 0) {
          const factor = item.action === 'W' ? 1.0 : item.action === 'G' ? 1.2 : 1.5;
          factoredOT += item.overturningMoment * factor;
        }
      }

      factoredResistingMoment = factoredResist;
      factoredOverturningMoment = factoredOT;
      designRatio = factoredOT > 1e-9 ? factoredResist / factoredOT : null;
    } else if (as1170Combo === 'bearing_1.2G_Wu_psiQ') {
      // AS/NZS 1170.0 Ultimate Wind Bearing: 1.2 G + 1.0 W_u + 0.4 Q
      standardFactors = {
        name: 'AS/NZS 1170.0 ULS Bearing (Wind Critical)',
        codeReference: 'AS/NZS 1170.0: 1.2G + 1.0Wu + 0.4Q',
        factorG_stb: 1.2,
        factorG_dst: 1.2,
        factorQ: 0.4,
        factorW: 1.0,
      };
      factoredResistingMoment = (footingResistingMoment + wallResistingMoment) * 1.2;
      factoredOverturningMoment = windOverturningMoment * 1.0;
      designRatio = factoredOverturningMoment > 1e-9 ? factoredResistingMoment / factoredOverturningMoment : null;
    } else {
      // AS/NZS 1170.0 Gravity Bearing: 1.2 G + 1.5 Q
      standardFactors = {
        name: 'AS/NZS 1170.0 ULS Bearing (Gravity Critical)',
        codeReference: 'AS/NZS 1170.0: 1.2G + 1.5Q',
        factorG_stb: 1.2,
        factorG_dst: 1.2,
        factorQ: 1.5,
        factorW: 0.0,
      };
      factoredResistingMoment = (footingResistingMoment + wallResistingMoment) * 1.2;
      factoredOverturningMoment = 0;
      designRatio = null;
    }
  }

  // 8. Soil Bearing Pressure Calculations
  // Total vertical load N:
  let totalVerticalLoad = footingWeight + wallWeight + additionalVerticalLoad;
  if (designStandard === 'AS_NZS_1170') {
    if (as1170Combo === 'stability_0.9G_Wu') {
      totalVerticalLoad = (footingWeight + wallWeight) * 0.9;
      for (const item of additionalLoadsDecomposition) {
        totalVerticalLoad += item.verticalForce * (item.action === 'G' ? 0.9 : 0.0);
      }
    } else if (as1170Combo === 'bearing_1.2G_Wu_psiQ') {
      totalVerticalLoad = (footingWeight + wallWeight) * 1.2;
      for (const item of additionalLoadsDecomposition) {
        totalVerticalLoad += item.verticalForce * (item.action === 'G' ? 1.2 : 0.4);
      }
    } else {
      totalVerticalLoad = (footingWeight + wallWeight) * 1.2;
      for (const item of additionalLoadsDecomposition) {
        totalVerticalLoad += item.verticalForce * (item.action === 'G' ? 1.2 : 1.5);
      }
    }
  }

  // Net moment about base centerline x = B / 2:
  // Overturning moment tips toward active toe (+).
  // Wall self-weight offset from center:
  const wallOffsetFromCenter = isLeftToRight
    ? (wallCentroidX - baseCenterX) // if x_wall > B/2, wall is on toe side (destabilizing moment about center)
    : (baseCenterX - wallCentroidX); // if right-to-left, left is toe

  const wallMomentAboutCenter = wallWeight * wallOffsetFromCenter;
  const activeOTMoment = designStandard === 'AS_NZS_1170' ? factoredOverturningMoment : overturningMoment;

  const netMomentAboutCenter = activeOTMoment + wallMomentAboutCenter + momentAboutCenterFromAdditional;

  // Eccentricity e = |M_net| / N:
  const eccentricity = totalVerticalLoad > 1e-9 ? Math.abs(netMomentAboutCenter) / totalVerticalLoad : 0;
  const kernLimit = footingWidth / 6;

  let contactStatus: 'full_contact' | 'tension_separation' | 'overturned' = 'full_contact';
  let qMax = 0;
  let qMin = 0;
  let effectiveContactWidth = footingWidth;
  let contactRatio = 100;

  if (totalVerticalLoad > 1e-9) {
    if (eccentricity <= kernLimit + 1e-7) {
      // Middle third: trapezoidal or rectangular bearing pressure
      contactStatus = 'full_contact';
      qMax = (totalVerticalLoad / footingWidth) * (1 + (6 * eccentricity) / footingWidth);
      qMin = Math.max(0, (totalVerticalLoad / footingWidth) * (1 - (6 * eccentricity) / footingWidth));
      effectiveContactWidth = footingWidth;
      contactRatio = 100;
    } else if (eccentricity < footingWidth / 2) {
      // Outside middle third: triangular pressure distribution with lift-off
      contactStatus = 'tension_separation';
      const a = footingWidth / 2 - eccentricity; // distance from toe to resultant
      effectiveContactWidth = Math.max(0.01, 3 * a);
      qMax = (2 * totalVerticalLoad) / effectiveContactWidth;
      qMin = 0;
      contactRatio = Math.min(100, Math.max(0, (effectiveContactWidth / footingWidth) * 100));
    } else {
      // Resultant is outside base: overturning / total lift-off
      contactStatus = 'overturned';
      effectiveContactWidth = 0;
      contactRatio = 0;
      qMax = 9999;
      qMin = 0;
    }
  }

  const allowableCapacity = allowableBearingCapacity;
  const utilizationRatio = allowableCapacity > 0 ? qMax / allowableCapacity : 0;
  let bearingStatus: 'pass' | 'fail' | 'indeterminate' = 'indeterminate';
  if (allowableCapacity > 0 && contactStatus !== 'overturned') {
    bearingStatus = utilizationRatio <= 1.0001 ? 'pass' : 'fail';
  } else if (contactStatus === 'overturned') {
    bearingStatus = 'fail';
  }

  const bearing: BearingPressureResults = {
    totalVerticalLoad,
    netMomentAboutCenter,
    eccentricity,
    kernLimit,
    contactStatus,
    qMax,
    qMin,
    effectiveContactWidth,
    contactRatio,
    allowableCapacity,
    utilizationRatio,
    bearingStatus,
  };

  // 9. Overall Pass / Fail Status
  let status: 'pass' | 'fail' | 'indeterminate' = 'indeterminate';
  let ratioMargin: number | null = null;

  const targetRatio = requiredRatio ?? (designStandard === 'AS_NZS_1170' ? 1.00 : 1.50);
  const activeRatio = designStandard === 'AS_NZS_1170' ? designRatio : overturningRatio;

  if (targetRatio !== undefined && targetRatio !== null && targetRatio > 0) {
    if (activeRatio !== null) {
      ratioMargin = activeRatio - targetRatio;
      const otPass = ratioMargin >= -1e-6;
      const bearingPass = bearingStatus !== 'fail';
      status = otPass && bearingPass ? 'pass' : 'fail';
    } else if (overturningMoment <= 1e-9 && totalResistingMoment > 0) {
      status = bearingStatus !== 'fail' ? 'pass' : 'fail';
    }
  }

  // 10. Structural Member Design Actions (M*, V*, N*)
  const designActions = computeStructuralDesignActions(
    inputs,
    lineLoad,
    bearing,
    designStandard,
    as1170Combo,
    additionalLoads
  );

  return {
    designPressure,
    lineLoad,
    horizontalForce,
    windResultantHeightFromBase,
    wallBaseMoment,
    shearTransferMoment,
    windOverturningMoment,
    overturningMoment,
    footingWeight,
    footingLeverArm,
    footingResistingMoment,
    wallWeight,
    wallLeverArm,
    wallResistingMoment,
    additionalLoadsDecomposition,
    additionalResistingMoment,
    additionalOverturningMoment,
    additionalVerticalLoad,
    additionalHorizontalForce,
    totalResistingMoment,
    overturningRatio,
    activeToe,
    activeToeX,
    designStandard,
    standardFactors,
    factoredResistingMoment,
    factoredOverturningMoment,
    designRatio,
    bearing,
    designActions,
    status,
    ratioMargin,
  };
}

export function computeStructuralDesignActions(
  inputs: OverturningInputs,
  lineLoad: number,
  bearing: BearingPressureResults,
  designStandard: DesignStandard,
  as1170Combo: AS1170Combo,
  additionalLoads: AdditionalLoad[]
): StructuralDesignActions {
  const Hw = inputs.wallHeight;
  const tw = inputs.wallThickness;
  const B = inputs.footingWidth;
  const D = inputs.footingDepth;
  const gammaW = inputs.wallUnitWeight;
  const gammaF = inputs.footingUnitWeight;
  const isLeftToRight = inputs.windDirection === 'left_to_right';

  const isAS = designStandard === 'AS_NZS_1170';
  const factorWind = 1.0;
  const factorG_stem = isAS ? 1.2 : 1.0;
  const factorG_rel = isAS ? 0.9 : 1.0;
  const factorG_dst = isAS ? 1.2 : 1.0;

  // 1. Wall Stem Base Actions (critical interface at top of footing)
  let stemShear = lineLoad * Hw * factorWind;
  let stemMoment = lineLoad * ((Hw * Hw) / 2) * factorWind;
  let stemAxial = Hw * tw * gammaW * factorG_stem;

  for (const load of additionalLoads) {
    const yAboveFooting = (load.heightY ?? (D + Hw)) - D;
    if (yAboveFooting >= 0) {
      const loadFactor = isAS ? (load.action === 'W' ? 1.0 : load.action === 'G' ? 1.2 : 1.5) : 1.0;
      if (load.type === 'point_horizontal') {
        stemShear += load.value * loadFactor;
        stemMoment += load.value * yAboveFooting * loadFactor;
      } else if (load.type === 'moment') {
        stemMoment += load.value * loadFactor;
      } else if (load.type === 'point_vertical') {
        stemAxial += load.value * loadFactor;
      }
    }
  }

  // 2. Toe and Heel Projection Geometry
  let L_toe = 0;
  let L_heel = 0;
  if (isLeftToRight) {
    const stemFrontX = Math.min(B, inputs.wallCentroidX + tw / 2);
    const stemBackX = Math.max(0, inputs.wallCentroidX - tw / 2);
    L_toe = Math.max(0, B - stemFrontX);
    L_heel = Math.max(0, stemBackX);
  } else {
    const stemFrontX = Math.max(0, inputs.wallCentroidX - tw / 2);
    const stemBackX = Math.min(B, inputs.wallCentroidX + tw / 2);
    L_toe = Math.max(0, stemFrontX);
    L_heel = Math.max(0, B - stemBackX);
  }

  // 3. Soil Pressure Distribution along base
  const qMax = bearing.qMax;
  const qMin = bearing.qMin;
  const contactStatus = bearing.contactStatus;
  const Lc = bearing.effectiveContactWidth;

  const getSoilPressureAt = (s: number): number => {
    if (contactStatus === 'overturned' || s < 0 || s > B) return 0;
    if (contactStatus === 'full_contact') {
      return Math.max(0, qMax - (qMax - qMin) * (s / B));
    }
    if (s <= Lc) {
      return Math.max(0, qMax * (1 - s / Math.max(0.001, Lc)));
    }
    return 0;
  };

  const qToe = getSoilPressureAt(0);
  const qStemFront = getSoilPressureAt(L_toe);
  const qStemBack = getSoilPressureAt(B - L_heel);
  const qHeel = getSoilPressureAt(B);

  // 4. Toe Cantilever Design Actions (Bending Moment & Shear at stem face)
  const footingWeightPerM2 = D * gammaF;
  const relievingDownwardPressure = footingWeightPerM2 * factorG_rel;

  const steps = 100;
  let toeShear = 0;
  let toeMoment = 0;
  const ds = L_toe > 0 ? L_toe / steps : 0;
  if (L_toe > 0) {
    for (let i = 0; i < steps; i++) {
      const sMid = (i + 0.5) * ds;
      const qMid = getSoilPressureAt(sMid);
      const qNet = Math.max(0, qMid - relievingDownwardPressure);
      toeShear += qNet * ds;
      toeMoment += qNet * (L_toe - sMid) * ds;
    }
  }

  // One-way shear at critical distance d from stem face: section at s = max(0, L_toe - d)
  const d_eff = Math.max(0.10, D - 0.07);
  let toeShearAtD = 0;
  const toeLengthMinusD = Math.max(0, L_toe - d_eff);
  if (toeLengthMinusD > 0) {
    const dsD = toeLengthMinusD / steps;
    for (let i = 0; i < steps; i++) {
      const sMid = (i + 0.5) * dsD;
      const qMid = getSoilPressureAt(sMid);
      const qNet = Math.max(0, qMid - relievingDownwardPressure);
      toeShearAtD += qNet * dsD;
    }
  }

  // 5. Heel Cantilever Design Actions (Bending Moment & Shear at back face of stem)
  let surchargePressure = 0;
  for (const load of additionalLoads) {
    if (load.type === 'surcharge_udl' && (load.surface === 'heel' || load.surface === 'full' || !load.surface)) {
      const loadFactor = isAS ? (load.action === 'G' ? 1.2 : 1.5) : 1.0;
      surchargePressure += load.value * loadFactor;
    }
  }
  const heelDownwardPressure = footingWeightPerM2 * factorG_dst + surchargePressure;

  let heelShear = 0;
  let heelMoment = 0;
  const du = L_heel > 0 ? L_heel / steps : 0;
  if (L_heel > 0) {
    for (let i = 0; i < steps; i++) {
      const uMid = (i + 0.5) * du;
      const sFromToe = B - uMid;
      const qSoil = getSoilPressureAt(sFromToe);
      const qNetDown = Math.max(0, heelDownwardPressure - qSoil);
      heelShear += qNetDown * du;
      heelMoment += qNetDown * (L_heel - uMid) * du;
    }
  }

  // 6. Overall Footing Design Actions
  const totalVertical = bearing.totalVerticalLoad;
  const totalHorizontal = lineLoad * Hw + additionalLoads
    .filter(l => l.type === 'point_horizontal')
    .reduce((sum, l) => sum + l.value, 0);

  const phi_slide = 0.8;
  const mu_friction = 0.50;
  const minVerticalForSliding = (Hw * tw * gammaW + B * D * gammaF) * (isAS ? 0.9 : 1.0);
  const slidingCapacity = phi_slide * mu_friction * minVerticalForSliding;
  const slidingStatus = totalHorizontal <= slidingCapacity + 1e-6 ? 'pass' : 'fail';

  return {
    wall: {
      mStar: Math.max(0, stemMoment),
      vStar: Math.max(0, stemShear),
      nStar: Math.max(0, stemAxial),
      stemHeight: Hw,
      stemThickness: tw,
      criticalSection: 'At base of stem (interface with top of footing slab)',
    },
    toe: {
      length: L_toe,
      mStar: Math.max(0, toeMoment),
      vStar: Math.max(0, toeShear),
      vStarAtD: Math.max(0, toeShearAtD),
      effectiveDepthD: d_eff,
      qToe,
      qStemFront,
      netUpwardForce: Math.max(0, toeShear),
    },
    heel: {
      length: L_heel,
      mStar: Math.max(0, heelMoment),
      vStar: Math.max(0, heelShear),
      downwardPressure: heelDownwardPressure,
      qHeel,
      qStemBack,
      netDownwardForce: Math.max(0, heelShear),
    },
    footing: {
      nStar: totalVertical,
      vStar: totalHorizontal,
      qStarMax: qMax,
      slidingCapacity,
      slidingStatus,
    },
    designStandardText: isAS
      ? `AS/NZS 1170.0:2002 & AS 3600:2018 (Limit State Design Actions)`
      : `Working Stress / ASD (Nominal Actions)`,
  };
}

export const DEFAULT_OVERTURNING_INPUTS: OverturningInputs = {
  windPressure: 0.84, // kPa
  windCoefficient: 1.30,
  wallHeight: 1.20, // m
  wallThickness: 0.15, // m
  footingWidth: 0.60, // m
  footingDepth: 0.60, // m
  footingUnitWeight: 24.0, // kN/m³
  wallUnitWeight: 24.0, // kN/m³
  includeWallWeight: false,
  wallCentroidX: 0.30, // m (centred: 0.60 / 2)
  windDirection: 'left_to_right',
  requiredRatio: 1.50,
  designStandard: 'ASD',
  allowableBearingCapacity: 150,
  additionalLoads: [],
  as1170Combo: 'stability_0.9G_Wu',
};

/**
 * Built-in Library Presets
 */
export interface WallPresetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  inputs: OverturningInputs;
}

export const BUILT_IN_PRESETS: WallPresetItem[] = [
  {
    id: 'preset-standard-boundary',
    name: 'Standard Boundary Wall',
    category: 'General / ASD',
    description: '1.2m wall, 0.6×0.6m footing, 0.84 kPa wind pressure (Working Stress Design FS ≥ 1.50).',
    inputs: { ...DEFAULT_OVERTURNING_INPUTS },
  },
  {
    id: 'preset-as1170-screen-wall',
    name: 'AS/NZS 1170.0 Screen Wall (Region A, TC2)',
    category: 'Australian Standards',
    description: '1.8m wall, 0.8×0.7m footing, 1.10 kPa wind, limit state combination 0.9G + 1.0Wu.',
    inputs: {
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 1.10,
      windCoefficient: 1.20,
      wallHeight: 1.80,
      wallThickness: 0.19,
      footingWidth: 0.80,
      footingDepth: 0.70,
      wallCentroidX: 0.40,
      includeWallWeight: true,
      designStandard: 'AS_NZS_1170',
      as1170Combo: 'stability_0.9G_Wu',
      requiredRatio: 1.00,
      allowableBearingCapacity: 150,
    },
  },
  {
    id: 'preset-high-wind-parapet',
    name: 'High Wind Parapet / Signage Wall',
    category: 'Commercial / High Wind',
    description: '2.1m wall, 1.0×0.8m footing, 1.45 kPa wind with 1.5 kN/m top parapet capping load.',
    inputs: {
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 1.45,
      windCoefficient: 1.35,
      wallHeight: 2.10,
      wallThickness: 0.20,
      footingWidth: 1.00,
      footingDepth: 0.80,
      wallCentroidX: 0.50,
      includeWallWeight: true,
      requiredRatio: 1.50,
      allowableBearingCapacity: 200,
      additionalLoads: [
        {
          id: 'top-capping',
          name: 'Concrete Capping / Handrail',
          type: 'point_vertical',
          action: 'G',
          value: 1.5,
          positionX: 0.50,
        },
      ],
    },
  },
  {
    id: 'preset-retaining-surcharge',
    name: 'Garden Wall with Heel Soil Surcharge',
    category: 'Retaining & Landscape',
    description: '1.4m wall, 0.9×0.6m footing with 5.0 kPa soil overburden surcharge on heel.',
    inputs: {
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 0.90,
      windCoefficient: 1.25,
      wallHeight: 1.40,
      wallThickness: 0.20,
      footingWidth: 0.90,
      footingDepth: 0.60,
      wallCentroidX: 0.20, // offset toward front
      includeWallWeight: true,
      requiredRatio: 1.50,
      allowableBearingCapacity: 150,
      additionalLoads: [
        {
          id: 'heel-surcharge',
          name: 'Soil / Paving Backfill Surcharge',
          type: 'surcharge_udl',
          action: 'G',
          value: 5.0,
          surface: 'heel',
        },
      ],
    },
  },
  {
    id: 'preset-zero-lot-line',
    name: 'Boundary Wall on Left Edge (Zero Lot Line)',
    category: 'Boundary / Zero Lot',
    description: 'Wall positioned hard on left boundary edge (x = t/2), 0.75m footing extending inward.',
    inputs: {
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 0.80,
      windCoefficient: 1.20,
      wallHeight: 1.50,
      wallThickness: 0.15,
      footingWidth: 0.75,
      footingDepth: 0.65,
      wallCentroidX: 0.075,
      includeWallWeight: true,
      requiredRatio: 1.50,
      allowableBearingCapacity: 120,
    },
  },
];

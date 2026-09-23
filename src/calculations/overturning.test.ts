import { describe, expect, it } from 'vitest';
import {
  calculateOverturning,
  DEFAULT_OVERTURNING_INPUTS,
  getWallCentroidForPreset,
  OverturningInputs,
  validateOverturningInputs,
} from './overturning';

describe('Cantilever Wall & Footing Overturning Calculation Engine', () => {
  // Test 1: Default case from Section 14
  it('1. matches default specification values exactly', () => {
    const inputs: OverturningInputs = {
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 0.84,
      windCoefficient: 1.3,
      wallHeight: 1.2,
      wallThickness: 0.15,
      footingWidth: 0.6,
      footingDepth: 0.6,
      footingUnitWeight: 24.0,
      wallUnitWeight: 24.0,
      includeWallWeight: false,
      wallCentroidX: 0.3,
      windDirection: 'left_to_right',
      requiredRatio: 1.5,
    };

    const res = calculateOverturning(inputs);

    // Design wind pressure: p_d = 0.84 * 1.30 = 1.092 kPa
    expect(res.designPressure).toBeCloseTo(1.092, 5);
    // Horizontal line load w = 1.092 kN/m
    expect(res.lineLoad).toBeCloseTo(1.092, 5);
    // Horizontal resultant: H = 1.092 * 1.2 = 1.3104 kN
    expect(res.horizontalForce).toBeCloseTo(1.3104, 5);
    // Wind resultant height above footing base: 0.6 + 1.2 / 2 = 1.2 m
    expect(res.windResultantHeightFromBase).toBeCloseTo(1.2, 5);
    // Overturning moment: M_OT = 1.3104 * 1.2 = 1.57248 kNm
    expect(res.overturningMoment).toBeCloseTo(1.57248, 5);
    // Footing weight: W_f = 24 * 0.6 * 0.6 = 8.64 kN
    expect(res.footingWeight).toBeCloseTo(8.64, 5);
    // Footing resisting moment: M_R,f = 8.64 * 0.3 = 2.592 kNm
    expect(res.footingResistingMoment).toBeCloseTo(2.592, 5);
    // Wall weight disabled
    expect(res.wallWeight).toBe(0);
    expect(res.wallResistingMoment).toBe(0);
    expect(res.totalResistingMoment).toBeCloseTo(2.592, 5);
    // Overturning ratio: FS = 2.592 / 1.57248 ≈ 1.64835...
    expect(res.overturningRatio).not.toBeNull();
    expect(res.overturningRatio!).toBeCloseTo(1.64835, 4);
    expect(Number(res.overturningRatio!.toFixed(2))).toBe(1.65);
    expect(res.status).toBe('pass');
  });

  // Test 2: Concrete unit weight change
  it('2. correctly recalculates when concrete unit weight changes', () => {
    const inputs: OverturningInputs = {
      ...DEFAULT_OVERTURNING_INPUTS,
      footingUnitWeight: 25.0, // changed from 24 to 25 kN/m³
    };

    const res = calculateOverturning(inputs);
    // W_f = 25 * 0.6 * 0.6 = 9.0 kN
    expect(res.footingWeight).toBeCloseTo(9.0, 5);
    // M_R,f = 9.0 * 0.3 = 2.70 kNm
    expect(res.footingResistingMoment).toBeCloseTo(2.7, 5);
    expect(res.totalResistingMoment).toBeCloseTo(2.7, 5);
    // FS = 2.7 / 1.57248 ≈ 1.7170
    expect(res.overturningRatio!).toBeCloseTo(2.7 / 1.57248, 4);
  });

  // Test 3: Centred wall self-weight (Section 15)
  it('3. calculates centred wall self-weight and resisting moment accurately', () => {
    const inputs: OverturningInputs = {
      ...DEFAULT_OVERTURNING_INPUTS,
      includeWallWeight: true,
      wallThickness: 0.15,
      wallCentroidX: 0.3, // centred: 0.6 / 2
      wallUnitWeight: 24.0,
      footingUnitWeight: 24.0,
      windDirection: 'left_to_right',
    };

    const res = calculateOverturning(inputs);

    // Wall weight: W_wall = 24 * 0.15 * 1.2 = 4.32 kN
    expect(res.wallWeight).toBeCloseTo(4.32, 5);
    // Wall lever arm: 0.60 - 0.30 = 0.30 m
    expect(res.wallLeverArm).toBeCloseTo(0.3, 5);
    // Wall resisting moment: M_R,wall = 4.32 * 0.30 = 1.296 kNm
    expect(res.wallResistingMoment).toBeCloseTo(1.296, 5);
    // Total resistance: M_R = 2.592 + 1.296 = 3.888 kNm
    expect(res.totalResistingMoment).toBeCloseTo(3.888, 5);
    // FS = 3.888 / 1.57248 ≈ 2.4725
    expect(res.overturningRatio!).toBeCloseTo(3.888 / 1.57248, 4);
  });

  // Test 4: Wall at left edge
  it('4. calculates left-edge wall with left-to-right wind (maximum lever arm)', () => {
    const t = 0.15;
    const B = 0.6;
    const x_wall = t / 2; // 0.075 m from left edge

    const inputs: OverturningInputs = {
      ...DEFAULT_OVERTURNING_INPUTS,
      includeWallWeight: true,
      wallThickness: t,
      footingWidth: B,
      wallCentroidX: x_wall,
      windDirection: 'left_to_right', // toe is at right edge x = B = 0.60
    };

    const res = calculateOverturning(inputs);
    // Toe is at x = 0.60 m. Wall centroid is at x = 0.075 m.
    // L_wall = 0.60 - 0.075 = 0.525 m.
    expect(res.wallLeverArm).toBeCloseTo(0.525, 5);
    // M_R,wall = 4.32 * 0.525 = 2.268 kNm
    expect(res.wallResistingMoment).toBeCloseTo(2.268, 5);
    // Total M_R = 2.592 + 2.268 = 4.860 kNm
    expect(res.totalResistingMoment).toBeCloseTo(4.86, 5);
  });

  // Test 5: Wall at right edge
  it('5. calculates right-edge wall with left-to-right wind (minimum lever arm)', () => {
    const t = 0.15;
    const B = 0.6;
    const x_wall = B - t / 2; // 0.60 - 0.075 = 0.525 m

    const inputs: OverturningInputs = {
      ...DEFAULT_OVERTURNING_INPUTS,
      includeWallWeight: true,
      wallThickness: t,
      footingWidth: B,
      wallCentroidX: x_wall,
      windDirection: 'left_to_right', // toe is at right edge x = 0.60
    };

    const res = calculateOverturning(inputs);
    // Toe is at x = 0.60 m. Wall centroid is at x = 0.525 m.
    // L_wall = 0.60 - 0.525 = 0.075 m.
    expect(res.wallLeverArm).toBeCloseTo(0.075, 5);
    // M_R,wall = 4.32 * 0.075 = 0.324 kNm
    expect(res.wallResistingMoment).toBeCloseTo(0.324, 5);
    // Total M_R = 2.592 + 0.324 = 2.916 kNm
    expect(res.totalResistingMoment).toBeCloseTo(2.916, 5);
  });

  // Test 6: Opposite wind direction (right-to-left wind)
  it('6. correctly reverses active toe and lever arms for right-to-left wind', () => {
    const t = 0.15;
    const B = 0.6;

    // Wall at left edge (x_wall = 0.075) with right-to-left wind:
    // Wind pushes from right to left (←). Active toe is at LEFT edge (x = 0).
    const leftEdgeRes = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      includeWallWeight: true,
      wallThickness: t,
      footingWidth: B,
      wallCentroidX: t / 2, // 0.075
      windDirection: 'right_to_left',
    });

    expect(leftEdgeRes.activeToe).toBe('left');
    expect(leftEdgeRes.activeToeX).toBe(0);
    // Lever arm to left edge is x_wall = 0.075 m
    expect(leftEdgeRes.wallLeverArm).toBeCloseTo(0.075, 5);
    expect(leftEdgeRes.wallResistingMoment).toBeCloseTo(0.324, 5);

    // Wall at right edge (x_wall = 0.525) with right-to-left wind:
    // Lever arm to left edge is x_wall = 0.525 m
    const rightEdgeRes = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      includeWallWeight: true,
      wallThickness: t,
      footingWidth: B,
      wallCentroidX: B - t / 2, // 0.525
      windDirection: 'right_to_left',
    });

    expect(rightEdgeRes.activeToe).toBe('left');
    expect(rightEdgeRes.wallLeverArm).toBeCloseTo(0.525, 5);
    expect(rightEdgeRes.wallResistingMoment).toBeCloseTo(2.268, 5);
  });

  // Test 7: Wall self-weight disabled
  it('7. completely excludes wall weight when checkbox is unchecked', () => {
    const res = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      includeWallWeight: false,
      wallThickness: 0.25,
      wallUnitWeight: 26,
    });

    expect(res.wallWeight).toBe(0);
    expect(res.wallResistingMoment).toBe(0);
    expect(res.totalResistingMoment).toBe(res.footingResistingMoment);
  });

  // Test 8: Zero wind pressure
  it('8. handles zero wind pressure gracefully without NaN or error', () => {
    const res = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 0,
    });

    expect(res.designPressure).toBe(0);
    expect(res.lineLoad).toBe(0);
    expect(res.horizontalForce).toBe(0);
    expect(res.overturningMoment).toBe(0);
    expect(res.footingResistingMoment).toBeGreaterThan(0);
    // Ratio handled safely (null when no overturning load)
    expect(res.overturningRatio).toBeNull();
    expect(res.status).toBe('pass'); // Resisting capacity with zero load
  });

  // Test 9: Input validation
  it('9. validates geometric boundaries and input constraints properly', () => {
    // Check positive dimensions
    expect(validateOverturningInputs({ footingWidth: 0 })).toContainEqual(
      expect.objectContaining({ field: 'footingWidth' })
    );
    expect(validateOverturningInputs({ footingDepth: -0.5 })).toContainEqual(
      expect.objectContaining({ field: 'footingDepth' })
    );
    expect(validateOverturningInputs({ wallHeight: 0 })).toContainEqual(
      expect.objectContaining({ field: 'wallHeight' })
    );
    expect(validateOverturningInputs({ windPressure: -1 })).toContainEqual(
      expect.objectContaining({ field: 'windPressure' })
    );

    // Wall thickness exceeds footing width
    expect(
      validateOverturningInputs({
        includeWallWeight: true,
        footingWidth: 0.5,
        wallThickness: 0.6,
      })
    ).toContainEqual(expect.objectContaining({ field: 'wallThickness' }));

    // Wall centroid outside footing bounds
    // B = 1.0, t = 0.2 -> allowable x_wall in [0.1, 0.9]
    expect(
      validateOverturningInputs({
        includeWallWeight: true,
        footingWidth: 1.0,
        wallThickness: 0.2,
        wallCentroidX: 0.05, // too far left
      })
    ).toContainEqual(expect.objectContaining({ field: 'wallCentroidX' }));

    expect(
      validateOverturningInputs({
        includeWallWeight: true,
        footingWidth: 1.0,
        wallThickness: 0.2,
        wallCentroidX: 0.95, // too far right
      })
    ).toContainEqual(expect.objectContaining({ field: 'wallCentroidX' }));
  });

  // Test 10: Equivalent Identity Check
  // M_OT = wz(D + z/2) must equal wz²/2 + (wz)D within floating-point tolerance
  it('10. verifies equivalence identity: wz(D + z/2) === wz²/2 + (wz)D across varied test geometries', () => {
    const testCases = [
      { w: 1.092, z: 1.2, D: 0.6 },
      { w: 2.5, z: 2.4, D: 0.8 },
      { w: 0.55, z: 0.9, D: 0.45 },
      { w: 3.2, z: 3.0, D: 1.2 },
      { w: 1.875, z: 1.8, D: 0.75 },
    ];

    for (const { w, z, D } of testCases) {
      const H = w * z;
      const combined = H * (D + z / 2);
      const decomposed = (w * Math.pow(z, 2)) / 2 + H * D;

      expect(Math.abs(combined - decomposed)).toBeLessThan(1e-12);
    }
  });

  it('correctly calculates preset centroid coordinates', () => {
    const B = 0.8;
    const t = 0.2;
    expect(getWallCentroidForPreset('centred', B, t)).toBeCloseTo(0.4, 5);
    expect(getWallCentroidForPreset('left', B, t)).toBeCloseTo(0.1, 5);
    expect(getWallCentroidForPreset('right', B, t)).toBeCloseTo(0.7, 5);
    expect(getWallCentroidForPreset('custom', B, t, 0.35)).toBeCloseTo(0.35, 5);
    // Clamping on custom
    expect(getWallCentroidForPreset('custom', B, t, 0.05)).toBeCloseTo(0.1, 5);
    expect(getWallCentroidForPreset('custom', B, t, 0.95)).toBeCloseTo(0.7, 5);
  });

  // Test 11: Bearing pressure calculations
  it('11. correctly evaluates bearing pressure, kern limit, and contact status', () => {
    // Zero wind test: pure uniform bearing pressure
    const zeroWindRes = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      windPressure: 0,
      footingWidth: 1.0,
      footingDepth: 0.5,
      footingUnitWeight: 24,
      includeWallWeight: false,
    });
    // N = 24 * 1.0 * 0.5 = 12 kN/m
    expect(zeroWindRes.bearing.totalVerticalLoad).toBeCloseTo(12, 4);
    expect(zeroWindRes.bearing.eccentricity).toBeCloseTo(0, 4);
    expect(zeroWindRes.bearing.kernLimit).toBeCloseTo(1.0 / 6, 4);
    expect(zeroWindRes.bearing.contactStatus).toBe('full_contact');
    expect(zeroWindRes.bearing.qMax).toBeCloseTo(12, 4);
    expect(zeroWindRes.bearing.qMin).toBeCloseTo(12, 4);
    expect(zeroWindRes.bearing.contactRatio).toBe(100);
  });

  // Test 12: Australian Standards AS/NZS 1170.0 ULS Stability (0.9G + 1.0Wu)
  it('12. applies Australian Standards 0.9G + 1.0Wu load combination correctly', () => {
    const res = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      designStandard: 'AS_NZS_1170',
      as1170Combo: 'stability_0.9G_Wu',
    });

    // M_R = 2.592 kNm unfactored
    // Factored M_d,R = 2.592 * 0.9 = 2.3328 kNm
    expect(res.factoredResistingMoment).toBeCloseTo(2.592 * 0.9, 4);
    // Factored M_d,OT = 1.57248 * 1.0 = 1.57248 kNm
    expect(res.factoredOverturningMoment).toBeCloseTo(1.57248, 4);
    // Design ratio = 2.3328 / 1.57248 ≈ 1.4835
    expect(res.designRatio!).toBeCloseTo(2.3328 / 1.57248, 4);
  });

  // Test 13: Additional loads
  it('13. correctly incorporates additional point loads and heel surcharges', () => {
    const res = calculateOverturning({
      ...DEFAULT_OVERTURNING_INPUTS,
      additionalLoads: [
        {
          id: 'point-1',
          name: 'Top Lateral Point Load',
          type: 'point_horizontal',
          action: 'W',
          value: 2.0, // 2 kN/m
          heightY: 1.8, // at top (D + z = 0.6 + 1.2 = 1.8m)
        },
      ],
    });

    // Additional overturning moment = 2.0 * 1.8 = 3.6 kNm
    expect(res.additionalOverturningMoment).toBeCloseTo(3.6, 4);
    expect(res.overturningMoment).toBeCloseTo(1.57248 + 3.6, 4);
  });
});


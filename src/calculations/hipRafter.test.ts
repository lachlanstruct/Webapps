import { describe, it, expect } from 'vitest';
import {
  calculateHipGeometry,
  solveTriangularBeamMechanics,
  calculateHipRafter,
  DEFAULT_HIP_INPUTS,
} from './hipRafter';

describe('Hip Rafter Calculation Engine', () => {
  it('1. correctly computes 3D geometry and plan angles for a symmetric 4.0m x 4.0m hip', () => {
    const geo = calculateHipGeometry(DEFAULT_HIP_INPUTS);

    // Plan length Lp = sqrt(4^2 + 4^2) = sqrt(32) ≈ 5.65685 m
    expect(geo.planLength).toBeCloseTo(Math.sqrt(32), 4);

    // Plan angle of symmetric hip = 45 degrees
    expect(geo.hipPlanAngleDeg).toBeCloseTo(45.0, 3);

    // Rise H = 4.0 * tan(22.5°) ≈ 1.65685 m
    const expectedRise = 4.0 * Math.tan((22.5 * Math.PI) / 180);
    expect(geo.roofRise).toBeCloseTo(expectedRise, 4);

    // True length L_true = sqrt(Lp^2 + H^2)
    const expectedTrue = Math.sqrt(32 + expectedRise * expectedRise);
    expect(geo.trueLength).toBeCloseTo(expectedTrue, 4);

    // Tributary plan area = 0.5 * 4 * 4 = 8.0 m²
    expect(geo.tributaryAreaPlan).toBeCloseTo(8.0, 4);

    // Peak tributary width in plan = 2 * 8.0 / 5.65685 ≈ 2.8284 m
    expect(geo.maxTributaryWidthPlan).toBeCloseTo(16.0 / Math.sqrt(32), 4);
  });

  it('2. verifies exact theoretical beam mechanics for pure triangular line load', () => {
    // Pure triangular load w(x) = w0 * (x / L)
    // with w0 = 6.0 kN/m, L = 6.0 m, w_uniform = 0
    const w0 = 6.0;
    const L = 6.0;

    const res = solveTriangularBeamMechanics(L, w0, 0, 0, 10000, 1e8);

    // Total triangular load = 0.5 * 6.0 * 6.0 = 18.0 kN
    expect(res.totalLoadKN).toBeCloseTo(18.0, 4);

    // Reaction at eaves (x = 0): R_eaves = (1/6) * w0 * L = (1/6) * 6 * 6 = 6.0 kN
    expect(res.rEavesKN).toBeCloseTo(6.0, 4);

    // Reaction at ridge (x = L): R_ridge = (1/3) * w0 * L = (1/3) * 6 * 6 = 12.0 kN
    expect(res.rRidgeKN).toBeCloseTo(12.0, 4);

    // Location of zero shear / max moment: x_M = L / sqrt(3) = 6 / sqrt(3) ≈ 3.4641 m
    expect(res.maxMomentLocationM).toBeCloseTo(6.0 / Math.sqrt(3), 3);

    // Theoretical maximum moment: M_max = (w0 * L^2) / (9 * sqrt(3)) = 216 / (9 * sqrt(3)) = 24 / sqrt(3) ≈ 13.8564 kNm
    const theoreticalMaxM = (w0 * L * L) / (9 * Math.sqrt(3));
    expect(res.maxMomentKNm).toBeCloseTo(theoreticalMaxM, 3);
  });

  it('3. runs complete hip rafter analysis and returns governing design actions', () => {
    const res = calculateHipRafter(DEFAULT_HIP_INPUTS);

    expect(res.governingActions.mStar).toBeGreaterThan(0);
    expect(res.governingActions.vStar).toBeGreaterThan(0);
    expect(res.governingActions.rEavesMaxDownKN).toBeGreaterThan(0);
    expect(res.governingActions.rRidgeMaxDownKN).toBeGreaterThan(res.governingActions.rEavesMaxDownKN);
    expect(res.governingActions.serviceDeflectionMm).toBeGreaterThan(0);
    expect(res.governingActions.bendingUtilization).toBeGreaterThan(0);
  });
});

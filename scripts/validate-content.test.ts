import { describe, expect, test } from "bun:test"
import {
  EXPIRING_URL_SIGNATURES,
  DRIFT_MIN_ABSOLUTE,
  DRIFT_FRACTION,
} from "../scripts/validate-content"

// validate-content.js guards its entrypoint with `require.main === module`, so
// importing it only runs top-level constant definitions + module.exports — never
// main()/checkDrift()/execSync()/fetch(). (Verified: importing prints no
// "Validating generated content..." banner.) These tests pin the documented
// CHECK B signatures and the CHECK C drift thresholds, which downstream content
// gating depends on.

describe("EXPIRING_URL_SIGNATURES (CHECK B)", () => {
  test("is a non-empty array of strings", () => {
    expect(Array.isArray(EXPIRING_URL_SIGNATURES)).toBe(true)
    expect(EXPIRING_URL_SIGNATURES.length).toBeGreaterThan(0)
    for (const sig of EXPIRING_URL_SIGNATURES) {
      expect(typeof sig).toBe("string")
      expect(sig.length).toBeGreaterThan(0)
    }
  })

  test("includes the 4 known expiring/signed-URL signatures", () => {
    const known = [
      "X-Amz-Expires",
      "expiry_time",
      "secure.notion-static.com",
      "X-Amz-Signature",
    ]
    for (const sig of known) {
      expect(EXPIRING_URL_SIGNATURES).toContain(sig)
    }
  })

  test("contains no duplicate signatures", () => {
    expect(new Set(EXPIRING_URL_SIGNATURES).size).toBe(EXPIRING_URL_SIGNATURES.length)
  })
})

describe("drift threshold constants (CHECK C)", () => {
  test("DRIFT_MIN_ABSOLUTE is a sane integer >= 2", () => {
    expect(typeof DRIFT_MIN_ABSOLUTE).toBe("number")
    expect(Number.isInteger(DRIFT_MIN_ABSOLUTE)).toBe(true)
    expect(DRIFT_MIN_ABSOLUTE).toBeGreaterThanOrEqual(2)
  })

  test("DRIFT_FRACTION is a fraction strictly between 0 and 1", () => {
    expect(typeof DRIFT_FRACTION).toBe("number")
    expect(DRIFT_FRACTION).toBeGreaterThan(0)
    expect(DRIFT_FRACTION).toBeLessThan(1)
  })

  test("combined: an allowed-drop formula stays positive for any count", () => {
    // Mirror the gate's allowedDrop = max(MIN, ceil(count * FRACTION)).
    const allowedDrop = (count: number) =>
      Math.max(DRIFT_MIN_ABSOLUTE, Math.ceil(count * DRIFT_FRACTION))
    expect(allowedDrop(0)).toBe(DRIFT_MIN_ABSOLUTE)
    expect(allowedDrop(100)).toBeGreaterThanOrEqual(DRIFT_MIN_ABSOLUTE)
    expect(allowedDrop(100)).toBeGreaterThan(0)
  })
})

import { expect, test } from "bun:test";
import { categoryLabel } from "./category-label";

test("legacy category spelling is corrected only for display", () => {
  expect(categoryLabel("Domclobering")).toBe("DOM Clobbering");
  expect(categoryLabel("domclobering")).toBe("DOM Clobbering");
  expect(categoryLabel("CSS Leak")).toBe("CSS Leak");
  expect(encodeURIComponent("Domclobering".toLowerCase())).toBe("domclobering");
});

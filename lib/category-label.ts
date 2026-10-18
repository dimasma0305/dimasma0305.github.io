/** Correct legacy category labels for readers without changing existing URLs. */
export function categoryLabel(name: string): string {
  return name.toLowerCase() === "domclobering" ? "DOM Clobbering" : name;
}

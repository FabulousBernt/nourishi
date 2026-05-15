// Blocked terms grouped by category. Matched with word boundaries (case-insensitive).
const BLOCKED_PATTERNS = [
  // Violence / harm
  "murder", "\\bkill\\b", "suicide", "torture", "\\bassault\\b", "\\bstab\\b", "\\bshoot",
  "strangle", "dismember", "decapitat", "mutilat", "massacre", "genocide",
  "\\bbomb\\b", "terrorist", "terroris",
  // Explicit / sexual
  "porn", "hentai", "\\bxxx\\b", "orgasm", "\\borgy\\b", "fetish", "bdsm",
  "genitals", "penis", "vagina", "\\banus\\b", "\\bnude\\b", "\\bnaked\\b",
  "masturbat", "ejaculat", "erotic",
  // Drugs (non-culinary)
  "cocaine", "\\bheroin\\b", "methamphetamine", "meth lab", "fentanyl", "crack pipe",
  "drug deal", "overdose",
  // Hate / slurs
  "nigger", "nigga", "faggot", "\\bkike\\b", "\\bspic\\b", "\\bchink\\b", "wetback",
  "white power", "white supremac", "\\bnazi", "heil hitler",
  // Misc harmful
  "how to make a weapon", "how to poison", "child abuse", "pedophil", "\\brape\\b",
];

// Build a single regex from all patterns (case-insensitive)
const blockedRegex = new RegExp(
  BLOCKED_PATTERNS.join("|"),
  "i"
);

/**
 * Returns { blocked: true, reason: string } if input contains blocked content,
 * or { blocked: false } if clean.
 */
export function checkContent(input) {
  if (typeof input !== "string") return { blocked: false };
  if (blockedRegex.test(input)) {
    return { blocked: true, reason: "Please search for food-related terms." };
  }
  return { blocked: false };
}

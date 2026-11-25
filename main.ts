// The Router Confesses — entry program.
//
// Writes the single winning one-line excuse to entry.txt. The line is a
// fixed string held in this file: the competition's gate requires exactly
// one line of 1-200 UTF-8 characters, so the program validates the line
// against that rule before writing anything.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The winning line: three beats — the hero's 12 seconds left (the stake),
// the router's 47 secret viewings (the escalation, self-implication),
// and a three-word punch that ends the line.
const LINE =
  "Your hero had 12 seconds left to confess, so I confess first: I streamed the ending 47 times and died of spoilers.";

const MAX_CHARS = 200;

interface GateResult {
  ok: boolean;
  problems: string[];
}

// Every gate rule the scorer applies, checked locally first: the text must
// be 1-200 characters, a single line, non-blank, and valid UTF-8 (a lone
// surrogate would fail to encode, so the round-trip through TextEncoder
// doubles as the UTF-8 check).
function validateEntry(line: string): GateResult {
  const problems: string[] = [];
  if (line.length === 0 || line.length > MAX_CHARS) {
    problems.push(`length ${line.length} outside 1-${MAX_CHARS}`);
  }
  if (line.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    problems.push("entry spans more than one line");
  }
  const encoded = new TextEncoder().encode(line);
  if (new TextDecoder("utf-8", { fatal: true }).decode(encoded) !== line) {
    problems.push("entry is not valid UTF-8");
  }
  return { ok: problems.length === 0, problems };
}

function writeEntry(line: string): string {
  const gate = validateEntry(line);
  if (!gate.ok) {
    throw new Error(`entry failed the gate: ${gate.problems.join("; ")}`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, line, "utf8");
  return outPath;
}

writeEntry(LINE);

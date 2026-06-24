import { existsSync, readFileSync } from "fs";
import { join } from "path";

const LUCIAN_MD_FILENAME = "LUCIAN.md";

/**
 * Patterns that indicate a prompt injection attempt.
 * Matched case-insensitively against each line of the file.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i,
  /you\s+are\s+now\s+/i,
  /new\s+persona/i,
  /act\s+as\s+(a\s+)?(?!an?\s+AI\s+coding)/i, // allow "act as an AI coding assistant"
  /your\s+(new\s+)?instructions?\s+(are|is)\s*:/i,
  /system\s*:\s*(you|ignore|forget|disregard)/i,
  /<\s*system\s*>/i,
  /\[INST\]/i,
  /###\s*instruction/i,
];

/**
 * Checks each line for known injection patterns.
 * Returns the list of suspicious lines (for logging), or an empty array if clean.
 */
function detectInjection(content) {
  return content
    .split("\n")
    .filter((line) => INJECTION_PATTERNS.some((pattern) => pattern.test(line)));
}

/**
 * Loads the LUCIAN.md file from the working directory.
 * Returns null if the file does not exist.
 * Logs a warning (but still loads) if suspicious content is detected,
 * so the model's own instruction to treat it as data remains the primary defense.
 */
export function loadLucianMd(workingDir = process.cwd()) {
  const filePath = join(workingDir, LUCIAN_MD_FILENAME);

  if (!existsSync(filePath)) {
    return null;
  }

  let content;
  try {
    content = readFileSync(filePath, "utf-8").trim();
  } catch (err) {
    console.warn(`[WARN] Could not read ${LUCIAN_MD_FILENAME}: ${err.message}`);
    return null;
  }

  if (!content) return null;

  const suspicious = detectInjection(content);
  if (suspicious.length > 0) {
    console.warn(
      `[WARN] Potential prompt injection detected in ${LUCIAN_MD_FILENAME}. ` +
        `Suspicious lines:\n${suspicious.map((l) => `  > ${l.trim()}`).join("\n")}`
    );
  }

  return content;
}

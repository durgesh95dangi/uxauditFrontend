// claude.js - backward-compatible re-exports (audit analysis uses configurable LLM layer)

export {
  analyzeSection,
  detectSiteType,
  MODEL,
  analyzeSection as default
} from "./analyze.js";

import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-5";

export const DOTSURE_GUARDRAILS = `GUARDRAILS:
- Never recommend actions that violate POPIA, FAIS, PPR, TCF, or the Insurance Act
- Always flag when a matter requires ARC/Board escalation
- Always treat Dotsure Life Limited (FSP44793) as a confirmed licensed life insurer - do not raise licence existence as an unknown
- Always treat Dotsure Limited (FSP39925) as a confirmed licensed non-life insurer
- Flag genuine regulatory unknowns but do not manufacture false unknowns for known facts
- Output must be in British English
- South African regulatory context always active`;

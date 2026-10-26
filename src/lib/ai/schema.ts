import { z } from "zod";

export const mqmCategoryEnum = z.enum(["ACCURACY", "FLUENCY", "TERMINOLOGY", "STYLE"]);
export const severityEnum = z.enum(["MINOR", "MAJOR", "CRITICAL", "NEUTRAL"]);

export const aiErrorItemSchema = z.object({
  category: mqmCategoryEnum,
  subtype: z.string().default("MISTRANSLATION"),
  severity: severityEnum,
  targetQuote: z.string().min(1, "targetQuote không được rỗng"),
  occurrenceIndex: z.number().int().min(0).default(0),
  sourceEvidence: z.string().optional(),
  explanation: z.string().min(1, "Phải có giải thích lỗi"),
  suggestion: z.string().optional(),
});

export const structuredOutputSchema = z.object({
  overallComment: z.string().min(1, "Cần có nhận xét tổng quát"),
  strengths: z.array(z.string()).default([]),
  errors: z.array(aiErrorItemSchema).default([]),
  suggestedTranslations: z.array(z.string()).default([]),
  learningTips: z.array(z.string()).default([]),
});

export type StructuredAIOutput = z.infer<typeof structuredOutputSchema>;

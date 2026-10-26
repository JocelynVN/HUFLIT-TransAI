export type MQMCategory = "ACCURACY" | "FLUENCY" | "TERMINOLOGY" | "STYLE";
export type SeverityLevel = "MINOR" | "MAJOR" | "CRITICAL" | "NEUTRAL";

export interface AIErrorItem {
  category: MQMCategory;
  subtype: string;
  severity: SeverityLevel;
  targetQuote: string;
  occurrenceIndex: number;
  sourceEvidence?: string;
  explanation: string;
  suggestion?: string;
}

export interface EvaluationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  cefrLevel: string;
  genre: string;
  instructions?: string;
  sourceText: string;
  studentTranslation: string;
  systemInstruction?: string;
}

export interface EvaluationResult {
  overallComment: string;
  strengths: string[];
  errors: AIErrorItem[];
  suggestedTranslations: string[];
  learningTips: string[];
  estimatedScore: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  estimatedCost: number;
}

export interface AIProvider {
  name: string;
  evaluateTranslation(request: EvaluationRequest): Promise<EvaluationResult>;
}

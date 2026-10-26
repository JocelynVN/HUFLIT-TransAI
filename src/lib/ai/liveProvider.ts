import { AIProvider, EvaluationRequest, EvaluationResult, AIErrorItem } from "./types";
import { structuredOutputSchema } from "./schema";
import { calculateMQMScore } from "../scoring";

export class LiveAIProvider implements AIProvider {
  name: string;
  private apiKey: string;
  private providerType: "gemini" | "openai";

  constructor(providerType: "gemini" | "openai" = "gemini") {
    this.providerType = providerType;
    this.name = providerType === "gemini" ? "Google Gemini 1.5 Pro" : "OpenAI GPT-4o";
    this.apiKey =
      providerType === "gemini"
        ? process.env.GEMINI_API_KEY || ""
        : process.env.OPENAI_API_KEY || "";
  }

  async evaluateTranslation(request: EvaluationRequest): Promise<EvaluationResult> {
    if (!this.apiKey) {
      throw new Error(`API key for ${this.name} is not configured.`);
    }

    const {
      sourceText,
      studentTranslation,
      sourceLanguage,
      targetLanguage,
      cefrLevel,
      genre,
      instructions,
      systemInstruction,
    } = request;

    const systemPrompt =
      systemInstruction ||
      `You are an educational translation assessment assistant for English-Vietnamese translation at HUFLIT.
Evaluate the student's translation strictly against the source text.
Use MQM taxonomy: ACCURACY, FLUENCY, TERMINOLOGY, STYLE.
Severity: MINOR, MAJOR, CRITICAL, NEUTRAL.
Return JSON ONLY matching the schema.`;

    const userPrompt = `
Source Language: ${sourceLanguage}
Target Language: ${targetLanguage}
CEFR Level: ${cefrLevel}
Genre: ${genre}
Task Instructions: ${instructions || "None"}

[SOURCE TEXT]
${sourceText}

[STUDENT TRANSLATION]
${studentTranslation}

Provide structured evaluation in JSON with overallComment, strengths, errors (category, subtype, severity, targetQuote, occurrenceIndex, sourceEvidence, explanation, suggestion), suggestedTranslations, and learningTips.
All explanations must be in Vietnamese.
`;

    // If Gemini
    if (this.providerType === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);
      }

      const data = await res.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) throw new Error("Empty response from Gemini");

      const parsed = JSON.parse(rawJson);
      const validated = structuredOutputSchema.parse(parsed);

      const sourceWords = sourceText.trim().split(/\s+/).filter(Boolean).length;
      const estimatedScore = calculateMQMScore(validated.errors, sourceWords);

      return {
        overallComment: validated.overallComment,
        strengths: validated.strengths,
        errors: validated.errors as AIErrorItem[],
        suggestedTranslations: validated.suggestedTranslations,
        learningTips: validated.learningTips,
        estimatedScore,
        tokenUsage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
        estimatedCost: 0.002,
      };
    }

    // Fallback or OpenAI
    const openAiUrl = "https://api.openai.com/v1/chat/completions";
    const openAiRes = await fetch(openAiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!openAiRes.ok) {
      throw new Error(`OpenAI API error: ${openAiRes.status} ${await openAiRes.text()}`);
    }

    const openAiData = await openAiRes.json();
    const rawContent = openAiData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(rawContent);
    const validated = structuredOutputSchema.parse(parsed);

    const sourceWords = sourceText.trim().split(/\s+/).filter(Boolean).length;
    const estimatedScore = calculateMQMScore(validated.errors, sourceWords);

    return {
      overallComment: validated.overallComment,
      strengths: validated.strengths,
      errors: validated.errors as AIErrorItem[],
      suggestedTranslations: validated.suggestedTranslations,
      learningTips: validated.learningTips,
      estimatedScore,
      tokenUsage: {
        promptTokens: openAiData.usage?.prompt_tokens || 0,
        completionTokens: openAiData.usage?.completion_tokens || 0,
        totalTokens: openAiData.usage?.total_tokens || 0,
      },
      estimatedCost: 0.005,
    };
  }
}

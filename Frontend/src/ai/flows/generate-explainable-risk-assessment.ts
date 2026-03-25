'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a behavioral risk assessment
 * for a developer based on their public repository activity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateExplainableRiskAssessmentInputSchema = z.object({
  githubUsername: z.string(),
  analyzedActivitySummary: z.string(),
  flaggedPatterns: z.array(z.string()),
  historicalContext: z.string(),
  ciCdModifications: z.boolean(),
  dependencyChanges: z.array(z.string()),
  obfuscatedFiles: z.boolean(),
  contributorConsistency: z.enum(['low', 'medium', 'high']),
  accountAgeMonths: z.number(),
  contributionAcceptanceRate: z.number(),
});

export type GenerateExplainableRiskAssessmentInput = z.infer<typeof GenerateExplainableRiskAssessmentInputSchema>;

const GenerateExplainableRiskAssessmentOutputSchema = z.object({
  riskScore: z.number(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  explainableFactors: z.array(z.object({
    factor: z.string(),
    explanation: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
  })),
  confidenceLevel: z.enum(['low', 'medium', 'high']),
  suggestedVerificationSteps: z.array(z.string()),
  disclaimer: z.string(),
});

export type GenerateExplainableRiskAssessmentOutput = z.infer<typeof GenerateExplainableRiskAssessmentOutputSchema>;

const explainableRiskAssessmentPrompt = ai.definePrompt({
  name: 'explainableRiskAssessmentPrompt',
  input: { schema: GenerateExplainableRiskAssessmentInputSchema },
  output: { schema: GenerateExplainableRiskAssessmentOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Analyze the developer '{{{githubUsername}}}' based on their activity summary as an expert security engine for GitSentinel.
  
Flagged Patterns: 
{{#each flaggedPatterns}}
- {{this}}
{{/each}}

Historical Context: {{{historicalContext}}}
CI/CD Modifications: {{{ciCdModifications}}}
Dependency Changes: {{#each dependencyChanges}}- {{this}}{{/each}}
Account Age: {{{accountAgeMonths}}} months
Consistency: {{{contributorConsistency}}}

Generate a detailed risk profile.`,
});

function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.originalMessage) return String(error.originalMessage);
  if (error?.message) return String(error.message);
  if (error?.statusText) return String(error.statusText);
  try {
    const str = JSON.stringify(error);
    if (str && str !== '{}') return str;
  } catch (e) {}
  return String(error) || 'An unknown AI analysis error occurred';
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 5, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = String(error);
    const isRateLimited = 
      errorStr.includes('429') || 
      errorStr.toLowerCase().includes('quota') ||
      (error?.originalMessage && String(error.originalMessage).includes('429'));

    if (attempts <= 1 || !isRateLimited) {
      throw new Error(getErrorMessage(error));
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, attempts - 1, delay * 2);
  }
}

export async function generateExplainableRiskAssessment(input: GenerateExplainableRiskAssessmentInput): Promise<GenerateExplainableRiskAssessmentOutput> {
  return withRetry(async () => {
    const { output } = await explainableRiskAssessmentPrompt(input);
    if (!output) throw new Error('GitSentinel AI Error: No output generated. Content may have been filtered.');
    return output;
  });
}

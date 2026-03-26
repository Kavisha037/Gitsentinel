'use server';
/**
 * @fileOverview This file implements a Genkit flow for identifying suspicious activity patterns
 * in a developer's public repository contributions based on pre-analyzed signals.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifySuspiciousActivityPatternsInputSchema = z.object({
  userName: z.string(),
  accountAgeDays: z.number(),
  totalContributions: z.number(),
  avgDailyContributions: z.number(),
  recentActivitySpike: z.object({
    detected: z.boolean(),
    details: z.string().optional(),
  }),
  repositoryDiversity: z.object({
    count: z.number(),
    unrelatedRepositoriesFlag: z.boolean(),
    details: z.string().optional(),
  }),
  fileTypeAnomalies: z.object({
    binaryCommits: z.boolean(),
    obfuscatedCommits: z.boolean(),
    ciCdModifications: z.boolean(),
    details: z.string().optional(),
  }),
  dependencyAnomalies: z.object({
    suspiciousDependencies: z.boolean(),
    details: z.string().optional(),
  }),
  contributorConsistency: z.object({
    stable: z.boolean(),
    details: z.string().optional(),
  }),
  contributionAcceptanceRate: z.number().min(0).max(100),
  trustIndicators: z.string().optional(),
});
export type IdentifySuspiciousActivityPatternsInput = z.infer<typeof IdentifySuspiciousActivityPatternsInputSchema>;

const IdentifySuspiciousActivityPatternsOutputSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high']),
  flaggedBehaviors: z.array(z.object({
    behavior: z.string(),
    explanation: z.string(),
    confidence: z.enum(['low', 'medium', 'high']),
    suggestedVerificationSteps: z.array(z.string()),
  })).default([]),
});
export type IdentifySuspiciousActivityPatternsOutput = z.infer<typeof IdentifySuspiciousActivityPatternsOutputSchema>;

const behavioralRiskAssessmentPrompt = ai.definePrompt({
  name: 'behavioralRiskAssessmentPrompt',
  input: { schema: IdentifySuspiciousActivityPatternsInputSchema },
  output: { schema: IdentifySuspiciousActivityPatternsOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `Analyze the security risk of user '{{{userName}}}' as the GitSentinel Behavioral Engine.
Account Age: {{{accountAgeDays}}} days.
Contributions: {{{totalContributions}}}.
Acceptance Rate: {{{contributionAcceptanceRate}}}%.

Anomalies:
- Spike Detected: {{{recentActivitySpike.detected}}} ({{{recentActivitySpike.details}}})
- Repo Diversity: {{{repositoryDiversity.count}}} repos (Unrelated Flag: {{{repositoryDiversity.unrelatedRepositoriesFlag}}})
- File Anomalies: Binary: {{{fileTypeAnomalies.binaryCommits}}}, Obfuscated: {{{fileTypeAnomalies.obfuscatedCommits}}}, CI/CD: {{{fileTypeAnomalies.ciCdModifications}}}
- Suspicious Deps: {{{dependencyAnomalies.suspiciousDependencies}}}

Provide a detailed Behavioral Risk Profile.`,
});

function getErrorMessage(error: any): string {
  if (!error) return 'Unknown AI Analysis Error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  try {
    const keys = Object.getOwnPropertyNames(error);
    if (keys.length > 0) {
      const debugObj: any = {};
      keys.forEach(k => { debugObj[k] = error[k]; });
      return JSON.stringify(debugObj);
    }
  } catch (e) { /* ignore */ }
  
  return JSON.stringify(error) || String(error);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = getErrorMessage(error).toLowerCase();
    const isRateLimited = 
      errorStr.includes('429') || 
      errorStr.includes('quota') || 
      errorStr.includes('too many requests') || 
      errorStr.includes('resource_exhausted') ||
      error?.status === 429;

    if (attempts <= 1 || !isRateLimited) {
      throw new Error(getErrorMessage(error));
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, attempts - 1, delay * 2);
  }
}

export async function identifySuspiciousActivityPatterns(input: IdentifySuspiciousActivityPatternsInput): Promise<IdentifySuspiciousActivityPatternsOutput> {
  return withRetry(async () => {
    const {output} = await behavioralRiskAssessmentPrompt(input);
    if (!output) throw new Error('GitSentinel AI Error: No output generated. Content may have been filtered.');
    return output!;
  });
}
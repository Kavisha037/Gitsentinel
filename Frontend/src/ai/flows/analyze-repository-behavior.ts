'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing the behavioral risk of a 
 * software repository based on historical activity, contributor patterns, and sensitive changes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContributorTrustSchema = z.object({
  username: z.string(),
  trustScore: z.number().min(0).max(100).describe("Individual trust score based on account history."),
  historySummary: z.string().describe("Summary of contributor's tenure and consistency."),
});

const AnalyzeRepositoryInputSchema = z.object({
  repoName: z.string(),
  owner: z.string(),
  platform: z.enum(['github', 'gitlab']),
  last90DaysMetrics: z.object({
    commitCount: z.number(),
    prCount: z.number(),
    newContributors: z.number(),
    averageCommitsPerDay: z.number(),
  }),
  baselines: z.object({
    avgCommitFrequency: z.number().describe("Historical average commits per day."),
    typicalContributorCount: z.number(),
  }),
  sensitiveChanges: z.array(z.object({
    type: z.enum(['cicd', 'dependency', 'maintainer_change', 'binary_commit']),
    description: z.string(),
    date: z.string(),
    contributor: z.string(),
  })),
  contributors: z.array(ContributorTrustSchema),
});

export type AnalyzeRepositoryInput = z.infer<typeof AnalyzeRepositoryInputSchema>;

const AnalyzeRepositoryOutputSchema = z.object({
  overallRiskScore: z.number().min(0).max(100).describe("Weighted aggregate risk score."),
  riskLevel: z.enum(['Safe', 'Moderate Risk', 'High Risk']),
  confidenceScore: z.number().min(0).max(100),
  keyFactors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    explanation: z.string(),
  })),
  suspiciousEventsTimeline: z.array(z.object({
    date: z.string(),
    event: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    correlationNote: z.string().optional().describe("Note if this event correlates with other signals."),
  })),
  recommendedActions: z.array(z.string()).describe("3-6 actionable recommendations based on the analysis findings."),
});

export type AnalyzeRepositoryOutput = z.infer<typeof AnalyzeRepositoryOutputSchema>;

const repositoryRiskPrompt = ai.definePrompt({
  name: 'repositoryRiskPrompt',
  input: { schema: AnalyzeRepositoryInputSchema },
  output: { schema: AnalyzeRepositoryOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an advanced security analysis engine for GitSentinel. Evaluate the behavioral risk of '{{{owner}}}/{{{repoName}}}'.

Metrics: Commits: {{{last90DaysMetrics.commitCount}}}, PRs: {{{last90DaysMetrics.prCount}}}, New Contributors: {{{last90DaysMetrics.newContributors}}}.
Changes:
{{#each sensitiveChanges}}
- [{{{type}}}] at {{{date}}} by {{{contributor}}}: {{{description}}}
{{/each}}

Generate 3–6 clear, actionable recommendations based on the following logic:
- If any commit is high risk, prioritize urgent actions like reviewing or reverting changes.
- If secrets/tokens are detected in descriptions, suggest revoking or rotating credentials immediately.
- If CI/CD files are modified, recommend reviewing workflow and deployment changes for unauthorized drift.
- For low-trust contributors (trustScore < 30), advise verifying identity and limiting permissions.
- If binary files or suspicious dependencies are found, suggest inspecting them carefully for malicious payloads.
- If unusual activity (spikes) is detected, recommend reviewing recent behavior against baselines.
- If everything is low risk, simply advise continuing to monitor the repository.

Provide a detailed 'Behavioral Risk Assessment'.`,
});

function getErrorMessage(error: any): string {
  if (!error) return 'Unknown AI Analysis Error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  // Capture non-enumerable properties like 'message' for JSON.stringify
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

export async function analyzeRepositoryBehavior(input: AnalyzeRepositoryInput): Promise<AnalyzeRepositoryOutput> {
  return withRetry(async () => {
    const { output } = await repositoryRiskPrompt(input);
    if (!output) throw new Error('GitSentinel AI Error: Analysis produced no results. Content may have been filtered.');
    return output;
  });
}
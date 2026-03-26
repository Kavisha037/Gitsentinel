export interface UserActivityData {
  userName: string;
  accountAgeDays: number;
  totalContributions: number;
  avgDailyContributions: number;
  contributionAcceptanceRate: number;
  trustIndicators: string;
  recentActivitySpike: {
    detected: boolean;
    details: string;
  };
  repositoryDiversity: {
    count: number;
    unrelatedRepositoriesFlag: boolean;
    details: string;
  };
  fileTypeAnomalies: {
    binaryCommits: boolean;
    obfuscatedCommits: boolean;
    ciCdModifications: boolean;
    details: string;
  };
  dependencyAnomalies: {
    suspiciousDependencies: boolean;
    details: string;
  };
  contributorConsistency: {
    stable: boolean;
    details: string;
  };
}

export interface RepoAnalysisData {
  repoName: string;
  owner: string;
  platform: 'github' | 'gitlab';
  last90DaysMetrics: {
    commitCount: number;
    prCount: number;
    newContributors: number;
    averageCommitsPerDay: number;
  };
  baselines: {
    avgCommitFrequency: number;
    typicalContributorCount: number;
  };
  sensitiveChanges: Array<{
    hash: string;
    type: 'cicd' | 'dependency' | 'maintainer_change' | 'binary_commit';
    description: string;
    date: string;
    contributor: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
  }>;
  contributors: Array<{
    username: string;
    trustScore: number;
    historySummary: string;
    isFlagged?: boolean;
  }>;
  stats: {
    totalCommitsScanned: number;
    suspiciousCommits: number;
    flaggedContributors: number;
    atRiskFiles: number;
    totalContributors: number;
  };
}

export const getMockUserData = (username: string): UserActivityData => {
  const isSuspicious = username.toLowerCase().includes('bot') || (username.length < 4 && username.length > 0);
  const isEmpty = username.toLowerCase().includes('empty') || username === 'unknown';
  
  if (isEmpty) {
    return {
      userName: username,
      accountAgeDays: 0,
      totalContributions: 0,
      avgDailyContributions: 0,
      contributionAcceptanceRate: 0,
      trustIndicators: "No public activity data found.",
      recentActivitySpike: { detected: false, details: "" },
      repositoryDiversity: { count: 0, unrelatedRepositoriesFlag: false, details: "" },
      fileTypeAnomalies: { binaryCommits: false, obfuscatedCommits: false, ciCdModifications: false, details: "" },
      dependencyAnomalies: { suspiciousDependencies: false, details: "" },
      contributorConsistency: { stable: true, details: "" }
    };
  }

  return {
    userName: username,
    accountAgeDays: isSuspicious ? 15 : 1200,
    totalContributions: isSuspicious ? 450 : 2500,
    avgDailyContributions: isSuspicious ? 30 : 2.5,
    contributionAcceptanceRate: isSuspicious ? 15 : 92,
    trustIndicators: isSuspicious ? "New account, low peer interactions." : "Verified contributor, long-standing member of community projects, high acceptance rates.",
    recentActivitySpike: {
      detected: isSuspicious,
      details: isSuspicious ? "Activity increased by 800% in the last 48 hours." : "Normal seasonal fluctuations."
    },
    repositoryDiversity: {
      count: isSuspicious ? 25 : 8,
      unrelatedRepositoriesFlag: isSuspicious,
      details: isSuspicious ? "Contributed to 25 unrelated repos across 12 organizations in 1 week." : "Focus on frontend frameworks and security tools."
    },
    fileTypeAnomalies: {
      binaryCommits: isSuspicious,
      obfuscatedCommits: isSuspicious,
      ciCdModifications: isSuspicious,
      details: isSuspicious ? "Frequent .exe and .bin file commits to source folders." : "Clean source-only commits."
    },
    dependencyAnomalies: {
      suspiciousDependencies: isSuspicious,
      details: isSuspicious ? "Introduced 'lodash-v2-secure' (potential typosquat)." : "Standard dependency updates."
    },
    contributorConsistency: {
      stable: !isSuspicious,
      details: isSuspicious ? "Erratic burst activity across multiple timezones." : "Consistent daily/weekly contributions for 3+ years."
    }
  };
};

export const getMockRepoData = (owner: string, repo: string): RepoAnalysisData => {
  const isSuspicious = repo.toLowerCase().includes('crypto') || repo.toLowerCase().includes('free');
  
  const sensitiveChanges: RepoAnalysisData['sensitiveChanges'] = [
    {
      hash: '225932',
      type: 'cicd',
      description: 'Add secret api token to deployment workflow',
      date: '2024-03-15',
      contributor: 'new_dev_99',
      riskLevel: 'HIGH',
      confidence: 91
    },
    {
      hash: '7c9f8a',
      type: 'dependency',
      description: 'Added suspicious package "colors-v2-secure"',
      date: '2024-03-10',
      contributor: 'lead_maintainer',
      riskLevel: 'MEDIUM',
      confidence: 76
    },
    {
      hash: '4e2d1b',
      type: 'binary_commit',
      description: 'Committed 15MB binary blob "lib/native/core.bin"',
      date: '2024-03-05',
      contributor: 'new_dev_99',
      riskLevel: 'HIGH',
      confidence: 88
    }
  ];

  const contributors = [
    { username: 'lead_maintainer', trustScore: 98, historySummary: 'Maintainer for 5 years, 2000+ commits.', isFlagged: false },
    { username: 'new_dev_99', trustScore: 12, historySummary: 'Account created 3 days ago, first contribution.', isFlagged: true },
    { username: 'staff_dev', trustScore: 85, historySummary: 'Consistent contributor, active in PR reviews.', isFlagged: false }
  ];

  return {
    repoName: repo,
    owner: owner,
    platform: 'github',
    last90DaysMetrics: {
      commitCount: isSuspicious ? 1200 : 450,
      prCount: isSuspicious ? 80 : 120,
      newContributors: isSuspicious ? 15 : 2,
      averageCommitsPerDay: isSuspicious ? 13.3 : 5,
    },
    baselines: {
      avgCommitFrequency: 4.5,
      typicalContributorCount: 10,
    },
    sensitiveChanges,
    contributors,
    stats: {
      totalCommitsScanned: isSuspicious ? 1200 : 450,
      suspiciousCommits: isSuspicious ? 42 : 3,
      flaggedContributors: isSuspicious ? 4 : 1,
      atRiskFiles: sensitiveChanges.length,
      totalContributors: contributors.length
    }
  };
};

export const getChartData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    contributions: Math.floor(Math.random() * 100) + 20,
    riskSignals: Math.floor(Math.random() * 5),
  }));
};

export const getFallbackUserAssessment = (data: UserActivityData) => {
  let score = 20;
  const behaviors = [];

  if (data.recentActivitySpike.detected) {
    score += 25;
    behaviors.push({
      behavior: "Activity Burst Detected",
      explanation: "Significant deviation from historical contribution frequency.",
      confidence: "high" as const,
      suggestedVerificationSteps: ["Audit commit timestamps", "Verify contributor identity"]
    });
  }

  if (data.fileTypeAnomalies.binaryCommits) {
    score += 30;
    behaviors.push({
      behavior: "Binary Blob Injection",
      explanation: "Opaque binary objects committed directly to source directories.",
      confidence: "high" as const,
      suggestedVerificationSteps: ["Scan binaries for malicious payloads", "Check against known threat databases"]
    });
  }

  if (data.contributionAcceptanceRate < 30) {
    score += 15;
  }

  return {
    riskScore: Math.min(score, 100),
    riskLevel: score > 70 ? 'high' as const : score > 35 ? 'medium' as const : 'low' as const,
    flaggedBehaviors: behaviors,
    isFallback: true
  };
};

export const getFallbackRepoAssessment = (data: RepoAnalysisData) => {
  let score = 15;
  const recommendations: string[] = [];
  const timeline = data.sensitiveChanges.map(change => ({
    date: change.date,
    event: change.description,
    severity: (change.type === 'cicd' || change.type === 'dependency') ? 'high' as const : 'medium' as const,
    correlationNote: "Heuristic match for sensitive system change."
  }));

  // Analyze findings to build recommendations
  const hasHighRisk = data.sensitiveChanges.some(c => c.riskLevel === 'HIGH');
  const hasSecrets = data.sensitiveChanges.some(c => c.description.toLowerCase().includes('secret') || c.description.toLowerCase().includes('token'));
  const hasCiCd = data.sensitiveChanges.some(c => c.type === 'cicd');
  const hasLowTrust = data.contributors.some(c => c.trustScore < 30);
  const hasBinaries = data.sensitiveChanges.some(c => c.type === 'binary_commit' || c.type === 'dependency');

  if (hasHighRisk) {
    recommendations.push("URGENT: Prioritize manual review of all HIGH risk commits and revert any unauthorized changes.");
  }
  if (hasSecrets) {
    recommendations.push("CRITICAL: Secret patterns detected. Revoke and rotate all potentially compromised credentials immediately.");
  }
  if (hasCiCd) {
    recommendations.push("Audit CI/CD pipeline modifications to ensure no unauthorized deployment paths were created.");
  }
  if (hasLowTrust) {
    recommendations.push("Verify identities of new or low-trust contributors and consider limiting their write permissions.");
  }
  if (hasBinaries) {
    recommendations.push("Inspect all binary blobs and external dependencies for hidden malicious payloads.");
  }

  if (recommendations.length === 0) {
    recommendations.push("No immediate threats found. Continue monitoring the repository for baseline deviations.");
  }

  if (data.last90DaysMetrics.averageCommitsPerDay > data.baselines.avgCommitFrequency * 2) {
    score += 20;
    recommendations.push("Analyze recent commit spikes to determine if they correlate with automated bot activity.");
  }

  score += (data.sensitiveChanges.length * 10);

  return {
    overallRiskScore: Math.min(score, 100),
    riskLevel: score > 70 ? 'High Risk' as const : score > 35 ? 'Moderate Risk' as const : 'Safe' as const,
    confidenceScore: 65,
    keyFactors: [
      { factor: "Heuristic Anomaly Detection", impact: "high" as const, explanation: "Pattern matched based on local threat baselines." }
    ],
    suspiciousEventsTimeline: timeline,
    recommendedActions: recommendations.slice(0, 6),
    isFallback: true
  };
};

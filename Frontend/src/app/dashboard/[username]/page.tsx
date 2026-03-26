import { identifySuspiciousActivityPatterns } from "@/ai/flows/identify-suspicious-activity-patterns";
import { getMockUserData, getFallbackUserAssessment } from "@/lib/mock-data";
import ActivityChart from "@/components/dashboard/ActivityChart";
import RiskDisplay from "@/components/dashboard/RiskDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, GitPullRequest, GitCommit, Search, Shield, Zap, TrendingUp, History, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ContributionNetworkWrapper from "@/components/dashboard/ContributionNetworkWrapper";
import ResilientAnalysisBanner from "@/components/dashboard/ResilientAnalysisBanner";

export default async function DashboardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const rawData = getMockUserData(username);
  
  if (rawData.totalContributions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#050608]">
        <Card className="glass-panel max-w-md w-full border-none">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle className="font-headline text-2xl text-white">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground text-sm leading-relaxed">
              We couldn't find a public profile for <span className="text-white font-bold">@{username}</span> or the account has zero public activity.
            </p>
            <Link href="/" className="block">
              <Button className="w-full bg-primary glow-primary font-headline">
                <Search className="h-4 w-4 mr-2" /> NEW SEARCH
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  let assessment;
  let errorMsg: string | null = null;

  try {
    assessment = await identifySuspiciousActivityPatterns(rawData);
  } catch (error: any) {
    assessment = getFallbackUserAssessment(rawData);
    errorMsg = error.message || String(error);
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 bg-[#050608] selection:bg-primary/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-50 animate-pulse" />
            <Avatar className="h-20 w-20 border-2 border-background relative">
              <AvatarImage src={`https://picsum.photos/seed/${username}/200/200`} />
              <AvatarFallback className="bg-muted text-2xl text-white">{username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-headline text-white">{username}</h1>
              <Badge variant="outline" className="border-primary/30 text-primary">PUBLIC DEVELOPER</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
              <span className="flex items-center gap-1"><Github className="h-4 w-4" /> GitHub</span>
              <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> Public Trace</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 relative z-10">
          <Link href="/">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 font-headline">
              <Search className="h-4 w-4 mr-2" /> NEW SEARCH
            </Button>
          </Link>
          <Link href={`/scan/user/${username}`}>
            <Button className="bg-primary glow-primary font-headline">
              <Zap className="h-4 w-4 mr-2" /> RE-SCAN
            </Button>
          </Link>
        </div>
      </header>

      {errorMsg && <ResilientAnalysisBanner errorMessage={errorMsg} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-headline uppercase text-muted-foreground flex items-center justify-between">
                  Aggregated Activity <TrendingUp className="h-3 w-3 text-secondary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-white">{rawData.totalContributions.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card className="glass-panel border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-headline uppercase text-muted-foreground flex items-center justify-between">
                  Acceptance Rate <GitPullRequest className="h-3 w-3 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-white">{rawData.contributionAcceptanceRate}%</div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-headline uppercase text-muted-foreground flex items-center justify-between">
                  Account Age <History className="h-3 w-3 text-white" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline text-white">{Math.floor(rawData.accountAgeDays / 365)}Y {Math.floor((rawData.accountAgeDays % 365) / 30)}M</div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel border-none overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5 text-secondary" />
                Multi-Repository Interaction Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContributionNetworkWrapper />
            </CardContent>
          </Card>

          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GitCommit className="h-5 w-5 text-primary" />
                Aggregated Behavioral Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <RiskDisplay assessment={assessment} />
          
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-primary" />
                Behavioral Consistency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Repo Dispersion</span>
                  <span className="text-white">{rawData.repositoryDiversity.count} Nodes</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: `${Math.min(100, (rawData.repositoryDiversity.count / 20) * 100)}%` }} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>Pattern Stability</span>
                  <span className="text-white">{rawData.contributorConsistency.stable ? 'Stable' : 'Volatile'}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${rawData.contributorConsistency.stable ? 'bg-primary' : 'bg-destructive'}`} style={{ width: rawData.contributorConsistency.stable ? '85%' : '30%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
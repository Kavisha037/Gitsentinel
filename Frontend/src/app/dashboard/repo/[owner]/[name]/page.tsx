
import { analyzeRepositoryBehavior } from "@/ai/flows/analyze-repository-behavior";
import { getMockRepoData, getFallbackRepoAssessment } from "@/lib/mock-data";
import RepoDashboardContent from "@/components/dashboard/RepoDashboardContent";

export default async function RepositoryDashboard({ 
  params,
  searchParams 
}: { 
  params: Promise<{ owner: string, name: string }>,
  searchParams: Promise<{ branch?: string, commits?: string, mode?: string }>
}) {
  const { owner, name } = await params;
  const { branch = 'main', commits = '5', mode = 'full' } = await searchParams;
  
  const rawData = getMockRepoData(owner, name);
  
  let analysis;
  let errorMsg: string | null = null;

  try {
    analysis = await analyzeRepositoryBehavior(rawData);
  } catch (error: any) {
    analysis = getFallbackRepoAssessment(rawData);
    errorMsg = error.message || String(error);
  }

  return (
    <div className="min-h-screen bg-[#050608]">
      <RepoDashboardContent 
        owner={owner} 
        name={name} 
        branch={branch}
        commitDepth={parseInt(commits)}
        scanMode={mode as 'commit' | 'code' | 'full'}
        rawData={rawData} 
        analysis={analysis}
        errorMsg={errorMsg}
      />
    </div>
  );
}

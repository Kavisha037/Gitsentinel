
import { analyzeRepositoryBehavior } from "@/ai/flows/analyze-repository-behavior";
import { getMockRepoData, getFallbackRepoAssessment } from "@/utils/mock-data";
import RepoDashboardContent from "@/components/dashboard/RepoDashboardContent";

export default async function RepositoryDashboard({
  params,
  searchParams
}: {
  params: Promise<{ owner: string, name: string }>,
  searchParams: Promise<{ branch?: string, commits?: string }>
}) {
  const { owner, name } = await params;
  const { branch = 'main', commits = '5' } = await searchParams;

  const rawData = getMockRepoData(owner, name);

  let analysis;

  try {
    analysis = await analyzeRepositoryBehavior(rawData);
  } catch (error: any) {
    analysis = getFallbackRepoAssessment(rawData);
  }

  return (
    <div className="min-h-screen bg-[#050608]">
      <RepoDashboardContent
        owner={owner}
        name={name}
        branch={branch}
        commitDepth={parseInt(commits)}
        rawData={rawData}
        analysis={analysis}
      />
    </div>
  );
}

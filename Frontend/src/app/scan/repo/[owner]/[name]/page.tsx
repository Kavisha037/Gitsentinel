"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ImmersiveScanner from "@/components/scan/ImmersiveScanner";
import { useScanManager } from "@/hooks/useScanManager";
import { getMockRepoData } from "@/lib/mock-data";
import { analyzeRepositoryBehavior } from "@/ai/flows/analyze-repository-behavior";

export default function RepoScanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const owner = params.owner as string;
  const name = params.name as string;
  // Fallback to 'commit' to match default homepage state
  const scanMode = (searchParams.get('mode') as 'commit' | 'code' | 'full') || 'commit';
  const { incrementScanCount } = useScanManager();

  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = async () => {
    try {
      const rawData = getMockRepoData(owner, name);
      try {
        await analyzeRepositoryBehavior(rawData);
      } catch (e) {
        // AI failure handled in dashboard view with fallback
      }

      await incrementScanCount();
      setIsComplete(true);
    } catch (err) {
      console.error("Failed to finalize scan:", err);
      setIsComplete(true);
    }
  };

  useEffect(() => {
    if (isComplete && owner && name) {
      const qs = new URLSearchParams(searchParams.toString());
      router.push(`/dashboard/repo/${owner}/${name}?${qs.toString()}`);
    }
  }, [isComplete, owner, name, router, searchParams]);

  if (!owner || !name) return null;

  return (
    <div className="min-h-screen bg-[#050608] selection:bg-primary/30">
      <ImmersiveScanner 
        mode="repo"
        scanMode={scanMode}
        owner={owner} 
        target={name} 
        onComplete={handleComplete} 
      />
    </div>
  );
}
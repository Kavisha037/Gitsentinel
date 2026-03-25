"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ImmersiveScanner from "@/components/scan/ImmersiveScanner";
import { useScanManager } from "@/hooks/useScanManager";
import { getMockRepoData, getFallbackRepoAssessment } from "@/utils/mock-data";
import { analyzeRepositoryBehavior } from "@/ai/flows/analyze-repository-behavior";

/**
 * Handles the repository scanning process.
 * Frictionless: no authentication or history saving to /users.
 */
export default function RepoScanPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const name = params.name as string;
  const { incrementScanCount } = useScanManager();

  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = async () => {
    try {
      // Perform scan analysis
      const rawData = getMockRepoData(owner, name);
      try {
        await analyzeRepositoryBehavior(rawData);
      } catch (e) {
        // AI failure handled in dashboard view with fallback
      }

      // Increment stats and finish
      await incrementScanCount();
      setIsComplete(true);
    } catch (err) {
      console.error("Failed to finalize scan:", err);
      setIsComplete(true);
    }
  };

  useEffect(() => {
    if (isComplete && owner && name) {
      router.push(`/dashboard/repo/${owner}/${name}`);
    }
  }, [isComplete, owner, name, router]);

  if (!owner || !name) return null;

  return (
    <div className="min-h-screen bg-[#050608] selection:bg-primary/30">
      <ImmersiveScanner
        mode="repo"
        owner={owner}
        target={name}
        onComplete={handleComplete}
      />
    </div>
  );
}
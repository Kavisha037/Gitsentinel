"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ImmersiveScanner from "@/components/scan/ImmersiveScanner";
import { useScanManager } from "@/hooks/useScanManager";
import { getMockUserData, getFallbackUserAssessment } from "@/lib/mock-data";
import { identifySuspiciousActivityPatterns } from "@/ai/flows/identify-suspicious-activity-patterns";

/**
 * Handles the user profile scanning process.
 * Frictionless: no authentication or history saving to /users.
 */
export default function UserScanPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { incrementScanCount } = useScanManager();

  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = async () => {
    try {
      // Perform scan analysis
      const rawData = getMockUserData(username);
      try {
        await identifySuspiciousActivityPatterns(rawData);
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
    if (isComplete && username) {
      router.push(`/dashboard/${username}`);
    }
  }, [isComplete, username, router]);

  if (!username) return null;

  return (
    <div className="min-h-screen bg-[#050608] selection:bg-primary/30">
      <ImmersiveScanner
        mode="user"
        target={username}
        onComplete={handleComplete}
      />
    </div>
  );
}
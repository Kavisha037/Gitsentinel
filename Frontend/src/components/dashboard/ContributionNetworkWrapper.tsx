"use client";

import ContributionNetwork from "./ContributionNetwork";

export default function ContributionNetworkWrapper() {
  // Replaced dynamic import with standard component as it's now hydration-safe
  return <ContributionNetwork />;
}

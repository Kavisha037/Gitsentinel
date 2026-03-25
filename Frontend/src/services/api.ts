const BASE_URL = "http://localhost:5000"; // change when deployed

// -----------------------------
// TYPES (important for clarity)
// -----------------------------
export interface ScanRequest {
    owner: string;
    repo: string;
    branch: string;
    last_commit: number;
}

export interface CommitResult {
    commit_hash: string;
    subject: string;
    author_id: number;
    suspicious: boolean;
    probability: number;
    risk_level: "LOW" | "MEDIUM" | "HIGH";
}

export interface ScanResponse {
    repo: string;
    branch: string;
    total_analyzed: number;
    suspicious_count: number;
    suspicious_pct: number;
    results: CommitResult[];
}

// -----------------------------
// MAIN API FUNCTION
// -----------------------------
export const scanRepository = async (
    data: ScanRequest
): Promise<ScanResponse> => {
    try {
        const response = await fetch(`${BASE_URL}/api/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to scan repository");
        }

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("API Error:", error.message);
        throw error;
    }
};
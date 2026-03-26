const BASE_URL = "https://foss-hackathon-production.up.railway.app"; // change when deployed

export interface AnalyseRequest {
    owner: string;
    repo: string;
    branch: string;
    last_n: number;
    token: string;
}

export interface AnalyseResponse {
    repo: string;
    branch: string;
    total_analyzed: number;
    suspicious_count: number;
    suspicious_pct: number;
    results: {
        commit_hash: string;
        subject: string;
        author_id: number;
        suspicious: boolean;
        probability: number;
        risk_level: string;
    }[];
}

export interface SourceCodeRequest {
    owner: string;
    repo: string;
    branch: string;
    token: string;
}

export interface SourceCodeResponse {
    repo: string;
    branch: string;
    total_files: number;
    scanned_files: number;
    vulnerable_files: number;
    safe_files: number;
    skipped_files: number;
    repo_risk: string;
    repo_risk_score: number;
    results: {
        filename: string;
        filepath: string;
        language: string;
        prediction: string;
        safe_probability: number;
        vulnerable_probability: number;
        confidence: number;
        risk_level: string;
    }[];
}

export interface FullScanRequest {
    owner: string;
    repo: string;
    branch: string;
    last_n: number;
    token: string;
}

export interface FullScanResponse {
    repo: string;
    branch: string;
    commit_analysis: AnalyseResponse;
    source_code_scan: SourceCodeResponse;
}

export const runAnalyse = async (data: AnalyseRequest): Promise<AnalyseResponse> => {
    const res = await fetch(`https://foss-hackathon-production.up.railway.app/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to analyse commits");
    return res.json();
};

export const runSourceCodeScan = async (data: SourceCodeRequest): Promise<SourceCodeResponse> => {
    const res = await fetch(`https://foss-hackathon-production.up.railway.app/scan/source-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to scan source code");
    return res.json();
};

export const runFullScan = async (data: FullScanRequest): Promise<FullScanResponse> => {
    const res = await fetch(`https://foss-hackathon-production.up.railway.app/scan/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to run full scan");
    return res.json();
};

import { Evidence, Uncertainty } from "./contracts";

export interface VerificationResult {
  status: Uncertainty;
  supported: boolean;
  score: number;
  reasons: string[];
}

export class EvidenceVerifier {
  verify(claim: string, evidence: Evidence[]): VerificationResult {
    if (evidence.length === 0) {
      return { status: "UNKNOWN", supported: false, score: 0, reasons: ["no_evidence"] };
    }

    const verified = evidence.filter((e) => e.verification === "VERIFIED");
    const conflicting = evidence.some((e) => e.verification === "CONFLICTING");
    const score = Math.max(0, Math.min(1, verified.reduce((sum, e) => sum + e.confidence, 0) / Math.max(1, evidence.length)));

    if (conflicting) return { status: "CONFLICTING", supported: false, score, reasons: ["conflicting_evidence", "claim_requires_resolution"] };
    if (verified.length === 0) return { status: "UNCERTAIN", supported: false, score, reasons: ["evidence_not_verified"] };
    if (score >= 0.8) return { status: "KNOWN", supported: true, score, reasons: [] };
    return { status: "LIKELY", supported: true, score, reasons: ["confidence_below_known_threshold"] };
  }
}

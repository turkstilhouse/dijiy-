import { ResourceUsage, Uncertainty } from "./contracts";

export interface EvalResult {
  taskSuccess: boolean;
  factualAccuracy: Uncertainty;
  evidenceQuality: number;
  policyCompliant: boolean;
  securityResistant: boolean;
  recoverySuccessful: boolean;
  latencyMs: number;
  usage: ResourceUsage;
  unsupportedClaimRate: number;
  notes: string[];
}

export interface EvalCase {
  id: string;
  objective: string;
  expected: {
    taskSuccess?: boolean;
    factualAccuracy?: Uncertainty;
    policyCompliant?: boolean;
    securityResistant?: boolean;
  };
  tags: Array<"normal" | "edge" | "failure" | "adversarial" | "tool-use" | "memory" | "long-horizon">;
}

export interface EvalRunner {
  run(testCase: EvalCase): Promise<EvalResult>;
}

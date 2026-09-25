import { AgentContract, Capability, PolicyDecision, RiskClass } from "./contracts";

const ORDER: RiskClass[] = ["R0", "R1", "R2", "R3", "R4", "R5"];

const requiresApproval = (risk: RiskClass) => risk === "R4" || risk === "R5";

export class PolicyGate {
  constructor(private readonly policyVersion = "dijiy-policy-v1") {}

  evaluate(agent: AgentContract, capability: Capability, requestedRisk: RiskClass): PolicyDecision {
    const reasons: string[] = [];
    const exceedsAgentRisk = ORDER.indexOf(requestedRisk) > ORDER.indexOf(agent.maxRiskClass);
    const capabilityMismatch = !agent.capabilities.includes(capability.id);
    const sideEffectMismatch = capability.externalSideEffect && !capability.reversible && ORDER.indexOf(requestedRisk) < ORDER.indexOf("R5");

    if (exceedsAgentRisk) reasons.push("agent_risk_ceiling_exceeded");
    if (capabilityMismatch) reasons.push("capability_not_granted");
    if (sideEffectMismatch) reasons.push("irreversible_side_effect_requires_R5");

    const allowed = reasons.length === 0;
    return {
      allowed,
      riskClass: requestedRisk,
      approvalRequired: allowed && requiresApproval(requestedRisk),
      reasons,
      decidedAt: new Date().toISOString(),
      policyVersion: this.policyVersion,
    };
  }
}

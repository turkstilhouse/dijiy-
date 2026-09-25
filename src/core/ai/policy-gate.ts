import { AgentContract, Capability, PolicyDecision, RiskClass, RISK_ORDER } from "./contracts";
const requiresApproval=(risk:RiskClass)=>risk==="R4"||risk==="R5";
export class PolicyGate {
 constructor(private readonly policyVersion="dijiy-policy-v1"){}
 evaluate(agent:AgentContract,capability:Capability,requestedRisk:RiskClass):PolicyDecision{
  const reasons:string[]=[];
  if(RISK_ORDER.indexOf(requestedRisk)>RISK_ORDER.indexOf(agent.maxRiskClass)) reasons.push("agent_risk_ceiling_exceeded");
  if(!agent.capabilities.includes(capability.id)) reasons.push("capability_not_granted");
  if(capability.externalSideEffect&&!capability.reversible&&requestedRisk!=="R5") reasons.push("irreversible_side_effect_requires_R5");
  return {allowed:reasons.length===0,riskClass:requestedRisk,approvalRequired:reasons.length===0&&requiresApproval(requestedRisk),reasons,decidedAt:new Date().toISOString(),policyVersion:this.policyVersion};
 }
}

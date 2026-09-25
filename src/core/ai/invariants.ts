import { AgentContract, Capability, RiskClass, RISK_ORDER } from "./contracts";
import { PolicyGate } from "./policy-gate";
export function assertAgentCannotEscalate(agent:AgentContract, capability:Capability, requestedRisk:RiskClass):void {
 const decision=new PolicyGate().evaluate(agent,capability,requestedRisk);
 if(RISK_ORDER.indexOf(requestedRisk)>RISK_ORDER.indexOf(agent.maxRiskClass) && decision.allowed) throw new Error("Security invariant violated: agent risk escalation was allowed");
}
export function assertSelfApprovalIsBlocked(approval:{requestedBy:string;approvedBy?:string}):void {
 if(approval.approvedBy && approval.requestedBy===approval.approvedBy) throw new Error("Security invariant violated: self-approval is forbidden");
}

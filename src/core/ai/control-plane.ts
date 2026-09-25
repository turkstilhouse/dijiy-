import { AgentContract, Capability, TaskContract } from "./contracts";
import { EvidenceVerifier, VerificationResult } from "./evidence-verifier";
import { ExecutionStateMachine } from "./execution-state";
import { KillSwitch } from "./kill-switch";
import { PolicyGate } from "./policy-gate";
import { ResourceGovernor } from "./resource-governor";

export class AIControlPlane {
  readonly state: ExecutionStateMachine;
  readonly governor: ResourceGovernor;
  readonly killSwitch: KillSwitch;
  readonly policy: PolicyGate;
  readonly verifier: EvidenceVerifier;

  constructor(
    private readonly task: TaskContract,
    budget: ResourceGovernor,
    state = new ExecutionStateMachine(task.state),
    killSwitch = new KillSwitch(),
    policy = new PolicyGate(),
    verifier = new EvidenceVerifier(),
  ) {
    this.governor = budget;
    this.state = state;
    this.killSwitch = killSwitch;
    this.policy = policy;
    this.verifier = verifier;
  }

  authorize(agent: AgentContract, capability: Capability) {
    this.killSwitch.assertRunning();
    return this.policy.evaluate(agent, capability, this.task.riskClass);
  }

  verify(claim: string, evidence: Parameters<EvidenceVerifier["verify"]>[1]): VerificationResult {
    this.killSwitch.assertRunning();
    return this.verifier.verify(claim, evidence);
  }
}

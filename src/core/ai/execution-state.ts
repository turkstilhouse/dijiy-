import { ExecutionState } from "./contracts";

const transitions: Record<ExecutionState, ExecutionState[]> = {
  REQUESTED: ["CLASSIFIED", "CANCELLED"],
  CLASSIFIED: ["PLANNED", "FAILED", "CANCELLED"],
  PLANNED: ["RESEARCHING", "GENERATING", "POLICY_CHECK", "FAILED", "CANCELLED"],
  RESEARCHING: ["GENERATING", "VERIFYING", "FAILED", "CANCELLED"],
  GENERATING: ["VERIFYING", "POLICY_CHECK", "FAILED", "CANCELLED"],
  VERIFYING: ["POLICY_CHECK", "GENERATING", "FAILED", "CANCELLED"],
  POLICY_CHECK: ["APPROVAL_REQUIRED", "APPROVED", "EXECUTING", "FAILED", "CANCELLED"],
  APPROVAL_REQUIRED: ["APPROVED", "FAILED", "CANCELLED"],
  APPROVED: ["EXECUTING", "FAILED", "CANCELLED"],
  EXECUTING: ["OBSERVING", "WAITING_TOOL", "WAITING_EXTERNAL", "FAILED", "CANCELLED"],
  WAITING_TOOL: ["EXECUTING", "OBSERVING", "FAILED", "CANCELLED"],
  WAITING_EXTERNAL: ["EXECUTING", "OBSERVING", "FAILED", "CANCELLED"],
  OBSERVING: ["EVALUATING", "FAILED", "CANCELLED"],
  EVALUATING: ["COMPLETED", "FAILED", "GENERATING", "CANCELLED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export class ExecutionStateMachine {
  constructor(private state: ExecutionState = "REQUESTED") {}

  current(): ExecutionState {
    return this.state;
  }

  transition(next: ExecutionState): void {
    if (!transitions[this.state].includes(next)) {
      throw new Error(`Invalid execution transition: ${this.state} -> ${next}`);
    }
    this.state = next;
  }
}

import { AgentContract, Capability, TaskContract } from "./contracts";
import { AIControlPlane } from "./control-plane";
import { ResourceGovernor } from "./resource-governor";

export interface ExecutionResult {
  taskId: string;
  state: string;
  output?: unknown;
  error?: string;
}

export interface ExecutionHandler {
  execute(task: TaskContract, agent: AgentContract, capability: Capability): Promise<unknown>;
}

export class ExecutionEngine {
  constructor(private readonly handler: ExecutionHandler) {}

  async run(
    control: AIControlPlane,
    agent: AgentContract,
    capability: Capability,
  ): Promise<ExecutionResult> {
    try {
      control.killSwitch.assertRunning();
      const decision = control.authorize(agent, capability);

      if (!decision.allowed) {
        control.state.transition("FAILED");
        return { taskId: control["task"].id, state: "FAILED", error: decision.reasons.join(",") };
      }

      if (decision.approvalRequired) {
        control.state.transition("APPROVAL_REQUIRED");
        return { taskId: control["task"].id, state: "APPROVAL_REQUIRED" };
      }

      control.state.transition("EXECUTING");
      control.governor.reserve({ modelCalls: 1 });
      const output = await this.handler.execute(control["task"], agent, capability);
      control.killSwitch.assertRunning();
      control.state.transition("OBSERVING");
      control.state.transition("EVALUATING");
      control.state.transition("COMPLETED");

      return { taskId: control["task"].id, state: "COMPLETED", output };
    } catch (error) {
      try {
        if (!["COMPLETED", "FAILED", "CANCELLED"].includes(control.state.current())) {
          control.state.transition("FAILED");
        }
      } catch {
        // Preserve the original execution failure.
      }
      return {
        taskId: control["task"].id,
        state: "FAILED",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

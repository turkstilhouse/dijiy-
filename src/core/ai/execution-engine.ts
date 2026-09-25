import { AgentContract, Capability, TaskContract } from "./contracts";
import { AIControlPlane } from "./control-plane";

export interface ExecutionResult {
  taskId: string;
  state: string;
  output?: unknown;\n  correlationId?: string;\n  usage?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionHandler {
  execute(task: TaskContract, agent: AgentContract, capability: Capability): Promise<unknown>;
}

export class ExecutionEngine {
  constructor(
    private readonly handler: ExecutionHandler,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async run(
    control: AIControlPlane,
    task: TaskContract,
    agent: AgentContract,
    capability: Capability,
  ): Promise<ExecutionResult> {
    try {
      control.killSwitch.assertRunning();
      const decision = control.authorize(agent, capability);

      if (!decision.allowed) {
        control.state.transition("FAILED");
        return { taskId: task.id, state: "FAILED", error: decision.reasons.join(",") };
      }

      if (decision.approvalRequired) {
        control.state.transition("APPROVAL_REQUIRED");
        return { taskId: task.id, state: "APPROVAL_REQUIRED" };
      }

      control.state.transition("EXECUTING");
      control.governor.reserve({ modelCalls: 1 });
      const output = await this.handler.execute(task, agent, capability);
      control.killSwitch.assertRunning();
      control.state.transition("OBSERVING");
      control.state.transition("EVALUATING");
      control.state.transition("COMPLETED");

      return { taskId: task.id, state: "COMPLETED", output: result.output, usage: result.usage, correlationId };
    } catch (error) {
      try {
        if (!["COMPLETED", "FAILED", "CANCELLED"].includes(control.state.current())) {
          control.state.transition("FAILED");
        }
      } catch {}
      return {
        taskId: task.id,
        state: "FAILED",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

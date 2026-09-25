import { AgentContract, Capability, TaskContract } from "./contracts";
import { AIControlPlane } from "./control-plane";

export interface ExecutionResult {
  taskId: string;
  state: string;
  output?: unknown;
  correlationId?: string;
  usage?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionHandler {
  execute(
    task: TaskContract,
    agent: AgentContract,
    capability: Capability,
    context: {
      executionId: string;
      attempt: number;
      onWaiting: (state: "WAITING_TOOL" | "WAITING_EXTERNAL") => void;
    },
  ): Promise<{ output: unknown; usage?: Record<string, unknown> }>;
}

export class ExecutionEngine {
  constructor(private readonly handler: ExecutionHandler) {}

  async run(
    control: AIControlPlane,
    task: TaskContract,
    agent: AgentContract,
    capability: Capability,
  ): Promise<ExecutionResult> {
    const executionId = `exec_${task.id}_${Date.now()}`;

    try {
      control.killSwitch.assertRunning();
      const decision = control.authorize(agent, capability);

      if (!decision.allowed) {
        control.state.transition("FAILED");
        return { taskId: task.id, state: "FAILED", correlationId: executionId, error: decision.reasons.join(",") };
      }

      if (decision.approvalRequired) {
        control.state.transition("APPROVAL_REQUIRED");
        return { taskId: task.id, state: "APPROVAL_REQUIRED", correlationId: executionId };
      }

      control.state.transition("EXECUTING");
      control.governor.reserve({ modelCalls: 1 });

      const result = await this.handler.execute(task, agent, capability, {
        executionId,
        attempt: 1,
        onWaiting: (state) => {
          if (control.state.current() === "EXECUTING") control.state.transition(state);
        },
      });

      control.killSwitch.assertRunning();

      if (control.state.current() === "WAITING_TOOL" || control.state.current() === "WAITING_EXTERNAL") {
        control.state.transition("EXECUTING");
      }

      control.state.transition("OBSERVING");
      control.state.transition("EVALUATING");
      control.state.transition("COMPLETED");

      return {
        taskId: task.id,
        state: "COMPLETED",
        output: result.output,
        usage: result.usage,
        correlationId: executionId,
      };
    } catch (error) {
      try {
        if (!["COMPLETED", "FAILED", "CANCELLED"].includes(control.state.current())) {
          control.state.transition("FAILED");
        }
      } catch {}
      return {
        taskId: task.id,
        state: "FAILED",
        correlationId: executionId,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
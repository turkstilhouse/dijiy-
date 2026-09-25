import { runCommand } from "./node-command";

export type AgentReachHealth = {
  ok: boolean;
  report: unknown;
  raw: string;
};

export async function checkAgentReachHealth(): Promise<AgentReachHealth> {
  const result = await runCommand("agent-reach", ["doctor", "--json"]);

  let report: unknown = result.stdout;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    // Keep raw output when the installed CLI does not emit JSON.
  }

  return {
    ok: result.code === 0,
    report,
    raw: result.stdout || result.stderr
  };
}

export type AgentReachGetInput = {
  channel: string;
  target: string;
  limit?: number;
  maxTokens?: number;
  noCache?: boolean;
};

export async function agentReachGet(input: AgentReachGetInput): Promise<unknown> {
  if (!/^[a-z0-9._-]+$/i.test(input.channel)) {
    throw new Error("INVALID_AGENT_REACH_CHANNEL");
  }

  if (!input.target || input.target.length > 2000) {
    throw new Error("INVALID_AGENT_REACH_TARGET");
  }

  const args = ["get", input.channel, input.target, "--json"];
  if (input.limit !== undefined) args.push("--limit", String(Math.max(1, Math.min(input.limit, 100))));
  if (input.maxTokens !== undefined) args.push("--max-tokens", String(Math.max(1, Math.min(input.maxTokens, 20000))));
  if (input.noCache) args.push("--no-cache");

  const result = await runCommand("agent-reach", args, 60_000);
  if (result.code !== 0) {
    throw new Error(`AGENT_REACH_EXIT_${result.code}:${result.stderr || result.stdout}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch {
    return result.stdout;
  }
}

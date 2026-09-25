import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CommandResult = {
  stdout: string;
  stderr: string;
  code: number;
};

export async function runCommand(
  command: string,
  args: string[],
  timeoutMs = 30_000
): Promise<CommandResult> {
  try {
    const result = await execFileAsync(command, args, {
      timeout: timeoutMs,
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true
    });

    return {
      stdout: String(result.stdout ?? ""),
      stderr: String(result.stderr ?? ""),
      code: 0
    };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; code?: number | string };
    return {
      stdout: String(e.stdout ?? ""),
      stderr: String(e.stderr ?? ""),
      code: typeof e.code === "number" ? e.code : 1
    };
  }
}

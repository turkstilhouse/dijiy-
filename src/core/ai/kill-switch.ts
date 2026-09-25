export class KillSwitch {
  private stopped = false;
  private reason?: string;

  stop(reason: string): void {
    this.stopped = true;
    this.reason = reason;
  }

  resume(): void {
    this.stopped = false;
    this.reason = undefined;
  }

  assertRunning(): void {
    if (this.stopped) throw new Error(`DİJİY execution stopped: ${this.reason ?? "kill switch"}`);
  }

  isStopped(): boolean { return this.stopped; }
  getReason(): string | undefined { return this.reason; }
}

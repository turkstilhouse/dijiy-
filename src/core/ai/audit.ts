import { AuditEvent } from "./contracts";

export interface AuditSink {
  append(event: AuditEvent): Promise<void>;
}

export class MemoryAuditSink implements AuditSink {
  private readonly events: AuditEvent[] = [];

  async append(event: AuditEvent): Promise<void> {
    this.events.push(Object.freeze({ ...event, metadata: { ...event.metadata } }));
  }

  list(): readonly AuditEvent[] {
    return this.events.slice();
  }
}

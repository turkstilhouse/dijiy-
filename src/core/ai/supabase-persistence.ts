import {
  AuditEvent,
  ExecutionCheckpoint,
  ExecutionPersistence,
  IdempotencyRecord,
  TaskContract,
} from "./contracts";
import { AuditSink } from "./audit";

type FetchLike = typeof fetch;

export interface SupabaseExecutionPersistenceConfig {
  url: string;
  key: string;
  fetchImpl?: FetchLike;
}

function requireUuid(value: string, field: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`${field} must be a UUID for Supabase AI Control Plane persistence`);
  }
  return value;
}

export class SupabaseExecutionPersistence implements ExecutionPersistence {
  private readonly baseUrl: string;
  private readonly key: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: SupabaseExecutionPersistenceConfig) {
    this.baseUrl = config.url.replace(/\/$/, "") + "/rest/v1";
    this.key = config.key;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await this.fetchImpl(this.baseUrl + path, {
      ...init,
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase Control Plane request failed (${response.status}): ${body}`);
    }
    return response;
  }

  async saveTask(task: TaskContract, executionId: string): Promise<void> {
    const id = requireUuid(task.id, "task.id");
    const workspaceId = requireUuid(task.workspaceId, "task.workspaceId");
    const requestedBy = requireUuid(task.requestedBy, "task.requestedBy");

    await this.request("/ai_tasks", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id,
        workspace_id: workspaceId,
        requested_by: requestedBy,
        objective: task.objective,
        risk_class: task.riskClass,
        state: task.state,
        budget: task.budget,
        idempotency_key: task.idempotencyKey ?? executionId,
        execution_id: executionId,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  async saveCheckpoint(checkpoint: ExecutionCheckpoint): Promise<void> {
    const taskId = requireUuid(checkpoint.taskId, "checkpoint.taskId");
    await this.request(`/ai_tasks?id=eq.${encodeURIComponent(taskId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        execution_id: checkpoint.executionId,
        state: checkpoint.state,
        checkpoint,
        updated_at: checkpoint.updatedAt,
      }),
    });
  }

  async loadCheckpoint(executionId: string): Promise<ExecutionCheckpoint | undefined> {
    const response = await this.request(
      `/ai_tasks?execution_id=eq.${encodeURIComponent(executionId)}&select=checkpoint&limit=1`,
      { method: "GET" },
    );
    const rows = (await response.json()) as Array<{ checkpoint?: ExecutionCheckpoint | null }>;
    return rows[0]?.checkpoint ?? undefined;
  }

  async getIdempotency(key: string): Promise<IdempotencyRecord | undefined> {
    const response = await this.request(
      `/ai_execution_idempotency?idempotency_key=eq.${encodeURIComponent(key)}&select=task_id,idempotency_key,operation,status,result_hash&limit=1`,
      { method: "GET" },
    );
    const rows = (await response.json()) as Array<{
      task_id: string;
      idempotency_key: string;
      operation: string;
      status: IdempotencyRecord["status"];
      result_hash?: string | null;
    }>;
    const row = rows[0];
    return row
      ? {
          key: row.idempotency_key,
          taskId: row.task_id,
          operation: row.operation,
          status: row.status,
          resultHash: row.result_hash ?? undefined,
        }
      : undefined;
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<void> {
    const taskId = requireUuid(record.taskId, "idempotency.taskId");
    await this.request("/ai_execution_idempotency", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        task_id: taskId,
        idempotency_key: record.key,
        operation: record.operation,
        status: record.status,
        result_hash: record.resultHash ?? null,
        updated_at: new Date().toISOString(),
      }),
    });
  }
}

export class SupabaseAuditSink implements AuditSink {
  private readonly baseUrl: string;
  private readonly key: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: SupabaseExecutionPersistenceConfig) {
    this.baseUrl = config.url.replace(/\/$/, "") + "/rest/v1";
    this.key = config.key;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async append(event: AuditEvent): Promise<void> {
    const taskId = requireUuid(event.taskId, "audit.taskId");
    const actorId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.actorId)
        ? event.actorId
        : null;

    const metadata = actorId
      ? event.metadata
      : { ...event.metadata, actorId: event.actorId };

    const response = await this.fetchImpl(this.baseUrl + "/ai_audit_events", {
      method: "POST",
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        task_id: taskId,
        actor_id: actorId,
        action: event.action,
        state: event.state,
        metadata,
        created_at: event.timestamp,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase audit write failed (${response.status}): ${body}`);
    }
  }
}

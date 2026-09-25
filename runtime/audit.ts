export type AuditEvent = {
  taskId?: string;
  actorId?: string;
  action: string;
  state: string;
  metadata?: Record<string, unknown>;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return {
    url: url.replace(/\/$/, ""),
    key
  };
}

export async function recordAuditEvent(event: AuditEvent): Promise<{ recorded: boolean; reason?: string }> {
  const cfg = config();
  if (!cfg) {
    return { recorded: false, reason: "SUPABASE_RUNTIME_CREDENTIALS_MISSING" };
  }

  const body = {
    task_id: event.taskId ?? null,
    actor_id: event.actorId ?? null,
    action: event.action,
    state: event.state,
    metadata: event.metadata ?? {}
  };

  const response = await fetch(cfg.url + "/rest/v1/ai_audit_events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: cfg.key,
      authorization: `Bearer ${cfg.key}`,
      prefer: "return=minimal"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    return { recorded: false, reason: `SUPABASE_AUDIT_HTTP_${response.status}` };
  }

  return { recorded: true };
}

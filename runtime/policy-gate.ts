export type PolicyDecision =
  | { allowed: true }
  | { allowed: false; state: "WAITING_FOR_CONNECTION" | "APPROVAL_REQUIRED"; reason: string };

export type PolicyContext = {
  adapter: string;
  providerVerified: boolean;
  healthPassed: boolean;
  risk: "automatic" | "notification" | "approval";
  externalPublish?: boolean;
};

export function evaluatePolicy(ctx: PolicyContext): PolicyDecision {
  if (!ctx.providerVerified && ctx.adapter !== "ollama") {
    return {
      allowed: false,
      state: "WAITING_FOR_CONNECTION",
      reason: "Provider/integration is not verified."
    };
  }

  if (!ctx.healthPassed) {
    return {
      allowed: false,
      state: "WAITING_FOR_CONNECTION",
      reason: "Runtime health check has not passed."
    };
  }

  if (ctx.risk === "approval" || ctx.externalPublish) {
    return {
      allowed: false,
      state: "APPROVAL_REQUIRED",
      reason: "This operation requires explicit human approval."
    };
  }

  return { allowed: true };
}

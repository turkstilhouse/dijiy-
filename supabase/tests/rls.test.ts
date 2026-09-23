// @vitest-environment node
/**
 * RLS tests for the draft migrations in supabase/migrations/.
 *
 * Runs against an in-memory Postgres (PGlite) seeded with a replica of the
 * production policies (fixtures/core_baseline.sql). Nothing here touches the
 * real Supabase project.
 *
 * "baseline" tests document the current production behaviour (the findings);
 * "after migrations" tests prove the drafts fix them without breaking
 * legitimate access.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const baselineSql = readFileSync(
  join(root, "tests/fixtures/core_baseline.sql"),
  "utf8",
);
const migrationFiles = readdirSync(join(root, "migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort();

const ORG_A = "00000000-0000-0000-0000-00000000000a";
const ORG_B = "00000000-0000-0000-0000-00000000000b";
const U = {
  owner: "10000000-0000-0000-0000-000000000001",
  admin: "10000000-0000-0000-0000-000000000002",
  manager: "10000000-0000-0000-0000-000000000003",
  member: "10000000-0000-0000-0000-000000000004",
  viewer: "10000000-0000-0000-0000-000000000005",
  suspended: "10000000-0000-0000-0000-000000000006",
  invited: "10000000-0000-0000-0000-000000000007",
  outsider: "10000000-0000-0000-0000-000000000008",
  stranger: "10000000-0000-0000-0000-000000000009",
} as const;
type Who = keyof typeof U;

const ID = {
  integration: "20000000-0000-0000-0000-000000000001",
  surface: "20000000-0000-0000-0000-000000000002",
  workflowRun: "20000000-0000-0000-0000-000000000003",
  artifact: "20000000-0000-0000-0000-000000000004",
  toolLog: "20000000-0000-0000-0000-000000000005",
  approval: "20000000-0000-0000-0000-000000000006",
  product: "20000000-0000-0000-0000-000000000007",
  fabric: "20000000-0000-0000-0000-000000000008",
  productFabric: "20000000-0000-0000-0000-000000000009",
  globalExpert: "20000000-0000-0000-0000-00000000000a",
  thread: "20000000-0000-0000-0000-00000000000b",
};

const seedSql = `
  insert into public.organizations (id, name, slug) values
    ('${ORG_A}', 'A', 'a'), ('${ORG_B}', 'B', 'b');
  insert into auth.users (id) values ${Object.values(U)
    .map((id) => `('${id}')`)
    .join(", ")};
  insert into public.workspace_members (organization_id, user_id, role, status) values
    ('${ORG_A}', '${U.owner}', 'owner', 'active'),
    ('${ORG_A}', '${U.admin}', 'admin', 'active'),
    ('${ORG_A}', '${U.manager}', 'manager', 'active'),
    ('${ORG_A}', '${U.member}', 'member', 'active'),
    ('${ORG_A}', '${U.viewer}', 'viewer', 'active'),
    ('${ORG_A}', '${U.suspended}', 'admin', 'suspended'),
    ('${ORG_A}', '${U.invited}', 'member', 'invited'),
    ('${ORG_B}', '${U.outsider}', 'owner', 'active');
  insert into public.integrations (id, organization_id) values ('${ID.integration}', '${ORG_A}');
  insert into public.integration_surfaces (id, integration_id) values ('${ID.surface}', '${ID.integration}');
  insert into public.workflow_runs (id, organization_id) values ('${ID.workflowRun}', '${ORG_A}');
  insert into public.artifacts (id, organization_id) values ('${ID.artifact}', '${ORG_A}');
  insert into public.tool_performance_log (id, organization_id) values ('${ID.toolLog}', '${ORG_A}');
  insert into public.human_approval_requests (id, organization_id) values ('${ID.approval}', '${ORG_A}');
  insert into public.products (id, organization_id) values ('${ID.product}', '${ORG_A}');
  insert into public.fabrics (id, organization_id) values ('${ID.fabric}', '${ORG_A}');
  insert into public.product_fabrics (id, product_id, fabric_id) values
    ('${ID.productFabric}', '${ID.product}', '${ID.fabric}');
  insert into public.experts (id, organization_id) values ('${ID.globalExpert}', null);
  insert into private.ai_comms_threads (id, organization_id) values ('${ID.thread}', '${ORG_A}');
`;

async function createDb(withMigrations: boolean) {
  const db = new PGlite();
  await db.exec(baselineSql);
  if (withMigrations) {
    for (const file of migrationFiles) {
      await db.exec(readFileSync(join(root, "migrations", file), "utf8"));
    }
  }
  await db.exec(seedSql);
  return db;
}

async function as(db: PGlite, who: Who | "anon" | "service_role") {
  await db.exec("reset role");
  const sub = who === "anon" || who === "service_role" ? "" : U[who];
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
    sub,
  ]);
  const role =
    who === "anon" ? "anon" : who === "service_role" ? who : "authenticated";
  await db.exec(`set role ${role}`);
}

/** Rows visible/affected for `who`. */
async function rows(
  db: PGlite,
  who: Who | "anon" | "service_role",
  sql: string,
) {
  await as(db, who);
  try {
    return (await db.query(sql)).rows.length;
  } finally {
    await db.exec("reset role");
  }
}

/** Whether the statement succeeds for `who` (RLS WITH CHECK / grants). */
async function succeeds(
  db: PGlite,
  who: Who | "anon" | "service_role",
  sql: string,
) {
  await as(db, who);
  try {
    await db.exec(sql);
    return true;
  } catch {
    return false;
  } finally {
    await db.exec("reset role");
  }
}

describe("baseline (production today) — reproduces the findings", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await createDb(false);
  });

  it("F1: suspended and invited members still read org data", async () => {
    expect(await rows(db, "suspended", "select id from integrations")).toBe(1);
    expect(await rows(db, "invited", "select id from workflow_runs")).toBe(1);
  });

  it("F2: a viewer can approve a human approval request", async () => {
    expect(
      await rows(
        db,
        "viewer",
        `update human_approval_requests set status = 'approved' returning id`,
      ),
    ).toBe(1);
  });

  it("F3: a plain member can modify product_fabrics despite manager-only policy", async () => {
    expect(
      await rows(
        db,
        "member",
        "update product_fabrics set quantity_m2 = 99 returning id",
      ),
    ).toBe(1);
  });

  it("F5: a user with no membership can write global experts", async () => {
    expect(
      await succeeds(
        db,
        "stranger",
        "insert into experts (organization_id) values (null)",
      ),
    ).toBe(true);
    expect(
      await rows(
        db,
        "stranger",
        "update experts set name = 'pwned' returning id",
      ),
    ).toBeGreaterThan(0);
  });

  it("private tables have RLS disabled but no client grants", async () => {
    const res = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where oid = 'private.ai_comms_threads'::regclass",
    );
    expect(res.rows[0].relrowsecurity).toBe(false);
    expect(
      await succeeds(db, "owner", "select * from private.ai_comms_threads"),
    ).toBe(false);
  });
});

describe("after draft migrations", () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await createDb(true);
  });

  describe("private.ai_comms_*", () => {
    it("has RLS enabled on both tables", async () => {
      const res = await db.query<{ relname: string; relrowsecurity: boolean }>(
        `select relname, relrowsecurity from pg_class
         where oid in ('private.ai_comms_threads'::regclass, 'private.ai_comms_messages'::regclass)`,
      );
      expect(res.rows.every((r) => r.relrowsecurity)).toBe(true);
    });

    it("still works for service_role and the table owner", async () => {
      expect(
        await rows(
          db,
          "service_role",
          "select id from private.ai_comms_threads",
        ),
      ).toBe(1);
      expect(
        await succeeds(
          db,
          "service_role",
          `insert into private.ai_comms_messages (thread_id, organization_id)
           values ('${ID.thread}', '${ORG_A}')`,
        ),
      ).toBe(true);
      expect(
        (await db.query("select id from private.ai_comms_threads")).rows,
      ).toHaveLength(1);
    });

    it("denies anon and authenticated", async () => {
      expect(
        await succeeds(db, "anon", "select * from private.ai_comms_threads"),
      ).toBe(false);
      expect(
        await succeeds(db, "owner", "select * from private.ai_comms_messages"),
      ).toBe(false);
    });
  });

  describe("active membership (F1)", () => {
    it.each(["suspended", "invited"] as const)(
      "%s members see nothing",
      async (who) => {
        for (const table of [
          "integrations",
          "integration_surfaces",
          "workflow_runs",
          "artifacts",
          "tool_performance_log",
          "human_approval_requests",
        ]) {
          expect(await rows(db, who, `select id from ${table}`)).toBe(0);
        }
      },
    );

    it("active members, including viewers, can still read", async () => {
      for (const who of ["owner", "member", "viewer"] as const) {
        expect(await rows(db, who, "select id from integrations")).toBe(1);
        expect(await rows(db, who, "select id from integration_surfaces")).toBe(
          1,
        );
        expect(await rows(db, who, "select id from workflow_runs")).toBe(1);
      }
    });

    it("other tenants and anonymous callers see nothing", async () => {
      expect(await rows(db, "outsider", "select id from integrations")).toBe(0);
      expect(await rows(db, "stranger", "select id from artifacts")).toBe(0);
      expect(await rows(db, "anon", "select id from integrations")).toBe(0);
    });
  });

  describe("role boundaries (F2)", () => {
    it("only owner/admin change governance configuration", async () => {
      const insert = `insert into integrations (organization_id) values ('${ORG_A}')`;
      expect(await succeeds(db, "member", insert)).toBe(false);
      expect(await succeeds(db, "manager", insert)).toBe(false);
      expect(await succeeds(db, "admin", insert)).toBe(true);
      expect(
        await rows(
          db,
          "member",
          "update operation_catalog set default_risk_level = 'automatic' returning id",
        ),
      ).toBe(0);
      expect(
        await succeeds(
          db,
          "member",
          `insert into integration_surfaces (integration_id) values ('${ID.integration}')`,
        ),
      ).toBe(false);
      expect(
        await succeeds(
          db,
          "owner",
          `insert into integration_surfaces (integration_id) values ('${ID.integration}')`,
        ),
      ).toBe(true);
    });

    it("viewers are read-only on operational data; members can write", async () => {
      const update = "update workflow_runs set status = 'running' returning id";
      expect(await rows(db, "viewer", update)).toBe(0);
      expect(await rows(db, "member", update)).toBe(1);
    });

    it("only owner/admin delete operational data", async () => {
      expect(
        await rows(db, "member", "delete from artifacts returning id"),
      ).toBe(0);
      expect(
        await rows(db, "admin", "delete from artifacts returning id"),
      ).toBe(1);
    });

    it("tool_performance_log is append-only for clients", async () => {
      expect(
        await succeeds(
          db,
          "member",
          `insert into tool_performance_log (organization_id) values ('${ORG_A}')`,
        ),
      ).toBe(true);
      expect(
        await rows(
          db,
          "owner",
          "update tool_performance_log set outcome = 'x' returning id",
        ),
      ).toBe(0);
      expect(
        await rows(
          db,
          "owner",
          "delete from tool_performance_log returning id",
        ),
      ).toBe(0);
    });

    it("members request approvals; only owner/admin decide, as themselves", async () => {
      expect(
        await succeeds(
          db,
          "member",
          `insert into human_approval_requests (organization_id) values ('${ORG_A}')`,
        ),
      ).toBe(true);
      expect(
        await succeeds(
          db,
          "member",
          `insert into human_approval_requests (organization_id, status) values ('${ORG_A}', 'approved')`,
        ),
      ).toBe(false);
      expect(
        await rows(
          db,
          "member",
          `update human_approval_requests set status = 'approved' where id = '${ID.approval}' returning id`,
        ),
      ).toBe(0);
      expect(
        await succeeds(
          db,
          "admin",
          `update human_approval_requests
             set status = 'approved', decided_by = '${U.owner}', decided_at = now()
           where id = '${ID.approval}'`,
        ),
      ).toBe(false);
      expect(
        await rows(
          db,
          "admin",
          `update human_approval_requests
             set status = 'approved', decided_by = '${U.admin}', decided_at = now()
           where id = '${ID.approval}' returning id`,
        ),
      ).toBe(1);
      expect(
        await rows(
          db,
          "owner",
          "delete from human_approval_requests returning id",
        ),
      ).toBe(0);
    });
  });

  describe("product_fabrics (F3)", () => {
    it("plain members can read but not modify; managers can modify", async () => {
      expect(await rows(db, "member", "select id from product_fabrics")).toBe(
        1,
      );
      expect(
        await rows(
          db,
          "member",
          "update product_fabrics set quantity_m2 = 99 returning id",
        ),
      ).toBe(0);
      expect(
        await rows(
          db,
          "manager",
          "update product_fabrics set quantity_m2 = 2 returning id",
        ),
      ).toBe(1);
    });
  });

  describe("global rows (F5)", () => {
    it("everyone signed in can read global experts", async () => {
      expect(await rows(db, "stranger", "select id from experts")).toBe(1);
    });

    it("no client can create, edit or delete global rows", async () => {
      expect(
        await succeeds(
          db,
          "stranger",
          "insert into experts (organization_id) values (null)",
        ),
      ).toBe(false);
      expect(
        await succeeds(
          db,
          "owner",
          "insert into experts (organization_id) values (null)",
        ),
      ).toBe(false);
      expect(
        await rows(db, "owner", "update experts set name = 'x' returning id"),
      ).toBe(0);
      expect(await rows(db, "owner", "delete from experts returning id")).toBe(
        0,
      );
      expect(
        await succeeds(
          db,
          "owner",
          `insert into expert_capabilities (expert_id) values ('${ID.globalExpert}')`,
        ),
      ).toBe(false);
    });

    it("org members still manage their own organization's rows", async () => {
      expect(
        await succeeds(
          db,
          "member",
          `insert into experts (organization_id) values ('${ORG_A}')`,
        ),
      ).toBe(true);
      expect(
        await succeeds(
          db,
          "outsider",
          `insert into experts (organization_id) values ('${ORG_A}')`,
        ),
      ).toBe(false);
    });

    it("service_role can still maintain global rows", async () => {
      expect(
        await rows(
          db,
          "service_role",
          "update experts set name = 'curated' where organization_id is null returning id",
        ),
      ).toBe(1);
    });
  });
});

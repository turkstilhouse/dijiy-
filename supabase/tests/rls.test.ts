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
  admin2: "10000000-0000-0000-0000-00000000000a",
} as const;
type Who = keyof typeof U;
type Actor = Who | "anon" | "service_role";

const ID = {
  integration: "20000000-0000-0000-0000-000000000001",
  approval: "20000000-0000-0000-0000-000000000006",
  product: "20000000-0000-0000-0000-000000000007",
  fabric: "20000000-0000-0000-0000-000000000008",
  globalExpert: "20000000-0000-0000-0000-00000000000a",
  thread: "20000000-0000-0000-0000-00000000000b",
  globalSource: "20000000-0000-0000-0000-00000000000c",
  globalDoc: "20000000-0000-0000-0000-00000000000d",
  order: "20000000-0000-0000-0000-00000000000e",
  task: "20000000-0000-0000-0000-00000000000f",
  prediction: "20000000-0000-0000-0000-000000000010",
};

/** Org-scoped tables that carry organization_id directly. */
const ORG_TABLES = [
  // legacy org_access (migration 150100)
  "integrations",
  "capabilities",
  "operation_catalog",
  "app_builds",
  "artifacts",
  "workflow_templates",
  "workflow_runs",
  "tool_performance_log",
  "human_approval_requests",
  // org_members_access & co. (migration 150300)
  "projects",
  "routing_rules",
  "agent_assignments",
  "customers",
  "suppliers",
  "fabrics",
  "products",
  "orders",
  "production_orders",
  "tasks",
  "decisions",
  "predictions",
  "orchestration_runs",
  "audit_events",
  "cost_events",
] as const;

/** Child tables and the INSERT that references a valid parent. */
const CHILD_INSERTS = {
  integration_surfaces: `insert into integration_surfaces (integration_id) values ('${ID.integration}')`,
  order_items: `insert into order_items (order_id) values ('${ID.order}')`,
  task_runs: `insert into task_runs (task_id) values ('${ID.task}')`,
  evaluations: `insert into evaluations (task_id) values ('${ID.task}')`,
  actual_outcomes: `insert into actual_outcomes (prediction_id) values ('${ID.prediction}')`,
  product_fabrics: `insert into product_fabrics (product_id, fabric_id) values ('${ID.product}', '${ID.fabric}')`,
} as const;
const CHILD_TABLES = Object.keys(CHILD_INSERTS) as Array<
  keyof typeof CHILD_INSERTS
>;

const seedSql = `
  insert into public.organizations (id, name, slug) values
    ('${ORG_A}', 'A', 'a'), ('${ORG_B}', 'B', 'b');
  insert into auth.users (id) values ${Object.values(U)
    .map((id) => `('${id}')`)
    .join(", ")};
  insert into public.workspace_members (organization_id, user_id, role, status) values
    ('${ORG_A}', '${U.owner}', 'owner', 'active'),
    ('${ORG_A}', '${U.admin}', 'admin', 'active'),
    ('${ORG_A}', '${U.admin2}', 'admin', 'active'),
    ('${ORG_A}', '${U.manager}', 'manager', 'active'),
    ('${ORG_A}', '${U.member}', 'member', 'active'),
    ('${ORG_A}', '${U.viewer}', 'viewer', 'active'),
    ('${ORG_A}', '${U.suspended}', 'owner', 'suspended'),
    ('${ORG_A}', '${U.invited}', 'admin', 'invited'),
    ('${ORG_B}', '${U.outsider}', 'owner', 'active');
  ${ORG_TABLES.filter((t) => t !== "human_approval_requests")
    .map(
      (t) => `insert into public.${t} (organization_id) values ('${ORG_A}');`,
    )
    .join("\n  ")}
  insert into public.integrations (id, organization_id) values ('${ID.integration}', '${ORG_A}');
  insert into public.human_approval_requests (id, organization_id, approval_type)
    values ('${ID.approval}', '${ORG_A}', 'publish_listing');
  insert into public.products (id, organization_id) values ('${ID.product}', '${ORG_A}');
  insert into public.fabrics (id, organization_id) values ('${ID.fabric}', '${ORG_A}');
  insert into public.orders (id, organization_id) values ('${ID.order}', '${ORG_A}');
  insert into public.tasks (id, organization_id) values ('${ID.task}', '${ORG_A}');
  insert into public.predictions (id, organization_id) values ('${ID.prediction}', '${ORG_A}');
  ${Object.values(CHILD_INSERTS).join(";\n  ")};
  insert into public.experts (id, organization_id) values ('${ID.globalExpert}', null);
  insert into public.expert_capabilities (expert_id) values ('${ID.globalExpert}');
  insert into public.expert_evaluations (expert_id) values ('${ID.globalExpert}');
  insert into public.knowledge_sources (id, organization_id) values ('${ID.globalSource}', null);
  insert into public.knowledge_documents (id, source_id, organization_id)
    values ('${ID.globalDoc}', '${ID.globalSource}', null);
  insert into public.knowledge_chunks (document_id) values ('${ID.globalDoc}');
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

async function as(db: PGlite, who: Actor) {
  await db.exec("reset role");
  const sub = who === "anon" || who === "service_role" ? "" : U[who];
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
    sub,
  ]);
  const role =
    who === "anon" ? "anon" : who === "service_role" ? who : "authenticated";
  await db.exec(`set role ${role}`);
}

/**
 * SQLSTATEs that mean "the database refused": insufficient_privilege (grants
 * and RLS WITH CHECK) and check_violation (constraints and our triggers).
 * Anything else — e.g. a typo in a test query — is rethrown so it can never
 * masquerade as a successful denial.
 */
const DENIED = new Set(["42501", "23514"]);

function assertDenied(err: unknown) {
  const code = (err as { code?: string }).code;
  if (!code || !DENIED.has(code)) throw err;
}

/** Rows visible/affected for `who`. A refused statement counts as 0 rows. */
async function rows(db: PGlite, who: Actor, sql: string) {
  await db.exec("savepoint probe");
  await as(db, who);
  try {
    const n = (await db.query(sql)).rows.length;
    await db.exec("reset role; release savepoint probe");
    return n;
  } catch (err) {
    await db.exec("rollback to savepoint probe; reset role");
    assertDenied(err);
    return 0;
  }
}

/** Whether the statement succeeds for `who` (RLS WITH CHECK / grants / triggers). */
async function succeeds(db: PGlite, who: Actor, sql: string) {
  await db.exec("savepoint probe");
  await as(db, who);
  try {
    await db.exec(sql);
    await db.exec("reset role; release savepoint probe");
    return true;
  } catch (err) {
    await db.exec("rollback to savepoint probe; reset role");
    assertDenied(err);
    return false;
  }
}

/**
 * Every test runs inside a transaction that is rolled back, so writes made by
 * one assertion never leak into another.
 */
function tx(db: () => PGlite, fn: () => Promise<void>) {
  return async () => {
    await db().exec("begin");
    try {
      await fn();
    } finally {
      await db().exec("reset role; rollback");
    }
  };
}

describe("baseline (production today) — reproduces the findings", () => {
  let db: PGlite;
  const get = () => db;
  beforeAll(async () => {
    db = await createDb(false);
  });

  it(
    "F0: private tables have RLS disabled but no client grants",
    tx(get, async () => {
      const res = await db.query<{ relrowsecurity: boolean }>(
        "select relrowsecurity from pg_class where oid = 'private.ai_comms_threads'::regclass",
      );
      expect(res.rows[0].relrowsecurity).toBe(false);
      expect(
        await succeeds(db, "owner", "select * from private.ai_comms_threads"),
      ).toBe(false);
    }),
  );

  it(
    "F1: suspended and invited members still read org data",
    tx(get, async () => {
      expect(await rows(db, "suspended", "select id from integrations")).toBe(
        2,
      );
      expect(await rows(db, "invited", "select id from workflow_runs")).toBe(1);
    }),
  );

  it(
    "F2: a viewer can approve a human approval request",
    tx(get, async () => {
      expect(
        await rows(
          db,
          "viewer",
          `update human_approval_requests set status = 'approved' returning id`,
        ),
      ).toBe(1);
    }),
  );

  it(
    "F3: a plain member can modify product_fabrics despite manager-only policy",
    tx(get, async () => {
      expect(
        await rows(
          db,
          "member",
          "update product_fabrics set quantity_m2 = 99 returning id",
        ),
      ).toBe(1);
    }),
  );

  it(
    "F5: a user with no membership can write global experts",
    tx(get, async () => {
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
    }),
  );

  it(
    "F6: a viewer can edit orders, customers and audit events",
    tx(get, async () => {
      expect(
        await rows(db, "viewer", "delete from customers returning id"),
      ).toBe(1);
      expect(
        await rows(db, "viewer", "delete from audit_events returning id"),
      ).toBe(1);
      expect(
        await rows(
          db,
          "viewer",
          "update orders set status = 'cancelled' returning id",
        ),
      ).toBe(2);
    }),
  );
});

describe("after draft migrations", () => {
  let db: PGlite;
  const get = () => db;
  beforeAll(async () => {
    db = await createDb(true);
  });

  describe("private.ai_comms_* (F0)", () => {
    it(
      "has RLS enabled on both tables",
      tx(get, async () => {
        const res = await db.query<{ relrowsecurity: boolean }>(
          `select relrowsecurity from pg_class
           where oid in ('private.ai_comms_threads'::regclass, 'private.ai_comms_messages'::regclass)`,
        );
        expect(res.rows).toHaveLength(2);
        expect(res.rows.every((r) => r.relrowsecurity)).toBe(true);
      }),
    );

    it(
      "still works for service_role and the table owner",
      tx(get, async () => {
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
      }),
    );

    it(
      "denies anon and authenticated",
      tx(get, async () => {
        expect(
          await succeeds(db, "anon", "select * from private.ai_comms_threads"),
        ).toBe(false);
        expect(
          await succeeds(
            db,
            "owner",
            "select * from private.ai_comms_messages",
          ),
        ).toBe(false);
      }),
    );
  });

  describe("inactive members (F1)", () => {
    it.each(["suspended", "invited"] as const)(
      "%s members cannot read any business table",
      (who) =>
        tx(get, async () => {
          for (const table of [...ORG_TABLES, ...CHILD_TABLES]) {
            expect(await rows(db, who, `select id from ${table}`), table).toBe(
              0,
            );
          }
        })(),
    );

    it.each(["suspended", "invited"] as const)(
      "%s members cannot write any business table",
      (who) =>
        tx(get, async () => {
          for (const table of ORG_TABLES) {
            expect(
              await succeeds(
                db,
                who,
                `insert into ${table} (organization_id) values ('${ORG_A}')`,
              ),
              `insert ${table}`,
            ).toBe(false);
          }
          for (const table of CHILD_TABLES) {
            expect(
              await succeeds(db, who, CHILD_INSERTS[table]),
              `insert ${table}`,
            ).toBe(false);
          }
        })(),
    );

    it(
      "other tenants and anonymous callers see nothing",
      tx(get, async () => {
        for (const table of ORG_TABLES) {
          for (const who of ["outsider", "stranger", "anon"] as const) {
            expect(
              await rows(db, who, `select id from ${table}`),
              `${who} ${table}`,
            ).toBe(0);
          }
        }
      }),
    );
  });

  describe("viewer is read-only (F2, F6)", () => {
    it(
      "reads every business table",
      tx(get, async () => {
        for (const table of [...ORG_TABLES, ...CHILD_TABLES]) {
          expect(
            await rows(db, "viewer", `select id from ${table}`),
            table,
          ).toBeGreaterThan(0);
        }
      }),
    );

    it(
      "cannot insert, update or delete in any business table",
      tx(get, async () => {
        for (const table of ORG_TABLES) {
          expect(
            await succeeds(
              db,
              "viewer",
              `insert into ${table} (organization_id) values ('${ORG_A}')`,
            ),
            `insert ${table}`,
          ).toBe(false);
          expect(
            await rows(
              db,
              "viewer",
              `update ${table} set organization_id = organization_id returning id`,
            ),
            `update ${table}`,
          ).toBe(0);
          expect(
            await rows(db, "viewer", `delete from ${table} returning id`),
            `delete ${table}`,
          ).toBe(0);
        }
        for (const table of CHILD_TABLES) {
          expect(
            await succeeds(db, "viewer", CHILD_INSERTS[table]),
            `insert ${table}`,
          ).toBe(false);
          expect(
            await rows(
              db,
              "viewer",
              `update ${table} set id = id returning id`,
            ),
            `update ${table}`,
          ).toBe(0);
          expect(
            await rows(db, "viewer", `delete from ${table} returning id`),
            `delete ${table}`,
          ).toBe(0);
        }
      }),
    );
  });

  describe("role boundaries for writers", () => {
    it(
      "only owner/admin change governance configuration",
      tx(get, async () => {
        for (const table of [
          "integrations",
          "capabilities",
          "operation_catalog",
          "projects",
          "routing_rules",
          "agent_assignments",
        ]) {
          const insert = `insert into ${table} (organization_id) values ('${ORG_A}')`;
          expect(await succeeds(db, "member", insert), `member ${table}`).toBe(
            false,
          );
          expect(
            await succeeds(db, "manager", insert),
            `manager ${table}`,
          ).toBe(false);
          expect(await succeeds(db, "admin", insert), `admin ${table}`).toBe(
            true,
          );
        }
        expect(
          await succeeds(db, "member", CHILD_INSERTS.integration_surfaces),
        ).toBe(false);
        expect(
          await succeeds(db, "owner", CHILD_INSERTS.integration_surfaces),
        ).toBe(true);
      }),
    );

    it(
      "members write operational data; only owner/admin delete it",
      tx(get, async () => {
        expect(
          await rows(
            db,
            "member",
            "update orders set status = 'confirmed' returning id",
          ),
        ).toBe(2);
        expect(await succeeds(db, "member", CHILD_INSERTS.order_items)).toBe(
          true,
        );
        expect(
          await rows(db, "member", "delete from customers returning id"),
        ).toBe(0);
        expect(
          await rows(db, "admin", "delete from customers returning id"),
        ).toBe(1);
      }),
    );

    it(
      "ledgers are append-only for every client role",
      tx(get, async () => {
        for (const table of [
          "tool_performance_log",
          "audit_events",
          "cost_events",
        ]) {
          expect(
            await succeeds(
              db,
              "member",
              `insert into ${table} (organization_id) values ('${ORG_A}')`,
            ),
            `insert ${table}`,
          ).toBe(true);
          expect(
            await rows(
              db,
              "owner",
              `update ${table} set organization_id = organization_id returning id`,
            ),
            `update ${table}`,
          ).toBe(0);
          expect(
            await rows(db, "owner", `delete from ${table} returning id`),
            `delete ${table}`,
          ).toBe(0);
        }
      }),
    );

    it(
      "product_fabrics: members read, only managers+ modify (F3)",
      tx(get, async () => {
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
      }),
    );
  });

  describe("human approvals", () => {
    const REQ = "30000000-0000-0000-0000-000000000001";
    const request = (type = "publish_listing") =>
      `insert into human_approval_requests (id, organization_id, approval_type)
       values ('${REQ}', '${ORG_A}', '${type}')`;
    const decide = (who: Who, id = REQ, status = "approved") =>
      `update human_approval_requests
         set status = '${status}', decided_by = '${U[who]}', decided_at = now()
       where id = '${id}' returning id`;

    it(
      "active non-viewers may request; viewers and inactive members may not",
      tx(get, async () => {
        for (const who of ["member", "manager", "admin"] as const) {
          expect(await succeeds(db, who, request()), who).toBe(true);
          await db.exec(
            `delete from human_approval_requests where id = '${REQ}'`,
          );
        }
        for (const who of [
          "viewer",
          "suspended",
          "invited",
          "outsider",
          "stranger",
        ] as const) {
          expect(await succeeds(db, who, request()), who).toBe(false);
        }
      }),
    );

    it(
      "requests are created pending, attributed to the caller",
      tx(get, async () => {
        expect(
          await succeeds(
            db,
            "member",
            `insert into human_approval_requests (organization_id, status)
             values ('${ORG_A}', 'approved')`,
          ),
        ).toBe(false);
        expect(
          await succeeds(
            db,
            "member",
            `insert into human_approval_requests (organization_id, requested_by)
             values ('${ORG_A}', '${U.owner}')`,
          ),
        ).toBe(false);
        expect(await succeeds(db, "member", request())).toBe(true);
        const res = await db.query<{ requested_by: string }>(
          `select requested_by from human_approval_requests where id = '${REQ}'`,
        );
        expect(res.rows[0].requested_by).toBe(U.member);
      }),
    );

    it(
      "forbids self-approval, even for owners and admins",
      tx(get, async () => {
        expect(await succeeds(db, "owner", request())).toBe(true);
        expect(await rows(db, "owner", decide("owner"))).toBe(0);
        await db.exec(
          `delete from human_approval_requests where id = '${REQ}'`,
        );

        expect(await succeeds(db, "admin", request())).toBe(true);
        expect(await rows(db, "admin", decide("admin"))).toBe(0);
        expect(await rows(db, "admin2", decide("admin2"))).toBe(1);
      }),
    );

    it(
      "blocks self-approval through service_role as well (trigger)",
      tx(get, async () => {
        expect(await succeeds(db, "admin", request())).toBe(true);
        expect(await succeeds(db, "service_role", decide("admin"))).toBe(false);
        expect(await succeeds(db, "service_role", decide("admin2"))).toBe(true);
      }),
    );

    it(
      "viewers, members and managers cannot decide",
      tx(get, async () => {
        for (const who of ["viewer", "member", "manager"] as const) {
          expect(await rows(db, who, decide(who, ID.approval)), who).toBe(0);
        }
      }),
    );

    it(
      "deciders can only record themselves as decider",
      tx(get, async () => {
        expect(
          await succeeds(
            db,
            "admin",
            `update human_approval_requests set status = 'approved',
               decided_by = '${U.owner}', decided_at = now()
             where id = '${ID.approval}'`,
          ),
        ).toBe(false);
        expect(await rows(db, "admin", decide("admin", ID.approval))).toBe(1);
      }),
    );

    it.each([
      "irreversible_external_actions",
      "financial_commitments",
      "legal_commitments",
      "credential_changes",
    ])("high-risk type %s can only be decided by an owner", (type) =>
      tx(get, async () => {
        expect(await succeeds(db, "member", request(type))).toBe(true);
        expect(await rows(db, "admin", decide("admin"))).toBe(0);
        expect(await rows(db, "owner", decide("owner"))).toBe(1);
      })(),
    );

    it(
      "a decision is final and request fields are immutable",
      tx(get, async () => {
        expect(await succeeds(db, "member", request())).toBe(true);
        expect(await rows(db, "admin", decide("admin"))).toBe(1);
        // RLS hides decided requests from deciders, so re-deciding is a no-op…
        expect(await rows(db, "owner", decide("owner", REQ, "rejected"))).toBe(
          0,
        );
        // …and the trigger rejects it outright for roles that bypass RLS.
        expect(
          await succeeds(db, "service_role", decide("owner", REQ, "rejected")),
        ).toBe(false);
        expect(
          await succeeds(
            db,
            "service_role",
            `update human_approval_requests set status = 'pending',
               decided_by = null, decided_at = null where id = '${REQ}'`,
          ),
        ).toBe(false);
        expect(
          await succeeds(
            db,
            "admin",
            `update human_approval_requests set status = 'approved',
               decided_by = '${U.admin}', decided_at = now(), payload = '{"amount": 1}'
             where id = '${ID.approval}'`,
          ),
        ).toBe(false);
      }),
    );

    it(
      "a decision must name a human decider; expiry does not",
      tx(get, async () => {
        expect(
          await succeeds(
            db,
            "service_role",
            `update human_approval_requests set status = 'approved'
             where id = '${ID.approval}'`,
          ),
        ).toBe(false);
        expect(
          await succeeds(
            db,
            "service_role",
            `update human_approval_requests set status = 'expired'
             where id = '${ID.approval}'`,
          ),
        ).toBe(true);
      }),
    );

    it(
      "no client can delete approval history",
      tx(get, async () => {
        expect(
          await rows(
            db,
            "owner",
            "delete from human_approval_requests returning id",
          ),
        ).toBe(0);
      }),
    );
  });

  describe("global rows (F5)", () => {
    const GLOBAL_TABLES = [
      "experts",
      "knowledge_sources",
      "knowledge_documents",
      "expert_capabilities",
      "expert_evaluations",
      "knowledge_chunks",
    ];

    it(
      "every signed-in user can read global rows",
      tx(get, async () => {
        for (const table of GLOBAL_TABLES) {
          expect(
            await rows(db, "stranger", `select id from ${table}`),
            table,
          ).toBe(1);
        }
      }),
    );

    it.each([
      "stranger",
      "viewer",
      "member",
      "manager",
      "admin",
      "owner",
    ] as const)("%s cannot create, edit or delete global rows", (who) =>
      tx(get, async () => {
        for (const table of [
          "experts",
          "knowledge_sources",
          "knowledge_documents",
        ]) {
          expect(
            await succeeds(
              db,
              who,
              `insert into ${table} (organization_id) values (null)`,
            ),
            `insert ${table}`,
          ).toBe(false);
        }
        for (const table of GLOBAL_TABLES) {
          expect(
            await rows(db, who, `update ${table} set id = id returning id`),
            `update ${table}`,
          ).toBe(0);
          expect(
            await rows(db, who, `delete from ${table} returning id`),
            `delete ${table}`,
          ).toBe(0);
        }
        expect(
          await succeeds(
            db,
            who,
            `insert into expert_capabilities (expert_id) values ('${ID.globalExpert}')`,
          ),
        ).toBe(false);
        expect(
          await succeeds(
            db,
            who,
            `insert into knowledge_chunks (document_id) values ('${ID.globalDoc}')`,
          ),
        ).toBe(false);
      })(),
    );

    it(
      "non-viewer members manage their own organization's rows",
      tx(get, async () => {
        const insert = `insert into experts (organization_id) values ('${ORG_A}')`;
        expect(await succeeds(db, "member", insert)).toBe(true);
        expect(await succeeds(db, "viewer", insert)).toBe(false);
        expect(await succeeds(db, "outsider", insert)).toBe(false);
      }),
    );

    it(
      "service_role can still curate global rows",
      tx(get, async () => {
        expect(
          await rows(
            db,
            "service_role",
            "update experts set name = 'curated' where organization_id is null returning id",
          ),
        ).toBe(1);
      }),
    );
  });
});

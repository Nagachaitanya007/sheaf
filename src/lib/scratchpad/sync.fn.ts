import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isPortable } from "./import-export";
import { decideSyncPush } from "./sync-core";

const MAX_PAYLOAD = 1_800_000;

export type CloudWorkspaceRow = {
  payload: string;
  revision: number;
  updatedAt: string;
} | null;

export const pullCloudWorkspace = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CloudWorkspaceRow> => {
    const sql = await getSql();
    const rows = await sql<{ payload: string; revision: number | string; updated_at: string }>`
      select payload, revision, updated_at from sheaf_workspaces where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      payload: row.payload,
      revision: Number(row.revision),
      updatedAt: row.updated_at,
    };
  });

export const pushCloudWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { payload: string; revision: number; force?: boolean }) => {
    if (!input || typeof input.payload !== "string") throw new Error("Invalid payload");
    if (input.payload.length > MAX_PAYLOAD) throw new Error("Workspace too large to sync");
    let parsed: unknown;
    try {
      parsed = JSON.parse(input.payload);
    } catch {
      throw new Error("Invalid workspace JSON");
    }
    if (!isPortable(parsed)) throw new Error("Not a Sheaf workspace");
    return {
      payload: input.payload,
      revision: Number(input.revision) || 0,
      force: Boolean(input.force),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ revision: number | string; payload: string; updated_at: string }>`
      select payload, revision, updated_at from sheaf_workspaces where user_id = ${context.userId} limit 1
    `;
    const current = existing[0];
    const serverRevision = current ? Number(current.revision) : null;
    const decision = decideSyncPush(data.revision, serverRevision, data.force);
    if (decision.action === "conflict") {
      if (!current) throw new Error("Conflict without a cloud copy");
      return {
        status: "conflict" as const,
        server: {
          payload: current.payload,
          revision: Number(current.revision),
          updatedAt: current.updated_at,
        },
      };
    }
    const nextRevision = decision.next;
    if (current) {
      await sql`
        update sheaf_workspaces
        set payload = ${data.payload}, revision = ${nextRevision}, updated_at = now()
        where user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into sheaf_workspaces (user_id, payload, revision)
        values (${context.userId}, ${data.payload}, ${nextRevision})
      `;
    }
    return { status: "ok" as const, revision: nextRevision };
  });

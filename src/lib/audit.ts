import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const headersList = headers();
    const ipAddress =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        metadata: (params.metadata || {}) as any,
        ipAddress: typeof ipAddress === "string" ? ipAddress.split(",")[0].trim() : "unknown",
        userAgent,
      },
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }
}

import "server-only";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import type { Role } from "@/lib/generated/prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "You must be logged in to do this.") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
  }
}

/**
 * The real enforcement boundary for role access — every service-backed Server Action
 * must call this, since middleware only redirects at the route/UX level.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError();
  }
  return session;
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import {
  deleteSessionTokenCookie,
  SESSION_COOKIE_NAME,
  setSessionTokenCookie,
  validateSessionToken,
} from "./lib/server/lucia";
import type { UserSelect } from "./lib/types";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const token = getCookie(SESSION_COOKIE_NAME);
  if (!token) throw new Error("Unauthorized");

  const { user, session } = await validateSessionToken(token);

  if (session) {
    setSessionTokenCookie(token, session.expiresAt);
  } else {
    deleteSessionTokenCookie();
  }

  if (!user) throw new Error("Unauthorized");

  return next<{ user: UserSelect }>({ context: { user } });
});

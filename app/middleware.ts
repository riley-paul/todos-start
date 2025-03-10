import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import {
  deleteSessionTokenCookie,
  SESSION_COOKIE_NAME,
  setSessionTokenCookie,
  validateSessionToken,
  type SessionValidationResult,
} from "./lib/server/lucia";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const token = getCookie(SESSION_COOKIE_NAME);
  if (!token) {
    return next<SessionValidationResult>({
      context: { user: null, session: null },
    });
  }

  const sessionValidation = await validateSessionToken(token);

  if (sessionValidation.session) {
    setSessionTokenCookie(token, sessionValidation.session.expiresAt);
  } else {
    deleteSessionTokenCookie();
  }

  return next<SessionValidationResult>({ context: sessionValidation });
});

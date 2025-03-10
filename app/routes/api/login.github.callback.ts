import db from "@/db";
import { User } from "@/db/schema";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/server/lucia";
import { getGithubUser, github } from "@/lib/server/oauth";
import { redirect } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getCookie } from "@tanstack/react-start/server";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { z } from "zod";

const zSearchParams = z.object({
  code: z.string(),
  state: z.string(),
});

export const APIRoute = createAPIFileRoute("/api/login/github/callback")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams);
    const { code, state } = zSearchParams.parse(searchParams);

    const storedState = getCookie("github_oauth_state");

    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, {
        status: 400,
      });
    }

    try {
      const tokens = await github.validateAuthorizationCode(code);
      const githubUser = await getGithubUser(tokens.accessToken());

      const [existingUser] = await db
        .select()
        .from(User)
        .where(eq(User.email, githubUser.email));

      if (existingUser) {
        await db
          .update(User)
          .set({ githubId: githubUser.id })
          .where(eq(User.id, existingUser.id));
        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, existingUser.id);
        setSessionTokenCookie(sessionToken, session.expiresAt);
        throw redirect({ to: "/" });
      }

      // add user to database
      const [user] = await db
        .insert(User)
        .values({
          email: githubUser.email,
          githubId: githubUser.id,
          githubUsername: githubUser.login,
          name: githubUser.name,
          avatarUrl: githubUser.avatar_url,
        })
        .returning();
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user.id);
      setSessionTokenCookie(sessionToken, session.expiresAt);
      throw redirect({ to: "/" });

    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        return new Response(null, {
          status: 400,
        });
      }
      return new Response(null, {
        status: 500,
      });
    }
  },
});

import { github } from "@/lib/server/oauth";
import { generateState } from "arctic";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { redirect } from "@tanstack/react-router";
import { setCookie } from "@tanstack/react-start/server";

export const APIRoute = createAPIFileRoute("/api/login/github")({
  GET: () => {
    const state = generateState();
    const url = github.createAuthorizationURL(state, []);

    setCookie("github_oauth_state", state, {
      path: "/",
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    throw redirect({ href: url.toString() });
  },
});

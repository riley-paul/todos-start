import { redirect } from "@tanstack/react-router";
import type { SessionValidationResult } from "./lucia";

export const authGuard = ({ user }: SessionValidationResult) => {
  if (!user) {
    throw redirect({ to: "/welcome" });
  }
  return user;
};

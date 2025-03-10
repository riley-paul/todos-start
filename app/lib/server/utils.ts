import type { SessionValidationResult } from "./lucia";

export const authGuard = ({ user }: SessionValidationResult) => {
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};

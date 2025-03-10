import { z } from "zod";
import db from "@/db";
import { Todo, User, UserSession } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware";

export const user_getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    return db
      .select()
      .from(User)
      .where(eq(User.id, user.id))
      .then(([res]) => res);
  });

export const user_remove = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    await db.delete(UserSession).where(eq(UserSession.userId, user.id));
    await db.delete(Todo).where(eq(Todo.userId, user.id));
    await db.delete(User).where(eq(User.id, user.id));
    return true;
  });

export const user_checkIfEmailExists = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data: { email } }) => {
    const data = await db.select().from(User).where(eq(User.email, email));
    return data.length > 0;
  });

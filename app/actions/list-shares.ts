import { z } from "zod";
import db from "@/db";
import { User, ListShare, List } from "@/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware";

export const listShare_create = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      email: z.string().email(),
      listId: z.string(),
    })
  )
  .handler(async ({ data: { email, listId }, context: { user } }) => {
    const sharedUser = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .then((rows) => rows[0]);

    if (!sharedUser) {
      throw new Error("User with email not found");
    }

    if (sharedUser.id === user.id) {
      throw new Error("You cannot share a list with yourself");
    }

    const [list] = await db.select().from(List).where(eq(List.id, listId));

    if (!list) {
      throw new Error("List not found");
    }

    if (list.userId !== user.id) {
      throw new Error("You do not have permission to share this list");
    }

    const existingShares = await db
      .select()
      .from(ListShare)
      .where(
        and(
          eq(ListShare.listId, listId),
          eq(ListShare.sharedUserId, sharedUser.id)
        )
      );

    if (existingShares.length > 0) {
      throw new Error("User already has access to this list");
    }

    const [listShare] = await db
      .insert(ListShare)
      .values({
        listId,
        userId: user.id,
        sharedUserId: sharedUser.id,
      })
      .returning();

    return listShare;
  });

export const listShare_remove = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data: { id }, context: { user } }) => {
    const [share] = await db
      .select()
      .from(ListShare)
      .where(eq(ListShare.id, id));

    if (share.sharedUserId !== user.id && share.userId !== user.id) {
      throw new Error("You do not have permission to cancel this share");
    }

    await db
      .delete(ListShare)
      .where(
        and(
          eq(ListShare.id, id),
          or(eq(ListShare.userId, user.id), eq(ListShare.sharedUserId, user.id))
        )
      );

    return true;
  });

export const listShare_leave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ listId: z.string() }))
  .handler(async ({ data: { listId }, context: { user } }) => {
    await db
      .delete(ListShare)
      .where(
        and(eq(ListShare.listId, listId), eq(ListShare.sharedUserId, user.id))
      );
    return true;
  });

export const listShare_accept = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data: { id }, context: { user } }) => {
    const [listShare] = await db
      .select()
      .from(ListShare)
      .where(eq(ListShare.id, id));

    if (!listShare) {
      throw new Error("List share not found");
    }

    if (listShare.sharedUserId !== user.id) {
      throw new Error("You do not have permission to accept this share");
    }

    await db
      .update(ListShare)
      .set({ isPending: false })
      .where(and(eq(ListShare.id, id), eq(ListShare.sharedUserId, user.id)));

    return listShare;
  });

export const listShare_getPending = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    const listShares = await db
      .selectDistinct({
        id: ListShare.id,
        list: {
          id: List.id,
          name: List.name,
        },
        invitedBy: {
          id: User.id,
          name: User.name,
          email: User.email,
          avatarUrl: User.avatarUrl,
        },
        createdAt: ListShare.createdAt,
      })
      .from(ListShare)
      .innerJoin(User, eq(User.id, ListShare.userId))
      .innerJoin(List, eq(List.id, ListShare.listId))
      .where(
        and(eq(ListShare.sharedUserId, user.id), eq(ListShare.isPending, true))
      )
      .orderBy(desc(ListShare.createdAt));
    return listShares;
  });

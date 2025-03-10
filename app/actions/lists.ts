import { z } from "zod";
import type { ListSelect } from "@/lib/types";
import {
  filterTodos,
  invalidateUsers,
  getListUsers,
  filterByListShare,
} from "./helpers";
import db from "@/db";
import { User, List, ListShare, Todo, zListInsert } from "@/db/schema";
import { eq, or, asc } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware";
import { authGuard } from "@/lib/server/utils";

export const list_get = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = authGuard(context);
    const lists: ListSelect[] = await db
      .selectDistinct({
        id: List.id,
        name: List.name,
        author: {
          id: User.id,
          name: User.name,
          email: User.email,
          avatarUrl: User.avatarUrl,
        },
      })
      .from(List)
      .leftJoin(ListShare, eq(ListShare.listId, List.id))
      .innerJoin(User, eq(User.id, List.userId))
      .where(or(eq(List.userId, user.id), filterByListShare(user.id)))
      .orderBy(asc(List.name))
      .then((lists) =>
        Promise.all(
          lists.map(async (list) => ({
            ...list,
            todoCount: await db
              .selectDistinct({ todoId: Todo.id })
              .from(Todo)
              .leftJoin(ListShare, eq(ListShare.listId, Todo.listId))
              .where(filterTodos(user.id, list.id))
              .then((rows) => rows.length),
            shares: await db
              .selectDistinct({
                id: ListShare.id,
                user: {
                  id: User.id,
                  name: User.name,
                  email: User.email,
                  avatarUrl: User.avatarUrl,
                },
                isPending: ListShare.isPending,
              })
              .from(ListShare)
              .innerJoin(User, eq(User.id, ListShare.sharedUserId))
              .where(eq(ListShare.listId, list.id))
              .then((shares) =>
                shares.map((share) => ({
                  ...share,
                  list: { id: list.id, name: list.name, author: list.author },
                  isAuthor: share.user.id === user.id,
                }))
              ),
            isAuthor: list.author.id === user.id,
          }))
        )
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          otherUsers: [...row.shares, { user: row.author }]
            .filter((share) => share.user.id !== user.id)
            .map((share) => share.user),
        }))
      );

    return lists;
  });

export const list_update = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), data: zListInsert }))
  .handler(async ({ data: { id, data }, context }) => {
    const user = authGuard(context);
    const users = await getListUsers(id);

    if (!users.includes(user.id)) {
      throw new Error("You do not have permission to update this list");
    }

    const [result] = await db
      .update(List)
      .set(data)
      .where(eq(List.id, id))
      .returning();

    invalidateUsers(users);
    return result;
  });

export const list_create = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(zListInsert)
  .handler(async ({ data, context }) => {
    const user = authGuard(context);
    const [result] = await db
      .insert(List)
      .values({ ...data, userId: user.id })
      .returning();

    const users = await getListUsers(result.id);

    invalidateUsers(users);
    return result;
  });

export const list_remove = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data: { id }, context }) => {
    const users = await getListUsers(id);

    await db.delete(Todo).where(eq(Todo.listId, id));
    await db.delete(ListShare).where(eq(ListShare.listId, id));
    await db.delete(List).where(eq(List.id, id));

    invalidateUsers(users);
    return true;
  });

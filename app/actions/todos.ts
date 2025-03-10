import db from "@/db";
import { User, Todo, ListShare, List, zTodoInsert } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import type { TodoSelect } from "@/lib/types";
import { filterTodos, invalidateUsers, getTodoUsers } from "./helpers";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware";

const zTodoText = z.string().trim().min(1, "Todo must not be empty");

export const todo_get = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ listId: z.string().nullable() }))
  .handler(async ({ data: { listId }, context: { user } }) => {
    const todos: TodoSelect[] = await db
      .selectDistinct({
        id: Todo.id,
        text: Todo.text,
        isCompleted: Todo.isCompleted,
        author: {
          id: User.id,
          name: User.name,
          email: User.email,
          avatarUrl: User.avatarUrl,
        },
        list: {
          id: List.id,
          name: List.name,
        },
      })
      .from(Todo)
      .leftJoin(ListShare, eq(ListShare.listId, Todo.listId))
      .leftJoin(List, eq(List.id, Todo.listId))
      .innerJoin(User, eq(User.id, Todo.userId))
      .where(filterTodos(user.id, listId))
      .orderBy(desc(Todo.createdAt))
      .then((rows) =>
        rows.map((row) => ({ ...row, isAuthor: row.author.id === user.id }))
      );
    return todos;
  });

export const todo_create = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(zTodoInsert)
  .handler(async ({ data, context: { user } }) => {
    const todo = await db
      .insert(Todo)
      .values({ ...data, userId: user.id })
      .returning()
      .then((rows) => rows[0]);

    invalidateUsers(await getTodoUsers(todo.id));
    return todo;
  });

export const todo_update = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(zTodoInsert.partial().required({ id: true }))
  .handler(async ({ data, context: { user } }) => {
    const users = await getTodoUsers(data.id);

    if (!users.includes(user.id)) {
      throw new Error("You do not have permission to update this task");
    }

    const [todo] = await db
      .update(Todo)
      .set(data)
      .where(and(eq(Todo.id, data.id)))
      .returning();

    invalidateUsers(users);
    return todo;
  });

export const todo_remove = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data: { id }, context: { user } }) => {
    const users = await getTodoUsers(id);

    if (!users.includes(user.id)) {
      throw new Error("You do not have permission to delete this task");
    }

    await db.delete(Todo).where(eq(Todo.id, id));

    invalidateUsers(users);
    return true;
  });

export const todo_removeCompleted = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ listId: z.string().nullable() }))
  .handler(async ({ data: { listId }, context: { user } }) => {
    const todoIds = await db
      .selectDistinct({ id: Todo.id })
      .from(Todo)
      .leftJoin(ListShare, eq(ListShare.listId, Todo.listId))
      .where(and(filterTodos(user.id, listId), eq(Todo.isCompleted, true)))
      .then((rows) => rows.map((row) => row.id));

    await db
      .delete(Todo)
      .where(and(eq(Todo.isCompleted, true), inArray(Todo.id, todoIds)));

    return true;
  });

import { queryOptions } from "@tanstack/react-query";
import type { SelectedList } from "@/lib/types";
import { user_getMe } from "@/actions/users";
import { todo_get } from "@/actions/todos";
import { useServerFn } from "@tanstack/react-start";
import { list_get } from "@/actions/lists";
import { listShare_getPending } from "@/actions/list-shares";

export const todosQueryOptions = (listId: SelectedList) =>
  queryOptions({
    queryKey: ["todos", listId],
    queryFn: () => todo_get({ data: { listId } }),
  });

export const userQueryOptions = queryOptions({
  queryKey: ["profile"],
  retry: false,
  queryFn: user_getMe,
});

export const listsQueryOptions = queryOptions({
  queryKey: ["lists"],
  queryFn: list_get,
  select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
});

export const pendingSharesQueryOptions = queryOptions({
  queryKey: ["pendingShares"],
  queryFn: listShare_getPending,
});
